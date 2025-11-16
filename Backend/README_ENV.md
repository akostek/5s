# Environment Variables Configuration

Bu proje kurumsal güvenlik standartlarına uygun olarak environment variables kullanmaktadır.

## Kurulum

### 1. .env Dosyası Oluşturma

`Backend/FiveS.Api/` klasöründe `.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cd Backend/FiveS.Api
copy .env.example .env
```

### 2. .env Dosyasını Düzenleme

`.env` dosyasını açın ve gerçek değerlerle doldurun:

```env
DATABASE_CONNECTION_STRING=Host=localhost;Port=5432;Database=fives_audit;Username=postgres;Password=your_password
JWT_SECRET=YourSuperSecretKeyForJWTTokenGeneration123!ChangeThisInProduction
JWT_ISSUER=FiveSAuditPlatform
JWT_AUDIENCE=FiveSAuditPlatformUsers
JWT_EXPIRATION_HOURS=24
```

## Güvenlik Notları

1. **`.env` dosyası Git'e commit edilmez** - `.gitignore` dosyasında zaten tanımlıdır
2. **Production ortamında** environment variables kullanın (IIS, Docker, Azure, vb.)
3. **JWT_SECRET** için güçlü bir key kullanın (en az 32 karakter)
4. **Database password** gibi hassas bilgileri asla kod içinde saklamayın

## Environment Variables Önceliği

Uygulama aşağıdaki sırayla configuration değerlerini arar:

1. **Environment Variables** (en yüksek öncelik)
2. `appsettings.json` veya `appsettings.{Environment}.json`
3. Default değerler (varsa)

## Production Deployment

### IIS
IIS'de environment variables ayarlamak için:
1. IIS Manager'da Application Pool'u seçin
2. "Advanced Settings" > "Environment Variables" bölümüne gidin
3. Gerekli değişkenleri ekleyin

### Docker
Docker Compose veya Dockerfile'da:
```yaml
environment:
  - DATABASE_CONNECTION_STRING=Host=db;Port=5432;Database=fives_audit;Username=postgres;Password=${DB_PASSWORD}
  - JWT_SECRET=${JWT_SECRET}
```

### Azure App Service
Azure Portal'da:
1. Configuration > Application Settings
2. "New application setting" ile environment variables ekleyin

## Geliştirme Ortamı

Development ortamında `.env` dosyası kullanılır. Bu dosya:
- Git'e commit edilmez
- Her geliştirici kendi `.env` dosyasını oluşturur
- `.env.example` dosyası template olarak kullanılır

## Sorun Giderme

### "JWT Secret not configured" hatası
- `.env` dosyasının `Backend/FiveS.Api/` klasöründe olduğundan emin olun
- `JWT_SECRET` değişkeninin doğru ayarlandığını kontrol edin

### "Database connection string not configured" hatası
- `.env` dosyasında `DATABASE_CONNECTION_STRING` değişkenini kontrol edin
- PostgreSQL'in çalıştığından ve bağlantı bilgilerinin doğru olduğundan emin olun

