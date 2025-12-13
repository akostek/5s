import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Container,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import {
  People,
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Close,
  PersonAdd,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User } from '../types';
import { useRole } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const schema = yup.object({
  name: yup.string().required('Ad soyad zorunludur'),
  username: yup.string(),
  sicil: yup.string(),
  email: yup.string().email('Geçerli email adresi girin').required('Email zorunludur'),
  password: yup.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  role: yup.string().required('Rol seçimi zorunludur'),
  sector: yup.string().required('Sektör zorunludur'),
  directorate: yup.string().required('Direktörlük zorunludur'),
  department_id: yup.number().nullable(),
});

const UsersPage: React.FC = () => {
  const { canManageUsers } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [directorates, setDirectorates] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  // Role filtering is handled by backend, removed roleFilter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      username: '',
      sicil: '',
      email: '',
      password: '',
      role: 'denetci',
      sector: 'UGES',
      directorate: '',
      department_id: null,
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchSectorsAndDirectorates();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesData = await apiService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchSectorsAndDirectorates = async () => {
    try {
      const [sectorsData, directoratesData, departmentsData] = await Promise.all([
        apiService.getSectors(),
        apiService.getDirectorates(),
        apiService.getDepartments()
      ]);
      setSectors(sectorsData);
      setDirectorates(directoratesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching sectors, directorates, and departments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getUsers();
      
      let filteredUsers = data;
      
      // Backend handles role filtering, frontend only handles search
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setUsers(filteredUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error?.response?.data?.message || 'Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers();
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

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      // Find sector and directorate IDs from names
      const sectorId = sectors.find(s => s.name === (user.sector || user.Sector))?.id;
      const directorateId = directorates.find(d => d.name === (user.directorate || user.Directorate))?.id;
      
      reset({
        name: user.name,
        username: user.username || user.Username || '',
        sicil: user.sicil || user.Sicil || '',
        email: user.email,
        role: user.role || user.Role || '',
        sector: user.sector || user.Sector || (sectors.length > 0 ? sectors[0].name : ''),
        directorate: user.directorate || user.Directorate || '',
        department_id: user.department_id || user.departmentId || null,
      });
    } else {
      setEditingUser(null);
      reset({
        name: '',
        username: '',
        sicil: '',
        email: '',
        password: '',
        role: 'denetci',
        sector: sectors.length > 0 ? sectors[0].name : '',
        directorate: directorates.length > 0 ? directorates[0].name : '',
        department_id: null,
      });
    }
    setDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      // Map sector and directorate names to IDs if needed
      // Find roleId from role name
      const selectedRole = roles.find(r => {
        const roleName = r.name.toLowerCase();
        const dataRole = (data.role || '').toLowerCase();
        return roleName === dataRole || 
               (dataRole === 'denetci' && (roleName.includes('denet') || roleName.includes('denetçi'))) ||
               (dataRole === 'alan_sorumlusu' && (roleName.includes('alan') || roleName.includes('sorumlu'))) ||
               (dataRole === 'admin' && roleName.includes('admin'));
      });
      
      if (!selectedRole) {
        throw new Error('Geçerli bir rol seçiniz');
      }

      // Find sectorId and directorateId
      const selectedSector = sectors.find(s => s.name === data.sector);
      const selectedDirectorate = directorates.find(d => d.name === data.directorate);
      const selectedDepartment = data.department_id ? departments.find(d => (d.id || d.Id) === data.department_id) : null;

      const submitData = {
        ...data,
        roleId: selectedRole.id, // Convert role name to roleId
        sectorId: selectedSector?.id || null,
        sector: data.sector, // Keep as name for backward compatibility
        directorateId: selectedDirectorate?.id || null,
        directorate: data.directorate, // Keep as name for backward compatibility
        departmentId: selectedDepartment ? (selectedDepartment.id || selectedDepartment.Id) : null,
      };
      
      if (editingUser) {
        await apiService.updateUser(editingUser.id, submitData);
        setSnackbar({ open: true, message: 'Kullanıcı başarıyla güncellendi', severity: 'success' });
      } else {
        // Password is required for new users
        if (!data.password || data.password.trim().length < 6) {
          throw new Error('Şifre en az 6 karakter olmalıdır');
        }
        await apiService.createUser({ 
          ...submitData, 
          password: data.password
        });
        setSnackbar({ open: true, message: 'Kullanıcı başarıyla oluşturuldu', severity: 'success' });
      }
      setDialogOpen(false);
      await fetchUsers();
    } catch (error: any) {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving user:', error);
      }
      const errorMessage = error?.response?.data?.message || error?.message || 'Kullanıcı kaydedilirken hata oluştu';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await apiService.deleteUser(userToDelete.id);
      setSnackbar({ open: true, message: 'Kullanıcı başarıyla silindi', severity: 'success' });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      await fetchUsers();
    } catch (error: any) {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting user:', error);
      }
      const errorMessage = error?.response?.data?.message || 'Kullanıcı silinirken hata oluştu';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 0, px: 0.5 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={300} height={50} />
          <Skeleton variant="text" width={500} height={25} />
        </Box>
        <Card>
          <CardContent>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={50} sx={{ mb: 1 }} />
            ))}
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Fade in timeout={800}>
      <Container maxWidth="xl" sx={{ py: 0, px: 0.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: 'info.main',
                mr: 2,
                width: 40,
                height: 40,
              }}
            >
              <People fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
                Kullanıcı Yönetimi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistem kullanıcılarını yönetin
              </Typography>
            </Box>
          </Box>
          
          {canManageUsers() && (
            <Button
              variant="contained"
              size="medium"
              startIcon={<PersonAdd />}
              onClick={() => handleOpenDialog()}
              sx={{
                px: 2,
                py: 1,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              }}
            >
              Yeni Kullanıcı
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          {[
            { title: 'Toplam Kullanıcı', value: users.length, icon: <People />, color: '#3b82f6' },
            { title: 'Aktif Kullanıcı', value: users.filter(u => u.is_active !== false && u.isActive !== false).length, icon: <People />, color: '#10b981' },
          ].map((stat, index) => (
            <Card key={index} sx={{ flex: '1 1 200px', minWidth: 180 }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 0.5 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.7 }}>
                    {React.cloneElement(stat.icon, { fontSize: 'medium' })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: '1 1 250px', minWidth: 200 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Ad, soyad veya email ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ flex: '0 0 auto' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Search />}
                  onClick={handleSearch}
                >
                  Ara
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Kullanıcı</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Sicil</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Rol</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Sektör</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Direktörlük</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Bölüm</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Son Giriş</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: getRoleColor(user.role) + '.main' }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500} fontSize="0.8rem">
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.8rem">
                        {user.sicil || user.Sicil || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.8rem">
                        {user.username || user.Username || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.8rem">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleText(user.role)}
                        size="small"
                        color={getRoleColor(user.role)}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.8rem">
                        {user.sector || user.Sector || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.8rem">
                        {user.directorate || user.Directorate || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.8rem">
                        {user.department_name || user.DepartmentName || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Aktif' : 'Pasif'}
                        size="small"
                        color={user.is_active ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.8rem">
                        {user.last_login ? format(new Date(user.last_login), 'dd/MM/yyyy HH:mm') : 'Hiç'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" sx={{ color: 'primary.main' }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        {canManageUsers() && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(user)}
                              sx={{ color: 'warning.main' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteClick(user)}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {users.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <People sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom fontSize="1rem">
                Kullanıcı bulunamadı
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Arama kriterlerinizi değiştirin veya yeni kullanıcı ekleyin
              </Typography>
            </Box>
          )}
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontSize="1rem">
                {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}
              </Typography>
              <IconButton onClick={() => setDialogOpen(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
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
                name="sicil"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    fullWidth
                    label="Sicil Numarası"
                    placeholder="Örn: 12345"
                  />
                )}
              />
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    fullWidth
                    label="Kullanıcı Adı"
                    placeholder="Örn: ahmet.yilmaz"
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
              {!editingUser && (
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      fullWidth
                      type="password"
                      label="Şifre"
                      placeholder="En az 6 karakter"
                      error={!!errors.password}
                      helperText={errors.password?.message || 'Yeni kullanıcı için şifre belirleyin'}
                    />
                  )}
                />
              )}
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl size="small" fullWidth error={!!errors.role}>
                    <InputLabel>Rol</InputLabel>
                      <Select {...field} label="Rol">
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.name}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </Select>
                  </FormControl>
                )}
              />
              <Controller
                name="sector"
                control={control}
                render={({ field }) => (
                  <FormControl size="small" fullWidth error={!!errors.sector}>
                    <InputLabel>Sektör</InputLabel>
                    <Select {...field} label="Sektör">
                      {sectors.map((sector) => (
                        <MenuItem key={sector.id} value={sector.name}>
                          {sector.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.sector && <Typography variant="caption" color="error">{errors.sector?.message}</Typography>}
                  </FormControl>
                )}
              />
              <Controller
                name="directorate"
                control={control}
                render={({ field }) => (
                  <FormControl size="small" fullWidth error={!!errors.directorate}>
                    <InputLabel>Direktörlük</InputLabel>
                    <Select {...field} label="Direktörlük">
                      {directorates.map((directorate) => (
                        <MenuItem key={directorate.id} value={directorate.name}>
                          {directorate.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.directorate && <Typography variant="caption" color="error">{errors.directorate?.message}</Typography>}
                  </FormControl>
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} size="small">
              İptal
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              size="small"
              sx={{
                background: editingUser 
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            >
              {editingUser ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Kullanıcıyı Sil</DialogTitle>
          <DialogContent>
            <Typography>
              "{userToDelete?.name}" kullanıcısını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
            >
              Sil
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Fade>
  );
};

export default UsersPage;