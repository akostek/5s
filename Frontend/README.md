# 5S Audit Platform - Frontend

Kurumsal 5S denetim yönetim sistemi için React + TypeScript tabanlı modern, responsive kullanıcı arayüzü.

---

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Teknoloji Stack](#teknoloji-stack)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum ve Yapılandırma](#kurulum-ve-yapılandırma)
- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Özellikler](#özellikler)
- [Routing](#routing)
- [State Management](#state-management)
- [API Entegrasyonu](#api-entegrasyonu)
- [Stil ve Tasarım](#stil-ve-tasarım)
- [Build ve Deployment](#build-ve-deployment)
- [Sorun Giderme](#sorun-giderme)

---

## 🎯 Genel Bakış

5S Audit Platform Frontend, kurumsal denetim süreçlerini yönetmek için tasarlanmış modern bir web uygulamasıdır. Sistem şu ana özellikleri sunar:

- **Kullanıcı Yönetimi**: Güvenli giriş, profil yönetimi, şifre değiştirme
- **Dashboard**: İstatistikler, grafikler, son denetimler
- **Denetim Yönetimi**: Denetim oluşturma, düzenleme, takip
- **Raporlama**: Detaylı raporlar, trend analizi, Excel export
- **Kullanıcı ve Departman Yönetimi**: CRUD işlemleri, filtreleme
- **Ayarlar**: Sistem ayarları, soru yönetimi, yetki yönetimi

---

## 🛠️ Teknoloji Stack

### Core Framework
- **React 19.1** - Modern UI framework
- **TypeScript 4.9** - Type-safe JavaScript
- **React Router v7** - Client-side routing

### UI Framework
- **Material-UI (MUI) 7.x** - Comprehensive component library
- **@mui/x-charts** - Grafik ve görselleştirme
- **@mui/x-data-grid** - Gelişmiş tablo bileşenleri

### Form & Validation
- **React Hook Form 7.x** - Performanslı form yönetimi
- **Yup 1.7** - Schema validation

### HTTP Client
- **Axios 1.12** - Promise-based HTTP client

### Utilities
- **date-fns 4.1** - Tarih işlemleri
- **Recharts 3.2** - Grafik kütüphanesi

### Build Tools
- **React Scripts 5.0** - Create React App build tools
- **TypeScript Compiler** - Type checking ve compilation

---

## 📁 Proje Yapısı

```
Frontend/
├── public/                 # Static dosyalar
│   ├── index.html          # Ana HTML dosyası
│   ├── favicon.ico         # Site ikonu
│   └── manifest.json       # PWA manifest
│
├── src/
│   ├── components/         # Yeniden kullanılabilir bileşenler
│   │   └── Layout/         # Layout bileşenleri (Header, Sidebar, vb.)
│   │
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx      # Authentication state management
│   │   └── PermissionContext.tsx # Permission state management
│   │
│   ├── pages/              # Sayfa bileşenleri
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AuditsPage.tsx
│   │   ├── NewAuditPage.tsx
│   │   ├── AuditDetailPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── DepartmentsPage.tsx
│   │   ├── AreasPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ChangePasswordPage.tsx
│   │   └── HelpPage.tsx
│   │
│   ├── services/           # API servisleri
│   │   └── api.ts         # Axios instance ve API metodları
│   │
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Tüm type tanımlamaları
│   │
│   ├── App.tsx             # Ana uygulama component
│   ├── App.css             # Global stiller
│   ├── index.tsx           # Entry point
│   └── index.css           # Global CSS
│
├── package.json            # Bağımlılıklar ve script'ler
├── tsconfig.json          # TypeScript konfigürasyonu
└── README.md              # Bu dosya
```

---

## ⚙️ Kurulum ve Yapılandırma

### Gereksinimler

- **Node.js 18+** (LTS versiyonu önerilir)
- **npm 9+** veya **yarn 1.22+**
- **Git** (kod yönetimi için)

### Adım 1: Projeyi İndirme

```bash
git clone <repository-url>
cd Frontend
```

### Adım 2: Bağımlılıkları Yükleme

```bash
npm install
```

veya

```bash
yarn install
```

### Adım 3: Environment Variables Yapılandırma

1. `.env` dosyası oluşturun (proje kök dizininde):

```bash
# Frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=5S Audit Platform
REACT_APP_VERSION=1.0.0
```

**Önemli Notlar:**
- `.env` dosyası Git'e commit edilmez
- Production'da environment variables server-side ayarlanmalıdır
- `REACT_APP_` prefix'i zorunludur (React'ın environment variable kuralı)

2. **Production için:**
   - Build zamanında environment variables ayarlanır
   - Veya runtime'da `window.env` objesi kullanılabilir

### Adım 4: Uygulamayı Çalıştırma

```bash
npm start
```

veya

```bash
yarn start
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

Tarayıcı otomatik olarak açılacak ve hot-reload özelliği sayesinde kod değişikliklerinde sayfa otomatik yenilenecektir.

---

## 💻 Geliştirme Ortamı

### Development Server

```bash
npm start
```

**Özellikler:**
- Hot Module Replacement (HMR) - Kod değişikliklerinde anında güncelleme
- Source Maps - Debug için
- ESLint uyarıları console'da görünür
- Otomatik tarayıcı açılması

### Environment Variables

Development'ta `.env` dosyası kullanılır. Değişiklikler için uygulamayı yeniden başlatmanız gerekebilir.

### TypeScript Type Checking

```bash
npm run type-check
```

veya IDE'nizde otomatik olarak çalışır (VS Code, WebStorm, vb.)

### Linting

```bash
npm run lint
```

---

## ✨ Özellikler

### 1. Authentication (Kimlik Doğrulama)

#### Login
- Email ve şifre ile giriş
- JWT token tabanlı authentication
- Token localStorage'da saklanır
- Otomatik token refresh (gelecek özellik)

#### Protected Routes
- Tüm sayfalar authentication gerektirir
- Login olmayan kullanıcılar otomatik login sayfasına yönlendirilir
- Token süresi dolduğunda otomatik logout

#### Logout
- Token ve kullanıcı bilgileri temizlenir
- Login sayfasına yönlendirilir

---

### 2. Dashboard

**Özellikler:**
- Toplam denetim sayısı
- Aktif denetimler
- Tamamlanan denetimler
- Ortalama skor
- Son denetimler listesi
- Grafikler ve görselleştirmeler

**Filtreleme:**
- Tarih aralığı
- Departman
- Sektör/Direktörlük

---

### 3. Denetim Yönetimi

#### Denetim Listesi (AuditsPage)
- Tüm denetimleri görüntüleme
- Filtreleme (durum, tarih, departman, denetçi)
- Arama
- Sayfalama
- Excel export

#### Yeni Denetim Oluşturma (NewAuditPage)
- Denetim planı oluşturma
- Departman ve alan seçimi
- Soru-cevap formu
- Görsel yükleme (maksimum 3 resim)
- Otomatik skor hesaplama
- Aksiyon planı oluşturma

#### Denetim Detayı (AuditDetailPage)
- Denetim bilgileri
- Soru-cevap detayları
- Yüklenen görseller
- Aksiyon listesi
- Denetim yayınlama

---

### 4. Kullanıcı Yönetimi (UsersPage)

**Özellikler:**
- Kullanıcı listesi (tablo formatında)
- Kullanıcı oluşturma/düzenleme
- Kullanıcı silme
- Şifre sıfırlama
- Rol atama
- Departman/Sektör/Direktörlük atama
- Filtreleme ve arama

**Yetkilendirme:**
- Backend tarafından kontrol edilir
- Sadece yetkili kullanıcılar erişebilir

---

### 5. Departman Yönetimi (DepartmentsPage)

**Özellikler:**
- Departman listesi
- Departman oluşturma/düzenleme
- Departman silme
- Sektör/Direktörlük atama
- Departman durumu (aktif/pasif)
- İlişkili kullanıcılar ve denetimler

---

### 6. Raporlama (ReportsPage)

**Rapor Türleri:**
- Dashboard istatistikleri
- Departman performans raporları
- İlerleme grafikleri (zaman serisi)
- Seviye dağılımı (pie chart)
- En iyi departmanlar
- Trend analizi
- Aksiyon istatistikleri

**Özellikler:**
- Grafik görselleştirmeleri
- Excel export
- PDF export (gelecek özellik)
- Filtreleme (tarih, departman)

---

### 7. Ayarlar (SettingsPage)

**Alt Sekmeler:**
- **Sorular**: Soru ve kategori yönetimi
- **Seviye Eşikleri**: 5S seviye eşik değerleri
- **Yetkiler**: Rol bazlı yetki yönetimi
- **Sektörler**: Sektör yönetimi
- **Direktörlükler**: Direktörlük yönetimi

---

## 🗺️ Routing

Uygulama React Router v7 kullanarak client-side routing yapar.

### Route Yapısı

```typescript
/                          → Login (public)
/login                     → Login (public)
/dashboard                 → Dashboard (protected)
/audits                    → Denetim listesi (protected)
/audits/new                → Yeni denetim (protected)
/audits/:id                 → Denetim detayı (protected)
/audits/:id/edit            → Denetim düzenleme (protected)
/users                      → Kullanıcı listesi (admin)
/departments                → Departman listesi (protected)
/areas                      → Alan listesi (protected)
/reports                    → Raporlar (protected)
/settings                   → Ayarlar (admin)
/profile                    → Profil (protected)
/change-password            → Şifre değiştirme (protected)
/help                       → Yardım (protected)
```

### Protected Routes

Tüm route'lar (login hariç) authentication gerektirir:

```typescript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};
```

---

## 🔄 State Management

### Auth Context

Kullanıcı authentication state'i `AuthContext` ile yönetilir:

```typescript
const { user, token, isAuthenticated, login, logout } = useAuth();
```

**State:**
- `user`: Kullanıcı bilgileri
- `token`: JWT token
- `isAuthenticated`: Giriş durumu
- `isLoading`: Yükleme durumu

**Methods:**
- `login(credentials)`: Giriş yap
- `logout()`: Çıkış yap
- `updateUser(user)`: Kullanıcı bilgilerini güncelle

### Permission Context

Yetki kontrolü `PermissionContext` ile yönetilir:

```typescript
const { permissions, canAccessPage, canAccessButton } = usePermission();
```

**Not:** Backend tarafından yetkilendirme yapıldığı için frontend'de sadece UI gösterimi kontrol edilir.

### Local Storage

- `token`: JWT access token
- `user`: Kullanıcı bilgileri (JSON string)

---

## 🌐 API Entegrasyonu

### API Service

Tüm API çağrıları `services/api.ts` dosyasındaki `apiService` üzerinden yapılır.

#### Örnek Kullanım

```typescript
import { apiService } from './services/api';

// Login
const response = await apiService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get audits
const audits = await apiService.getAudits({
  page: 1,
  limit: 10,
  status: 'published'
});

// Create user
const user = await apiService.createUser({
  email: 'newuser@example.com',
  password: 'password123',
  name: 'New User',
  roleId: 2
});
```

### Request Interceptor

Otomatik olarak JWT token eklenir:

```typescript
this.api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor

401 (Unauthorized) hatalarında otomatik logout:

```typescript
this.api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🎨 Stil ve Tasarım

### Material-UI Theme

Uygulama Material-UI theme sistemi kullanır:

```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#6366f1' },  // Modern indigo
    secondary: { main: '#f59e0b' }, // Warm amber
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});
```

### Responsive Design

- **Mobile-first approach**: Önce mobil tasarım, sonra desktop
- **Breakpoints**: xs (0px), sm (600px), md (900px), lg (1200px), xl (1536px)
- **Grid System**: Material-UI Grid component'i kullanılır

### Component Styling

- **Material-UI Components**: Çoğu bileşen MUI'den
- **Custom CSS**: Gerekli yerlerde `App.css` ve component-specific CSS
- **Emotion**: MUI'nin styling engine'i (CSS-in-JS)

---

## 📦 Build ve Deployment

### Development Build

```bash
npm start
```

### Production Build

```bash
npm run build
```

Build dosyaları `build/` klasöründe oluşturulur:
- Optimize edilmiş JavaScript bundle'ları
- Minified CSS
- Asset optimization
- Source maps (opsiyonel)

### Build Analizi

Bundle boyutunu analiz etmek için:

```bash
npm run build
npm install -g serve
serve -s build
```

### Static Hosting (Nginx)

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/fives-frontend/build;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # React Router - tüm route'ları index.html'e yönlendir
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (opsiyonel)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=https://api.yourdomain.com/api
```

### Azure Static Web Apps

1. **Azure Portal'da Static Web App oluşturun**
2. **GitHub Actions ile deploy:**
   - GitHub repository'yi bağlayın
   - Build command: `npm run build`
   - App artifact location: `build`
3. **Environment variables:**
   - `REACT_APP_API_URL` ayarlayın

### AWS S3 + CloudFront

1. **S3 bucket oluşturun**
2. **Build dosyalarını yükleyin:**
   ```bash
   aws s3 sync build/ s3://your-bucket-name --delete
   ```
3. **CloudFront distribution oluşturun**
4. **Custom error pages:** 404 → `/index.html` (React Router için)

---

## 🔧 Sorun Giderme

### CORS Hataları

**Sorun:** "CORS policy blocked"

**Çözüm:**
1. Backend'de CORS ayarlarını kontrol edin
2. Frontend URL'inin backend CORS policy'sinde tanımlı olduğundan emin olun
3. Development'ta proxy kullanabilirsiniz (`package.json`):
   ```json
   "proxy": "http://localhost:5000"
   ```

---

### API Bağlantı Hataları

**Sorun:** "Network Error" veya "ECONNREFUSED"

**Çözüm:**
1. Backend'in çalıştığından emin olun
2. `.env` dosyasında `REACT_APP_API_URL` değerini kontrol edin
3. Firewall veya network ayarlarını kontrol edin
4. Browser console'da detaylı hata mesajını inceleyin

---

### Build Hataları

**Sorun:** "Module not found" veya TypeScript hataları

**Çözüm:**
1. `node_modules` klasörünü silin ve yeniden yükleyin:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. TypeScript hatalarını kontrol edin:
   ```bash
   npm run type-check
   ```
3. Cache'i temizleyin:
   ```bash
   npm cache clean --force
   ```

---

### Token Expired Hatası

**Sorun:** Sürekli login sayfasına yönlendiriliyor

**Çözüm:**
1. Token süresinin dolup dolmadığını kontrol edin
2. `localStorage`'ı temizleyin:
   ```javascript
   localStorage.clear();
   ```
3. Backend'de token expiration ayarlarını kontrol edin

---

### Styling Sorunları

**Sorun:** Material-UI component'leri düzgün görünmüyor

**Çözüm:**
1. `CssBaseline` component'inin `App.tsx`'de kullanıldığından emin olun
2. Theme provider'ın doğru yapılandırıldığını kontrol edin
3. Browser cache'ini temizleyin

---

### Performance Sorunları

**Sorun:** Uygulama yavaş çalışıyor

**Çözüm:**
1. React DevTools Profiler ile performans analizi yapın
2. Gereksiz re-render'ları önlemek için `React.memo` kullanın
3. Büyük listeler için virtual scrolling (react-window) kullanın
4. Code splitting ile lazy loading yapın:
   ```typescript
   const LazyComponent = React.lazy(() => import('./Component'));
   ```

---

## 📚 Best Practices

### 1. Component Organization
- Functional components kullanın
- Hooks ile state management
- Props için TypeScript interfaces tanımlayın
- Component'leri küçük ve tek sorumluluğa sahip tutun

### 2. State Management
- Local state için `useState`
- Global state için Context API
- Server state için React Query (opsiyonel, gelecekte eklenebilir)

### 3. Code Splitting
- Route-based code splitting:
  ```typescript
  const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
  ```
- Dynamic imports ile gerektiğinde yükleme

### 4. Error Handling
- Try-catch blocks kullanın
- Error boundaries ekleyin (gelecek özellik)
- Kullanıcı dostu hata mesajları gösterin

### 5. Performance
- `useMemo` ile pahalı hesaplamaları cache'leyin
- `useCallback` ile callback'leri optimize edin
- `React.memo` ile gereksiz re-render'ları önleyin

### 6. Security
- Hassas bilgileri localStorage'da saklamayın
- XSS koruması için input sanitization
- HTTPS kullanın (production'da)

---

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Coverage

```bash
npm test -- --coverage
```

### E2E Tests (Gelecek Özellik)

Cypress veya Playwright ile E2E testleri eklenebilir.

---

## 📞 Destek ve İletişim

- **Teknik Destek:** [IT Destek Ekibi]
- **Frontend Geliştirme:** [Frontend Ekibi]
- **Dokümantasyon:** Bu README

---

## 📄 Lisans

Kuruluş içi kullanım için geliştirilmiştir. Tüm hakları saklıdır.

---

**Son Güncelleme:** 2024  
**Versiyon:** 1.0.0
