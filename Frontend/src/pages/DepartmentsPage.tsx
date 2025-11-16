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
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import {
  Business,
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Close,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiService } from '../services/api';
import { Department } from '../types';

const schema = yup.object({
  name: yup.string().required('Bölüm adı zorunludur'),
  sectorId: yup.number().required('Sektör zorunludur'),
  directorateId: yup.number().required('Direktörlük zorunludur'),
  description: yup.string(),
  is_active: yup.boolean(),
});

interface Sector {
  id: number;
  name: string;
}

interface Directorate {
  id: number;
  name: string;
}

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [directorates, setDirectorates] = useState<Directorate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
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
      sectorId: 0,
      directorateId: 0,
      description: '',
      is_active: true,
    },
  });

  useEffect(() => {
    fetchDepartments();
    fetchSectorsAndDirectorates();
  }, []);

  const fetchSectorsAndDirectorates = async () => {
    try {
      const [sectorsData, directoratesData] = await Promise.all([
        apiService.getSectors(),
        apiService.getDirectorates()
      ]);
      setSectors(sectorsData);
      setDirectorates(directoratesData);
    } catch (error) {
      console.error('Error fetching sectors and directorates:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getDepartments();
      
      let filteredDepartments = data;

      // Arama filtresi
      if (searchTerm) {
        filteredDepartments = filteredDepartments.filter(dept => 
          dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Durum filtresi
      if (statusFilter !== 'all') {
        filteredDepartments = filteredDepartments.filter(dept => 
          statusFilter === 'active' ? dept.is_active : !dept.is_active
        );
      }

      // Sıralama
      filteredDepartments.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'created_at':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'status':
            return Number(b.is_active) - Number(a.is_active);
          default:
            return 0;
        }
      });

      setDepartments(filteredDepartments);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      setError(error?.response?.data?.message || 'Bölümler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDepartments();
  };

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      // Find sectorId and directorateId from names
      const sectorId = sectors.find(s => s.name === department.sector)?.id || 0;
      const directorateId = directorates.find(d => d.name === department.directorate)?.id || 0;
      reset({
        name: department.name,
        sectorId,
        directorateId,
        description: department.description,
        is_active: department.is_active,
      });
    } else {
      setEditingDepartment(null);
      reset({
        name: '',
        sectorId: 0,
        directorateId: 0,
        description: '',
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDepartment(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      setError('');
      if (editingDepartment) {
        // Update department
        await apiService.updateDepartment(editingDepartment.id, data);
        setSnackbar({ open: true, message: 'Bölüm başarıyla güncellendi', severity: 'success' });
      } else {
        // Create new department
        await apiService.createDepartment(data);
        setSnackbar({ open: true, message: 'Bölüm başarıyla oluşturuldu', severity: 'success' });
      }
      handleCloseDialog();
      await fetchDepartments();
    } catch (error: any) {
      console.error('Error saving department:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Bölüm kaydedilirken hata oluştu';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (departmentToDelete) {
        await apiService.deleteDepartment(departmentToDelete.id);
        setSnackbar({ open: true, message: 'Bölüm başarıyla silindi', severity: 'success' });
        setDeleteDialogOpen(false);
        setDepartmentToDelete(null);
        await fetchDepartments();
      }
    } catch (error: any) {
      console.error('Error deleting department:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Bölüm silinirken hata oluştu';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 0, px: 0.5 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={60} />
          <Skeleton variant="text" width={500} height={30} />
        </Box>
        <Card>
          <CardContent>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1 }} />
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: 'warning.main',
                mr: 2,
                width: 48,
                height: 48,
              }}
            >
              <Business />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Bölüm Yönetimi
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Denetim bölümlerini yönetin ve düzenleyin
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ fontSize: '0.8rem' }}
          >
            Yeni Bölüm
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          {[
            { title: 'Toplam Bölüm', value: departments.length, icon: <Business />, color: '#f59e0b' },
            { title: 'Aktif Bölümler', value: departments.filter(d => d.is_active !== false && d.isActive !== false).length, icon: <Business />, color: '#2e7d32' },
            { title: 'Pasif Bölümler', value: departments.filter(d => d.is_active === false || d.isActive === false).length, icon: <Business />, color: '#d32f2f' },
            { title: 'Toplam Sektör', value: sectors.length, icon: <Business />, color: '#1976d2' },
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

        {/* Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: '1 1 250px', minWidth: 200 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Bölüm adı veya açıklama ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ flex: '0 0 120px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Durum"
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="active">Aktif</MenuItem>
                    <MenuItem value="inactive">Pasif</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '0 0 120px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sırala</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sırala"
                  >
                    <MenuItem value="name">Ada Göre</MenuItem>
                    <MenuItem value="created_at">Tarihe Göre</MenuItem>
                    <MenuItem value="status">Duruma Göre</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '0 0 auto' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Search />}
                  onClick={handleSearch}
                >
                  Filtrele
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Departments Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Bölüm Adı</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Sektör</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Direktörlük</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Oluşturma Tarihi</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {dept.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dept.sector || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dept.directorate || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dept.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                          value={dept.is_active ? 'active' : 'inactive'}
                          onChange={async (e) => {
                            try {
                              await apiService.updateDepartment(dept.id, {
                                name: dept.name,
                                sectorId: sectors.find(s => s.name === dept.sector)?.id || 0,
                                directorateId: directorates.find(d => d.name === dept.directorate)?.id || 0,
                                description: dept.description,
                                is_active: e.target.value === 'active',
                              });
                              await fetchDepartments();
                              setSnackbar({ open: true, message: 'Bölüm durumu güncellendi', severity: 'success' });
                            } catch (error: any) {
                              console.error('Error updating department status:', error);
                              setSnackbar({ open: true, message: 'Durum güncellenirken hata oluştu', severity: 'error' });
                            }
                          }}
                          sx={{ fontSize: '0.7rem', height: 28 }}
                        >
                          <MenuItem value="active">Aktif</MenuItem>
                          <MenuItem value="inactive">Pasif</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dept.created_at ? format(new Date(dept.created_at), 'dd/MM/yyyy') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          sx={{ color: 'primary.main' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(dept)}
                          sx={{ color: 'warning.main' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(dept)}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {departments.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Business sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Henüz bölüm bulunmuyor
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                İlk bölümünüzü oluşturmak için butona tıklayın
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Yeni Bölüm Oluştur
              </Button>
            </Box>
          )}
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                {editingDepartment ? 'Bölüm Düzenle' : 'Yeni Bölüm Oluştur'}
              </Typography>
              <IconButton onClick={handleCloseDialog}>
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
                    fullWidth
                    size="small"
                    label="Bölüm Adı"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="sectorId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.sectorId}>
                    <InputLabel>Sektör</InputLabel>
                    <Select
                      {...field}
                      label="Sektör"
                    >
                      <MenuItem value={0}>Seçiniz</MenuItem>
                      {sectors.map((sector) => (
                        <MenuItem key={sector.id} value={sector.id}>
                          {sector.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.sectorId && <Typography variant="caption" color="error">{errors.sectorId?.message}</Typography>}
                  </FormControl>
                )}
              />
              <Controller
                name="directorateId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.directorateId}>
                    <InputLabel>Direktörlük</InputLabel>
                    <Select
                      {...field}
                      label="Direktörlük"
                    >
                      <MenuItem value={0}>Seçiniz</MenuItem>
                      {directorates.map((directorate) => (
                        <MenuItem key={directorate.id} value={directorate.id}>
                          {directorate.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.directorateId && <Typography variant="caption" color="error">{errors.directorateId?.message}</Typography>}
                  </FormControl>
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    label="Açıklama"
                    placeholder="Bölümün detaylı açıklamasını yazın..."
                  />
                )}
              />
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} size="small" />}
                    label="Bölüm aktif"
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              İptal
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              sx={{
                background: editingDepartment 
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            >
              {editingDepartment ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Bölümü Sil</DialogTitle>
          <DialogContent>
            <Typography>
              "{departmentToDelete?.name}" bölümünü silmek istediğinizden emin misiniz?
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

        {/* Snackbar for notifications */}
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

export default DepartmentsPage;