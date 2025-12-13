import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../contexts/PermissionContext';
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Container,
  Fade,
  Tab,
  Tabs,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import {
  Save,
  Settings as SettingsIcon,
  Email,
  Assessment,
  Business,
  Notifications,
  QuestionAnswer,
  Add,
  Edit,
  Delete,
  Security,
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface Question {
  id: number;
  category: string;
  categoryId?: number;
  text: string;
  sector?: string;
  directorate?: string;
  department?: string;
  area?: string;
  order: number;
  points_high: number;
  points_medium: number;
  points_low: number;
  is_active: boolean;
}

const mockQuestions: Question[] = [
  { id: 1, category: '1S - Seiri', text: 'Gereksiz malzemeler ayıklandı mı?', sector: 'UGES', directorate: 'Üretim Direktörlüğü', department: 'Üretim Planlama Müdürlüğü', area: 'Ana Üretim Hattı', order: 1, points_high: 10, points_medium: 5, points_low: 0, is_active: true },
  { id: 2, category: '2S - Seiton', text: 'Her şey yerli yerinde mi?', sector: 'UGES', directorate: 'Üretim Direktörlüğü', department: 'Üretim Planlama Müdürlüğü', area: 'Ana Üretim Hattı', order: 2, points_high: 10, points_medium: 5, points_low: 0, is_active: true },
  { id: 3, category: '3S - Seiso', text: 'Alan temiz mi?', sector: 'UGES', directorate: 'Kalite Direktörlüğü', department: 'Kalite Güvence Müdürlüğü', area: 'Kalite Kontrol Laboratuvarı', order: 3, points_high: 10, points_medium: 5, points_low: 0, is_active: true },
  { id: 4, category: '4S - Seiketsu', text: 'Standartlar uygulanıyor mu?', sector: 'UGES', directorate: 'Bakım Direktörlüğü', department: 'Teknik Bakım Müdürlüğü', area: 'Makine Bakımı', order: 4, points_high: 10, points_medium: 5, points_low: 0, is_active: true },
  { id: 5, category: '5S - Shitsuke', text: 'Disiplin sağlanıyor mu?', sector: 'UGES', directorate: 'Lojistik Direktörlüğü', department: 'Depo Yönetim Müdürlüğü', area: 'Hammadde Deposu', order: 5, points_high: 10, points_medium: 5, points_low: 0, is_active: true },
];

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { canAccessPage, canAccessButton } = usePermission();
  const [canViewYetkilerTab, setCanViewYetkilerTab] = useState(false);
  
  // Backend handles authorization, no need to check role in frontend
  const [activeTab, setActiveTab] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [levelThresholds, setLevelThresholds] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  
  // Sektörler state
  const [sectors, setSectors] = useState<any[]>([]);
  const [sectorDialogOpen, setSectorDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<any | null>(null);
  const [sectorName, setSectorName] = useState('');
  const [sectorDescription, setSectorDescription] = useState('');
  
  // Direktörlükler state
  const [directorates, setDirectorates] = useState<any[]>([]);
  const [directorateDialogOpen, setDirectorateDialogOpen] = useState(false);
  const [editingDirectorate, setEditingDirectorate] = useState<any | null>(null);
  const [directorateName, setDirectorateName] = useState('');
  const [directorateDescription, setDirectorateDescription] = useState('');
  const [directorateSectorId, setDirectorateSectorId] = useState<number | null>(null);

  // Duyurular state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementDate, setAnnouncementDate] = useState(new Date().toISOString().split('T')[0]);
  const [announcementIsActive, setAnnouncementIsActive] = useState(true);

  // Yetkiler state
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  
  // Permission form fields
  const [permissionRoleId, setPermissionRoleId] = useState<number>(0);
  const [permissionPage, setPermissionPage] = useState('');
  const [permissionButton, setPermissionButton] = useState('');
  const [permissionFilterSektor, setPermissionFilterSektor] = useState(false);
  const [permissionFilterDirektorluk, setPermissionFilterDirektorluk] = useState(false);
  const [permissionShowPlanlananTarih, setPermissionShowPlanlananTarih] = useState(false);
  const [permissionShowPlanlandiDurum, setPermissionShowPlanlandiDurum] = useState(false);
  const [permissionCanView, setPermissionCanView] = useState(true);
  const [permissionCanViewYetkilerTab, setPermissionCanViewYetkilerTab] = useState(false);

  // Genel Ayarlar
  const [companyName, setCompanyName] = useState('UGES - Ulusal Güvenlik Elektronik Sistemleri');
  const [companyAddress, setCompanyAddress] = useState('İstanbul, Türkiye');
  const [contactEmail, setContactEmail] = useState('info@uges.com.tr');
  const [contactPhone, setContactPhone] = useState('+90 212 xxx xx xx');

  // Denetim Ayarları
  const [autoAssignAuditors, setAutoAssignAuditors] = useState(true);
  const [requirePhotos, setRequirePhotos] = useState(true);
  const [allowOfflineMode, setAllowOfflineMode] = useState(false);
  const [minAuditInterval, setMinAuditInterval] = useState('30');

  // Email Bildirim Ayarları
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smtpServer, setSmtpServer] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('noreply@uges.com.tr');
  const [smtpPassword, setSmtpPassword] = useState('');

  // Bildirim Tercihleri
  const [notifyNewAudit, setNotifyNewAudit] = useState(true);
  const [notifyAuditComplete, setNotifyAuditComplete] = useState(true);
  const [notifyNewAction, setNotifyNewAction] = useState(true);
  const [notifyActionDue, setNotifyActionDue] = useState(true);
  const [notifyLowScore, setNotifyLowScore] = useState(true);
  const [dailyReport, setDailyReport] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  // S Seviyesi Puan Eşikleri - Tablo formatı için (LevelThreshold'dan beslenecek)
  interface ScoreThreshold {
    id?: number;
    level: string; // 'Başlangıç S', '1S', '2S', '3S', '4S', '5S'
    minScore: number; // MinPercentage
    maxScore: number; // MaxPercentage
    sectorId?: number | null;
    sectorName?: string;
  }

  const [scoreThresholds, setScoreThresholds] = useState<ScoreThreshold[]>([]);
  const [editingThreshold, setEditingThreshold] = useState<ScoreThreshold | null>(null);
  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  // Fetch sectors, directorates, questions, categories, level thresholds, and departments
  useEffect(() => {
    fetchSectors();
    fetchDirectorates();
    fetchQuestions();
    fetchCategories();
    fetchLevelThresholds();
    fetchDepartments();
    fetchAreas();
    fetchScoreThresholds();
    fetchAnnouncements();
    fetchCanViewYetkilerTab();
  }, []);

  const fetchCanViewYetkilerTab = async () => {
    try {
      const response = await apiService.canViewYetkilerTab();
      setCanViewYetkilerTab(response.canView);
      // Eğer Yetkiler sekmesini görebiliyorsa, verileri yükle
      if (response.canView) {
        fetchPermissions();
        fetchRoles();
      }
    } catch (error) {
      console.error('Error checking Yetkiler tab permission:', error);
      setCanViewYetkilerTab(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const data = await apiService.getAreas();
      setAreas(data);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await apiService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchScoreThresholds = async () => {
    try {
      const data = await apiService.getLevelThresholds();
      const thresholds: ScoreThreshold[] = (data.thresholds || []).map((lt: any) => ({
        id: lt.id,
        level: lt.levelName || lt.level_name || '',
        minScore: lt.minPercentage || lt.min_percentage || 0,
        maxScore: lt.maxPercentage || lt.max_percentage || 100,
        sectorId: lt.sectorId || lt.sector_id || null,
        sectorName: lt.sectorName || lt.sector_name || null,
      }));
      setScoreThresholds(thresholds);
    } catch (error) {
      console.error('Error fetching score thresholds:', error);
      setScoreThresholds([]);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const questionsData = await apiService.getQuestions();
      // Map API response to Question interface
      const mappedQuestions: Question[] = questionsData.map((q: any) => ({
        id: q.id,
        category: q.categoryName || q.category_name || q.CategoryName || '',
        categoryId: q.categoryId || q.category_id || q.CategoryId,
        text: q.text || q.Text || '',
        sector: q.sector || q.Sector || '',
        directorate: q.directorate || q.Directorate || '',
        department: q.department || q.Department || '',
        area: q.area || q.Area || '',
        order: q.orderIndex || q.order_index || q.OrderIndex || 0,
        points_high: q.pointsHigh || q.points_high || q.PointsHigh || 10,
        points_medium: q.pointsMedium || q.points_medium || q.PointsMedium || 5,
        points_low: q.pointsLow || q.points_low || q.PointsLow || 0,
        is_active: q.isActive !== undefined ? q.isActive : (q.is_active !== undefined ? q.is_active : (q.IsActive !== undefined ? q.IsActive : true)),
      }));
      setQuestions(mappedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLevelThresholds = async () => {
    try {
      const data = await apiService.getLevelThresholds();
      setLevelThresholds(data.thresholds || []);
    } catch (error) {
      console.error('Error fetching level thresholds:', error);
    }
  };

  const fetchSectors = async () => {
    try {
      const data = await apiService.getSectors();
      setSectors(data);
    } catch (error) {
      console.error('Error fetching sectors:', error);
    }
  };

  const fetchDirectorates = async () => {
    try {
      const data = await apiService.getDirectorates();
      setDirectorates(data);
    } catch (error) {
      console.error('Error fetching directorates:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const data = await apiService.getAnnouncements(); // Tüm duyuruları çek
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleSaveAnnouncement = async () => {
    try {
      if (!announcementTitle.trim() || !announcementContent.trim()) {
        alert('Başlık ve içerik zorunludur');
        return;
      }

      const announcementData = {
        title: announcementTitle,
        content: announcementContent,
        announcementDate: announcementDate,
        isActive: announcementIsActive,
      };

      if (editingAnnouncement) {
        await apiService.updateAnnouncement(editingAnnouncement.id, announcementData);
        alert('Duyuru güncellendi');
      } else {
        await apiService.createAnnouncement(announcementData);
        alert('Duyuru oluşturuldu');
      }

      setAnnouncementDialogOpen(false);
      setEditingAnnouncement(null);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setAnnouncementDate(new Date().toISOString().split('T')[0]);
      setAnnouncementIsActive(true);
      await fetchAnnouncements();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Duyuru kaydedilirken hata oluştu');
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (window.confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteAnnouncement(id);
        alert('Duyuru silindi');
        await fetchAnnouncements();
      } catch (error: any) {
        alert(error?.response?.data?.message || 'Duyuru silinirken hata oluştu');
      }
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await apiService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Fallback: try to get from permissions
      try {
        const perms = await apiService.getAllPermissions();
        const uniqueRoles = Array.from(new Set(perms.map((p: any) => ({ id: p.roleId, name: p.role }))))
          .map((r: any) => ({ id: r.id, name: r.name }));
        setRoles(uniqueRoles);
      } catch (e) {
        console.error('Error fetching roles from permissions:', e);
      }
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const data = await apiService.getAllPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleOpenPermissionDialog = (permission?: any) => {
    if (permission) {
      setEditingPermission(permission);
      setPermissionRoleId(permission.roleId);
      setPermissionPage(permission.page);
      setPermissionButton(permission.button || '');
      setPermissionFilterSektor(permission.filterSektor);
      setPermissionFilterDirektorluk(permission.filterDirektorluk);
      setPermissionShowPlanlananTarih(permission.showPlanlananTarih);
      setPermissionShowPlanlandiDurum(permission.showPlanlandiDurum);
      setPermissionCanView(permission.canView);
      setPermissionCanViewYetkilerTab(permission.canViewYetkilerTab || false);
    } else {
      setEditingPermission(null);
      setPermissionRoleId(0);
      setPermissionPage('');
      setPermissionButton('');
      setPermissionFilterSektor(false);
      setPermissionFilterDirektorluk(false);
      setPermissionShowPlanlananTarih(false);
      setPermissionShowPlanlandiDurum(false);
      setPermissionCanView(true);
      setPermissionCanViewYetkilerTab(false);
    }
    setPermissionDialogOpen(true);
  };

  const handleClosePermissionDialog = () => {
    setPermissionDialogOpen(false);
    setEditingPermission(null);
  };

  const handleSavePermission = async () => {
    try {
      if (!permissionRoleId || !permissionPage) {
        alert('Rol ve Sayfa alanları zorunludur.');
        return;
      }

      const permissionData: any = {
        roleId: permissionRoleId,
        page: permissionPage.trim(),
        button: permissionButton.trim() || null,
        filterSektor: permissionFilterSektor,
        filterDirektorluk: permissionFilterDirektorluk,
        showPlanlananTarih: permissionShowPlanlananTarih,
        showPlanlandiDurum: permissionShowPlanlandiDurum,
        canView: permissionCanView,
        canViewYetkilerTab: permissionCanViewYetkilerTab,
      };

      if (editingPermission) {
        await apiService.updatePermission(editingPermission.id, permissionData);
      } else {
        await apiService.createPermission(permissionData);
      }

      await fetchPermissions();
      handleClosePermissionDialog();
    } catch (error: any) {
      console.error('Error saving permission:', error);
      alert(error.response?.data?.message || 'Yetki kaydedilirken bir hata oluştu.');
    }
  };

  const handleDeletePermission = async (id: number) => {
    if (window.confirm('Bu yetkiyi silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deletePermission(id);
        await fetchPermissions();
      } catch (error: any) {
        console.error('Error deleting permission:', error);
        alert('Yetki silinirken bir hata oluştu.');
      }
    }
  };

  const handleSaveSector = async () => {
    try {
      if (editingSector) {
        await apiService.updateSector(editingSector.id, {
          name: sectorName,
          description: sectorDescription,
          isActive: editingSector.isActive
        });
      } else {
        await apiService.createSector({ name: sectorName, description: sectorDescription });
      }
      fetchSectors();
      setSectorDialogOpen(false);
      setSectorName('');
      setSectorDescription('');
      setEditingSector(null);
    } catch (error) {
      console.error('Error saving sector:', error);
    }
  };

  const handleDeleteSector = async (id: number) => {
    if (window.confirm('Bu sektörü silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteSector(id);
        fetchSectors();
      } catch (error) {
        console.error('Error deleting sector:', error);
      }
    }
  };

  const handleSaveDirectorate = async () => {
    try {
      if (editingDirectorate) {
        await apiService.updateDirectorate(editingDirectorate.id, {
          name: directorateName,
          sectorId: directorateSectorId,
          description: directorateDescription,
          isActive: editingDirectorate.isActive
        });
      } else {
        await apiService.createDirectorate({ 
          name: directorateName, 
          sectorId: directorateSectorId,
          description: directorateDescription 
        });
      }
      fetchDirectorates();
      setDirectorateDialogOpen(false);
      setDirectorateName('');
      setDirectorateDescription('');
      setDirectorateSectorId(null);
      setEditingDirectorate(null);
    } catch (error) {
      console.error('Error saving directorate:', error);
    }
  };

  const handleDeleteDirectorate = async (id: number) => {
    if (window.confirm('Bu direktörlüğü silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteDirectorate(id);
        fetchDirectorates();
      } catch (error) {
        console.error('Error deleting directorate:', error);
      }
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSave = () => {
    console.log('Settings saved');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;
    
    if (!editingQuestion.text || !editingQuestion.text.trim()) {
      alert('Soru metni zorunludur.');
      return;
    }

    if (!editingQuestion.categoryId) {
      alert('Kategori seçilmelidir.');
      return;
    }
    
    // Ensure categoryId is a valid number
    if (!editingQuestion.categoryId || editingQuestion.categoryId <= 0) {
      alert('Geçerli bir kategori seçilmelidir.');
      return;
    }

    // Validate categoryId one more time before sending
    const categoryIdNum = Number(editingQuestion.categoryId);
    if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
      alert('Geçerli bir kategori seçilmelidir. (ID: ' + editingQuestion.categoryId + ')');
      return;
    }

      const questionData: any = {
      categoryId: categoryIdNum, // Ensure it's a number
        text: editingQuestion.text.trim(),
        sector: editingQuestion.sector || null,
        directorate: editingQuestion.directorate || null,
        department: editingQuestion.department || null,
        area: editingQuestion.area || null,
        orderIndex: editingQuestion.order || 0,
        pointsHigh: editingQuestion.points_high || 10,
        pointsMedium: editingQuestion.points_medium || 5,
        pointsLow: editingQuestion.points_low || 0,
        isActive: editingQuestion.is_active !== undefined ? editingQuestion.is_active : true,
      };

    // Debug: Log the data being sent
    console.log('Sending question data:', questionData);
    console.log('Editing question:', editingQuestion);
    console.log('CategoryId type:', typeof questionData.categoryId, 'value:', questionData.categoryId);

    try {
      if (editingQuestion.id && editingQuestion.id > 0) {
        await apiService.updateQuestion(editingQuestion.id, questionData);
      } else {
        await apiService.createQuestion(questionData);
      }
      
      await fetchQuestions();
      setQuestionDialogOpen(false);
      setEditingQuestion(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving question:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      console.error('Question data sent:', questionData);
      
      let errorMessage = 'Soru kaydedilirken bir hata oluştu.';
      
      // Get more detailed error message
      if (error?.response?.data) {
        const errorData = error.response.data;
        console.error('Error data:', errorData);
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Validation errors
          const errorDetails = errorData.errors.map((e: any) => 
            `${e.field}: ${Array.isArray(e.errors) ? e.errors.join(', ') : e.errors}`
          ).join('\n');
          errorMessage = `Doğrulama hatası:\n${errorDetails}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Show full error in console for debugging
      console.error('Final error message:', errorMessage);
      alert(errorMessage);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (window.confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteQuestion(id);
        await fetchQuestions();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error: any) {
        console.error('Error deleting question:', error);
        console.error('Error response:', error?.response?.data);
        console.error('Error status:', error?.response?.status);
        
        let errorMessage = 'Soru silinirken bir hata oluştu.';
        
        if (error?.response?.status === 403) {
          errorMessage = 'Bu işlem için yetkiniz bulunmamaktadır.';
        } else if (error?.response?.data) {
          const errorData = error.response.data;
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
      }
    }
  };

  return (
    <Fade in timeout={800}>
      <Container maxWidth={false} sx={{ py: 3, px: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Sistem Ayarları
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Platform yapılandırması ve bildirim ayarları
            </Typography>
          </Box>
        </Box>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Ayarlar başarıyla kaydedildi
          </Alert>
        )}

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab icon={<SettingsIcon />} iconPosition="start" label="Puan Eşikleri" />
            <Tab icon={<QuestionAnswer />} iconPosition="start" label="Sorular" />
            <Tab icon={<Notifications />} iconPosition="start" label="Duyurular" />
            <Tab icon={<Business />} iconPosition="start" label="Sektörler" />
            <Tab icon={<Business />} iconPosition="start" label="Direktörlükler" />
            {canViewYetkilerTab && (
              <Tab icon={<Security />} iconPosition="start" label="Yetkiler" />
            )}
          </Tabs>
        </Card>

        {/* Tab Panels */}
        <Card>
          <CardContent>
            {/* Puan Eşikleri */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>5S Seviye Puan Aralıkları</Typography>
                  <Typography variant="body2" color="text.secondary">Sektör, direktörlük ve bölüm bazında puan eşiklerini yönetin</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={() => {
                    setEditingThreshold({
                      level: '1S',
                      minScore: 0,
                      maxScore: 100,
                      sectorId: null,
                    });
                    setThresholdDialogOpen(true);
                  }} 
                  size="small"
                >
                  Yeni Eşik Ekle
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Sektör</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>5S Seviyesi</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Min Yüzde</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Max Yüzde</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Yüzde Aralığı</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                  <TableBody>
                    {scoreThresholds.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Henüz puan eşiği tanımlanmamıştır.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        scoreThresholds.map((threshold) => {
                        const getLevelColor = (level: string) => {
                          const colors: { [key: string]: string } = {
                            'Başlangıç S': 'default',
                            'Başlangıç': 'default',
                            '1S': 'error',
                            '2S': 'warning',
                            '3S': 'info',
                            '4S': 'primary',
                            '5S': 'success',
                          };
                          return colors[level] || 'default';
                        };
                        
                        return (
                          <TableRow key={threshold.id || threshold.level} hover>
                            <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{threshold.sectorName || 'Tümü'}</Typography></TableCell>
                            <TableCell>
                              <Chip 
                                label={threshold.level} 
                                size="small" 
                                color={getLevelColor(threshold.level) as any}
                                sx={{ fontSize: '0.7rem', height: 20 }} 
                              />
                            </TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{threshold.minScore}%</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{threshold.maxScore}%</Typography></TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                {threshold.minScore}% - {threshold.maxScore}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => {
                                    setEditingThreshold(threshold);
                                    setThresholdDialogOpen(true);
                                  }} 
                                  sx={{ color: 'primary.main' }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={async () => {
                                    if (window.confirm('Bu eşiği silmek istediğinizden emin misiniz?')) {
                                      try {
                                        if (threshold.id) {
                                          await apiService.deleteLevelThreshold(threshold.id);
                                          await fetchScoreThresholds();
                                          setSaveSuccess(true);
                                          setTimeout(() => setSaveSuccess(false), 3000);
                                        }
                                      } catch (error) {
                                        console.error('Error deleting threshold:', error);
                                        alert('Eşik silinirken bir hata oluştu.');
                                      }
                                    }
                                  }} 
                                  sx={{ color: 'error.main' }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Sorular */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>Denetim Soruları</Typography>
                  <Typography variant="body2" color="text.secondary">Sektör, direktörlük, bölüm ve alan bazında sorular</Typography>
                </Box>
                {canAccessButton('Ayarlar', 'new') && (
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={() => {
                      const sortedCategories = [...categories].sort((a, b) => 
                        (a.orderIndex || a.order_index || a.OrderIndex || 0) - (b.orderIndex || b.order_index || b.OrderIndex || 0)
                    );
                      const firstCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;
                    setEditingQuestion({
                      id: 0,
                        category: firstCategory?.name || firstCategory?.Name || '',
                        categoryId: firstCategory?.id || firstCategory?.Id || undefined,
                      text: '',
                      sector: '',
                      directorate: '',
                      department: '',
                      area: '',
                      order: 0,
                      points_high: 10,
                      points_medium: 5,
                      points_low: 0,
                      is_active: true,
                    });
                    setQuestionDialogOpen(true);
                  }} 
                  size="small"
                >
                  Yeni Soru Ekle
                </Button>
                )}
              </Box>
              {loadingQuestions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Kategori</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Kategori ID</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Soru</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Sektör</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Direktörlük</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Bölüm</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Alan</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Puanlar (Y/O/D)</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Durum</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {questions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} sx={{ textAlign: 'center', py: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Henüz soru bulunmamaktadır.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        questions.map((question) => (
                          <TableRow key={question.id} hover>
                            <TableCell><Chip label={question.category} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} /></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{question.categoryId || '-'}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{question.text}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{question.sector || '-'}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{question.directorate || '-'}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{question.department || '-'}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{question.area || '-'}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{question.points_high}/{question.points_medium}/{question.points_low}</Typography></TableCell>
                            <TableCell><Chip label={question.is_active ? 'Aktif' : 'Pasif'} size="small" color={question.is_active ? 'success' : 'default'} sx={{ fontSize: '0.7rem', height: 20 }} /></TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {canAccessButton('Ayarlar', 'edit') && (
                                <IconButton size="small" onClick={() => { setEditingQuestion(question); setQuestionDialogOpen(true); }} sx={{ color: 'primary.main' }}><Edit fontSize="small" /></IconButton>
                                )}
                                {canAccessButton('Ayarlar', 'delete') && (
                                <IconButton size="small" onClick={() => handleDeleteQuestion(question.id)} sx={{ color: 'error.main' }}><Delete fontSize="small" /></IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            {/* Duyurular */}
            <TabPanel value={activeTab} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>Duyurular</Typography>
                  <Typography variant="body2" color="text.secondary">Sistem duyurularını yönetin</Typography>
                </Box>
                {canAccessButton('Ayarlar', 'new') && (
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setAnnouncementTitle('');
                    setAnnouncementContent('');
                    setAnnouncementDate(new Date().toISOString().split('T')[0]);
                    setAnnouncementIsActive(true);
                    setAnnouncementDialogOpen(true);
                  }} 
                  size="small"
                >
                  Yeni Duyuru Ekle
                </Button>
                )}
              </Box>
              {loadingAnnouncements ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Tarih</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Başlık</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>İçerik</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Durum</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {announcements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Henüz duyuru bulunmamaktadır.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        announcements.map((announcement) => (
                          <TableRow key={announcement.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                {format(new Date(announcement.announcementDate), 'd MMMM yyyy', { locale: tr })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                                {announcement.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '0.75rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  maxWidth: 300,
                                }}
                              >
                                {announcement.content}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={announcement.isActive ? 'Aktif' : 'Pasif'} 
                                size="small" 
                                color={announcement.isActive ? 'success' : 'default'} 
                                sx={{ fontSize: '0.7rem', height: 20 }} 
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {canAccessButton('Ayarlar', 'edit') && (
                                <IconButton 
                                  size="small" 
                                  onClick={() => { 
                                    setEditingAnnouncement(announcement); 
                                    setAnnouncementTitle(announcement.title);
                                    setAnnouncementContent(announcement.content);
                                    setAnnouncementDate(new Date(announcement.announcementDate).toISOString().split('T')[0]);
                                    setAnnouncementIsActive(announcement.isActive);
                                    setAnnouncementDialogOpen(true); 
                                  }} 
                                  sx={{ color: 'primary.main' }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                )}
                                {canAccessButton('Ayarlar', 'delete') && (
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleDeleteAnnouncement(announcement.id)} 
                                  sx={{ color: 'error.main' }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Duyuru Dialog */}
              <Dialog open={announcementDialogOpen} onClose={() => setAnnouncementDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                  {editingAnnouncement ? 'Duyuru Düzenle' : 'Yeni Duyuru Ekle'}
                </DialogTitle>
                <DialogContent>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                      label="Duyuru Başlığı"
                      fullWidth
                      size="small"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      required
                    />
                    <TextField
                      label="Duyuru Tarihi"
                      type="date"
                      fullWidth
                      size="small"
                      value={announcementDate}
                      onChange={(e) => setAnnouncementDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                    <TextField
                      label="Duyuru İçeriği"
                      fullWidth
                      multiline
                      rows={6}
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      required
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={announcementIsActive}
                          onChange={(e) => setAnnouncementIsActive(e.target.checked)}
                        />
                      }
                      label="Aktif"
                    />
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => {
                    setAnnouncementDialogOpen(false);
                    setEditingAnnouncement(null);
                    setAnnouncementTitle('');
                    setAnnouncementContent('');
                    setAnnouncementDate(new Date().toISOString().split('T')[0]);
                    setAnnouncementIsActive(true);
                  }}>
                    İptal
                  </Button>
                  <Button variant="contained" onClick={handleSaveAnnouncement}>
                    {editingAnnouncement ? 'Güncelle' : 'Oluştur'}
                  </Button>
                </DialogActions>
              </Dialog>
            </TabPanel>

            {/* Sektörler */}
            <TabPanel value={activeTab} index={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>Sektörler</Typography>
                  <Typography variant="body2" color="text.secondary">Sektör yönetimi</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={() => {
                    setEditingSector(null);
                    setSectorName('');
                    setSectorDescription('');
                    setSectorDialogOpen(true);
                  }} 
                  size="small"
                >
                  Yeni Sektör Ekle
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Sektör Adı</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Açıklama</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Durum</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sectors.map((sector) => (
                      <TableRow key={sector.id} hover>
                        <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{sector.id}</Typography></TableCell>
                        <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{sector.name}</Typography></TableCell>
                        <TableCell><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{sector.description || '-'}</Typography></TableCell>
                        <TableCell><Chip label={sector.isActive ? 'Aktif' : 'Pasif'} size="small" color={sector.isActive ? 'success' : 'default'} sx={{ fontSize: '0.7rem', height: 20 }} /></TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => { 
                                setEditingSector(sector); 
                                setSectorName(sector.name);
                                setSectorDescription(sector.description || '');
                                setSectorDialogOpen(true); 
                              }} 
                              sx={{ color: 'primary.main' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteSector(sector.id)} 
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
            </TabPanel>

            {/* Direktörlükler */}
            <TabPanel value={activeTab} index={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>Direktörlükler</Typography>
                  <Typography variant="body2" color="text.secondary">Direktörlük yönetimi</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={() => {
                    setEditingDirectorate(null);
                    setDirectorateName('');
                    setDirectorateDescription('');
                    setDirectorateSectorId(null);
                    setDirectorateDialogOpen(true);
                  }} 
                  size="small"
                >
                  Yeni Direktörlük Ekle
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Direktörlük Adı</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Sektör</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Açıklama</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Durum</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {directorates.map((directorate) => (
                      <TableRow key={directorate.id} hover>
                        <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{directorate.id}</Typography></TableCell>
                        <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{directorate.name}</Typography></TableCell>
                        <TableCell><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{directorate.sectorName || '-'}</Typography></TableCell>
                        <TableCell><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{directorate.description || '-'}</Typography></TableCell>
                        <TableCell><Chip label={directorate.isActive ? 'Aktif' : 'Pasif'} size="small" color={directorate.isActive ? 'success' : 'default'} sx={{ fontSize: '0.7rem', height: 20 }} /></TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => { 
                                setEditingDirectorate(directorate); 
                                setDirectorateName(directorate.name);
                                setDirectorateDescription(directorate.description || '');
                                setDirectorateSectorId(directorate.sectorId || null);
                                setDirectorateDialogOpen(true); 
                              }} 
                              sx={{ color: 'primary.main' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteDirectorate(directorate.id)} 
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
            </TabPanel>

            {/* Yetkiler - Backend'den kontrol edilir */}
            {canViewYetkilerTab && (
              <TabPanel value={activeTab} index={5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>Yetkiler</Typography>
                    <Typography variant="body2" color="text.secondary">Sistem yetkilerini yönetin</Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => handleOpenPermissionDialog()} 
                    size="small"
                  >
                    Yeni Yetki Ekle
                  </Button>
                </Box>
                {loadingPermissions ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Rol</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Sayfa</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Buton</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Filtre Sektör</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Filtre Direktörlük</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Göster Planlanan Tarih</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Göster Planlandı Durum</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Görüntüle</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Yetkiler Sekmesi</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>İşlemler</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {permissions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                              <Typography variant="body2" color="text.secondary">
                                Henüz yetki kaydı yok
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          permissions.map((permission) => (
                            <TableRow key={permission.id} hover>
                              <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{permission.id}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{permission.role}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{permission.page}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{permission.button || '-'}</Typography></TableCell>
                              <TableCell>
                                <Chip 
                                  label={permission.filterSektor ? 'Evet' : 'Hayır'} 
                                  size="small" 
                                  color={permission.filterSektor ? 'success' : 'default'} 
                                  sx={{ fontSize: '0.7rem', height: 20 }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={permission.filterDirektorluk ? 'Evet' : 'Hayır'} 
                                  size="small" 
                                  color={permission.filterDirektorluk ? 'success' : 'default'} 
                                  sx={{ fontSize: '0.7rem', height: 20 }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={permission.showPlanlananTarih ? 'Evet' : 'Hayır'} 
                                  size="small" 
                                  color={permission.showPlanlananTarih ? 'success' : 'default'} 
                                  sx={{ fontSize: '0.7rem', height: 20 }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={permission.showPlanlandiDurum ? 'Evet' : 'Hayır'} 
                                  size="small" 
                                  color={permission.showPlanlandiDurum ? 'success' : 'default'} 
                                  sx={{ fontSize: '0.7rem', height: 20 }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={permission.canView ? 'Evet' : 'Hayır'} 
                                  size="small" 
                                  color={permission.canView ? 'success' : 'error'} 
                                  sx={{ fontSize: '0.7rem', height: 20 }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={permission.canViewYetkilerTab ? 'Evet' : 'Hayır'} 
                                  size="small" 
                                  color={permission.canViewYetkilerTab ? 'success' : 'default'} 
                                  sx={{ fontSize: '0.7rem', height: 20 }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleOpenPermissionDialog(permission)} 
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDeletePermission(permission.id)} 
                                    sx={{ color: 'error.main' }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>
            )}

            {/* Save Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Button variant="contained" startIcon={<Save />} onClick={handleSave} size="large" sx={{ px: 4, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                Ayarları Kaydet
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Sector Dialog */}
        <Dialog open={sectorDialogOpen} onClose={() => { setSectorDialogOpen(false); setEditingSector(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>{editingSector ? 'Sektörü Düzenle' : 'Yeni Sektör Ekle'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField 
                fullWidth 
                label="Sektör Adı" 
                value={sectorName}
                onChange={(e) => setSectorName(e.target.value)}
                size="small"
                required
              />
              <TextField 
                fullWidth 
                label="Açıklama" 
                value={sectorDescription}
                onChange={(e) => setSectorDescription(e.target.value)}
                multiline 
                rows={2} 
                size="small"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => { setSectorDialogOpen(false); setEditingSector(null); }}>İptal</Button>
            <Button variant="contained" onClick={handleSaveSector} disabled={!sectorName.trim()}>
              {editingSector ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Directorate Dialog */}
        <Dialog open={directorateDialogOpen} onClose={() => { setDirectorateDialogOpen(false); setEditingDirectorate(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>{editingDirectorate ? 'Direktörlüğü Düzenle' : 'Yeni Direktörlük Ekle'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField 
                fullWidth 
                label="Direktörlük Adı" 
                value={directorateName}
                onChange={(e) => setDirectorateName(e.target.value)}
                size="small"
                required
              />
              <FormControl fullWidth size="small">
                <InputLabel>Sektör</InputLabel>
                <Select
                  value={directorateSectorId || ''}
                  label="Sektör"
                  onChange={(e) => setDirectorateSectorId(e.target.value ? Number(e.target.value) : null)}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {sectors.filter(s => s.isActive).map((sector) => (
                    <MenuItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField 
                fullWidth 
                label="Açıklama" 
                value={directorateDescription}
                onChange={(e) => setDirectorateDescription(e.target.value)}
                multiline 
                rows={2} 
                size="small"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => { setDirectorateDialogOpen(false); setEditingDirectorate(null); }}>İptal</Button>
            <Button variant="contained" onClick={handleSaveDirectorate} disabled={!directorateName.trim()}>
              {editingDirectorate ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Question Dialog */}
        <Dialog open={questionDialogOpen} onClose={() => { setQuestionDialogOpen(false); setEditingQuestion(null); }} maxWidth="md" fullWidth>
          <DialogTitle>{editingQuestion ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Kategori</InputLabel>
                <Select 
                  value={editingQuestion?.categoryId?.toString() || ''} 
                  label="Kategori"
                  onChange={(e) => {
                    const selectedId = parseInt(e.target.value, 10);
                    if (isNaN(selectedId) || selectedId <= 0) {
                      console.error('Invalid category ID:', e.target.value);
                      alert('Geçersiz kategori seçimi');
                      return;
                    }
                    const selectedCategory = categories.find(c => (c.id || c.Id) === selectedId);
                    setEditingQuestion({ 
                      ...editingQuestion!, 
                      categoryId: selectedId,
                      category: selectedCategory?.name || selectedCategory?.Name || ''
                    });
                  }}
                >
                  {categories.length === 0 ? (
                    <MenuItem value="" disabled>Kategoriler yükleniyor...</MenuItem>
                  ) : (
                    categories
                      .sort((a, b) => (a.orderIndex || a.order_index || a.OrderIndex || 0) - (b.orderIndex || b.order_index || b.OrderIndex || 0))
                      .map((cat) => {
                        const categoryName = cat.name || cat.Name || '';
                        const categoryId = cat.id || cat.Id;
                        return (
                          <MenuItem key={categoryId} value={categoryId.toString()}>
                            {categoryName}
                          </MenuItem>
                        );
                      })
                  )}
                </Select>
              </FormControl>
              <TextField 
                fullWidth 
                label="Soru Metni" 
                multiline 
                rows={2} 
                value={editingQuestion?.text || ''} 
                onChange={(e) => setEditingQuestion({ ...editingQuestion!, text: e.target.value })}
                size="small" 
              />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sektör</InputLabel>
                  <Select 
                    value={editingQuestion?.sector || ''} 
                    label="Sektör"
                    onChange={(e) => {
                      const selectedSector = e.target.value;
                      setEditingQuestion({ 
                        ...editingQuestion!, 
                        sector: selectedSector,
                        directorate: '', // Reset directorate when sector changes
                        department: '', // Reset department when sector changes
                        area: '' // Reset area when sector changes
                      });
                    }}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {sectors.filter(s => s.isActive).map((sector) => (
                      <MenuItem key={sector.id} value={sector.name}>{sector.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Direktörlük</InputLabel>
                  <Select 
                    value={editingQuestion?.directorate || ''} 
                    label="Direktörlük"
                    onChange={(e) => {
                      const selectedDirectorate = e.target.value;
                      setEditingQuestion({ 
                        ...editingQuestion!, 
                        directorate: selectedDirectorate,
                        department: '', // Reset department when directorate changes
                        area: '' // Reset area when directorate changes
                      });
                    }}
                    disabled={!editingQuestion?.sector}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {directorates
                      .filter(d => {
                        if (!editingQuestion?.sector) return false;
                        const selectedSector = sectors.find(s => s.name === editingQuestion.sector);
                        return selectedSector && d.sectorId === selectedSector.id;
                      })
                      .map((directorate) => (
                        <MenuItem key={directorate.id} value={directorate.name}>{directorate.name}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Bölüm</InputLabel>
                  <Select 
                    value={editingQuestion?.department || ''} 
                    label="Bölüm"
                    onChange={(e) => {
                      const selectedDepartment = e.target.value;
                      setEditingQuestion({ 
                        ...editingQuestion!, 
                        department: selectedDepartment,
                        area: '' // Reset area when department changes
                      });
                    }}
                    disabled={!editingQuestion?.directorate}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {departments
                      .filter(dept => {
                        if (!editingQuestion?.directorate) return false;
                        const selectedDirectorate = directorates.find(d => d.name === editingQuestion.directorate);
                        return selectedDirectorate && dept.directorateId === selectedDirectorate.id;
                      })
                      .map((dept) => (
                        <MenuItem key={dept.id} value={dept.name}>{dept.name}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Alan</InputLabel>
                  <Select 
                    value={editingQuestion?.area || ''} 
                    label="Alan"
                    onChange={(e) => setEditingQuestion({ ...editingQuestion!, area: e.target.value })}
                    disabled={!editingQuestion?.department}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {areas
                      .filter(area => {
                        if (!editingQuestion?.department) return false;
                        const selectedDepartment = departments.find(d => d.name === editingQuestion.department);
                        return selectedDepartment && area.departmentId === selectedDepartment.id;
                      })
                      .map((area) => (
                        <MenuItem key={area.id} value={area.name}>{area.name}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Stack>
              <TextField
                fullWidth
                label="Sıra"
                type="number"
                value={editingQuestion?.order || 0}
                onChange={(e) => setEditingQuestion({ ...editingQuestion!, order: parseInt(e.target.value) || 0 })}
                size="small"
              />
              <Divider />
              <Typography variant="subtitle2">Puanlama</Typography>
              <Stack direction="row" spacing={2}>
                <TextField 
                  fullWidth 
                  label="Yüksek Puan" 
                  type="number" 
                  value={editingQuestion?.points_high || 10} 
                  onChange={(e) => setEditingQuestion({ ...editingQuestion!, points_high: parseInt(e.target.value) || 10 })}
                  size="small" 
                />
                <TextField 
                  fullWidth 
                  label="Orta Puan" 
                  type="number" 
                  value={editingQuestion?.points_medium || 5} 
                  onChange={(e) => setEditingQuestion({ ...editingQuestion!, points_medium: parseInt(e.target.value) || 5 })}
                  size="small" 
                />
                <TextField 
                  fullWidth 
                  label="Düşük Puan" 
                  type="number" 
                  value={editingQuestion?.points_low || 0} 
                  onChange={(e) => setEditingQuestion({ ...editingQuestion!, points_low: parseInt(e.target.value) || 0 })}
                  size="small" 
                />
              </Stack>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={editingQuestion?.is_active ?? true} 
                    onChange={(e) => setEditingQuestion({ ...editingQuestion!, is_active: e.target.checked })}
                  />
                } 
                label="Aktif" 
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => { setQuestionDialogOpen(false); setEditingQuestion(null); }}>İptal</Button>
            <Button variant="contained" onClick={handleSaveQuestion}>
              {editingQuestion?.id ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Score Threshold Dialog */}
        <Dialog open={thresholdDialogOpen} onClose={() => { setThresholdDialogOpen(false); setEditingThreshold(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>{editingThreshold?.id ? 'Puan Eşiğini Düzenle' : 'Yeni Puan Eşiği Ekle'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sektör</InputLabel>
                <Select 
                  value={editingThreshold?.sectorId || ''} 
                  label="Sektör"
                  onChange={(e) => setEditingThreshold({ ...editingThreshold!, sectorId: e.target.value ? Number(e.target.value) : null })}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {sectors.map((sector) => (
                    <MenuItem key={sector.id} value={sector.id}>{sector.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>5S Seviyesi</InputLabel>
                <Select 
                  value={editingThreshold?.level || ''} 
                  label="5S Seviyesi"
                  onChange={(e) => setEditingThreshold({ ...editingThreshold!, level: e.target.value })}
                >
                  <MenuItem value="Başlangıç S">Başlangıç S</MenuItem>
                  <MenuItem value="1S">1S</MenuItem>
                  <MenuItem value="2S">2S</MenuItem>
                  <MenuItem value="3S">3S</MenuItem>
                  <MenuItem value="4S">4S</MenuItem>
                  <MenuItem value="5S">5S</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={2}>
                <TextField 
                  fullWidth 
                  label="Min Yüzde (%)" 
                  type="number" 
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  value={editingThreshold?.minScore || 0} 
                  onChange={(e) => setEditingThreshold({ ...editingThreshold!, minScore: parseFloat(e.target.value) || 0 })}
                  size="small" 
                  helperText="0-100 arası"
                />
                <TextField 
                  fullWidth 
                  label="Max Yüzde (%)" 
                  type="number" 
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  value={editingThreshold?.maxScore || 100} 
                  onChange={(e) => setEditingThreshold({ ...editingThreshold!, maxScore: parseFloat(e.target.value) || 100 })}
                  size="small" 
                  helperText="0-100 arası"
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => { setThresholdDialogOpen(false); setEditingThreshold(null); }}>İptal</Button>
            <Button 
              variant="contained" 
              onClick={async () => {
                if (!editingThreshold || !editingThreshold.level) {
                  alert('Lütfen tüm alanları doldurun.');
                  return;
                }
                
                try {
                  if (editingThreshold.id) {
                    // Update existing
                    await apiService.updateLevelThreshold(editingThreshold.id, {
                      levelName: editingThreshold.level,
                      minPercentage: editingThreshold.minScore,
                      maxPercentage: editingThreshold.maxScore,
                      sectorId: editingThreshold.sectorId || null,
                    });
                  } else {
                    // Add new
                    await apiService.createLevelThreshold({
                      levelName: editingThreshold.level,
                      minPercentage: editingThreshold.minScore,
                      maxPercentage: editingThreshold.maxScore,
                      sectorId: editingThreshold.sectorId || null,
                    });
                  }
                  
                  await fetchScoreThresholds();
                  setThresholdDialogOpen(false);
                  setEditingThreshold(null);
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                } catch (error: any) {
                  console.error('Error saving threshold:', error);
                  const errorMessage = error?.response?.data?.message || error?.message || 'Eşik kaydedilirken bir hata oluştu.';
                  alert(errorMessage);
                }
              }}
            >
              {editingThreshold?.id !== undefined ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Permission Dialog */}
        <Dialog open={permissionDialogOpen} onClose={handleClosePermissionDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editingPermission ? 'Yetkiyi Düzenle' : 'Yeni Yetki Ekle'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Rol</InputLabel>
                <Select 
                  value={permissionRoleId} 
                  label="Rol"
                  onChange={(e) => setPermissionRoleId(Number(e.target.value))}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" required>
                <InputLabel>Sayfa</InputLabel>
                <Select 
                  value={permissionPage} 
                  label="Sayfa"
                  onChange={(e) => setPermissionPage(e.target.value)}
                >
                  <MenuItem value="Anasayfa">Anasayfa</MenuItem>
                  <MenuItem value="Denetimler">Denetimler</MenuItem>
                  <MenuItem value="Raporlar">Raporlar</MenuItem>
                  <MenuItem value="Yardim">Yardim</MenuItem>
                  <MenuItem value="Profil">Profil</MenuItem>
                  <MenuItem value="Alanlar">Alanlar</MenuItem>
                  <MenuItem value="Bolumler">Bolumler</MenuItem>
                  <MenuItem value="Kullanicilar">Kullanicilar</MenuItem>
                  <MenuItem value="Ayarlar">Ayarlar</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Buton (Opsiyonel)</InputLabel>
                <Select 
                  value={permissionButton || ''} 
                  label="Buton (Opsiyonel)"
                  onChange={(e) => setPermissionButton(e.target.value || '')}
                >
                  <MenuItem value="">(Sayfa Yetkisi - Buton Yok)</MenuItem>
                  <MenuItem value="new">new</MenuItem>
                  <MenuItem value="edit">edit</MenuItem>
                  <MenuItem value="delete">delete</MenuItem>
                  <MenuItem value="AddPlan">AddPlan</MenuItem>
                </Select>
              </FormControl>
              <Divider />
              <Typography variant="subtitle2">Filtreleme Ayarları</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={permissionFilterSektor}
                    onChange={(e) => setPermissionFilterSektor(e.target.checked)}
                  />
                }
                label="Filtre Sektör"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={permissionFilterDirektorluk}
                    onChange={(e) => setPermissionFilterDirektorluk(e.target.checked)}
                  />
                }
                label="Filtre Direktörlük"
              />
              <Divider />
              <Typography variant="subtitle2">Denetimler Sayfası Özel Ayarları</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={permissionShowPlanlananTarih}
                    onChange={(e) => setPermissionShowPlanlananTarih(e.target.checked)}
                  />
                }
                label="Göster Planlanan Tarih"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={permissionShowPlanlandiDurum}
                    onChange={(e) => setPermissionShowPlanlandiDurum(e.target.checked)}
                  />
                }
                label="Göster Planlandı Durum"
              />
              <Divider />
              <FormControlLabel
                control={
                  <Switch
                    checked={permissionCanView}
                    onChange={(e) => setPermissionCanView(e.target.checked)}
                    color="primary"
                  />
                }
                label="Görüntüle (CanView)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={permissionCanViewYetkilerTab}
                    onChange={(e) => setPermissionCanViewYetkilerTab(e.target.checked)}
                    color="primary"
                  />
                }
                label="Ayarlar Sayfasında Yetkiler Sekmesini Göster (CanViewYetkilerTab)"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleClosePermissionDialog}>İptal</Button>
            <Button 
              variant="contained" 
              onClick={handleSavePermission} 
              disabled={!permissionRoleId || !permissionPage.trim()}
            >
              {editingPermission ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Fade>
  );
};

export default SettingsPage;
