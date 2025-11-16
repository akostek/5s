import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  LocationOn,
  Warning,
  CheckCircle,
  Error,
  Person,
  Assignment,
  Close,
} from '@mui/icons-material';

interface AreaData {
  id: number;
  name: string;
  department: string;
  departmentId: number;
  supervisor?: string;
  audits: number;
  openActions: number;
  level: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  image?: string;
}

interface InteractiveMapProps {
  onAreaClick: (areaId: number) => void;
  areas?: any[];
  audits?: any[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ onAreaClick, areas = [], audits = [] }) => {
  const [clickedArea, setClickedArea] = useState<number | null>(null);

  // Calculate area statistics from audits
  const areaStats = useMemo(() => {
    const stats: Record<number, { audits: number; openActions: number; level: string; avgScore: number }> = {};
    
    audits.forEach((audit: any) => {
      const areaId = audit.area_id || audit.areaId;
      if (!areaId) return;
      
      if (!stats[areaId]) {
        stats[areaId] = { audits: 0, openActions: 0, level: 'Başlangıç', avgScore: 0 };
      }
      
      stats[areaId].audits += 1;
      stats[areaId].openActions += audit.open_actions || audit.openActions || 0;
      
      // Calculate average score and level
      const score = audit.max_possible_score > 0 
        ? Math.round((audit.total_score / audit.max_possible_score) * 100) 
        : 0;
      stats[areaId].avgScore = (stats[areaId].avgScore * (stats[areaId].audits - 1) + score) / stats[areaId].audits;
      
      // Determine level based on average score
      if (stats[areaId].avgScore >= 90) stats[areaId].level = '5S';
      else if (stats[areaId].avgScore >= 70) stats[areaId].level = '4S';
      else if (stats[areaId].avgScore >= 50) stats[areaId].level = '3S';
      else if (stats[areaId].avgScore >= 30) stats[areaId].level = '2S';
      else if (stats[areaId].avgScore >= 10) stats[areaId].level = '1S';
    });
    
    return stats;
  }, [audits]);

  // Map areas to AreaData format
  const mappedAreas: AreaData[] = useMemo(() => {
    if (!areas || areas.length === 0) return [];
    
    return areas.map((area: any) => {
      const areaId = area.id;
      const stats = areaStats[areaId] || { audits: 0, openActions: 0, level: 'Başlangıç', avgScore: 0 };
      
      // Determine status based on level and open actions
      let status: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
      if (stats.level === '5S' && stats.openActions === 0) status = 'excellent';
      else if (stats.level === '4S' || stats.level === '3S') status = 'good';
      else if (stats.level === '2S' || stats.openActions > 5) status = 'warning';
      else if (stats.level === '1S' || stats.openActions > 10) status = 'critical';
      
      return {
        id: areaId,
        name: area.name || area.Name || '',
        department: area.departmentName || area.department_name || area.DepartmentName || '',
        departmentId: area.departmentId || area.department_id || area.DepartmentId || 0,
        supervisor: area.supervisor || area.Supervisor || area.area_supervisor || area.areaSupervisor || '',
        audits: stats.audits,
        openActions: stats.openActions,
        level: stats.level,
        status,
        image: area.image || area.Image || undefined,
      };
    });
  }, [areas, areaStats]);

  const getStatusColor = (status: string) => {
    const colors = {
      excellent: '#10b981', // Yeşil
      good: '#3b82f6',      // Mavi
      warning: '#f59e0b',   // Sarı
      critical: '#ef4444',  // Kırmızı
    };
    return colors[status as keyof typeof colors] || '#6b7280';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle sx={{ fontSize: '1.2rem', color: '#10b981' }} />;
      case 'good':
        return <CheckCircle sx={{ fontSize: '1.2rem', color: '#3b82f6' }} />;
      case 'warning':
        return <Warning sx={{ fontSize: '1.2rem', color: '#f59e0b' }} />;
      case 'critical':
        return <Error sx={{ fontSize: '1.2rem', color: '#ef4444' }} />;
      default:
        return <LocationOn sx={{ fontSize: '1.2rem' }} />;
    }
  };

  if (mappedAreas.length === 0) {
    return (
      <Card sx={{ height: '100%', minHeight: 300 }}>
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Lütfen sektör, direktörlük ve bölüm seçiniz
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const selectedArea = mappedAreas.find(a => a.id === clickedArea);

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
            📋 Alanlar
          </Typography>
          <Chip
            label={`${mappedAreas.length} Alan`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          {mappedAreas.map((area) => (
            <Card
              key={area.id}
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid',
                borderColor: 'transparent',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  borderColor: getStatusColor(area.status),
                },
              }}
              onClick={() => setClickedArea(area.id)}
            >
                <CardContent sx={{ p: 2 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      {getStatusIcon(area.status)}
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {area.name}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Department */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem', 
                      color: 'text.secondary',
                      display: 'block',
                      mb: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {area.department} Bölümü
                  </Typography>

                  {/* Supervisor */}
                  {area.supervisor && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                      <Person sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {area.supervisor}
                      </Typography>
                    </Box>
                  )}

                  {/* Level and Status Chips */}
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                    <Chip
                      label={area.level}
                      size="small"
                      sx={{ 
                        fontSize: '0.65rem', 
                        height: 20, 
                        bgcolor: getLevelColor(area.level),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <Chip
                      label={area.status === 'excellent' ? 'Mükemmel' : 
                             area.status === 'good' ? 'İyi' : 
                             area.status === 'warning' ? 'Uyarı' : 'Kritik'}
                      size="small"
                      sx={{ 
                        fontSize: '0.65rem', 
                        height: 20,
                        bgcolor: getStatusColor(area.status),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>

                  {/* Stats */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, pt: 1, borderTop: '1px solid', borderColor: 'grey.200' }}>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        Denetim
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: 'primary.main' }}>
                        {area.audits}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        Açık Aksiyon
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: 'warning.main' }}>
                        {area.openActions}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
          ))}
        </Box>
      </Box>

      {/* Modal - Detay Bilgileri */}
      <Dialog
        open={!!clickedArea}
        onClose={() => setClickedArea(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedArea && (
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 2 }}>
              {/* Kapatma butonu */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Box
                  onClick={() => setClickedArea(null)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'grey.400',
                    }
                  }}
                >
                  <Close sx={{ fontSize: '1rem' }} />
                </Box>
              </Box>
              
              {/* Alan görseli */}
              <Box sx={{
                width: '100%',
                height: 200,
                bgcolor: 'grey.100',
                borderRadius: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {selectedArea.image ? (
                  <Box
                    component="img"
                    src={selectedArea.image.startsWith('http') ? selectedArea.image : `${process.env.REACT_APP_API_URL?.replace('/api', '') || `http://${window.location.hostname}:5000`}${selectedArea.image}`}
                    alt={selectedArea.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${getStatusColor(selectedArea.status)}20, ${getStatusColor(selectedArea.status)}40)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <LocationOn sx={{ fontSize: '4rem', color: getStatusColor(selectedArea.status) }} />
                  </Box>
                )}
              </Box>

              {/* Alan bilgileri */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ fontSize: '1.5rem', mr: 1, color: getStatusColor(selectedArea.status) }} />
                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  {selectedArea.name}
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary', display: 'block', mb: 1.5 }}>
                {selectedArea.department} Bölümü
              </Typography>

              {/* Alan Sorumlusu */}
              {selectedArea.supervisor && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Person sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    Sorumlu: {selectedArea.supervisor}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={`${selectedArea.level}`}
                  size="small"
                  sx={{ 
                    fontSize: '0.75rem', 
                    height: 24, 
                    bgcolor: getLevelColor(selectedArea.level),
                    color: 'white',
                    fontWeight: 600
                  }}
                />
                <Chip
                  label={selectedArea.status === 'excellent' ? 'Mükemmel' : 
                         selectedArea.status === 'good' ? 'İyi' : 
                         selectedArea.status === 'warning' ? 'Uyarı' : 'Kritik'}
                  size="small"
                  sx={{ 
                    fontSize: '0.75rem', 
                    height: 24,
                    bgcolor: getStatusColor(selectedArea.status),
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <Box sx={{ textAlign: 'center', flex: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Denetim
                  </Typography>
                  <Typography variant="h5" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'primary.main' }}>
                    {selectedArea.audits}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', flex: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Açık Aksiyon
                  </Typography>
                  <Typography variant="h5" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'warning.main' }}>
                    {selectedArea.openActions}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'grey.200' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '0.85rem', 
                    color: 'primary.main', 
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textAlign: 'center',
                    '&:hover': {
                      color: 'primary.dark',
                    }
                  }}
                  onClick={() => {
                    setClickedArea(null);
                    onAreaClick(selectedArea.id);
                  }}
                >
                  Denetimleri Görüntüle →
                </Typography>
              </Box>
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default InteractiveMap;
