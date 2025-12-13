import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Container,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  Collapse,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Assignment,
  Assessment,
  TrendingUp,
  People,
  ArrowForward,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Map,
  Warning,
  Close,
  ZoomIn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { apiService } from '../services/api';
import { Audit, Announcement } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [areaImageDialog, setAreaImageDialog] = useState<string | null>(null);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  
  const [sectors, setSectors] = useState<any[]>([]);
  const [directorates, setDirectorates] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<any[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  
  const [stats, setStats] = useState([
    { label: 'Toplam Denetim', value: '0', icon: <Assignment fontSize="small" />, color: '#6366f1', change: '', actionInfo: '' },
    { label: 'Ortalama Puan', value: '0%', icon: <TrendingUp fontSize="small" />, color: '#10b981', change: '', actionInfo: '' },
    { label: 'Aktif Kullanıcı', value: '0', icon: <People fontSize="small" />, color: '#f59e0b', change: '', actionInfo: '' },
    { label: 'Tamamlanma', value: '0%', icon: <CheckCircle fontSize="small" />, color: '#8b5cf6', change: '', actionInfo: '' },
    { label: 'Aksiyonlar', value: '0/0', icon: <Warning fontSize="small" />, color: '#ef4444', change: '', actionInfo: '0 açık' },
  ]);
  
  const [recentAudits, setRecentAudits] = useState<Array<{
    id: number;
    department: string;
    area?: string;
    sector?: string;
    directorate?: string;
    score: number;
    level: string;
    date: string;
    auditor: string;
    totalActions?: number;
    openActions?: number;
    status?: string;
  }>>([]);
  
  const [sectorRankings, setSectorRankings] = useState<Array<{
    sector: string;
    avgScore: number;
    level: string;
    auditCount: number;
  }>>([]);
  
  const [sectorBreakdown, setSectorBreakdown] = useState<Array<{
    sector: string;
    seiri: number;
    seiton: number;
    seiso: number;
    seiketsu: number;
    shitsuke: number;
    total: number;
  }>>([]);
  
  const [monthProgress, setMonthProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    loadDashboardData();
    loadFilterData();
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      // Sadece aktif duyuruları çek (kullanıcı giriş yapmamış olabilir)
      const data = await apiService.getAnnouncements(true);
      // En yeni olanlar önce gelecek şekilde sırala (max 10)
      const sorted = [...data].sort((a, b) => {
        const dateA = new Date(a.announcementDate).getTime();
        const dateB = new Date(b.announcementDate).getTime();
        return dateB - dateA;
      }).slice(0, 10);
      setAnnouncements(sorted);
    } catch (error: any) {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading announcements:', error);
      }
      // Hata durumunda boş array kullan
      setAnnouncements([]);
    }
  };

  useEffect(() => {
    filterAreas();
  }, [selectedSector, selectedDirectorate, selectedDepartment, areas]);

  const loadFilterData = async () => {
    try {
      const [sectorsData, directoratesData, departmentsData, areasData] = await Promise.all([
        apiService.getSectors(),
        apiService.getDirectorates(),
        apiService.getDepartments(),
        apiService.getAreas(),
      ]);
      setSectors(sectorsData);
      setDirectorates(directoratesData);
      setDepartments(departmentsData);
      // Ensure areas have imageUrl property
      const areasWithImage = areasData.map((area: any) => {
        // Debug: Log area data
        if (process.env.NODE_ENV === 'development') {
          console.log('Area from API:', area);
          console.log('Area imageUrl:', area.imageUrl, area.ImageUrl, area.image_url);
        }
        return {
          ...area,
          imageUrl: area.imageUrl || area.ImageUrl || area.image_url || '',
        };
      });
      setAreas(areasWithImage);
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const filterAreas = () => {
    let filtered = [...areas];
    
    if (selectedSector !== 'all') {
      // Filter by sector through departments
      const sectorDepartments = departments.filter((d: any) => 
        (d.sector || d.Sector) === selectedSector
      ).map((d: any) => d.id || d.Id);
      filtered = filtered.filter((a: any) => 
        sectorDepartments.includes(a.departmentId || a.department_id || a.DepartmentId)
      );
    }
    
    if (selectedDirectorate !== 'all') {
      const directorateDepartments = departments.filter((d: any) => 
        (d.directorate || d.Directorate) === selectedDirectorate
      ).map((d: any) => d.id || d.Id);
      filtered = filtered.filter((a: any) => 
        directorateDepartments.includes(a.departmentId || a.department_id || a.DepartmentId)
      );
    }
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter((a: any) => 
        (a.departmentId || a.department_id || a.DepartmentId) === parseInt(selectedDepartment)
      );
    }
    
    setFilteredAreas(filtered);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all audits and required data
      const [data, sectorsData, departmentsData] = await Promise.all([
        apiService.getAudits(),
        apiService.getSectors(),
        apiService.getDepartments(),
      ]);
      
      // Update sectors and departments state if not already loaded
      if (sectors.length === 0) {
        setSectors(sectorsData);
      }
      if (departments.length === 0) {
        setDepartments(departmentsData);
      }
      
      // Use the fetched data for calculations
      const currentSectors = sectors.length > 0 ? sectors : sectorsData;
      const currentDepartments = departments.length > 0 ? departments : departmentsData;
      
      // Map backend data to frontend Audit type
      const mappedAudits = data.map((a: any) => ({
        id: a.id || a.Id,
        department_id: a.departmentId || a.department_id || a.DepartmentId,
        department_name: a.departmentName || a.department_name || a.DepartmentName || '',
        sector_id: a.sectorId || a.sector_id || a.SectorId,
        sector_name: a.sectorName || a.sector_name || a.SectorName || null,
        directorate_id: a.directorateId || a.directorate_id || a.DirectorateId,
        directorate_name: a.directorateName || a.directorate_name || a.DirectorateName || null,
        auditor_id: a.auditorId || a.auditor_id || a.AuditorId,
        auditor_name: a.auditorName || a.auditor_name || a.AuditorName || '',
        audit_date: a.auditDate || a.audit_date || a.AuditDate ? new Date(a.auditDate || a.audit_date || a.AuditDate).toISOString().split('T')[0] : '',
        notes: a.notes || a.Notes,
        status: a.status || a.Status || 'draft',
        total_score: a.totalScore || a.total_score || a.TotalScore || 0,
        max_possible_score: a.maxPossibleScore || a.max_possible_score || a.MaxPossibleScore || 0,
        level_achieved: a.levelAchieved || a.level_achieved || a.LevelAchieved,
        area_id: a.areaId || a.area_id || a.AreaId,
        area_name: a.areaName || a.area_name || a.AreaName,
        area_supervisor: a.areaSupervisor || a.area_supervisor || a.AreaSupervisor,
        total_actions: a.totalActions || a.total_actions || a.TotalActions || 0,
        open_actions: a.openActions || a.open_actions || a.OpenActions || 0,
        closed_actions: a.closedActions || a.closed_actions || a.ClosedActions || 0,
        created_at: a.createdAt || a.created_at || a.CreatedAt ? new Date(a.createdAt || a.created_at || a.CreatedAt).toISOString() : new Date().toISOString(),
        updated_at: a.updatedAt || a.updated_at || a.UpdatedAt ? new Date(a.updatedAt || a.updated_at || a.UpdatedAt).toISOString() : undefined,
      }));
      
      setAudits(mappedAudits);
      
      // Calculate stats
      const totalAudits = mappedAudits.length;
      const completedAudits = mappedAudits.filter(a => a.status === 'tamamlandı' || a.status === 'published' || a.status === 'denetlendi').length;
      const totalScore = mappedAudits.reduce((sum, a) => sum + (a.total_score || 0), 0);
      const maxScore = mappedAudits.reduce((sum, a) => sum + (a.max_possible_score || 0), 0);
      const avgScore = totalAudits > 0 && maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
      const completionRate = totalAudits > 0 ? Math.round((completedAudits / totalAudits) * 100) : 0;
      
      // Get unique users count
      const uniqueAuditors = new Set(mappedAudits.map(a => a.auditor_id).filter((id: any) => id && id !== 0));
      const activeUsers = uniqueAuditors.size;
      
      // Calculate action stats
      const totalActions = mappedAudits.reduce((sum, a) => sum + (a.total_actions || 0), 0);
      const openActions = mappedAudits.reduce((sum, a) => sum + (a.open_actions || 0), 0);
      
      // Get recent audits (last 10, sorted by date)
      const sortedAudits = [...mappedAudits]
        .sort((a, b) => {
          const dateA = a.audit_date ? new Date(a.audit_date).getTime() : new Date(a.created_at).getTime();
          const dateB = b.audit_date ? new Date(b.audit_date).getTime() : new Date(b.created_at).getTime();
          return dateB - dateA;
        })
        .slice(0, 10);
      
      const mappedRecentAudits = sortedAudits.map(audit => {
        const score = audit.max_possible_score > 0 
          ? Math.round((audit.total_score / audit.max_possible_score) * 100) 
          : 0;
        const level = audit.level_achieved || 'Başlangıç';
        const dateStr = audit.audit_date || audit.created_at;
        const date = dateStr 
          ? format(new Date(dateStr), 'd MMMM yyyy', { locale: tr })
          : format(new Date(), 'd MMMM yyyy', { locale: tr });
        const auditor = audit.auditor_name || 'Bilinmiyor';
        const department = audit.department_name || audit.area_name || 'Bilinmiyor';
        
        // Get sector and directorate from audit or department
        const sector = audit.sector_name || (() => {
          const dept = currentDepartments.find((d: any) => (d.id || d.Id) === audit.department_id);
          if (dept) {
            const deptSectorId = dept.sectorId || dept.sector_id || dept.SectorId;
            if (deptSectorId) {
              const sectorObj = currentSectors.find((s: any) => (s.id || s.Id) === deptSectorId);
              return sectorObj?.name || sectorObj?.Name || '-';
            }
            return dept?.sector || dept?.Sector || dept?.sectorName || dept?.SectorName || '-';
          }
          return '-';
        })();
        const directorate = audit.directorate_name || (() => {
          const dept = currentDepartments.find((d: any) => (d.id || d.Id) === audit.department_id);
          return dept?.directorate || dept?.Directorate || dept?.directorateName || dept?.DirectorateName || '-';
        })();
        
        return {
          id: audit.id,
          department,
          area: audit.area_name,
          sector,
          directorate,
          score,
          level,
          date,
          auditor,
          totalActions: audit.total_actions || 0,
          openActions: audit.open_actions || 0,
          status: audit.status,
        };
      });
      
      // Calculate sector rankings
      const sectorStats: Record<string, { totalScore: number; maxScore: number; count: number }> = {};
      mappedAudits.forEach((audit: any) => {
        // Get sector from audit first (from mapped data)
        let sector = audit.sector_name;
        
        // If not found in audit, try to get from department
        if (!sector) {
          const dept = currentDepartments.find((d: any) => (d.id || d.Id) === audit.department_id);
          if (dept) {
            // Try to get sector from department's sectorId by looking up in sectors array
            const deptSectorId = dept.sectorId || dept.sector_id || dept.SectorId;
            if (deptSectorId) {
              const sectorObj = currentSectors.find((s: any) => (s.id || s.Id) === deptSectorId);
              sector = sectorObj?.name || sectorObj?.Name;
            }
            // Fallback to old field names
            if (!sector) {
          sector = dept?.sector || dept?.Sector || dept?.sectorName || dept?.SectorName;
        }
          }
        }
        
        // Skip if still no sector found
        if (!sector || sector === '-' || sector === null || sector === undefined) {
          return; // Skip audits without sector
        }
        
        if (!sectorStats[sector]) {
          sectorStats[sector] = { totalScore: 0, maxScore: 0, count: 0 };
        }
        sectorStats[sector].totalScore += audit.total_score || 0;
        sectorStats[sector].maxScore += audit.max_possible_score || 0;
        sectorStats[sector].count += 1;
      });
      
      const rankings = Object.entries(sectorStats)
        .map(([sector, stats]) => {
          const avgScore = stats.maxScore > 0 ? Math.round((stats.totalScore / stats.maxScore) * 100) : 0;
          let level = 'Başlangıç';
          if (avgScore >= 90) level = '5S';
          else if (avgScore >= 70) level = '4S';
          else if (avgScore >= 50) level = '3S';
          else if (avgScore >= 30) level = '2S';
          else if (avgScore >= 10) level = '1S';
          
          return {
            sector,
            avgScore,
            level,
            auditCount: stats.count,
          };
        })
        .sort((a, b) => b.avgScore - a.avgScore);
      
      setSectorRankings(rankings);
      
      // Calculate sector breakdown (simplified - would need category breakdown from backend)
      const breakdown = Object.entries(sectorStats)
        .filter(([sector]) => sector && sector !== '-') // Filter out invalid sectors
        .map(([sector, stats]) => {
          // For now, distribute evenly - in real implementation, would need category scores
          const total = stats.maxScore > 0 ? Math.round((stats.totalScore / stats.maxScore) * 100) : 0;
          return {
            sector,
            seiri: Math.round(total * 0.2),
            seiton: Math.round(total * 0.2),
            seiso: Math.round(total * 0.2),
            seiketsu: Math.round(total * 0.2),
            shitsuke: Math.round(total * 0.2),
            total,
          };
        });
      setSectorBreakdown(breakdown);
      
      // Calculate monthly progress
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthAudits = mappedAudits.filter(a => {
        const auditDateStr = a.audit_date || a.created_at;
        if (!auditDateStr) return false;
        const auditDate = new Date(auditDateStr);
        return auditDate >= startOfMonth;
      });
      const monthCompleted = monthAudits.filter(a => 
        a.status === 'tamamlandı' || a.status === 'published' || a.status === 'denetlendi'
      ).length;
      
      setStats([
        { label: 'Toplam Denetim', value: totalAudits.toString(), icon: <Assignment fontSize="small" />, color: '#6366f1', change: '', actionInfo: '' },
        { label: 'Ortalama Puan', value: `${avgScore}%`, icon: <TrendingUp fontSize="small" />, color: '#10b981', change: '', actionInfo: '' },
        { label: 'Aktif Kullanıcı', value: activeUsers.toString(), icon: <People fontSize="small" />, color: '#f59e0b', change: '', actionInfo: '' },
        { label: 'Tamamlanma', value: `${completionRate}%`, icon: <CheckCircle fontSize="small" />, color: '#8b5cf6', change: '', actionInfo: '' },
        { label: 'Aksiyonlar', value: `${openActions}/${totalActions}`, icon: <Warning fontSize="small" />, color: '#ef4444', change: '', actionInfo: `${openActions} açık` },
      ]);
      
      setRecentAudits(mappedRecentAudits);
      setMonthProgress({
        current: monthCompleted,
        total: monthAudits.length,
        percentage: monthAudits.length > 0 ? Math.round((monthCompleted / monthAudits.length) * 100) : 0,
      });
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setStats([
        { label: 'Toplam Denetim', value: '0', icon: <Assignment fontSize="small" />, color: '#6366f1', change: '', actionInfo: '' },
        { label: 'Ortalama Puan', value: '0%', icon: <TrendingUp fontSize="small" />, color: '#10b981', change: '', actionInfo: '' },
        { label: 'Aktif Kullanıcı', value: '0', icon: <People fontSize="small" />, color: '#f59e0b', change: '', actionInfo: '' },
        { label: 'Tamamlanma', value: '0%', icon: <CheckCircle fontSize="small" />, color: '#8b5cf6', change: '', actionInfo: '' },
        { label: 'Aksiyonlar', value: '0/0', icon: <Warning fontSize="small" />, color: '#ef4444', change: '', actionInfo: '0 açık' },
      ]);
      setRecentAudits([]);
      setMonthProgress({ current: 0, total: 0, percentage: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleAreaClick = (area: any) => {
    // Get base URL for images (backend URL without /api)
    const getImageFullUrl = (imageUrl: string) => {
      if (!imageUrl || imageUrl.trim() === '') return '';
      // If already a full URL (starts with http), return as is
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      // If starts with /, it's a relative path - add backend base URL
      const baseUrl = process.env.REACT_APP_API_URL 
        ? process.env.REACT_APP_API_URL.replace('/api', '') 
        : `http://${window.location.hostname}:5000`;
      return imageUrl.startsWith('/') 
        ? `${baseUrl}${imageUrl}` 
        : `${baseUrl}/${imageUrl}`;
    };

    // Ensure imageUrl is included in the area object with full URL
    const rawImageUrl = area.imageUrl || area.ImageUrl || area.image_url || '';
    const fullImageUrl = getImageFullUrl(rawImageUrl);
    
    const areaWithImage = {
      ...area,
      imageUrl: fullImageUrl,
    };
    
    // Debug: Log area data
    if (process.env.NODE_ENV === 'development') {
      console.log('handleAreaClick - area:', area);
      console.log('handleAreaClick - rawImageUrl:', rawImageUrl);
      console.log('handleAreaClick - fullImageUrl:', fullImageUrl);
      console.log('handleAreaClick - areaWithImage:', areaWithImage);
    }
    setSelectedArea(areaWithImage);
    setAreaDialogOpen(true);
  };

  const handleAuditClick = (auditId: number) => {
    navigate(`/audits/${auditId}`);
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      '5S': '#10b981',
      '4S': '#3b82f6',
      '3S': '#f59e0b',
      '2S': '#ef4444',
      '1S': '#dc2626',
    };
    return colors[level] || '#6b7280';
  };

  const getAreaStats = (areaId: number) => {
    const areaAudits = audits.filter(a => (a.area_id) === areaId);
    const totalAudits = areaAudits.length;
    const totalScore = areaAudits.reduce((sum, a) => sum + (a.total_score || 0), 0);
    const maxScore = areaAudits.reduce((sum, a) => sum + (a.max_possible_score || 0), 0);
    const avgScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const openActions = areaAudits.reduce((sum, a) => sum + (a.open_actions || 0), 0);
    const totalActions = areaAudits.reduce((sum, a) => sum + (a.total_actions || 0), 0);
    
    let level = 'Başlangıç';
    if (avgScore >= 90) level = '5S';
    else if (avgScore >= 70) level = '4S';
    else if (avgScore >= 50) level = '3S';
    else if (avgScore >= 30) level = '2S';
    else if (avgScore >= 10) level = '1S';
    
    return { totalAudits, avgScore, level, openActions, totalActions };
  };

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ py: 4, px: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 0, px: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 0.5 }}>
          Hoş geldiniz! 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          5S Denetim Platformu ile süreçlerinizi optimize edin
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {stats.map((stat, index) => (
          <Card key={index} sx={{ flex: '1 1 180px', minWidth: 150 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: stat.color }}>
                  {stat.icon}
                </Avatar>
                {stat.actionInfo && (
                  <Chip 
                    label={stat.actionInfo} 
                    size="small" 
                    sx={{ 
                      fontSize: '0.625rem', 
                      height: '16px',
                      bgcolor: stat.color + '20',
                      color: stat.color,
                    }} 
                  />
                )}
              </Box>
              <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Tesis Haritası - Collapsible with Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Map Header */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              p: 2, 
              pb: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'grey.50'
              }
            }}
            onClick={() => setIsMapExpanded(!isMapExpanded)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Map sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Tesis Haritası
              </Typography>
            </Box>
            <IconButton size="small">
              {isMapExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          {/* Map Content */}
          <Collapse in={isMapExpanded}>
            <Box sx={{ p: 2, pt: 0 }}>
              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Sektör</InputLabel>
                  <Select
                    value={selectedSector}
                    label="Sektör"
                    onChange={(e) => {
                      setSelectedSector(e.target.value);
                      setSelectedDirectorate('all');
                      setSelectedDepartment('all');
                    }}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    {sectors.map((sector) => (
                      <MenuItem key={sector.id} value={sector.name}>
                        {sector.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Direktörlük</InputLabel>
                  <Select
                    value={selectedDirectorate}
                    label="Direktörlük"
                    onChange={(e) => {
                      setSelectedDirectorate(e.target.value);
                      setSelectedDepartment('all');
                    }}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    {directorates
                      .filter((d: any) => 
                        selectedSector === 'all' || 
                        departments.some((dept: any) => 
                          (dept.sector || dept.Sector) === selectedSector &&
                          (dept.directorate || dept.Directorate) === d.name
                        )
                      )
                      .map((directorate) => (
                        <MenuItem key={directorate.id} value={directorate.name}>
                          {directorate.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Bölüm</InputLabel>
                  <Select
                    value={selectedDepartment}
                    label="Bölüm"
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    {departments
                      .filter((d: any) => {
                        if (selectedSector !== 'all' && (d.sector || d.Sector) !== selectedSector) return false;
                        if (selectedDirectorate !== 'all' && (d.directorate || d.Directorate) !== selectedDirectorate) return false;
                        return true;
                      })
                      .map((dept) => (
                        <MenuItem key={dept.id || dept.Id} value={(dept.id || dept.Id).toString()}>
                          {dept.name || dept.Name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
              
              {/* Areas Grid - 6 columns, fixed size */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(6, 1fr)', 
                gap: 2,
                '@media (max-width: 1800px)': {
                  gridTemplateColumns: 'repeat(5, 1fr)',
                },
                '@media (max-width: 1500px)': {
                  gridTemplateColumns: 'repeat(4, 1fr)',
                },
                '@media (max-width: 1200px)': {
                  gridTemplateColumns: 'repeat(3, 1fr)',
                },
                '@media (max-width: 900px)': {
                  gridTemplateColumns: 'repeat(2, 1fr)',
                },
                '@media (max-width: 600px)': {
                  gridTemplateColumns: '1fr',
                },
              }}>
                {filteredAreas.length === 0 ? (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Seçilen filtreler için alan bulunamadı.
                    </Typography>
                  </Box>
                ) : (
                  filteredAreas.map((area: any) => {
                    const stats = getAreaStats(area.id || area.Id);
                    const areaNumber = (area.id || area.Id) % 6 || 6; // 1-6 arası
                    const imageUrl = `/uploads/images/alan${areaNumber}.jpg`; // Backend'den static file
                    return (
                      <Card
                        key={area.id || area.Id}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                            '& .area-image': {
                              transform: 'scale(1.1)',
                            },
                            '& .area-overlay': {
                              opacity: 0.9,
                            },
                          },
                        }}
                        onClick={() => handleAreaClick(area)}
                      >
                        <Box
                          className="area-image"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: `url(${imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 0.3s',
                            opacity: 0.3,
                          }}
                        />
                        <Box
                          className="area-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
                            transition: 'opacity 0.3s',
                          }}
                        />
                        <CardContent sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                          <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 700, mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            {area.name || area.Name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9, mb: 1.5, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                            {area.departmentName || area.department_name || area.DepartmentName || ''}
                          </Typography>
                          <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Box>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block', fontWeight: 600 }}>
                                  %{stats.avgScore}
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', display: 'block', opacity: 0.8 }}>
                                  {stats.totalAudits} Denetim
                                </Typography>
                              </Box>
                              <Chip
                                label={stats.level}
                                size="small"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: '22px',
                                  bgcolor: 'rgba(255,255,255,0.25)',
                                  color: 'white',
                                  fontWeight: 600,
                                  border: '1px solid rgba(255,255,255,0.3)',
                                }}
                              />
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={stats.avgScore} 
                              sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                bgcolor: 'rgba(255,255,255,0.2)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: 'white',
                                }
                              }} 
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'stretch' }}>
        {/* Son Denetimler - Table */}
        <Box sx={{ flex: '2 1 600px', minWidth: 300, display: 'flex', flexDirection: 'column' }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Son Denetimler
                </Typography>
                <Button 
                  size="small" 
                  endIcon={<ArrowForward fontSize="small" />}
                  onClick={() => navigate('/audits')}
                  sx={{ fontSize: '0.6875rem' }}
                >
                  Tümü
                </Button>
              </Box>
              <TableContainer sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Tarih</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Sektör</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Direktörlük</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Bölüm</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Alan</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Denetçi</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Puan</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Seviye</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Aksiyon</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Durum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentAudits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Henüz denetim bulunmamaktadır.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentAudits.map((audit) => (
                        <TableRow
                          key={audit.id}
                          onClick={() => handleAuditClick(audit.id)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'grey.50',
                            },
                          }}
                        >
                          <TableCell sx={{ fontSize: '0.75rem' }}>{audit.date}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{audit.sector || '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{audit.directorate || '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{audit.department}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{audit.area || '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{audit.auditor}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>%{audit.score}</Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={audit.score} 
                                sx={{ 
                                  flex: 1, 
                                  height: 6, 
                                  borderRadius: 3,
                                  bgcolor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: audit.score >= 90 ? '#10b981' : audit.score >= 70 ? '#3b82f6' : audit.score >= 50 ? '#f59e0b' : '#ef4444'
                                  }
                                }} 
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={audit.level}
                              size="small"
                              sx={{
                                fontSize: '0.625rem',
                                height: '18px',
                                bgcolor: getLevelColor(audit.level) + '20',
                                color: getLevelColor(audit.level),
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            {audit.openActions}/{audit.totalActions}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={audit.status === 'tamamlandı' || audit.status === 'published' ? 'Tamamlandı' : 'Devam Ediyor'}
                              size="small"
                              sx={{
                                fontSize: '0.625rem',
                                height: '18px',
                                bgcolor: (audit.status === 'tamamlandı' || audit.status === 'published') ? '#10b98120' : '#f59e0b20',
                                color: (audit.status === 'tamamlandı' || audit.status === 'published') ? '#10b981' : '#f59e0b',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Duyurular */}
        <Box sx={{ flex: '1 1 300px', minWidth: 250, display: 'flex', flexDirection: 'column' }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Duyurular
                </Typography>
                {announcements.some(a => new Date(a.announcementDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) && (
                  <Chip 
                    label="Yeni" 
                    size="small" 
                    color="error"
                    sx={{ fontSize: '0.625rem', height: '18px' }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {announcements.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Henüz duyuru bulunmamaktadır.
                    </Typography>
                  </Box>
                ) : (
                  announcements.map((announcement) => {
                    const announcementDate = new Date(announcement.announcementDate);
                    const isNew = announcementDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Son 7 gün
                    
                    return (
                      <Box
                        key={announcement.id}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: isNew ? 'primary.main' : 'grey.200',
                          borderRadius: '6px',
                          bgcolor: isNew ? 'primary.50' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: isNew ? 'primary.100' : 'grey.50',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: isNew ? 'error.main' : 'primary.main' }}>
                            {isNew ? '!' : 'i'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                {announcement.title}
                              </Typography>
                              {isNew && (
                                <Chip 
                                  label="Yeni" 
                                  size="small" 
                                  color="error"
                                  sx={{ fontSize: '0.5rem', height: '14px', ml: 'auto' }}
                                />
                              )}
                            </Box>
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ 
                                fontSize: '0.625rem', 
                                mb: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.4,
                              }}
                            >
                              {announcement.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem' }}>
                              {format(announcementDate, 'd MMMM yyyy', { locale: tr })}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Sektör Sıralaması ve Kırılım */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        {/* Sektörlere Göre 5S Puan Ortalama Sıralaması */}
        <Box sx={{ flex: '1 1 400px', minWidth: 300 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 2 }}>
                Sektörlere Göre 5S Puan Ortalama Sıralaması
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Sıra</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Sektör</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Ortalama Puan</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Seviye</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Denetim Sayısı</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sectorRankings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Veri bulunamadı.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sectorRankings.map((sector, index) => (
                        <TableRow key={sector.sector}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{index + 1}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{sector.sector}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>%{sector.avgScore}</TableCell>
                          <TableCell>
                            <Chip
                              label={sector.level}
                              size="small"
                              sx={{
                                fontSize: '0.625rem',
                                height: '18px',
                                bgcolor: getLevelColor(sector.level) + '20',
                                color: getLevelColor(sector.level),
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{sector.auditCount}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Sektörlere Göre S Bazında Puan Kırılımı */}
        <Box sx={{ flex: '1 1 400px', minWidth: 300 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 2 }}>
                Sektörlere Göre S Bazında Puan Kırılımı
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Sektör</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>1S</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>2S</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>3S</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>4S</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>5S</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Toplam</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sectorBreakdown.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Veri bulunamadı.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sectorBreakdown.map((sector) => (
                        <TableRow key={sector.sector}>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{sector.sector}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>%{sector.seiri}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>%{sector.seiton}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>%{sector.seiso}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>%{sector.seiketsu}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>%{sector.shitsuke}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>%{sector.total}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* 5S Metodolojisi Hakkında - Şık Versiyon */}
      <Card sx={{ mt: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 3, color: 'white' }}>
            5S Metodolojisi Hakkında
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 3 }}>
            {[
              { 
                title: '1S - Seiri', 
                desc: 'Ayırt etme ve gereksizleri kaldırma',
                detail: 'İş yerindeki gereksiz eşya ve malzemeleri ayırt edip kaldırmak. Sadece gerekli olanları tutmak.',
                color: '#ef4444'
              },
              { 
                title: '2S - Seiton', 
                desc: 'Düzenleme ve yerleştirme',
                detail: 'Her şeyin belirli bir yeri olmalı ve her şey yerli yerinde olmalı. Hızlı erişim ve verimlilik sağlar.',
                color: '#f59e0b'
              },
              { 
                title: '3S - Seiso', 
                desc: 'Temizlik ve bakım',
                detail: 'Çalışma alanını temiz tutmak ve düzenli bakım yapmak. Temizlik, kalite ve güvenliğin temelidir.',
                color: '#3b82f6'
              },
              { 
                title: '4S - Seiketsu', 
                desc: 'Standartlaştırma',
                detail: 'İlk üç S\'in standartlaştırılması. Sürekli iyileştirme ve tutarlılık sağlamak.',
                color: '#8b5cf6'
              },
              { 
                title: '5S - Shitsuke', 
                desc: 'Sürdürme ve disiplin',
                detail: '5S uygulamalarını sürekli hale getirmek ve disiplin içinde uygulamak. Kültür haline getirmek.',
                color: '#10b981'
              },
            ].map((item, index) => (
              <Box 
                key={index} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, mb: 1, color: 'white' }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1.5, color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                  {item.desc}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
                  {item.detail}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Area Detail Dialog */}
      <Dialog open={areaDialogOpen} onClose={() => setAreaDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedArea?.name || selectedArea?.Name || 'Alan Detayları'}
              {selectedArea && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 'normal' }}>
                  ({selectedArea.departmentName || selectedArea.department_name || selectedArea.DepartmentName || '-'})
                </Typography>
              )}
            </Typography>
            <IconButton size="small" onClick={() => setAreaDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedArea && (() => {
            const stats = getAreaStats(selectedArea.id || selectedArea.Id);
            const areaAudits = audits.filter(a => (a.area_id) === (selectedArea.id || selectedArea.Id));
            const areaImageUrl = selectedArea.imageUrl || selectedArea.ImageUrl || selectedArea.image_url || '';
            
            return (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 0, alignItems: 'flex-start' }}>
                {/* Sol Taraf - Görsel */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 33.333%' }, maxWidth: { xs: '100%', md: '33.333%' } }}>
                  {areaImageUrl && areaImageUrl.trim() !== '' ? (
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: 3,
                        cursor: 'pointer',
                        height: '100%',
                        minHeight: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        '&:hover .zoom-overlay': {
                          opacity: 1,
                        },
                      }}
                      onClick={() => setImageZoomOpen(true)}
                    >
                      <img
                        src={areaImageUrl}
                        alt={selectedArea.name || selectedArea.Name || selectedArea.alanAdi || 'Alan Görseli'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onError={(e) => {
                          console.error('Image load error for URL:', areaImageUrl);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <Box
                        className="zoom-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: 'rgba(0, 0, 0, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s',
                        }}
                      >
                        <ZoomIn sx={{ color: 'white', fontSize: 48 }} />
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ p: 3, bgcolor: 'grey.100', borderRadius: 2, textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Görsel yüklenmedi
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Sağ Taraf - İstatistikler ve Denetimler */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 66.666%' }, maxWidth: { xs: '100%', md: '66.666%' } }}>
                  {/* Bilgi Kartları */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'stretch' }}>
                    <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)' }, minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 11px)' } }}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                            Ortalama Puan
                          </Typography>
                          <Typography variant="h5" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 0.5 }}>
                            %{stats.avgScore}
                          </Typography>
                          <Chip
                            label={stats.level}
                            size="small"
                            sx={{
                              fontSize: '0.65rem',
                              height: '20px',
                              bgcolor: getLevelColor(stats.level) + '20',
                              color: getLevelColor(stats.level),
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)' }, minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 11px)' } }}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                            Toplam Denetim
                          </Typography>
                          <Typography variant="h5" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {stats.totalAudits}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 11px)' }, minWidth: { xs: '100%', sm: 'calc(33.333% - 11px)' } }}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 1 }}>
                            Aksiyonlar
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Typography variant="h5" sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>
                              {stats.openActions}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                              Açık
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                              /
                            </Typography>
                            <Typography variant="h5" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                              {stats.totalActions}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                              Toplam
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>
                  
                  {/* Denetimler Tablosu */}
                  <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 2 }}>
                    Denetimler
                  </Typography>
                  {areaAudits.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Bu alan için henüz denetim bulunmamaktadır.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Tarih</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Puan</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Seviye</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Durum</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {areaAudits.slice(0, 5).map((audit) => (
                            <TableRow
                              key={audit.id}
                              onClick={() => {
                                handleAuditClick(audit.id);
                                setAreaDialogOpen(false);
                              }}
                              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}
                            >
                              <TableCell sx={{ fontSize: '0.75rem' }}>
                                {audit.audit_date ? format(new Date(audit.audit_date), 'd MMMM yyyy', { locale: tr }) : '-'}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                %{audit.max_possible_score > 0 ? Math.round((audit.total_score / audit.max_possible_score) * 100) : 0}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={audit.level_achieved || 'Başlangıç'}
                                  size="small"
                                  sx={{
                                    fontSize: '0.625rem',
                                    height: '18px',
                                    bgcolor: getLevelColor(audit.level_achieved || 'Başlangıç') + '20',
                                    color: getLevelColor(audit.level_achieved || 'Başlangıç'),
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={audit.status === 'tamamlandı' || audit.status === 'published' ? 'Tamamlandı' : 'Devam Ediyor'}
                                  size="small"
                                  sx={{
                                    fontSize: '0.625rem',
                                    height: '18px',
                                    bgcolor: (audit.status === 'tamamlandı' || audit.status === 'published') ? '#10b98120' : '#f59e0b20',
                                    color: (audit.status === 'tamamlandı' || audit.status === 'published') ? '#10b981' : '#f59e0b',
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAreaDialogOpen(false)}>Kapat</Button>
          {selectedArea && (
            <Button 
              variant="contained" 
              onClick={() => {
                navigate(`/audits?area=${selectedArea.id || selectedArea.Id}`);
                setAreaDialogOpen(false);
              }}
            >
              Tüm Denetimleri Görüntüle
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog 
        open={imageZoomOpen} 
        onClose={() => setImageZoomOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: 'none',
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setImageZoomOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
              zIndex: 1,
            }}
          >
            <Close />
          </IconButton>
          {selectedArea && (() => {
            const areaImageUrl = selectedArea.imageUrl || selectedArea.ImageUrl || selectedArea.image_url || '';
            return areaImageUrl && areaImageUrl.trim() !== '' ? (
              <img
                src={areaImageUrl}
                alt={selectedArea.name || selectedArea.Name || selectedArea.alanAdi || 'Alan Görseli'}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  console.error('Image load error for URL:', areaImageUrl);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null;
          })()}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default DashboardPage;
