import React, { useState, useEffect } from 'react';
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Person,
  Save,
  Email,
  Business,
  CalendarToday,
  Security,
  Assignment,
  TrendingUp,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

const schema = yup.object({
  name: yup.string().required('Ad soyad zorunludur'),
  email: yup.string().email('Geçerli email adresi girin').required('Email zorunludur'),
});

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [userStats, setUserStats] = useState({
    totalAudits: 0,
    completedAudits: 0,
    averageScore: 0,
    openActions: 0,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
      fetchUserStats();
    }
  }, [user, reset]);

  const fetchUserStats = async () => {
    try {
      // Mock data for demo
      setUserStats({
        totalAudits: 15,
        completedAudits: 12,
        averageScore: 82,
        openActions: 3,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      console.log('Updating profile:', data);
      setSuccess('Profil bilgileri başarıyla güncellendi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Profil güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getRoleText = (role: string) => {
    // Role comes as string from backend (Ad field from Roller table)
    return role || 'Kullanıcı';
  };

  const getRoleColor = (role: string): 'error' | 'warning' | 'info' | 'success' | 'primary' | 'secondary' | 'default' => {
    // Simple color mapping based on role name
    const roleLower = role?.toLowerCase() || '';
    if (roleLower.includes('admin')) return 'error';
    if (roleLower.includes('denetçi') || roleLower.includes('denetci')) return 'info';
    if (roleLower.includes('alan')) return 'warning';
    if (roleLower.includes('bölüm') || roleLower.includes('bolum')) return 'success';
    return 'default';
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 2, px: 2 }}>
        <Alert severity="warning">Kullanıcı bilgileri yüklenemedi</Alert>
      </Container>
    );
  }

  return (
    <Fade in timeout={800}>
      <Container maxWidth="md" sx={{ py: 2, px: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              mr: 2,
              width: 40,
              height: 40,
            }}
          >
            <Person fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              Profil Bilgileri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kişisel bilgilerinizi yönetin
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Profile Info and Account Details */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom fontSize="1rem" fontWeight={600}>
                    Kişisel Bilgiler
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          fullWidth
                          label="Ad Soyad"
                          error={!!errors.name}
                          helperText={errors.name?.message}
                        />
                      )}
                    />
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          fullWidth
                          type="email"
                          label="Email"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSubmit(onSubmit)}
                      disabled={loading}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      }}
                    >
                      Güncelle
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom fontSize="1rem" fontWeight={600}>
                    Hesap Detayları
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Security fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">Rol:</Typography>
                            <Chip
                              label={getRoleText(user.role)}
                              size="small"
                              color={getRoleColor(user.role)}
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Business fontSize="small" color="secondary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            Bölüm: {user.department_name || 'Atanmamış'}
                          </Typography>
                        }
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CalendarToday fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            Üyelik: {format(new Date(user.created_at), 'dd/MM/yyyy')}
                          </Typography>
                        }
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Email fontSize="small" color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            Son Giriş: {user.last_login ? format(new Date(user.last_login), 'dd/MM/yyyy HH:mm') : 'Hiç'}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* User Statistics */}
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom fontSize="1rem" fontWeight={600}>
                Denetim İstatistikleri
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center', flex: '1 1 120px', minWidth: 100 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1, width: 32, height: 32 }}>
                    <Assignment fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" color="primary.main" fontWeight={700} fontSize="1.2rem">
                    {userStats.totalAudits}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Toplam Denetim
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', flex: '1 1 120px', minWidth: 100 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1, width: 32, height: 32 }}>
                    <TrendingUp fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" color="success.main" fontWeight={700} fontSize="1.2rem">
                    {userStats.completedAudits}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tamamlanan
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', flex: '1 1 120px', minWidth: 100 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1, width: 32, height: 32 }}>
                    <TrendingUp fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" color="info.main" fontWeight={700} fontSize="1.2rem">
                    %{userStats.averageScore}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ortalama Puan
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', flex: '1 1 120px', minWidth: 100 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1, width: 32, height: 32 }}>
                    <Assignment fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" color="warning.main" fontWeight={700} fontSize="1.2rem">
                    {userStats.openActions}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Açık Aksiyon
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom fontSize="1rem" fontWeight={600}>
                Güvenlik
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  href="/change-password"
                  size="small"
                >
                  Şifre Değiştir
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Fade>
  );
};

export default ProfilePage;