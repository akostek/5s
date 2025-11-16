import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Container,
  Fade,
  TextField,
  Button,
  Avatar,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Security,
  Save,
  ArrowBack,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  currentPassword: yup.string().required('Mevcut şifre zorunludur'),
  newPassword: yup.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Yeni şifre zorunludur'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Şifreler eşleşmiyor')
    .required('Şifre onayı zorunludur'),
});

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');
      
      // Mock API call
      console.log('Changing password:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Şifre başarıyla değiştirildi');
      reset();
      
      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (error: any) {
      setError('Şifre değiştirilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in timeout={800}>
      <Container maxWidth="sm" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => navigate('/profile')}
            sx={{ mr: 1 }}
            size="small"
          >
            <ArrowBack />
          </IconButton>
          <Avatar
            sx={{
              bgcolor: 'warning.main',
              mr: 2,
              width: 40,
              height: 40,
            }}
          >
            <Security fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              Şifre Değiştir
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hesap güvenliğinizi koruyun
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Current Password */}
                <Controller
                  name="currentPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type={showPasswords.current ? 'text' : 'password'}
                      label="Mevcut Şifre"
                      error={!!errors.currentPassword}
                      helperText={errors.currentPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('current')}
                              edge="end"
                              size="small"
                            >
                              {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                {/* New Password */}
                <Controller
                  name="newPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type={showPasswords.new ? 'text' : 'password'}
                      label="Yeni Şifre"
                      error={!!errors.newPassword}
                      helperText={errors.newPassword?.message || 'En az 6 karakter olmalıdır'}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('new')}
                              edge="end"
                              size="small"
                            >
                              {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                {/* Confirm Password */}
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type={showPasswords.confirm ? 'text' : 'password'}
                      label="Yeni Şifre (Tekrar)"
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('confirm')}
                              edge="end"
                              size="small"
                            >
                              {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                {/* Security Tips */}
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Güvenli Şifre İpuçları:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    • En az 6 karakter kullanın<br />
                    • Büyük ve küçük harfler kullanın<br />
                    • Rakam ve özel karakterler ekleyin<br />
                    • Kişisel bilgilerinizi kullanmayın
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/profile')}
                    disabled={loading}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    }}
                  >
                    {loading ? 'Değiştiriliyor...' : 'Şifre Değiştir'}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Fade>
  );
};

export default ChangePasswordPage;