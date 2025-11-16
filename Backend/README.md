# 5S Audit Platform - Backend API

Kurumsal 5S denetim yönetim sistemi için .NET 8.0 tabanlı RESTful API. Clean Architecture prensiplerine uygun olarak geliştirilmiştir.

---

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Mimari Yapı](#mimari-yapı)
- [Teknoloji Stack](#teknoloji-stack)
- [Kurulum ve Yapılandırma](#kurulum-ve-yapılandırma)
- [Geliştirme Ortamı](#geliştirme-ortamı)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Veritabanı Yönetimi](#veritabanı-yönetimi)
- [Güvenlik](#güvenlik)
- [Deployment](#deployment)
- [Sorun Giderme](#sorun-giderme)

---

## 🎯 Genel Bakış

5S Audit Platform Backend, kurumsal denetim süreçlerini yönetmek için tasarlanmış bir REST API'dir. Sistem şu ana özellikleri sunar:

- **Kullanıcı Yönetimi**: Rol tabanlı erişim kontrolü, sektör/direktörlük bazlı filtreleme
- **Denetim Yönetimi**: Denetim oluşturma, takip, raporlama
- **Soru-Cevap Sistemi**: Kategori bazlı sorular ve otomatik skor hesaplama
- **Aksiyon Takibi**: Denetim sonrası aksiyon planları ve takibi
- **Raporlama**: Dashboard, trend analizi, performans metrikleri
- **Dosya Yönetimi**: Güvenli görsel yükleme ve saklama

---

## 🏗️ Mimari Yapı

Proje **Clean Architecture** prensiplerine uygun olarak 4 ana katmandan oluşmaktadır:

```
Backend/
├── FiveS.Domain/          # Domain Layer (En alt katman)
├── FiveS.Infrastructure/  # Infrastructure Layer
├── FiveS.Application/     # Application Layer
└── FiveS.Api/            # Presentation Layer (En üst katman)
```

### Katman Sorumlulukları

#### 1. FiveS.Domain (Domain Layer)
**Sorumluluk:** İş mantığının çekirdeği, entity'ler, enum'lar, domain interface'leri

**İçerik:**
- `Entities/`: Veritabanı entity modelleri (User, Audit, Question, vb.)
- `Enums/`: Enum tanımlamaları (UserRole, AuditStatus, vb.)
- `Interfaces/`: Repository ve service interface'leri
- `Common/`: BaseEntity gibi ortak sınıflar

**Bağımlılık:** Yok (En alt katman, hiçbir katmana bağımlı değil)

**Örnek Kullanım:**
```csharp
// Entity örneği
public class User : BaseEntity
{
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public int RoleId { get; set; }
    // ...
}
```

---

#### 2. FiveS.Infrastructure (Infrastructure Layer)
**Sorumluluk:** Veri erişimi, external service implementasyonları, altyapı servisleri

**İçerik:**
- `Data/`: DbContext ve veritabanı yapılandırması
- `Repositories/`: Repository pattern implementasyonları
- `Services/`: JWT, Password hashing gibi altyapı servisleri
- `Configurations/`: Entity Framework yapılandırmaları
- `Migrations/`: Veritabanı migration dosyaları

**Bağımlılık:** FiveS.Domain

**Örnek Kullanım:**
```csharp
// Repository implementasyonu
public class Repository<T> : IRepository<T> where T : BaseEntity
{
    // CRUD işlemleri
}
```

---

#### 3. FiveS.Application (Application Layer)
**Sorumluluk:** İş mantığı, use case'ler, DTO'lar, validation

**İçerik:**
- `DTOs/`: Data Transfer Objects (API ile domain arasında veri transferi)
- `Services/`: Business logic servisleri
- `Interfaces/`: Service interface'leri
- `Validators/`: FluentValidation ile input validation
- `Mappings/`: DTO-Entity mapping logic

**Bağımlılık:** FiveS.Domain, FiveS.Infrastructure

**Örnek Kullanım:**
```csharp
// Service implementasyonu
public class AuthService : IAuthService
{
    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto loginDto)
    {
        // İş mantığı burada
    }
}
```

---

#### 4. FiveS.Api (Presentation Layer)
**Sorumluluk:** HTTP endpoint'ler, controller'lar, middleware'ler, konfigürasyon

**İçerik:**
- `Controllers/`: REST API controller'ları
- `Middleware/`: Exception handling, logging middleware'leri
- `Helpers/`: Yardımcı sınıflar
- `Program.cs`: Uygulama başlangıç noktası ve servis konfigürasyonu
- `appsettings.json`: Konfigürasyon dosyaları

**Bağımlılık:** Tüm katmanlar

**Örnek Kullanım:**
```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
    {
        // Controller logic
    }
}
```

---

## 🛠️ Teknoloji Stack

### Backend Framework
- **.NET 8.0** - Modern, yüksek performanslı framework
- **ASP.NET Core** - Web API framework

### Veritabanı
- **PostgreSQL** - Güçlü, açık kaynak ilişkisel veritabanı
- **Entity Framework Core 8.0** - ORM (Object-Relational Mapping)
- **Npgsql** - PostgreSQL provider

### Authentication & Authorization
- **JWT (JSON Web Tokens)** - Token tabanlı kimlik doğrulama
- **BCrypt.Net** - Güvenli şifre hashleme
- **Role-based Access Control (RBAC)** - Rol tabanlı yetkilendirme

### Validation & Documentation
- **FluentValidation** - Güçlü input validation
- **Swagger/OpenAPI** - API dokümantasyonu ve test arayüzü

### Diğer
- **DotNetEnv** - Environment variable yönetimi
- **Serilog** (opsiyonel) - Structured logging

---

## ⚙️ Kurulum ve Yapılandırma

### Gereksinimler

- **.NET 8.0 SDK** veya üzeri
- **PostgreSQL 12+** (veya Docker ile PostgreSQL container)
- **Git** (kod yönetimi için)

### Adım 1: Projeyi İndirme

```bash
git clone <repository-url>
cd Backend
```

### Adım 2: Bağımlılıkları Yükleme

```bash
cd FiveS.Api
dotnet restore
```

### Adım 3: Environment Variables Yapılandırma

**ÖNEMLİ:** Bu proje kurumsal güvenlik standartlarına uygun olarak environment variables kullanmaktadır.

1. `.env` dosyası oluşturun:
   ```bash
   cd Backend/FiveS.Api
   # .env.example dosyasını .env olarak kopyalayın (eğer varsa)
   # Veya manuel olarak oluşturun
   ```

2. `.env` dosyasını düzenleyin:
   ```env
   # Veritabanı Bağlantı String'i
   DATABASE_CONNECTION_STRING=Host=localhost;Port=5432;Database=fives_audit;Username=postgres;Password=your_secure_password
   
   # JWT Ayarları
   JWT_SECRET=YourSuperSecretKeyForJWTTokenGeneration123!ChangeThisInProduction_Minimum32Characters
   JWT_ISSUER=FiveSAuditPlatform
   JWT_AUDIENCE=FiveSAuditPlatformUsers
   JWT_EXPIRATION_HOURS=24
   ```

   **Güvenlik Notları:**
   - `JWT_SECRET` en az 32 karakter olmalıdır
   - Production'da güçlü, rastgele bir secret kullanın
   - `.env` dosyası Git'e commit edilmez (`.gitignore`'da tanımlı)

3. Detaylı bilgi için `README_ENV.md` dosyasına bakın.

### Adım 4: Veritabanı Kurulumu

#### Seçenek 1: PostgreSQL Kurulumu (Yerel)

1. PostgreSQL'i kurun ve çalıştırın
2. Veritabanı oluşturun:
   ```sql
   CREATE DATABASE fives_audit;
   ```

#### Seçenek 2: Docker ile PostgreSQL

```bash
docker run --name postgres-5s \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=fives_audit \
  -p 5432:5432 \
  -d postgres:15
```

### Adım 5: Migration'ları Uygulama

```bash
cd Backend/FiveS.Api
dotnet ef database update --project ../FiveS.Infrastructure
```

**Not:** Migration'lar uygulama başlatıldığında otomatik olarak uygulanır. Manuel uygulama için yukarıdaki komutu kullanın.

### Adım 6: Uygulamayı Çalıştırma

```bash
cd Backend/FiveS.Api
dotnet run
```

Uygulama varsayılan olarak şu adreslerde çalışacaktır:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`

---

## 💻 Geliştirme Ortamı

### Development Mode

```bash
cd Backend/FiveS.Api
dotnet run
```

### Watch Mode (Otomatik Yeniden Başlatma)

Kod değişikliklerinde otomatik olarak yeniden başlatır:

```bash
dotnet watch run
```

### Swagger UI

Development mode'da Swagger UI otomatik olarak aktif olur:
```
https://localhost:5001/swagger
```

Swagger UI'da:
- Tüm API endpoint'lerini görebilirsiniz
- API'yi test edebilirsiniz
- JWT token ile authentication yapabilirsiniz

### Debugging

**Visual Studio:**
1. Projeyi açın
2. F5 ile debug modda çalıştırın

**Visual Studio Code:**
1. `.vscode/launch.json` dosyasını oluşturun (gerekirse)
2. F5 ile debug modda çalıştırın

---

## 📚 API Dokümantasyonu

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "Admin",
    "roleId": 1
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword123"
}
```

---

### Users Endpoints (Admin Only)

#### Get All Users
```http
GET /api/users
Authorization: Bearer {token}
```

#### Get User by ID
```http
GET /api/users/{id}
Authorization: Bearer {token}
```

#### Create User
```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "New User",
  "roleId": 2,
  "departmentId": 1
}
```

#### Update User
```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### Delete User
```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

#### Reset Password
```http
POST /api/users/{id}/reset-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "newPassword": "newPassword123"
}
```

---

### Audits Endpoints

#### Get All Audits
```http
GET /api/audits?page=1&limit=10&status=published
Authorization: Bearer {token}
```

#### Get Audit by ID
```http
GET /api/audits/{id}
Authorization: Bearer {token}
```

#### Create Audit
```http
POST /api/audits
Authorization: Bearer {token}
Content-Type: application/json

{
  "departmentId": 1,
  "auditorId": 2,
  "auditDate": "2024-01-15",
  "area": "Production Area A"
}
```

#### Submit Audit Responses
```http
POST /api/audits/{id}/responses
Authorization: Bearer {token}
Content-Type: application/json

{
  "responses": [
    {
      "questionId": 1,
      "response": "High",
      "imageUrls": ["/uploads/images/image1.jpg"]
    }
  ]
}
```

#### Publish Audit
```http
POST /api/audits/{id}/publish
Authorization: Bearer {token}
```

---

### Questions & Categories Endpoints

#### Get Categories with Questions
```http
GET /api/questions/categories
Authorization: Bearer {token}
```

#### Create Question
```http
POST /api/questions
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Is the workplace organized?",
  "categoryId": 1,
  "points": 10
}
```

---

### Image Upload Endpoints

#### Upload Single Image
```http
POST /api/ImageUpload/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary data]
```

#### Upload Multiple Images
```http
POST /api/ImageUpload/upload-multiple
Authorization: Bearer {token}
Content-Type: multipart/form-data

files: [binary data]
files: [binary data]
files: [binary data]
```

**Limitler:**
- Maksimum dosya boyutu: 5MB
- Maksimum dosya sayısı: 3
- İzin verilen formatlar: JPG, JPEG, PNG, GIF, BMP, WEBP

---

### Reports Endpoints

#### Dashboard Stats
```http
GET /api/reports/dashboard
Authorization: Bearer {token}
```

#### Department Reports
```http
GET /api/reports/departments
Authorization: Bearer {token}
```

#### Department Progress
```http
GET /api/reports/departments/{id}/progress?months=6
Authorization: Bearer {token}
```

---

## 🗄️ Veritabanı Yönetimi

### Migration Oluşturma

Yeni bir migration oluşturmak için:

```bash
cd Backend/FiveS.Api
dotnet ef migrations add MigrationName --project ../FiveS.Infrastructure
```

**Örnek:**
```bash
dotnet ef migrations add AddUserLastLoginField --project ../FiveS.Infrastructure
```

### Migration Uygulama

```bash
dotnet ef database update --project ../FiveS.Infrastructure
```

### Migration Geri Alma

Belirli bir migration'a geri dönmek için:

```bash
dotnet ef database update PreviousMigrationName --project ../FiveS.Infrastructure
```

### Veritabanını Sıfırlama (DİKKAT: Tüm veriler silinir!)

```bash
dotnet ef database drop --project ../FiveS.Infrastructure
dotnet ef database update --project ../FiveS.Infrastructure
```

### Migration Dosyalarını Silme

Son migration'ı silmek için (henüz uygulanmamışsa):

```bash
dotnet ef migrations remove --project ../FiveS.Infrastructure
```

---

## 🔒 Güvenlik

### Authentication

- **JWT Token Tabanlı**: Tüm API endpoint'leri JWT token ile korunur
- **Token Süresi**: 24 saat (configurable)
- **Algorithm**: HMAC-SHA256
- **Claims**: UserId, Email, Role, DepartmentId, SectorId, DirectorateId

### Password Security

- **Hashing Algorithm**: BCrypt
- **Work Factor**: 10 (configurable)
- **Minimum Length**: 6 karakter (production'da 12+ önerilir)

### Authorization

- **Role-based Access Control (RBAC)**: Kullanıcı rolleri tabanlı yetkilendirme
- **Permission System**: Sayfa ve buton bazlı yetki kontrolü
- **Department/Sector Filtering**: Kullanıcılar sadece yetkili oldukları departman/sektör verilerini görebilir

### CORS (Cross-Origin Resource Sharing)

**Development:**
```csharp
policy.AllowAnyOrigin()
      .AllowAnyMethod()
      .AllowAnyHeader();
```

**Production:**
```csharp
policy.WithOrigins("https://yourdomain.com")
      .AllowCredentials()
      .AllowAnyMethod()
      .AllowAnyHeader();
```

### Input Validation

- **FluentValidation**: Tüm input'lar validate edilir
- **SQL Injection Protection**: Entity Framework parametreli sorgular kullanır
- **XSS Protection**: Input sanitization (frontend'de de yapılmalı)

### File Upload Security

- **File Type Validation**: Sadece belirli formatlar kabul edilir
- **File Size Limit**: Maksimum 5MB
- **Path Traversal Protection**: Dosya adları sanitize edilir
- **Authorization Required**: Tüm upload endpoint'leri yetkilendirme gerektirir

### Best Practices

1. **Environment Variables**: Hassas bilgiler environment variables'da saklanır
2. **HTTPS**: Production'da HTTPS zorunludur
3. **Error Handling**: Detaylı hata mesajları production'da gösterilmez
4. **Logging**: Hassas bilgiler log'lara yazılmaz
5. **Dependency Updates**: Düzenli olarak güvenlik güncellemeleri yapılır

---

## 🚀 Deployment

### Production Build

```bash
cd Backend/FiveS.Api
dotnet publish -c Release -o ./publish
```

### IIS Deployment

1. **Publish:**
   ```bash
   dotnet publish -c Release -o C:\inetpub\wwwroot\FiveSApi
   ```

2. **IIS'de Site Oluştur:**
   - IIS Manager'ı açın
   - "Add Website" ile yeni site oluşturun
   - Physical path: `C:\inetpub\wwwroot\FiveSApi`
   - Port: 80 veya 443 (HTTPS için)

3. **Application Pool Ayarları:**
   - .NET CLR Version: **No Managed Code**
   - Managed Pipeline Mode: **Integrated**

4. **Environment Variables:**
   - Application Pool > Advanced Settings > Environment Variables
   - Gerekli environment variables'ı ekleyin

5. **HTTPS Yapılandırması:**
   - SSL sertifikası yükleyin
   - HTTPS binding ekleyin

### Docker Deployment

#### Dockerfile Örneği

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "FiveS.Api.dll"]
```

#### Docker Compose Örneği

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:80"
    environment:
      - DATABASE_CONNECTION_STRING=Host=db;Port=5432;Database=fives_audit;Username=postgres;Password=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=fives_audit
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Azure App Service Deployment

1. **Azure Portal'da App Service oluşturun**
2. **Deployment Center'dan deploy edin:**
   - GitHub, Azure DevOps, veya Local Git
3. **Configuration > Application Settings:**
   - Environment variables ekleyin
4. **Configuration > Connection Strings:**
   - Database connection string ekleyin

### Linux Deployment (Nginx + Systemd)

1. **Publish:**
   ```bash
   dotnet publish -c Release -o /var/www/fives-api
   ```

2. **Systemd Service:**
   ```ini
   [Unit]
   Description=5S Audit Platform API
   
   [Service]
   WorkingDirectory=/var/www/fives-api
   ExecStart=/usr/bin/dotnet /var/www/fives-api/FiveS.Api.dll
   Restart=always
   RestartSec=10
   Environment=ASPNETCORE_ENVIRONMENT=Production
   Environment=DATABASE_CONNECTION_STRING=...
   Environment=JWT_SECRET=...
   
   [Install]
   WantedBy=multi-user.target
   ```

3. **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection keep-alive;
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🔧 Sorun Giderme

### Connection String Hataları

**Sorun:** "Database connection string not configured"

**Çözüm:**
1. `.env` dosyasının `Backend/FiveS.Api/` klasöründe olduğundan emin olun
2. `DATABASE_CONNECTION_STRING` değişkenini kontrol edin
3. PostgreSQL'in çalıştığından emin olun:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # Linux
   sudo systemctl status postgresql
   ```
4. Firewall ayarlarını kontrol edin

---

### JWT Hataları

**Sorun:** "JWT Secret not configured"

**Çözüm:**
1. `.env` dosyasında `JWT_SECRET` değişkenini kontrol edin
2. Secret'ın en az 32 karakter olduğundan emin olun
3. Environment variable'ın doğru yüklendiğini kontrol edin

**Sorun:** "Token validation failed"

**Çözüm:**
1. `JWT_ISSUER` ve `JWT_AUDIENCE` değerlerinin eşleştiğini kontrol edin
2. Token'ın süresinin dolmadığını kontrol edin
3. Secret key'in aynı olduğundan emin olun

---

### Migration Hataları

**Sorun:** "Migration already applied" veya "Migration not found"

**Çözüm:**
1. Migration durumunu kontrol edin:
   ```bash
   dotnet ef migrations list --project ../FiveS.Infrastructure
   ```
2. Veritabanını kontrol edin:
   ```sql
   SELECT * FROM "__EFMigrationsHistory";
   ```
3. Gerekirse migration'ı geri alın ve yeniden uygulayın

---

### Port Çakışması

**Sorun:** "Address already in use"

**Çözüm:**
1. `launchSettings.json` dosyasında port'u değiştirin
2. Veya başka bir process'in aynı port'u kullandığını kontrol edin:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Linux
   sudo lsof -i :5000
   ```

---

### CORS Hataları

**Sorun:** Frontend'den API'ye istek atılamıyor

**Çözüm:**
1. `Program.cs`'de CORS policy'yi kontrol edin
2. Frontend URL'inin CORS policy'de tanımlı olduğundan emin olun
3. Development'ta `AllowAnyOrigin()` kullanılabilir, production'da spesifik origin'ler tanımlanmalı

---

## 📞 Destek ve İletişim

- **Teknik Destek:** [IT Destek Ekibi]
- **Güvenlik Sorunları:** [Güvenlik Ekibi]
- **Dokümantasyon:** Bu README ve Swagger UI

---

## 📄 Lisans

Kuruluş içi kullanım için geliştirilmiştir. Tüm hakları saklıdır.

---

**Son Güncelleme:** 2024  
**Versiyon:** 1.0.0
