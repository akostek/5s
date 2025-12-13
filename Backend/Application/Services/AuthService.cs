using Application.DTOs;
using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IRepository<User> _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly JwtService _jwtService;
        private readonly ILogger<AuthService> _logger;
        private readonly HttpClient _httpClient;
        private readonly Microsoft.Extensions.Configuration.IConfiguration _configuration;

        public AuthService(
            IRepository<User> userRepository,
            IUnitOfWork unitOfWork,
            JwtService jwtService,
            ILogger<AuthService> logger,
            HttpClient httpClient,
            Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _jwtService = jwtService;
            _logger = logger;
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto loginDto)
        {
            try
            {
                _logger?.LogInformation("E-posta için giriş denemesi: {Email}", loginDto.Email);
                
                var user = await _unitOfWork.Repository<User>()
                    .GetQueryable()
                    .Include(u => u.Department)
                    .Include(u => u.Sector)
                    .Include(u => u.Directorate)
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Email == loginDto.Email && u.IsActive);

                if (user == null)
                {
                    _logger?.LogWarning("Kullanıcı bulunamadı veya pasif: {Email}", loginDto.Email);
                    throw new UnauthorizedAccessException("Invalid credentials");
                }

                _logger?.LogInformation("Kullanıcı bulundu: {UserId}, RolId: {RoleId}, Rol: {Role}", 
                    user.Id, user.RoleId, user.Role?.Ad);

                if (!PasswordHasher.VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    _logger?.LogWarning("Geçersiz şifre: {Email}", loginDto.Email);
                    throw new UnauthorizedAccessException("Invalid credentials");
                }

                // Son giriş tarihini güncelle - UTC olduğundan emin ol
                user.LastLogin = DateTime.UtcNow;
                try
                {
                    await _userRepository.UpdateAsync(user);
                    await _unitOfWork.SaveChangesAsync();
                }
                catch (Exception dbEx)
                {
                    _logger?.LogWarning(dbEx, "Kullanıcı {UserId} için son giriş güncellemesi başarısız oldu, giriş işlemine devam ediliyor", user.Id);
                    // Son giriş güncellemesi başarısız olsa bile logla ama girişi engelleme
                    // Token oluşturmaya devam et
                }

                _logger?.LogInformation("Kullanıcı için token oluşturuluyor: {UserId}", user.Id);
                var token = _jwtService.GenerateToken(user);
                _logger?.LogInformation("Token başarıyla oluşturuldu: {UserId}", user.Id);

                return new LoginResponseDto
                {
                    Token = token,
                    User = MapToUserDto(user)
                };
            }
            catch (UnauthorizedAccessException)
            {
                // Yetkilendirme hatalarını olduğu gibi fırlat
                throw;
            }
            catch (InvalidOperationException ex)
            {
                // JWT Secret eksik veya diğer yapılandırma sorunları
                _logger?.LogError(ex, "Configuration error during login: {Message}", ex.Message);
                throw new Exception($"Configuration error: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Login error for email {Email}: {Message}, InnerException: {InnerException}", 
                    loginDto.Email, ex.Message, ex.InnerException?.Message);
                throw new Exception($"Login error: {ex.Message}. InnerException: {ex.InnerException?.Message}", ex);
            }
        }

        public async Task<LoginResponseDto> LoginWithKeycloakAsync(string code)
        {
            try
            {
                // OFFLINE GELİŞTİRME İÇİN MOCK GİRİŞ
                // Yerel çalışırken gerçek Keycloak sunucusu olmadan giriş yapmayı sağlar
                if (code == "mock_dev_code")
                {
                    _logger.LogWarning("Performing MOCK LOGIN for offline development");
                    
                    var mockEmail = "admin@kaizen.local";
                    var mockUser = await _unitOfWork.Repository<User>()
                        .GetQueryable()
                        .Include(u => u.Department)
                        .Include(u => u.Sector)
                        .Include(u => u.Directorate)
                        .Include(u => u.Role)
                        .FirstOrDefaultAsync(u => u.Email == mockEmail);

                    if (mockUser == null)
                    {
                        mockUser = new User
                        {
                            Email = mockEmail,
                            Name = "Offline Admin",
                            Username = "admin",
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow,
                            RoleId = 1, // Admin rolü
                            PasswordHash = PasswordHasher.HashPassword("mock_password")
                        };
                        await _userRepository.AddAsync(mockUser);
                        await _unitOfWork.SaveChangesAsync();
                        
                        // Yeniden yükle
                        mockUser = await _unitOfWork.Repository<User>()
                            .GetQueryable()
                            .Include(u => u.Role)
                            .FirstOrDefaultAsync(u => u.Id == mockUser.Id);
                    }

                    var mockToken = _jwtService.GenerateToken(mockUser!);
                    return new LoginResponseDto
                    {
                        Token = mockToken,
                        User = mockUser != null ? MapToUserDto(mockUser) : new UserDto()
                    };
                }

                // 1. Kodu token ile değiştir
                var baseUrl = _configuration["Integration:Keycloak:BaseUrl"];
                var realm = _configuration["Integration:Keycloak:Realm"];
                var clientId = _configuration["Integration:Keycloak:ClientId"];
                var clientSecret = _configuration["Integration:Keycloak:ClientSecret"];
                
                if (string.IsNullOrEmpty(baseUrl) || string.IsNullOrEmpty(realm))
                {
                    throw new Exception("Keycloak BaseUrl or Realm is not configured");
                }

                var keycloakUrl = $"{baseUrl.TrimEnd('/')}/realms/{realm}/protocol/openid-connect/token";
                var frontendUrl = _configuration["Integration:Frontend:Url"];
                if (string.IsNullOrEmpty(frontendUrl))
                {
                    throw new InvalidOperationException("Frontend URL is not configured in appsettings.json (Integration:Frontend:Url)");
                }
                var redirectUri = frontendUrl.TrimEnd('/') + "/callback"; // Frontend ile eşleştiğinden emin ol

                var tokenContent = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("grant_type", "authorization_code"),
                    new KeyValuePair<string, string>("client_id", clientId ?? ""),
                    new KeyValuePair<string, string>("client_secret", clientSecret ?? ""),
                    new KeyValuePair<string, string>("code", code),
                    new KeyValuePair<string, string>("redirect_uri", redirectUri)
                });

                var tokenResponse = await _httpClient.PostAsync(keycloakUrl, tokenContent);
                if (!tokenResponse.IsSuccessStatusCode)
                {
                    var error = await tokenResponse.Content.ReadAsStringAsync();
                    _logger.LogError("Keycloak token exchange failed: {Error}", error);
                    throw new Exception("Keycloak login failed");
                }

                var tokenJson = await tokenResponse.Content.ReadAsStringAsync();
                using var tokenDoc = System.Text.Json.JsonDocument.Parse(tokenJson);
                var accessToken = tokenDoc.RootElement.GetProperty("access_token").GetString();

                // 2. Kullanıcı Bilgilerini Al
                var userInfoUrl = $"{baseUrl.TrimEnd('/')}/realms/{realm}/protocol/openid-connect/userinfo";
                
                var userInfoRequest = new HttpRequestMessage(HttpMethod.Get, userInfoUrl);
                userInfoRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
                
                var userInfoResponse = await _httpClient.SendAsync(userInfoRequest);
                if (!userInfoResponse.IsSuccessStatusCode)
                {
                    var errorContent = await userInfoResponse.Content.ReadAsStringAsync();
                    _logger.LogError("Keycloak user info failed. Status: {Status}, Error: {Error}", userInfoResponse.StatusCode, errorContent);
                    throw new Exception("Failed to get user info from Keycloak");
                }

                var userInfoJson = await userInfoResponse.Content.ReadAsStringAsync();
                _logger.LogInformation("Keycloak User Info Response: {UserInfo}", userInfoJson);
                using var userDoc = System.Text.Json.JsonDocument.Parse(userInfoJson);
                var root = userDoc.RootElement;
                
                // Konfigürasyondan Özellik Anahtarlarını Al
                var sicilKey = _configuration["Integration:Keycloak:AttributeMapping:Sicil"] ?? "sicil_no";
                var sectorKey = _configuration["Integration:Keycloak:AttributeMapping:Sector"] ?? "sektor";
                var directorateKey = _configuration["Integration:Keycloak:AttributeMapping:Directorate"] ?? "mudurluk";
                var departmentKey = _configuration["Integration:Keycloak:AttributeMapping:Department"] ?? "department";
                var nameKey = _configuration["Integration:Keycloak:AttributeMapping:Name"] ?? "name";
                var emailKey = _configuration["Integration:Keycloak:AttributeMapping:Email"] ?? "email";
                var usernameKey = _configuration["Integration:Keycloak:AttributeMapping:Username"] ?? "preferred_username";

                // Kullanıcı Detaylarını Çıkar
                // Kullanıcı adı her zaman preferred_username'dir ancak geçersiz kılınabilir
                var username = root.TryGetProperty(usernameKey, out var uProp) ? uProp.GetString() : null;
                
                // Sicil yapılandırılmış anahtardan gelir
                var sicilNo = root.TryGetProperty(sicilKey, out var sProp) ? sProp.GetString() : null;

                if (string.IsNullOrEmpty(username))
                {
                    throw new Exception($"Username ({usernameKey}) not found in Keycloak user info");
                }

                var email = root.TryGetProperty(emailKey, out var emailProp) ? emailProp.GetString() : $"{username}@aselsan.com.tr";
                var name = root.TryGetProperty(nameKey, out var nameProp) ? nameProp.GetString() : username;

                // Yapılandırılmış anahtarları kullanarak Organizasyon Verilerini Çıkar
                var sectorName = root.TryGetProperty(sectorKey, out var sNameProp) ? sNameProp.GetString() : null;
                var directorateName = root.TryGetProperty(directorateKey, out var dNameProp) ? dNameProp.GetString() : null;
                var departmentName = root.TryGetProperty(departmentKey, out var depNameProp) ? depNameProp.GetString() : null;

                int? sectorId = null;
                int? directorateId = null;
                int? departmentId = null;

                // 1. Sektör Kontrolü ve Oluşturma (Auto-Provisioning)
                if (!string.IsNullOrEmpty(sectorName))
                {
                    var cleanSectorName = sectorName.Trim();
                    var sector = await _unitOfWork.Repository<Sector>().GetQueryable()
                        .FirstOrDefaultAsync(s => s.Name.ToLower() == cleanSectorName.ToLower());
                        
                    if (sector == null)
                    {
                        _logger.LogInformation("Auto-provisioning new Sector: {SectorName}", cleanSectorName);
                        sector = new Sector 
                        { 
                            Name = cleanSectorName, 
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        await _unitOfWork.Repository<Sector>().AddAsync(sector);
                        await _unitOfWork.SaveChangesAsync();
                    }
                    sectorId = sector.Id;
                }

                // 2. Direktörlük Kontrolü ve Oluşturma
                if (!string.IsNullOrEmpty(directorateName))
                {
                    var cleanDirectorateName = directorateName.Trim();
                    var directorate = await _unitOfWork.Repository<Directorate>().GetQueryable()
                        .FirstOrDefaultAsync(d => d.Name.ToLower() == cleanDirectorateName.ToLower());
                        
                    if (directorate == null)
                    {
                        _logger.LogInformation("Auto-provisioning new Directorate: {DirectorateName}", cleanDirectorateName);
                        directorate = new Directorate 
                        { 
                            Name = cleanDirectorateName, 
                            SectorId = sectorId, // Varsa bağlı olduğu sektörü ata
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        await _unitOfWork.Repository<Directorate>().AddAsync(directorate);
                        await _unitOfWork.SaveChangesAsync();
                    }
                    directorateId = directorate.Id;
                }

                // 3. Departman Kontrolü ve Oluşturma
                if (!string.IsNullOrEmpty(departmentName))
                {
                    var cleanDepartmentName = departmentName.Trim();
                    var department = await _unitOfWork.Repository<Department>().GetQueryable()
                        .FirstOrDefaultAsync(d => d.Name.ToLower() == cleanDepartmentName.ToLower());
                        
                    if (department == null)
                    {
                        _logger.LogInformation("Auto-provisioning new Department: {DepartmentName}", cleanDepartmentName);
                        department = new Department 
                        { 
                            Name = cleanDepartmentName, 
                            SectorId = sectorId,
                            DirectorateId = directorateId,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        await _unitOfWork.Repository<Department>().AddAsync(department);
                        await _unitOfWork.SaveChangesAsync();
                    }
                    departmentId = department.Id;
                }

                // 3. Kullanıcı Adına Göre Kullanıcı Bul veya Oluştur
                // 3. Kullanıcıyı Bul veya Oluştur (Sicil No öncelikli)
                User? user = null;

                // Önce Sicil No ile ara (Eğer sicil no geldiyse)
                if (!string.IsNullOrEmpty(sicilNo))
                {
                    user = await _unitOfWork.Repository<User>()
                        .GetQueryable()
                        .Include(u => u.Department)
                        .Include(u => u.Sector)
                        .Include(u => u.Directorate)
                        .Include(u => u.Role)
                        .FirstOrDefaultAsync(u => u.Sicil == sicilNo);
                }

                // Sicil ile bulunamadıysa Username ile ara
                if (user == null)
                {
                    user = await _unitOfWork.Repository<User>()
                        .GetQueryable()
                        .Include(u => u.Department)
                        .Include(u => u.Sector)
                        .Include(u => u.Directorate)
                        .Include(u => u.Role)
                        .FirstOrDefaultAsync(u => u.Username == username);
                }

                if (user == null)
                {
                    // Yeni Kullanıcı Oluştur
                    _logger.LogInformation($"User not found (Sicil: {sicilNo}, Username: {username}). Creating new user.");
                    
                    user = new User
                    {
                        Username = username!,
                        Name = name ?? username!,
                        Email = email ?? "",
                        Sicil = sicilNo, // Sicil no kaydediliyor
                        SectorId = sectorId,
                        DirectorateId = directorateId,
                        DepartmentId = departmentId,
                        RoleId = 2, // Varsayılan Rol: User (veya uygun ID)
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        PasswordHash = PasswordHasher.HashPassword(Guid.NewGuid().ToString()) // Rastgele şifre
                    };

                    await _userRepository.AddAsync(user);
                    await _unitOfWork.SaveChangesAsync();
                }
                else
                {
                    // Mevcut kullanıcıyı güncelle (Sync)
                    bool isModified = false;
                    
                    _logger.LogInformation("Checking for user updates. User: {UserId}, Sicil: {Sicil}", user.Id, user.Sicil);
                    _logger.LogInformation("Incoming - SectorId: {SectorId}, DirectorateId: {DirectorateId}, DepartmentId: {DepartmentId}", sectorId, directorateId, departmentId);
                    _logger.LogInformation("Current  - SectorId: {CSectorId}, DirectorateId: {CDirectorateId}, DepartmentId: {CDepartmentId}", user.SectorId, user.DirectorateId, user.DepartmentId);

                    if (user.Sicil != sicilNo && !string.IsNullOrEmpty(sicilNo)) 
                    { 
                        _logger.LogInformation("Updating Sicil: {Old} -> {New}", user.Sicil, sicilNo);
                        user.Sicil = sicilNo; 
                        isModified = true; 
                    }
                    
                    if (user.SectorId != sectorId && sectorId.HasValue) 
                    { 
                        _logger.LogInformation("Updating SectorId: {Old} -> {New}", user.SectorId, sectorId);
                        user.SectorId = sectorId; 
                        isModified = true; 
                    }
                    
                    if (user.DirectorateId != directorateId && directorateId.HasValue) 
                    { 
                        _logger.LogInformation("Updating DirectorateId: {Old} -> {New}", user.DirectorateId, directorateId);
                        user.DirectorateId = directorateId; 
                        isModified = true; 
                    }
                    
                    if (user.DepartmentId != departmentId && departmentId.HasValue) 
                    { 
                        _logger.LogInformation("Updating DepartmentId: {Old} -> {New}", user.DepartmentId, departmentId);
                        user.DepartmentId = departmentId; 
                        isModified = true; 
                    }
                    
                    if (user.Name != name && !string.IsNullOrEmpty(name)) 
                    { 
                        user.Name = name; 
                        isModified = true; 
                    }
                    
                    if (user.Email != email && !string.IsNullOrEmpty(email)) 
                    { 
                        user.Email = email; 
                        isModified = true; 
                    }
                    
                    user.LastLogin = DateTime.UtcNow;
                    isModified = true; // Login zamanı her zaman değişir (LastLogin yüzünden)

                    if (isModified)
                    {
                        _userRepository.Update(user);
                        await _unitOfWork.SaveChangesAsync();
                        _logger.LogInformation("User updated successfully.");
                    }
                }

                // Navigasyon özelliklerini almak için yeniden yükle
                user = await _unitOfWork.Repository<User>()
                    .GetQueryable()
                    .Include(u => u.Role)
                    .Include(u => u.Department)
                    .Include(u => u.Sector)
                    .Include(u => u.Directorate)
                    .FirstOrDefaultAsync(u => u.Id == user.Id);

                // 4. Token Oluştur
                var appToken = _jwtService.GenerateToken(user!);

                return new LoginResponseDto
                {
                    Token = appToken,
                    User = user != null ? MapToUserDto(user) : new UserDto()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Keycloak login error: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<UserDto> GetCurrentUserAsync(int userId)
        {
            var user = await _unitOfWork.Repository<User>()
                .GetQueryable()
                .Include(u => u.Department)
                .Include(u => u.Sector)
                .Include(u => u.Directorate)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);
            
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            return MapToUserDto(user);
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            if (!PasswordHasher.VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Current password is incorrect");
            }

            user.PasswordHash = PasswordHasher.HashPassword(changePasswordDto.NewPassword);
            await _userRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Username = user.Username,
                Sicil = user.Sicil,
                SectorId = user.SectorId,
                Sector = user.Sector?.Name,
                DirectorateId = user.DirectorateId,
                Directorate = user.Directorate?.Name,
                Role = user.Role?.Ad ?? "",
                RoleId = user.RoleId,
                DepartmentId = user.DepartmentId,
                DepartmentName = user.Department?.Name,
                IsActive = user.IsActive,
                LastLogin = user.LastLogin,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                IsDemo = user.Id == 0 // ID 0 ise Demo kullanıcıdır
            };
        }
    }
}


