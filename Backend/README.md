# 5S Audit Platform - Backend

.NET 8.0 tabanlı, Clean Architecture prensiplerine uygun REST API.

## Proje Yapısı

### FiveS.Domain
**Sorumluluk**: Entity modelleri, Enum'lar, Domain interface'leri

**İçerik**:
- `Entities/`: Veritabanı entity modelleri
- `Enums/`: Enum tanımlamaları (UserRole, AuditStatus, vb.)
- `Interfaces/`: Repository interface'leri
- `Common/`: Base entity ve ortak sınıflar

**Bağımlılık**: Yok (En alt katman)

### FiveS.Infrastructure
**Sorumluluk**: Data access, external service implementasyonları

**İçerik**:
- `Data/`: DbContext ve veritabanı yapılandırması
- `Repositories/`: Repository pattern implementasyonları
- `Services/`: Infrastructure servisleri (JWT, Password hashing)
- `Configurations/`: Entity Framework yapılandırmaları

**Bağımlılık**: FiveS.Domain

### FiveS.Application
**Sorumluluk**: Business logic, DTOs, Use cases

**İçerik**:
- `DTOs/`: Data Transfer Objects
- `Services/`: Business logic servisleri
- `Interfaces/`: Service interface'leri
- `Validators/`: Input validation (FluentValidation)
- `Mappings/`: DTO mapping logic

**Bağımlılık**: FiveS.Domain, FiveS.Infrastructure

### FiveS.Api
**Sorumluluk**: HTTP endpoints, Controllers

**İçerik**:
- `Controllers/`: REST API controller'ları
- `Middleware/`: Custom middleware'ler
- `Program.cs`: Uygulama başlangıç noktası
- `appsettings.json`: Konfigürasyon dosyaları

**Bağımlılık**: Tüm katmanlar

## Teknolojiler

- **.NET 8.0**
- **Entity Framework Core 8.0**
- **PostgreSQL** (Npgsql provider)
- **JWT Authentication**
- **BCrypt.Net** (Password hashing)
- **Swagger/OpenAPI**
- **FluentValidation** (Input validation)

## API Endpoints

### Authentication
```
POST   /api/auth/login                 # Kullanıcı girişi
GET    /api/auth/me                    # Mevcut kullanıcı bilgisi
POST   /api/auth/change-password       # Şifre değiştirme
POST   /api/auth/logout                # Çıkış
```

### Users (Admin only)
```
GET    /api/users                      # Tüm kullanıcılar
GET    /api/users/{id}                 # Kullanıcı detayı
POST   /api/users                      # Yeni kullanıcı
PUT    /api/users/{id}                 # Kullanıcı güncelleme
DELETE /api/users/{id}                 # Kullanıcı silme
POST   /api/users/{id}/reset-password  # Şifre sıfırlama
```

### Departments
```
GET    /api/departments                # Tüm bölümler
GET    /api/departments/{id}           # Bölüm detayı
POST   /api/departments                # Yeni bölüm (Admin)
PUT    /api/departments/{id}           # Bölüm güncelleme (Admin)
DELETE /api/departments/{id}           # Bölüm silme (Admin)
```

### Audits
```
GET    /api/audits                     # Denetim listesi (filtreleme destekli)
GET    /api/audits/{id}                # Denetim detayı
POST   /api/audits                     # Yeni denetim (Denetçi/Admin)
PUT    /api/audits/{id}                # Denetim güncelleme
POST   /api/audits/{id}/responses      # Cevapları kaydet
POST   /api/audits/{id}/publish        # Denetimi yayınla
DELETE /api/audits/{id}                # Denetim sil (Admin)
PUT    /api/audits/actions/{id}        # Aksiyonu güncelle
```

### Questions & Categories
```
GET    /api/questions/categories       # Kategoriler ve sorular
GET    /api/questions/category/{id}    # Kategori soruları
POST   /api/questions                  # Yeni soru (Admin)
PUT    /api/questions/{id}             # Soru güncelleme (Admin)
DELETE /api/questions/{id}             # Soru silme (Admin)
POST   /api/questions/categories       # Yeni kategori (Admin)
PUT    /api/questions/categories/{id}  # Kategori güncelleme (Admin)
```

### Reports
```
GET    /api/reports/dashboard          # Dashboard istatistikleri
GET    /api/reports/departments        # Bölüm raporları
GET    /api/reports/departments/{id}/progress  # İlerleme raporu
GET    /api/reports/levels             # Seviye dağılımı
GET    /api/reports/top-departments    # En iyi bölümler
GET    /api/reports/trends             # Trend analizi
GET    /api/reports/actions            # Aksiyon istatistikleri
```

### Settings (Admin only)
```
GET    /api/settings                   # Tüm ayarlar
GET    /api/settings/level-thresholds  # Seviye eşikleri
PUT    /api/settings/level-thresholds  # Seviye eşiklerini güncelle
PUT    /api/settings/{key}             # Ayar güncelleme
GET    /api/settings/system-info       # Sistem bilgisi
GET    /api/settings/backup            # Ayarları yedekle
POST   /api/settings/restore           # Ayarları geri yükle
```

## Veritabanı Migration

### Migration oluşturma
```bash
cd FiveS.Api
dotnet ef migrations add InitialCreate --project ../FiveS.Infrastructure
```

### Migration uygulama
```bash
dotnet ef database update
```

### Migration geri alma
```bash
dotnet ef database update PreviousMigrationName
```

## Konfigürasyon

### Environment Variables (.env)

**ÖNEMLİ:** Bu proje kurumsal güvenlik standartlarına uygun olarak environment variables kullanmaktadır.

1. `Backend/FiveS.Api/.env.example` dosyasını `.env` olarak kopyalayın:
   ```bash
   cd Backend/FiveS.Api
   copy .env.example .env
   ```

2. `.env` dosyasını açın ve gerçek değerlerle doldurun:
   ```env
   DATABASE_CONNECTION_STRING=Host=localhost;Port=5432;Database=fives_audit;Username=postgres;Password=your_password
   JWT_SECRET=YourSuperSecretKeyForJWTTokenGeneration123!ChangeThisInProduction
   JWT_ISSUER=FiveSAuditPlatform
   JWT_AUDIENCE=FiveSAuditPlatformUsers
   JWT_EXPIRATION_HOURS=24
   ```

**Güvenlik Notları:**
- `.env` dosyası Git'e commit edilmez (`.gitignore`'da tanımlı)
- Production ortamında environment variables kullanın
- JWT_SECRET için güçlü bir key kullanın (en az 32 karakter)
- Detaylı bilgi için `README_ENV.md` dosyasına bakın

### appsettings.json (Fallback)

`appsettings.json` dosyası artık hassas bilgileri içermez. Environment variables yoksa fallback olarak kullanılır:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": ""
  },
  "Jwt": {
    "Secret": "",
    "Issuer": "FiveSAuditPlatform",
    "Audience": "FiveSAuditPlatformUsers",
    "ExpirationHours": "24"
  }
}
```

## Çalıştırma

### Development mode
```bash
cd FiveS.Api
dotnet run
```

### Watch mode (auto-reload)
```bash
dotnet watch run
```

### Production build
```bash
dotnet publish -c Release -o ./publish
```

## Test

```bash
dotnet test
```

## Swagger UI

Development mode'da Swagger UI otomatik olarak aktif olur:
```
https://localhost:5001/swagger
```

## Güvenlik

### JWT Token
- Token süres: 24 saat (configurable)
- Algorithm: HMAC-SHA256
- Claims: UserId, Email, Role, DepartmentId

### Password Hashing
- BCrypt algoritması
- Work factor: 10

### Authorization
- Role-based: `[Authorize(Roles = "Admin")]`
- Policy-based: Gerektiğinde eklenebilir

## Best Practices

1. **Dependency Injection**: Tüm bağımlılıklar constructor injection ile
2. **Repository Pattern**: Data access soyutlaması
3. **Unit of Work**: Transaction yönetimi
4. **DTOs**: Entity'leri direkt expose etme
5. **Validation**: FluentValidation ile input kontrolü
6. **Error Handling**: Global exception middleware
7. **Logging**: ILogger ile structured logging
8. **Async/Await**: Tüm I/O işlemleri async

## Deployment

### Docker (Opsiyonel)
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "FiveS.Api.dll"]
```

### IIS Deployment
1. Publish: `dotnet publish -c Release`
2. IIS'de site oluştur
3. Application Pool: .NET CLR Version: No Managed Code
4. web.config otomatik oluşturulur

## Troubleshooting

### Connection String hataları
- PostgreSQL'in çalıştığından emin olun
- Connection string'deki bilgileri kontrol edin
- Firewall ayarlarını kontrol edin

### JWT hataları
- Secret key'in yeterince uzun olduğundan emin olun (min 16 karakter)
- Issuer ve Audience değerlerinin eşleştiğini kontrol edin

### Migration hataları
- Veritabanı bağlantısını kontrol edin
- Mevcut migration'ları temizleyin: `dotnet ef database drop`
- Yeniden oluşturun: `dotnet ef database update`

