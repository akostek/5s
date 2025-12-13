import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { KEYCLOAK_CONFIG } from '../config';

const LoginPage: React.FC = () => {

  const handleSSOLogin = () => {
    window.location.href = `${KEYCLOAK_CONFIG.url}?client_id=${KEYCLOAK_CONFIG.clientId}&response_type=code&scope=openid profile email&redirect_uri=${encodeURIComponent(KEYCLOAK_CONFIG.redirectUri)}`;
  };

  const handleOfflineLogin = () => {
    // Redirect to callback with mock code
    window.location.href = '/callback?code=mock_dev_code';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#6366f1' }}>
              5S Denetim Platformu
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Lütfen giriş yöntemini seçiniz
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSSOLogin}
            sx={{
              bgcolor: '#6366f1',
              '&:hover': { bgcolor: '#4f46e5' }
            }}
          >
            SSO ile Giriş Yap (Şirket Ağı)
          </Button>

          {/* Offline Login Button for Development */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ pt: 2, borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
              <Typography variant="caption" display="block" sx={{ mb: 2, color: 'text.secondary' }}>
                Geliştirme Ortamı / Şirket Dışı Erişim
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                onClick={handleOfflineLogin}
              >
                Offline / Test Girişi Yap
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
