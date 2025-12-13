import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  CalendarToday,
  Person,
  Business,
  Assignment,
  CheckCircle,
  Warning,
  Error,
  Edit,
  Print,
  Share,
  Visibility,
  ArrowBack,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Audit, AuditResponse, AuditAction } from '../types';
import apiService from '../services/api';

const AuditDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [responses, setResponses] = useState<AuditResponse[]>([]);
  const [actions, setActions] = useState<AuditAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageDialog, setImageDialog] = useState<string | null>(null);
  const [questionImages, setQuestionImages] = useState<Map<number, string[]>>(new Map());
  const [actionImages, setActionImages] = useState<Map<number, string[]>>(new Map());
  const [evidenceImages, setEvidenceImages] = useState<Map<number, string[]>>(new Map());

  useEffect(() => {
    const fetchAuditDetails = async () => {
      if (!id) {
        setError('Denetim ID bulunamadı');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const auditId = parseInt(id, 10);
        if (isNaN(auditId)) {
          setError('Geçersiz denetim ID');
          setLoading(false);
          return;
        }

        // Fetch audit, responses, and actions in parallel
        const [auditData, responsesData, actionsData] = await Promise.all([
          apiService.getAudit(auditId).catch((err) => {
            console.error('Error fetching audit:', err);
            return null;
          }),
          apiService.getAuditDetailResponses(auditId).catch((err) => {
            console.error('Error fetching responses:', err);
            return [];
          }),
          apiService.getActionsByAuditId(auditId).catch((err) => {
            console.error('Error fetching actions:', err);
            return [];
          }),
        ]);

        if (!auditData) {
          setError('Denetim bulunamadı');
          setLoading(false);
          return;
        }

        // Map audit data - API returns camelCase (from backend DTO)
        // Backend returns AuditDto directly, not wrapped
        const audit: any = auditData;
        const mappedAudit: Audit = {
          id: audit.id || 0,
          department_id: audit.departmentId || 0,
          department_name: audit.departmentName || '',
          auditor_id: audit.auditorId || 0,
          auditor_name: audit.auditorName || '',
          auditor_email: '',
          audit_date: audit.auditDate ? new Date(audit.auditDate).toISOString() : new Date().toISOString(),
          notes: audit.notes || '',
          status: audit.status === 'denetlendi' ? 'published' : (audit.status === 'planlandı' ? 'draft' : (audit.status === 'devam' ? 'draft' : 'published')),
          total_score: audit.totalScore || 0,
          max_possible_score: audit.maxPossibleScore || 0,
          level_achieved: audit.levelAchieved || '',
          total_actions: audit.totalActions || 0,
          open_actions: audit.openActions || 0,
          closed_actions: audit.closedActions || 0,
          created_at: audit.createdAt ? new Date(audit.createdAt).toISOString() : new Date().toISOString(),
        };

        // Map responses data
        const mappedResponses: AuditResponse[] = (responsesData || []).map((r: any) => ({
          id: r.id || 0,
          audit_id: auditId,
          question_id: r.questionId || 0,
          question_text: r.questionText || '',
          category: r.categoryName || '',
          score: r.pointsAwarded || 0,
          notes: '',
          image_url: (r.imageUrls && r.imageUrls.length > 0) ? (() => {
            let url = r.imageUrls[0];
            if (url && url.startsWith('/')) {
              const baseURL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;
              url = baseURL.replace('/api', '') + url;
            }
            return url;
          })() : undefined,
          response: (r.response === 'High' || r.response === 2 || r.response === 'high') ? 'high' :
            ((r.response === 'Medium' || r.response === 1 || r.response === 'medium') ? 'medium' : 'low'),
          points_awarded: r.pointsAwarded || 0,
          created_at: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }));

        // Map actions data
        const mappedActions: AuditAction[] = (actionsData || []).map((a: any) => {
          // Map status from backend enum to frontend format
          let status: 'pending' | 'in_progress' | 'completed' = 'pending';
          if (a.status === 'Closed' || a.status === 'closed' || a.status === 'Completed' || a.status === 'Kapandı') {
            status = 'completed';
          } else if (a.status === 'InProgress' || a.status === 'in_progress' || a.status === 'In Progress' || a.status === 'Devam Ediyor') {
            status = 'in_progress';
          } else if (a.status === 'PendingApproval' || a.status === 'pending_approval' || a.status === 'pendingapproval' || a.status === 'Denetçi Kontrolünde') {
            status = 'pending';
          }

          // Convert backend images to full URLs if needed
          if (a.images && a.images.length > 0) {
            const actionImgs: string[] = [];
            const evidenceImgs: string[] = [];

            a.images.forEach((img: any) => {
              let url = img.imagePath || img.ImagePath;
              if (url && url.startsWith('/')) {
                const baseURL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;
                url = baseURL.replace('/api', '') + url;
              }

              if (img.imageType === 'Aksiyon' || img.ImageType === 'Aksiyon') {
                actionImgs.push(url);
              } else if (img.imageType === 'Kanit' || img.ImageType === 'Kanit') {
                evidenceImgs.push(url);
              }
            });

            if (actionImgs.length > 0) {
              setActionImages(prev => {
                const newMap = new Map(prev);
                newMap.set(a.id || 0, actionImgs);
                return newMap;
              });
            }

            // Store evidence images in a separate state map if needed, or better yet, attach to the action object itself if possible.
            // For now, let's just stick to the requested visual separation.
            // We can add a new state for evidence images.
            if (evidenceImgs.length > 0) {
              setEvidenceImages(prev => {
                const newMap = new Map(prev);
                newMap.set(a.id || 0, evidenceImgs);
                return newMap;
              });
            }
          }

          return {
            id: a.id || 0,
            audit_id: a.auditId || auditId,
            question_id: a.questionId || 0,
            description: a.description || '',
            responsible_user_id: 0,
            responsible_user_name: a.responsiblePerson || '',
            target_date: a.targetDate ? new Date(a.targetDate).toISOString().split('T')[0] : '',
            status: status,
            priority: 'Orta' as 'Düşük' | 'Orta' | 'Yüksek', // Default priority, can be enhanced later
            created_at: a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            completed_at: status === 'completed' && a.updatedAt ? new Date(a.updatedAt).toISOString().split('T')[0] : undefined,
          };
        });

        setAudit(mappedAudit);
        setResponses(mappedResponses);
        setActions(mappedActions);
      } catch (err: any) {
        console.error('Error fetching audit details:', err);
        setError(err.message || 'Denetim detayları yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditDetails();
  }, [id]);

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const getResponseColor = (response: string) => {
    switch (response) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'error';
      default:
        return 'default';
    }
  };

  const getResponseText = (response: string) => {
    switch (response) {
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return response;
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActionStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'pending':
        return 'Denetçi Kontrolünde';
      default:
        return status;
    }
  };

  const isActionOverdue = (targetDate: string): boolean => {
    if (!targetDate) return false;
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return target < today;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Yüksek':
        return 'error';
      case 'Orta':
        return 'warning';
      case 'Düşük':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleEdit = () => {
    navigate(`/audits/${id}/edit`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Denetim linki panoya kopyalandı!');
  };

  const handleBack = () => {
    navigate('/audits');
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Denetim detayları yükleniyor...</Typography>
      </Box>
    );
  }

  if (error || !audit) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error || 'Denetim bulunamadı'}
      </Alert>
    );
  }

  const scorePercentage = (audit.total_score / audit.max_possible_score) * 100;

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto', p: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
            size="small"
            sx={{ fontSize: '0.75rem' }}
          >
            Geri
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
            Denetim Detayı #{audit.id.toString().padStart(3, '0')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
            size="small"
          >
            Düzenle
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            size="small"
          >
            Yazdır
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={handleShare}
            size="small"
          >
            Paylaş
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                Durum
              </Typography>
              <Chip
                label={audit.status === 'published' ? 'Yayınlandı' : 'Taslak'}
                color={audit.status === 'published' ? 'success' : 'warning'}
                size="small"
              />
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                Toplam Puan
              </Typography>
              <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {audit.total_score}/{audit.max_possible_score}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                %{scorePercentage.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                5S Seviyesi
              </Typography>
              <Chip
                label={audit.level_achieved || 'Belirlenmedi'}
                color={getScoreColor(audit.total_score, audit.max_possible_score)}
                size="small"
              />
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Error color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                Açık Aksiyonlar
              </Typography>
              <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {audit.open_actions}/{audit.total_actions}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Audit Info and Images - Split Layout */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left: Audit Info (Shortened) */}
        <Card sx={{ flex: 1, minWidth: { xs: '100%', md: '300px' } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
              Denetim Bilgileri
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Business sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Bölüm
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                    {audit.department_name}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Denetleyen
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                    {audit.auditor_name}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Denetim Tarihi
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                    {format(new Date(audit.audit_date), 'dd MMMM yyyy', { locale: tr })}
                  </Typography>
                </Box>
              </Box>
              {audit.notes && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                    Notlar
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {audit.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Right: Images Gallery */}
        <Card sx={{ flex: 1, minWidth: { xs: '100%', md: '300px' } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
              Görseller
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {responses.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.85rem', fontWeight: 600 }}>
                  Soru Görselleri
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {responses.map((response) => {
                    if (!response.image_url) return null;
                    return (
                      <Box
                        key={response.id}
                        sx={{
                          position: 'relative',
                          width: 80,
                          height: 80,
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 },
                        }}
                        onClick={() => setImageDialog(response.image_url!)}
                      >
                        <img
                          src={response.image_url}
                          alt={`Soru ${response.question_id} görseli`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 4,
                            border: '1px solid #e0e0e0',
                          }}
                        />
                      </Box>
                    );
                  })}
                  {responses.filter(r => r.image_url).length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      Soru görseli bulunmamaktadır.
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Score Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Puan Dağılımı
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ minWidth: 60 }}>
              %{scorePercentage.toFixed(1)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={scorePercentage}
              color={getScoreColor(audit.total_score, audit.max_possible_score)}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4, mx: 2 }}
            />
            <Typography variant="body2">
              {audit.total_score}/{audit.max_possible_score}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Questions and Responses */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Soru Cevapları
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Soru</TableCell>
                  <TableCell align="center">Değerlendirme</TableCell>
                  <TableCell align="center">Puan</TableCell>
                  <TableCell>Notlar</TableCell>
                  <TableCell align="center">Görsel</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {response.category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {response.question_text}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getResponseText(response.response)}
                        color={getResponseColor(response.response)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {response.points_awarded}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {response.notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {response.image_url ? (
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => setImageDialog(response.image_url!)}
                          sx={{ fontSize: '0.7rem' }}
                        >
                          Görüntüle
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Actions */}
      {actions.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
              Aksiyon Planları ({actions.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Aksiyon</TableCell>
                    <TableCell>Sorumlu</TableCell>
                    <TableCell align="center">Öncelik</TableCell>
                    <TableCell align="center">Hedef Tarih</TableCell>
                    <TableCell align="center">Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {actions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {action.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.7rem' }}>
                            {action.responsible_user_name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {action.responsible_user_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={action.priority}
                          color={getPriorityColor(action.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {action.target_date ? format(new Date(action.target_date), 'dd/MM/yyyy') : '-'}
                          </Typography>
                          {action.target_date && isActionOverdue(action.target_date) && action.status !== 'completed' && (
                            <Chip
                              label="Gecikmiş"
                              color="error"
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 16, mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getActionStatusText(action.status)}
                          color={getActionStatusColor(action.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                          {/* Aksiyon Images - Left Side */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            {(actionImages.get(action.id) && actionImages.get(action.id)!.length > 0) && (
                              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Aksiyon</Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                              {actionImages.get(action.id) && actionImages.get(action.id)!.length > 0 ? (
                                actionImages.get(action.id)!.map((img, idx) => (
                                  <Box
                                    key={`act-${idx}`}
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      cursor: 'pointer',
                                      borderRadius: 1,
                                      border: '1px solid #e0e0e0',
                                      overflow: 'hidden',
                                      '&:hover': { opacity: 0.8, borderColor: 'primary.main' },
                                    }}
                                    onClick={() => setImageDialog(img)}
                                  >
                                    <img
                                      src={img}
                                      alt={`Aksiyon görseli ${idx + 1}`}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  </Box>
                                ))
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>-</Typography>
                              )}
                            </Box>
                          </Box>

                          {/* Divider if both exist */}
                          {((actionImages.get(action.id)?.length || 0) > 0 && (evidenceImages.get(action.id)?.length || 0) > 0) && (
                            <Divider orientation="vertical" flexItem />
                          )}

                          {/* Evidence Images - Right Side */}
                          {evidenceImages.get(action.id) && evidenceImages.get(action.id)!.length > 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Kanıt</Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {evidenceImages.get(action.id)!.map((img, idx) => (
                                  <Box
                                    key={`evd-${idx}`}
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      cursor: 'pointer',
                                      borderRadius: 1,
                                      border: '1px solid #e0e0e0',
                                      overflow: 'hidden',
                                      '&:hover': { opacity: 0.8, borderColor: 'success.main' },
                                    }}
                                    onClick={() => setImageDialog(img)}
                                  >
                                    <img
                                      src={img}
                                      alt={`Kanıt görseli ${idx + 1}`}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Image Dialog */}
      <Dialog
        open={!!imageDialog}
        onClose={() => setImageDialog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Denetim Görseli</DialogTitle>
        <DialogContent>
          {imageDialog && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={imageDialog}
                alt="Denetim Görseli"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialog(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditDetailPage;