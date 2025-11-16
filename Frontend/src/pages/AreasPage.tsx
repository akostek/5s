import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Container,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  TablePagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Business,
  LocationOn,
  Search,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { apiService } from '../services/api';
import { Department as DepartmentType } from '../types';


interface Area {
  id: number;
  name: string;
  sector?: string;
  sectorName?: string;
  directorate?: string;
  directorateName?: string;
  description: string;
  department_id: number;
  department_name: string;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AreasPage: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department_id: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [departmentsData, areasData] = await Promise.all([
        apiService.getDepartments(),
        apiService.getAreas()
      ]);
      
      setDepartments(departmentsData);
      
      // Map areas to include department_name and location
      const mappedAreas = areasData.map((area: any) => {
        const dept = departmentsData.find(d => d.id === area.departmentId);
        return {
          id: area.id,
          name: area.name,
          description: area.description || '',
          department_id: area.departmentId,
          department_name: area.departmentName || dept?.name || 'Unknown',
          sector: area.sectorName || dept?.sector || '',
          sectorName: area.sectorName || dept?.sector || '',
          directorate: area.directorateName || dept?.directorate || '',
          directorateName: area.directorateName || dept?.directorate || '',
          location: '', // Backend doesn't have location field currently
          is_active: area.isActive,
          created_at: area.createdAt,
          updated_at: area.UpdatedAt,
        };
      });
      
      setAreas(mappedAreas);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({ open: true, message: 'Veri yüklenirken hata oluştu', severity: 'error' });
      setLoading(false);
    }
  };

  const handleOpenDialog = (area?: Area) => {
    if (area) {
      setEditingArea(area);
      setFormData({
        name: area.name,
        description: area.description,
        department_id: area.department_id.toString(),
        is_active: area.is_active,
      });
    } else {
      setEditingArea(null);
      setFormData({
        name: '',
        description: '',
        department_id: '',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingArea(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: 'Alan adı zorunludur', severity: 'error' });
      return;
    }
    if (!formData.department_id) {
      setSnackbar({ open: true, message: 'Bölüm seçimi zorunludur', severity: 'error' });
      return;
    }

    try {
      const areaData = {
        departmentId: parseInt(formData.department_id),
        name: formData.name,
        description: formData.description,
      };

      if (editingArea) {
        // Update existing area
        await apiService.updateArea(editingArea.id, areaData);
        setSnackbar({ open: true, message: 'Alan başarıyla güncellendi', severity: 'success' });
      } else {
        // Create new area
        await apiService.createArea(areaData);
        setSnackbar({ open: true, message: 'Alan başarıyla eklendi', severity: 'success' });
      }

      handleCloseDialog();
      await fetchData();
    } catch (error: any) {
      console.error('Error saving area:', error);
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.message || 'Alan kaydedilirken hata oluştu', 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu alanı silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteArea(id);
        setSnackbar({ open: true, message: 'Alan başarıyla silindi', severity: 'success' });
        await fetchData();
      } catch (error: any) {
        console.error('Error deleting area:', error);
        setSnackbar({ 
          open: true, 
          message: error?.response?.data?.message || 'Alan silinirken hata oluştu', 
          severity: 'error' 
        });
      }
    }
  };

  const handleToggleStatus = async (area: Area) => {
    try {
      await apiService.updateArea(area.id, { 
        departmentId: area.department_id,
        name: area.name,
        description: area.description,
      });
      setSnackbar({ open: true, message: 'Alan durumu güncellendi', severity: 'success' });
      await fetchData();
    } catch (error: any) {
      console.error('Error toggling area status:', error);
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.message || 'Alan durumu güncellenirken hata oluştu', 
        severity: 'error' 
      });
    }
  };

  // Filter areas
  const filteredAreas = areas.filter(area => {
    const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (area.description && area.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (area.department_name && area.department_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (area.location && area.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = departmentFilter === 'all' || area.department_id.toString() === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && area.is_active) ||
                         (statusFilter === 'inactive' && !area.is_active);

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination
  const paginatedAreas = filteredAreas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 1, px: 1 }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
          Alanlar yükleniyor...
        </Typography>
      </Container>
    );
  }


  return (
    <Container maxWidth="xl" sx={{ py: 0, px: 0.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
            Alanlar Yönetimi
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ fontSize: '0.8rem' }}
        >
          Yeni Alan
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        {[
          { title: 'Toplam Alan', value: areas.length, icon: <LocationOn />, color: '#1976d2' },
          { title: 'Aktif Alanlar', value: areas.filter(a => a.is_active).length, icon: <Business />, color: '#2e7d32' },
          { title: 'Pasif Alanlar', value: areas.filter(a => !a.is_active).length, icon: <Business />, color: '#d32f2f' },
          { title: 'Toplam Bölüm', value: departments.length, icon: <Business />, color: '#f57c00' },
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
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Alan, açıklama, bölüm veya konum ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
              />
            </Box>
            
            <Box sx={{ flex: '0 0 150px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Bölüm</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Bölüm"
                  sx={{ fontSize: '0.8rem' }}
                >
                  <MenuItem value="all">Tüm Bölümler</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: '0 0 120px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Durum"
                  sx={{ fontSize: '0.8rem' }}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="inactive">Pasif</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Areas Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Alan Adı</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Sektör</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Direktörlük</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Açıklama</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Bölüm</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Oluşturma</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAreas.map((area) => (
                <TableRow key={area.id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1, color: 'primary.main', fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {area.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {area.sector || area.sectorName || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {area.directorate || area.directorateName || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {area.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={area.department_name}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={area.is_active ? 'Aktif' : 'Pasif'}
                      size="small"
                      color={area.is_active ? 'success' : 'error'}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                      onClick={() => handleToggleStatus(area)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                      {area.created_at ? format(new Date(area.created_at), 'dd MMM yyyy', { locale: tr }) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(area)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(area.id)}
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
        
        <TablePagination
          component="div"
          count={filteredAreas.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          sx={{ fontSize: '0.8rem' }}
        />
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600 }}>
          {editingArea ? 'Alan Düzenle' : 'Yeni Alan Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Alan Adı"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              size="small"
              sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
            />
            
            <TextField
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              size="small"
              sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
            />

            <FormControl fullWidth required size="small">
              <InputLabel>Bölüm</InputLabel>
              <Select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                label="Bölüm"
                sx={{ fontSize: '0.8rem' }}
              >
                {departments.filter(d => (d.is_active !== false) && (d.isActive !== false)).map((dept) => (
                  <MenuItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Durum</InputLabel>
              <Select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                label="Durum"
                sx={{ fontSize: '0.8rem' }}
              >
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="inactive">Pasif</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ fontSize: '0.8rem' }}>
            İptal
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ fontSize: '0.8rem' }}>
            {editingArea ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', fontSize: '0.8rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AreasPage;
