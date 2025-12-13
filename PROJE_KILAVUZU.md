# 5S Denetim Platformu - Proje Kılavuzu

Bu doküman, 5S Denetim Platformu'nun kurulumu, yapılandırması, mimarisi ve güvenliği hakkında güncel bilgileri içerir.

---

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Kurulum ve Yapılandırma](#kurulum-ve-yapılandırma)
3. [Keycloak Entegrasyonu (SSO)](#keycloak-entegrasyonu-sso)
4. [Proje Yapısı](#proje-yapısı)
5. [Güvenlik](#güvenlik)
6. [Sorun Giderme](#sorun-giderme)

---

## 1. Genel Bakış

5S Denetim Platformu, kurumsal denetim süreçlerini yönetmek için tasarlanmış, .NET 8.0 Backend ve React 19 Frontend teknolojileriyle geliştirilmiş modern bir web uygulamasıdır.

**Temel Özellikler:**
- **Kullanıcı Yönetimi:** Keycloak SSO entegrasyonu, rol tabanlı yetkilendirme.
- **Denetim:** Denetim planlama, yürütme, puanlama ve raporlama.
- **Raporlama:** Dashboard, trend analizleri ve Excel çıktıları.

---

## 2. Kurulum ve Yapılandırma

### Gereksinimler
- **Backend:** .NET 8.0 SDK, PostgreSQL 12+
- **Frontend:** Node.js 18+, npm 9+

### Backend Kurulumu
Backend ayarları `Backend/FiveS.Api/appsettings.json` dosyasında yönetilir.

**Veritabanı Bağlantısı:**
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD"
}
```

**Mail Servisi:**
```json
"MailService": {
  "Url": "https://mailservice-api.msp.aselsan.com.tr/api/v1/Sender/SendEmailMilli",
  "From": "akaizen@aselsan.com.tr",
  "DisplayName": "A-KAİZEN Platformu"
}
```

### Frontend Kurulumu
Frontend ayarları `Frontend/src/config.ts` dosyasında bulunur.

**Kurulum Komutları:**
```bash
cd Frontend
npm install
npm start
```
Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

---

## 3. Keycloak Entegrasyonu (SSO)

Platform, kimlik doğrulama için Keycloak kullanır. Yapılandırma hem Backend hem de Frontend tarafında uyumlu olmalıdır.

### Backend Yapılandırması (`appsettings.json`)
Keycloak ayarları `Integration:Keycloak` bölümünde tanımlanır. Bu yapı sayesinde sunucu adresi, realm ve kullanıcı özellik eşleştirmeleri dinamik olarak değiştirilebilir.

```json
"Keycloak": {
  "BaseUrl": "http://localhost:8080",      // Keycloak sunucu adresi
  "Realm": "5s_local",                     // Realm adı
  "ClientId": "5s_client",                 // İstemci kimliği
  "ClientSecret": "YOUR_CLIENT_SECRET",    // İstemci gizli anahtarı
  "AttributeMapping": {                    // Keycloak -> Veritabanı Eşleştirmesi
    "Sicil": "sicil_no",
    "Sector": "sektor",
    "Directorate": "mudurluk",
    "Department": "department",
    "Name": "name",
    "Email": "email",
    "Username": "preferred_username"
  }
}
```

### Frontend Yapılandırması (`src/config.ts`)
Frontend tarafında da benzer ayarlar `KEYCLOAK_SETTINGS` objesi içinde bulunur:

```typescript
const KEYCLOAK_SETTINGS = {
  baseUrl: `http://${window.location.hostname}:8080`,
  realm: '5s_local',
  clientId: '5s_client'
};
```

### Kullanıcı Eşleştirme Mantığı
1. Kullanıcı Keycloak ile giriş yapar.
2. Backend, `AttributeMapping` ayarlarındaki anahtarları kullanarak Keycloak'tan gelen token içindeki bilgileri okur (Örn: `sicil_no`, `sektor`).
3. Eğer kullanıcı veritabanında yoksa, bu bilgilerle **otomatik olarak oluşturulur**.
4. Eğer kullanıcı varsa, bilgileri (Bölüm, Sektör vb.) **güncellenir**.

---

## 4. Proje Yapısı

### Backend (`Backend/`)
Clean Architecture prensiplerine göre 4 katmanlı yapıdadır:
- **FiveS.Domain:** Veritabanı nesneleri (Entities) ve arayüzler.
- **FiveS.Infrastructure:** Veritabanı erişimi, Keycloak ve Mail servisleri.
- **FiveS.Application:** İş mantığı servisleri (AuthService, AuditService vb.).
- **FiveS.Api:** Controller'lar ve API yapılandırması.

### Frontend (`Frontend/`)
React + TypeScript yapısındadır:
- **src/components:** Ortak bileşenler.
- **src/pages:** Sayfa tasarımları.
- **src/services:** API isteklerini yöneten servisler.
- **src/contexts:** Auth ve Yetki yönetimi (Context API).

---

## 5. Güvenlik

- **Authentication:** JWT (JSON Web Token) tabanlıdır.
- **Authorization:** Rol tabanlı (RBAC) yetkilendirme kullanılır.
- **Veri Güvenliği:** Şifreler BCrypt ile hashlenerek saklanır.
- **API Güvenliği:** Tüm hassas endpoint'ler `[Authorize]` attribute'u ile korunur.
- **CORS:** Production ortamında sadece izin verilen domainlere (Origin) izin verilecek şekilde yapılandırılmalıdır.

---

## 6. Sorun Giderme

**Soru:** "Keycloak login failed" hatası alıyorum.
**Çözüm:** `appsettings.json` içindeki `ClientSecret` değerinin Keycloak panelindeki değerle aynı olduğundan ve `BaseUrl`'in doğru olduğundan emin olun.

**Soru:** Kullanıcı bilgileri (Bölüm, Sektör) gelmiyor.
**Çözüm:** Keycloak tarafında "Mappers" ayarlarının yapıldığından ve `appsettings.json` içindeki `AttributeMapping` anahtarlarının (örn: `sektor`) Keycloak token'ındaki alan adlarıyla birebir eşleştiğinden emin olun.

**Soru:** Veritabanına bağlanamıyorum.
**Çözüm:** PostgreSQL servisinin çalıştığını ve `ConnectionStrings` ayarındaki şifrenin doğru olduğunu kontrol edin.
