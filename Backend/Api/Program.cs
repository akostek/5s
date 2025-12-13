using Application.Interfaces;
using Application.Services;
using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Api.Middleware;
using Api.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using DotNetEnv;

// .env dosyasından ortam değişkenlerini yükle - Kurumsal standartlar gereği KALDIRILDI
// Yapılandırma artık appsettings.json üzerinden yönetiliyor
// var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
// if (File.Exists(envPath))
// {
//     Env.Load(envPath);
// }

var builder = WebApplication.CreateBuilder(args);

// Servisleri konteynere ekle
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // JSON serileştirme/ters serileştirme için camelCase kullan (Frontend ile uyumluluk için)
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true; // Büyük/küçük harf duyarsız eşleşmeye izin ver
        // Enum değerlerini string'e dönüştür
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        // Manuel yönetim için otomatik ModelState doğrulamasını devre dışı bırak
        options.SuppressModelStateInvalidFilter = false; // Otomatik doğrulamayı koru ancak özel işleme izin ver
    });

// Veritabanı Yapılandırması - Ortam değişkeninden veya konfigürasyondan yükle
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    // Öncelik: Ortam Değişkeni > appsettings.json
    var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")
        ?? builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Database connection string not configured. Please set DATABASE_CONNECTION_STRING environment variable or in appsettings.json");
    
    options.UseNpgsql(connectionString);
    
    // Güvenlik: Hassas verileri (şifreler, tokenlar vb.) asla loglama
    options.EnableSensitiveDataLogging(false);
    
    // Detaylı hataları sadece geliştirme ortamında göster (güvenlik en iyi uygulaması)
    options.EnableDetailedErrors(builder.Environment.IsDevelopment());
});

// Repository ve Unit of Work Deseni
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Uygulama Servisleri
builder.Services.AddHttpClient<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IAreaService, AreaService>();
builder.Services.AddScoped<AuditService>();
builder.Services.AddScoped<QuestionService>();
builder.Services.AddScoped<AuditResponseService>();
builder.Services.AddScoped<IActionService, ActionService>();
builder.Services.AddScoped<ISectorService, SectorService>();
builder.Services.AddScoped<IDirectorateService, DirectorateService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<ImageUploadService>();
builder.Services.AddHttpClient<IMailService, KeycloakMailService>();

// JWT Kimlik Doğrulama - Ortam değişkenlerinden veya konfigürasyondan yükle
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
    ?? builder.Configuration["Jwt:Secret"] 
    ?? throw new InvalidOperationException("JWT Secret not configured. Please set JWT_SECRET environment variable or in appsettings.json");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") 
    ?? builder.Configuration["Jwt:Issuer"] 
    ?? "FiveSAuditPlatform";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") 
    ?? builder.Configuration["Jwt:Audience"] 
    ?? "FiveSAuditPlatformUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret ?? throw new InvalidOperationException("JWT Secret not configured")))
    };
});

builder.Services.AddAuthorization();

// CORS Yapılandırması
builder.Services.AddCors(options =>
{
    var allowedOrigins = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS")?
        .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        ?? Array.Empty<string>();
    
    options.AddPolicy("AllowAll", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Geliştirme: Herkese izin ver
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            // Production: Sadece izin verilen originler
            if (allowedOrigins.Length > 0)
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            }
            else
            {
                // Güvenli varsayılan: Eğer origin belirtilmemişse hiçbir şeye izin verme (veya sadece same-origin)
                // Bu durum loglanmalı
                Console.WriteLine("UYARI: Production ortamında CORS_ALLOWED_ORIGINS ayarlanmamış! CORS istekleri engellenecek.");
            }
        }
    });
});

// Swagger Yapılandırması
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "5S Audit Platform API",
        Version = "v1",
        Description = "Corporate 5S Audit Management System API"
    });

    // Swagger'da JWT Kimlik Doğrulama
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// HTTP istek hattını yapılandır
// Swagger sadece Geliştirme ortamında (güvenlik en iyi uygulaması)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "5S Audit Platform API v1");
        c.DisplayRequestDuration(); // Show request duration in Swagger UI
    });
}

// Global Hata Yönetimi
app.UseMiddleware<ExceptionHandlingMiddleware>();

// CORS, UseAuthentication ve UseAuthorization'dan önce gelmelidir
app.UseCors("AllowAll");

// Statik dosyaları sun (yüklenen resimler için)
// Varsayılan statik dosyalar wwwroot klasöründen sunulur
app.UseStaticFiles();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Sağlık Kontrolü (Health Check) Endpoint'i
app.MapGet("/api/health", () => new
{
    status = "OK",
    timestamp = DateTime.UtcNow,
    version = "1.0.0"
});

app.Run();


