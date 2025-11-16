# 5S Audit Platform - Frontend

React + TypeScript tabanlı, modern ve responsive kullanıcı arayüzü.

## Teknolojiler

- **React 19.1** - UI Framework
- **TypeScript 4.9** - Type safety
- **Material-UI 7.x** - UI Component library
- **React Router v7** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form yönetimi
- **Recharts** - Grafikler ve görselleştirme
- **date-fns** - Tarih işlemleri

## Proje Yapısı

```
src/
├── components/           # Reusable UI bileşenleri
│   ├── common/          # Ortak bileşenler (LoadingSpinner, vb.)
│   ├── Layout/          # Layout bileşenleri
│   └── InteractiveMap/  # Özel bileşenler
├── pages/               # Sayfa bileşenleri
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── AuditsPage.tsx
│   ├── NewAuditPage.tsx
│   ├── UsersPage.tsx
│   └── ...
├── contexts/            # React Context providers
│   └── AuthContext.tsx
├── services/            # API servisleri
│   └── api.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── App.tsx              # Ana uygulama component
├── index.tsx            # Entry point
└── index.css            # Global styles
```

## Özellikler

### Kimlik Doğrulama
- JWT token tabanlı authentication
- Protected routes
- Automatic token refresh
- Role-based UI rendering

### Dashboard
- Denetim istatistikleri
- Grafik ve görselleştirmeler
- Son denetimler
- Aksiyon takibi

### Denetim Yönetimi
- Denetim oluşturma ve düzenleme
- Kategori bazlı değerlendirme
- Real-time skor hesaplama
- Görsel destekli aksiyon yönetimi

### Kullanıcı Yönetimi
- Kullanıcı CRUD işlemleri
- Rol yönetimi
- Departman atamaları
- Şifre yönetimi

### Raporlar
- Departman performans raporları
- İlerleme grafikleri
- Seviye dağılımı
- Aksiyon analizi

## Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Bağımlılıkları Yükleme
```bash
npm install
```

### Environment Variables
`.env` dosyası oluşturun:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_NAME=5S Audit Platform
REACT_APP_VERSION=1.0.0
```

### Development Server
```bash
npm start
```
Uygulama `http://localhost:3000` adresinde çalışacaktır.

### Production Build
```bash
npm run build
```
Build dosyaları `build/` klasöründe oluşturulur.

## Routing

```tsx
/                      -> Login (public)
/login                 -> Login (public)
/dashboard             -> Dashboard (protected)
/audits                -> Audit listesi (protected)
/audits/new            -> Yeni denetim (protected)
/audits/:id            -> Denetim detayı (protected)
/audits/:id/edit       -> Denetim düzenleme (protected)
/users                 -> Kullanıcı listesi (admin)
/departments           -> Bölüm listesi (protected)
/reports               -> Raporlar (protected)
/settings              -> Ayarlar (admin)
/profile               -> Profil (protected)
/change-password       -> Şifre değiştirme (protected)
```

## Authentication Flow

### Login
```tsx
import { useAuth } from './contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  
  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (error) {
      // Handle error
    }
  };
};
```

### Protected Routes
```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};
```

## API Service

### Kullanım
```tsx
import apiService from './services/api';

// Login
const response = await apiService.login({ email, password });

// Get audits
const { audits, pagination } = await apiService.getAudits({
  page: 1,
  limit: 10,
  status: 'published'
});

// Create user
const { user } = await apiService.createUser({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
  role: 'denetci'
});
```

### Interceptors
- **Request**: Otomatik JWT token ekleme
- **Response**: 401 hatalarında otomatik logout

## State Management

### Auth Context
```tsx
const AuthContext = createContext({
  user: null,
  loading: false,
  login: async (email, password) => {},
  logout: () => {},
  updateUser: (user) => {}
});
```

### Local Storage
- `token`: JWT access token
- `user`: Kullanıcı bilgileri (JSON)

## Styling

### Material-UI Theme
```tsx
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});
```

### Responsive Design
- Mobile-first approach
- Breakpoints: xs, sm, md, lg, xl
- Grid system kullanımı

## Form Validation

### React Hook Form
```tsx
import { useForm } from 'react-hook-form';

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = (data) => {
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true })} />
      {errors.email && <span>Email is required</span>}
    </form>
  );
};
```

## Grafik ve Görselleştirme

### Recharts
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<LineChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="score" stroke="#8884d8" />
</LineChart>
```

## Testing

### Unit Tests
```bash
npm test
```

### Coverage
```bash
npm test -- --coverage
```

## Best Practices

1. **Component Organization**
   - Functional components
   - Hooks kullanımı
   - Prop types veya TypeScript interfaces

2. **State Management**
   - Local state: useState
   - Global state: Context API
   - Server state: React Query (opsiyonel)

3. **Code Splitting**
   - React.lazy() ile route-based splitting
   - Dynamic imports

4. **Error Handling**
   - Try-catch blocks
   - Error boundaries
   - User-friendly error messages

5. **Performance**
   - useMemo for expensive calculations
   - useCallback for callback optimization
   - React.memo for component memoization

## Deployment

### Build
```bash
npm run build
```

### Static Hosting (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

### CORS Issues
- Backend'de CORS ayarlarını kontrol edin
- API URL'ini doğru girdiğinizden emin olun

### Build Errors
```bash
# Clear cache
rm -rf node_modules
npm cache clean --force
npm install
```

### Runtime Errors
- Browser console'u kontrol edin
- Network tab'dan API isteklerini inceleyin
- React DevTools kullanın

## Geliştirme İpuçları

### VS Code Extensions
- ESLint
- Prettier
- TypeScript Hero
- ES7+ React/Redux/React-Native snippets

### Chrome Extensions
- React Developer Tools
- Redux DevTools (gerekirse)

## Katkıda Bulunma

1. Feature branch oluşturun
2. Değişikliklerinizi commit edin
3. Pull request açın
4. Code review sürecini bekleyin

## Lisans

Kuruluş içi kulanım için geliştirilmiştir.
