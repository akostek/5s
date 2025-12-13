import React from 'react'; // Trigger rebuild
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PermissionProvider, usePermission } from './contexts/PermissionContext';
import Layout from './components/Layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AuditsPage from './pages/AuditsPage';
import AuditDetailPage from './pages/AuditDetailPage';
import NewAuditPage from './pages/NewAuditPage';
import ReportsPage from './pages/ReportsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import AreasPage from './pages/AreasPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import HelpPage from './pages/HelpPage';
import CallbackPage from './pages/CallbackPage';

// Modern, minimal theme
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#6366f1', // Modern indigo
            light: '#818cf8',
            dark: '#4f46e5',
        },
        secondary: {
            main: '#f59e0b', // Warm amber
            light: '#fbbf24',
            dark: '#d97706',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        grey: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
        },
    },
    typography: {
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h1: { fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em' },
        h2: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em' },
        h3: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.025em' },
        h4: { fontSize: '1.125rem', fontWeight: 600 },
        h5: { fontSize: '1rem', fontWeight: 600 },
        h6: { fontSize: '0.875rem', fontWeight: 600 },
        body1: { fontSize: '0.875rem', lineHeight: 1.5 },
        body2: { fontSize: '0.75rem', lineHeight: 1.4 },
        caption: { fontSize: '0.6875rem', lineHeight: 1.3 },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    padding: '6px 12px',
                    minHeight: '32px',
                    borderRadius: '6px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    },
                },
                sizeSmall: {
                    padding: '4px 8px',
                    fontSize: '0.6875rem',
                    minHeight: '28px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    borderRadius: '8px',
                    border: '1px solid #f3f4f6',
                },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: '12px',
                    '&:last-child': {
                        paddingBottom: '12px',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-root': {
                        fontSize: '0.75rem',
                        minHeight: '36px',
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '0.75rem',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontSize: '0.6875rem',
                    height: '20px',
                },
                sizeSmall: {
                    fontSize: '0.625rem',
                    height: '18px',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    fontSize: '0.75rem',
                    padding: '6px 8px',
                },
                head: {
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    backgroundColor: '#f9fafb',
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    width: '24px',
                    height: '24px',
                    fontSize: '0.75rem',
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    padding: '4px',
                },
                sizeSmall: {
                    padding: '2px',
                },
            },
        },
    },
});

interface ProtectedRouteProps {
    children: React.ReactNode;
    page?: string; // Page name for permission check
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, page }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const { canAccessPage, loading: permissionsLoading } = usePermission();

    if (isLoading || permissionsLoading) {
        return <div>Yükleniyor...</div>;
    }

    if (!isAuthenticated) {
        // Oturum yoksa direkt Keycloak'a yönlendir
        const keycloakUrl = `http://${window.location.hostname}:8080/realms/5s_local/protocol/openid-connect/auth?client_id=5s_client&response_type=code&scope=openid profile email&redirect_uri=${encodeURIComponent(window.location.origin + '/callback')}`;
        window.location.href = keycloakUrl;
        return null;
    }

    // Check page permission if page name is provided
    if (page && !canAccessPage(page)) {
        return (
            <Layout>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh',
                    fontSize: '14px'
                }}>
                    Bu sayfaya erişim yetkiniz yok.
                </div>
            </Layout>
        );
    }

    return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <PermissionProvider>
                    <Router>
                        <Routes>
                            {/* Login sayfası kaldırıldı, direkt Keycloak'a yönlendirilecek */}
                            <Route path="/callback" element={<CallbackPage />} />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />

                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute page="Anasayfa">
                                        <DashboardPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/audits"
                                element={
                                    <ProtectedRoute page="Denetimler">
                                        <AuditsPage />
                                    </ProtectedRoute>
                                }
                            />


                            <Route
                                path="/audits/new"
                                element={
                                    <ProtectedRoute page="Denetimler">
                                        <NewAuditPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/audits/:id"
                                element={
                                    <ProtectedRoute page="Denetimler">
                                        <AuditDetailPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/reports"
                                element={
                                    <ProtectedRoute page="Raporlar">
                                        <ReportsPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/departments"
                                element={
                                    <ProtectedRoute page="Bolumler">
                                        <DepartmentsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/areas"
                                element={
                                    <ProtectedRoute page="Alanlar">
                                        <AreasPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/users"
                                element={
                                    <ProtectedRoute page="Kullanicilar">
                                        <UsersPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute page="Ayarlar">
                                        <SettingsPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute page="Profil">
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/change-password"
                                element={
                                    <ProtectedRoute page="Profil">
                                        <ChangePasswordPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/help"
                                element={
                                    <ProtectedRoute page="Yardim">
                                        <HelpPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="*"
                                element={
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        minHeight: '100vh',
                                        fontSize: '14px'
                                    }}>
                                        404 - Sayfa bulunamadı
                                    </div>
                                }
                            />
                        </Routes>
                    </Router>
                </PermissionProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

// Global CSS for animations
const globalStyles = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

// Inject global styles
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = globalStyles;
    document.head.appendChild(style);
}

export default App;