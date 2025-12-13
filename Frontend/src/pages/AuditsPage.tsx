import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Tooltip,
  LinearProgress,
  TableSortLabel,
} from '@mui/material';
import {
  Assignment,
  Add,
  Search,
  FilterList,
  GetApp,
  Visibility,
  Edit,
  Delete,
  Print,
  Close,
  CheckCircle,
  Warning,
  Schedule,
  PriorityHigh,
  Send,
  Undo,
  PhotoLibrary
} from '@mui/icons-material';
import CollectionsIcon from '@mui/icons-material/Collections';
import { format } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useRole } from '../contexts/AuthContext';
import { usePermission } from '../contexts/PermissionContext';
import { apiService } from '../services/api';
import { Audit, Action } from '../types';
import ActionHistoryDialog from './ActionHistoryDialog';
import NoteDialog from './NoteDialog';
import { History } from '@mui/icons-material';

// ... existing types ...


type RowStatus = 'draft' | 'published' | 'planlandı' | 'devam' | 'tamamlandı' | 'denetlendi';

interface AuditTableRow {
  key: string;
  displayId: string;
  date?: string;
  departmentName: string;
  sectorDirectorate?: string; // Combined sector/directorate
  areaName?: string;
  areaSupervisor?: string;
  level?: string | null;
  totalActions?: number;
  openActions?: number;
  closedActions?: number;
  totalScore?: number;
  maxPossibleScore?: number;
  auditorName?: string;
  status: RowStatus;
  audit: Audit;
}

type NormalizedActionStatus = 'open' | 'in_progress' | 'closed' | 'pending_approval';

const normalizeActionStatus = (status: any): NormalizedActionStatus => {
  if (typeof status === 'number') {
    switch (status) {
      case 1:
        return 'in_progress';
      case 2:
        return 'pending_approval';
      case 3:
        return 'closed';
      default:
        return 'open';
    }
  }

  const value = (status ?? '').toString().toLowerCase();

  // Turkish & English Mappings
  if (value === 'inprogress' || value === 'in_progress' || value === 'devam ediyor' || value === 'devamediyor') {
    return 'in_progress';
  }

  if (value === 'closed' || value === 'completed' || value === 'kapandı' || value === 'tamamlandı' || value === 'tamamlandi') {
    return 'closed';
  }

  if (value === 'pending_approval' || value === 'pendingapproval' || value === 'denetçi kontrolünde' || value === 'denetçi onayı bekliyor' || value === 'denetçikontrolünde' || value === 'pendingapproval') {
    return 'pending_approval';
  }

  // Explicit check for Open synonyms
  if (value === 'open' || value === 'açık' || value === 'acik' || value === 'aksiyon sahibinde') {
    return 'open';
  }

  return 'open';
};

const getActionStatusLabel = (status: NormalizedActionStatus) => {
  switch (status) {
    case 'open':
      return 'Aksiyon Sahibinde';
    case 'in_progress':
      return 'Devam Ediyor';
    case 'closed':
      return 'Kapandı';
    case 'pending_approval':
      return 'Denetçi Kontrolünde';
    default:
      return 'Bilinmiyor';
  }
};

const getActionStatusChipColor = (status: NormalizedActionStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'open':
      return 'error'; // Kırmızı - Alan Sorumlusunda (Acil)
    case 'in_progress':
      return 'warning';
    case 'closed':
      return 'success';
    case 'pending_approval':
      return 'info'; // Mavi - Denetçi Kontrolünde
    default:
      return 'default';
  }
};



const normalizeDateString = (value: any): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const mapActionDtoToAction = (action: any): Action => {
  // Backend uses camelCase (QuestionId, SuggestedActivity, etc.)
  // Frontend uses snake_case (question_id, suggested_activity, etc.)
  const createdAt = action?.createdAt ?? action?.created_at ?? action?.CreatedAt ?? new Date().toISOString();
  const updatedAt = action?.updatedAt ?? action?.updated_at ?? action?.UpdatedAt;
  const targetDate = action?.targetDate ?? action?.target_date ?? action?.TargetDate;

  // Priority mapping - backend'de priority alanı yoksa varsayılan olarak 'Orta'
  const priority = action?.priority ?? action?.Priority;
  const normalizedPriority = priority && (priority === 'Düşük' || priority === 'Orta' || priority === 'Yüksek')
    ? priority
    : 'Orta' as 'Düşük' | 'Orta' | 'Yüksek';

  return {
    id: action?.id ?? action?.Id ?? 0,
    audit_id: action?.auditId ?? action?.audit_id ?? action?.AuditId ?? 0,
    question_id: action?.questionId ?? action?.question_id ?? action?.QuestionId ?? 0,
    image_path: action?.imagePath ?? action?.image_path ?? action?.ImagePath,
    description: action?.description ?? action?.Description ?? '',
    suggested_activity: action?.suggestedActivity ?? action?.suggested_activity ?? action?.SuggestedActivity ?? '',
    planned_activity: action?.plannedActivity ?? action?.planned_activity ?? action?.PlannedActivity ?? '',
    target_date: normalizeDateString(targetDate),
    responsible_person: action?.responsiblePerson ?? action?.responsible_person ?? action?.ResponsiblePerson ?? '',
    status: normalizeActionStatus(action?.status ?? action?.Status),
    priority: normalizedPriority,
    question_text: action?.questionText ?? action?.question_text ?? action?.QuestionText,
    category_name: action?.categoryName ?? action?.category_name ?? action?.CategoryName,
    created_at:
      typeof createdAt === 'string'
        ? (Number.isNaN(new Date(createdAt).getTime()) ? new Date().toISOString() : createdAt)
        : new Date(createdAt).toISOString(),
    updated_at: updatedAt
      ? typeof updatedAt === 'string'
        ? (Number.isNaN(new Date(updatedAt).getTime()) ? undefined : updatedAt)
        : new Date(updatedAt).toISOString()
      : undefined,
    images: action?.images ?? action?.Images, // Map images list from DTO
  };
};

const AuditsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { canAccessButton } = usePermission();
  const [actionPermissions, setActionPermissions] = useState<Record<string, boolean>>({});
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState(searchParams.get('area') || 'all');
  const [auditorFilter, setAuditorFilter] = useState('all');
  const [areaSupervisorFilter, setAreaSupervisorFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [levelMinFilter, setLevelMinFilter] = useState('');
  const [levelMaxFilter, setLevelMaxFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all'); // 'all', 'with_open', 'without_open'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [criticalActionsFilter, setCriticalActionsFilter] = useState(searchParams.get('criticalActions') === 'true');
  const [delayedActionsFilter, setDelayedActionsFilter] = useState(searchParams.get('delayedActions') === 'true');

  // Set all permissions to true - no role-based restrictions
  useEffect(() => {
    setActionPermissions({
      'Start': true,
      'Continue': true,
      'Publish': true,
      'AddPlan': true,
      'Action_Create': true,
      'Action_Complete': true,
      'Action_Edit': true,
    });
  }, []);
  const [filteredActionIds, setFilteredActionIds] = useState<string[]>(searchParams.get('actionIds') ? searchParams.get('actionIds')!.split(',').filter(id => id) : []);
  const [auditActionsMap, setAuditActionsMap] = useState<Map<number, Action[]>>(new Map());
  const [auditProgressMap, setAuditProgressMap] = useState<Map<number, { answered: number; total: number }>>(new Map());
  const [allAuditProgressMap, setAllAuditProgressMap] = useState<Map<number, { answered: number; total: number }>>(new Map());
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof AuditTableRow>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionsDialogOpen, setActionsDialogOpen] = useState(false);
  const [selectedAuditActions, setSelectedAuditActions] = useState<Action[]>([]);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [actionsError, setActionsError] = useState('');
  const [overdueActionsMap, setOverdueActionsMap] = useState<Map<number, number>>(new Map());
  const [highPriorityActionsCount, setHighPriorityActionsCount] = useState(0);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planForm, setPlanForm] = useState({
    departmentId: 0,
    sectorId: 0,
    directorateId: 0,
    auditorId: 0,
    areaId: 0,
    areaSupervisor: '',
    auditDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [planFormError, setPlanFormError] = useState('');
  const [planSubmitting, setPlanSubmitting] = useState(false);

  const [departments, setDepartments] = useState<any[]>([]);
  const [auditors, setAuditors] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  // Action Workflow States
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<number>(0);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDialogTitle, setNoteDialogTitle] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<{ id: number; status: string } | null>(null);

  // Image Gallery State
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For lightbox/enlarge

  const handleViewHistory = (actionId: number) => {
    setSelectedActionId(actionId);
    setHistoryDialogOpen(true);
  };

  const handleRequestStatusChange = (action: Action, newStatus: string, title: string) => {
    setPendingStatusChange({ id: action.id, status: newStatus });
    setNoteDialogTitle(title);
    setNoteDialogOpen(true);
  };

  const handleConfirmStatusChange = async (note: string, imageUrl?: string) => {
    if (!pendingStatusChange) return;

    try {
      await apiService.changeActionStatus(pendingStatusChange.id, pendingStatusChange.status, note, imageUrl);

      // Update local state
      setSelectedAuditActions(prev => prev.map(a =>
        a.id === pendingStatusChange.id
          ? { ...a, status: pendingStatusChange.status as NormalizedActionStatus }
          : a
      ));

      setNoteDialogOpen(false);
      setPendingStatusChange(null);
      // Reload actions to be safe
      if (selectedAudit) {
        loadAuditActions(selectedAudit.id);
      }
    } catch (error: any) {
      console.error('Error changing status:', error);
      alert(error?.response?.data?.message || 'Durum değiştirilirken hata oluştu');
    }
  };

  const loadAuditActions = useCallback(
    async (auditId: number) => {
      try {
        setActionsLoading(true);
        setActionsError('');
        const actions = await apiService.getActionsByAuditId(auditId);
        const mappedActions = actions.map(action => mapActionDtoToAction(action));
        setSelectedAuditActions(mappedActions);
      } catch (error: any) {
        console.error('Error loading audit actions:', error);
        setActionsError('Aksiyonlar yüklenirken hata oluştu: ' + (error?.message || 'Bilinmeyen hata'));
        setSelectedAuditActions([]);
      } finally {
        setActionsLoading(false);
      }
    },
    []
  );

  const loadAudits = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAudits();
      // Map backend data to frontend Audit type
      const mappedAudits: Audit[] = data.map((a: any) => ({
        id: a.id,
        department_id: a.departmentId,
        department_name: a.departmentName,
        sector_name: a.sectorName || a.sector || '',
        directorate_name: a.directorateName || a.directorate || '',
        auditor_id: a.auditorId,
        auditor_name: a.auditorName,
        audit_date: a.auditDate ? new Date(a.auditDate).toISOString().split('T')[0] : '',
        notes: a.notes,
        status: a.status || 'draft',
        total_score: a.totalScore || 0,
        max_possible_score: a.maxPossibleScore || 0,
        level_achieved: a.levelAchieved,
        area_id: a.areaId,
        area_name: a.areaName,
        area_supervisor: a.areaSupervisor,
        total_actions: a.totalActions || 0,
        open_actions: a.openActions || 0,
        closed_actions: a.closedActions || 0,
        created_at: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
        updated_at: a.updatedAt ? new Date(a.updatedAt).toISOString() : undefined,
      }));
      setAudits(mappedAudits);

      // Load overdue actions count, high priority actions, and progress for each audit
      const overdueMap = new Map<number, number>();
      const progressMap = new Map<number, { answered: number; total: number }>();

      // Get total questions count
      const questions = await apiService.getQuestions();
      const totalQuestions = questions.length;

      const actionsMap = new Map<number, Action[]>();

      await Promise.all(mappedAudits.map(async (audit) => {
        try {
          const [actions, responses] = await Promise.all([
            apiService.getActionsByAuditId(audit.id),
            apiService.getAuditDetailResponses(audit.id).catch(() => [])
          ]);

          // Store actions for this audit
          const mappedActions = actions.map((a: any) => mapActionDtoToAction(a));
          actionsMap.set(audit.id, mappedActions);

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const overdueCount = actions.filter((action: any) => {
            if (!action.targetDate || action.status === 'closed') return false;
            const targetDate = new Date(action.targetDate);
            targetDate.setHours(0, 0, 0, 0);
            return targetDate < today;
          }).length;
          overdueMap.set(audit.id, overdueCount);

          // Calculate progress
          const answeredCount = responses.length;
          progressMap.set(audit.id, { answered: answeredCount, total: totalQuestions });
        } catch (error) {
          console.error(`Error loading data for audit ${audit.id}:`, error);
          overdueMap.set(audit.id, 0);
          progressMap.set(audit.id, { answered: 0, total: totalQuestions });
          actionsMap.set(audit.id, []);
        }
      }));
      setAuditActionsMap(actionsMap);
      setOverdueActionsMap(overdueMap);
      setAllAuditProgressMap(progressMap);
      setAuditProgressMap(progressMap);
    } catch (error) {
      console.error('Error loading audits:', error);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load audits from API
    loadAudits();

    // Load departments, areas, auditors and area supervisors for filters
    const loadFilterData = async () => {
      try {
        // Use Promise.allSettled to handle individual failures gracefully
        const [deptResult, areaResult, userResult] = await Promise.allSettled([
          apiService.getDepartments(),
          apiService.getAreas(),
          apiService.getUsers(), // getUsers() now handles 403/401 silently internally
        ]);

        // Set departments
        if (deptResult.status === 'fulfilled') {
          setDepartments(deptResult.value || []);
        } else {
          console.error('Error loading departments:', deptResult.reason);
          setDepartments([]);
        }

        // Set areas
        if (areaResult.status === 'fulfilled') {
          setAreas(areaResult.value || []);
        } else {
          console.error('Error loading areas:', areaResult.reason);
          setAreas([]);
        }

        // Set auditors and area supervisors - no role filtering, show all users
        if (userResult.status === 'fulfilled') {
          const userData = userResult.value || [];
          // Show all users as auditors - no role filtering
          setAuditors(userData);
          // Show all users as area supervisors - no role filtering
          setAreaSupervisors(userData);
        } else {
          // Log error but don't fail silently
          if (userResult.reason?.response?.status !== 403 && userResult.reason?.response?.status !== 401) {
            console.error('Error loading users:', userResult.reason);
          }
          setAuditors([]);
          setAreaSupervisors([]);
        }
      } catch (error) {
        console.error('Error loading filter data:', error);
        // Set empty arrays as fallback
        setDepartments([]);
        setAreas([]);
        setAuditors([]);
        setAreaSupervisors([]);
      }
    };
    loadFilterData();
  }, []);

  const [sectors, setSectors] = useState<any[]>([]);
  const [directorates, setDirectorates] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [areaSupervisors, setAreaSupervisors] = useState<any[]>([]);

  // Load questions when edit dialog opens
  useEffect(() => {
    const loadQuestions = async () => {
      if (editDialogOpen) {
        try {
          const questionsData = await apiService.getQuestions();
          setQuestions(questionsData || []);
        } catch (error) {
          console.error('Error loading questions:', error);
        }
      }
    };
    loadQuestions();
  }, [editDialogOpen]);

  useEffect(() => {
    // Load departments, sectors, directorates, areas and auditors for plan form
    const loadFormData = async () => {
      try {
        // Use Promise.allSettled to handle individual failures gracefully
        const [deptResult, sectorResult, directorateResult, areaResult, userResult, questionsResult] = await Promise.allSettled([
          apiService.getDepartments(),
          apiService.getSectors(),
          apiService.getDirectorates(),
          apiService.getAreas(),
          apiService.getActiveUsers(), // getUsers() now handles 403/401 silently internally
          apiService.getQuestions(),
        ]);

        // Set departments
        if (deptResult.status === 'fulfilled') {
          setDepartments(deptResult.value || []);
        } else {
          console.error('Error loading departments:', deptResult.reason);
          setDepartments([]);
        }

        // Set sectors
        if (sectorResult.status === 'fulfilled') {
          setSectors(sectorResult.value || []);
        } else {
          console.error('Error loading sectors:', sectorResult.reason);
          setSectors([]);
        }

        // Set directorates
        if (directorateResult.status === 'fulfilled') {
          setDirectorates(directorateResult.value || []);
        } else {
          console.error('Error loading directorates:', directorateResult.reason);
          setDirectorates([]);
        }

        // Set areas
        if (areaResult.status === 'fulfilled') {
          setAreas(areaResult.value || []);
        } else {
          console.error('Error loading areas:', areaResult.reason);
          setAreas([]);
        }

        // Set questions
        if (questionsResult.status === 'fulfilled') {
          setQuestions(questionsResult.value || []);
        } else {
          console.error('Error loading questions:', questionsResult.reason);
          setQuestions([]);
        }

        // Set auditors and area supervisors - backend already filters by role
        if (userResult.status === 'fulfilled') {
          const userData = userResult.value || [];
          // Backend returns users filtered by role, no need to filter in frontend
          setAuditors(userData);
          setAreaSupervisors(userData);
        } else {
          // Silently handle user permission errors
          // Don't log 403/401 errors as they are expected when user doesn't have permission
          if (userResult.reason?.response?.status !== 403 && userResult.reason?.response?.status !== 401) {
            console.error('Error loading users:', userResult.reason);
          }
          setAuditors([]);
          setAreaSupervisors([]);
        }
      } catch (error: any) {
        console.error('Error loading form data:', error);
        // Set empty arrays as fallback
        setDepartments([]);
        setSectors([]);
        setDirectorates([]);
        setAreas([]);
        setQuestions([]);
        setAuditors([]);
        setAreaSupervisors([]);
      }
    };
    if (planDialogOpen) {
      loadFormData();
    }
  }, [planDialogOpen]);

  const filteredAudits = useMemo(() => {
    let filtered = [...audits];

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(audit =>
        audit.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.area_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.auditor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.area_supervisor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(audit => audit.department_id === Number(departmentFilter));
    }

    // Area filter
    if (areaFilter !== 'all') {
      filtered = filtered.filter(audit => audit.area_id === Number(areaFilter));
    }

    // Auditor filter
    if (auditorFilter !== 'all') {
      filtered = filtered.filter(audit => audit.auditor_id === Number(auditorFilter));
    }

    // Area Supervisor filter
    if (areaSupervisorFilter !== 'all') {
      filtered = filtered.filter(audit => audit.area_supervisor === areaSupervisorFilter);
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(audit => {
        if (!audit.audit_date) return false;
        const auditDate = new Date(audit.audit_date);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        return auditDate >= start;
      });
    }
    if (endDate) {
      filtered = filtered.filter(audit => {
        if (!audit.audit_date) return false;
        const auditDate = new Date(audit.audit_date);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return auditDate <= end;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'devam') {
        filtered = filtered.filter(audit => audit.status === 'devam');
      } else if (statusFilter === 'denetlendi') {
        filtered = filtered.filter(audit => audit.status === 'published' || audit.status === 'denetlendi');
      } else if (statusFilter === 'yayınlandı') {
        filtered = filtered.filter(audit => audit.status === 'published');
      } else if (statusFilter === 'tamamlandı') {
        filtered = filtered.filter(audit => audit.status === 'tamamlandı');
      } else {
        filtered = filtered.filter(audit => audit.status === statusFilter);
      }
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(audit => audit.level_achieved === levelFilter);
    }

    // Level range filter
    if (levelMinFilter || levelMaxFilter) {
      const levelOrder: { [key: string]: number } = { '1S': 1, '2S': 2, '3S': 3, '4S': 4, '5S': 5 };
      filtered = filtered.filter(audit => {
        if (!audit.level_achieved) return false;
        const auditLevel = levelOrder[audit.level_achieved] || 0;
        const minLevel = levelMinFilter ? (levelOrder[levelMinFilter] || 0) : 0;
        const maxLevel = levelMaxFilter ? (levelOrder[levelMaxFilter] || 0) : 5;
        return auditLevel >= minLevel && auditLevel <= maxLevel;
      });
    }

    // Action filter
    if (actionFilter === 'with_open') {
      filtered = filtered.filter(audit => (audit.open_actions || 0) > 0);
    } else if (actionFilter === 'without_open') {
      filtered = filtered.filter(audit => (audit.open_actions || 0) === 0);
    }

    // Critical actions filter
    if (criticalActionsFilter && filteredActionIds.length > 0) {
      filtered = filtered.filter(audit => {
        const auditActions = auditActionsMap.get(audit.id) || [];
        return auditActions.some(action => {
          const actionId = action.id.toString();
          if (!filteredActionIds.includes(actionId)) return false;
          const priority = (action.priority || '').toString().toLowerCase();
          return priority === 'yüksek';
        });
      });
    }

    // Delayed actions filter
    if (delayedActionsFilter && filteredActionIds.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(audit => {
        const auditActions = auditActionsMap.get(audit.id) || [];
        return auditActions.some(action => {
          const actionId = action.id.toString();
          if (!filteredActionIds.includes(actionId)) return false;
          const normalizedStatus = normalizeActionStatus(action.status);
          if (normalizedStatus === 'closed') return false;
          if (!action.target_date) return false;
          try {
            const target = new Date(action.target_date);
            target.setHours(0, 0, 0, 0);
            return target < today;
          } catch (e) {
            return false;
          }
        });
      });
    }

    return filtered;
  }, [audits, searchTerm, statusFilter, departmentFilter, areaFilter, auditorFilter, areaSupervisorFilter, levelFilter, levelMinFilter, levelMaxFilter, actionFilter, startDate, endDate, criticalActionsFilter, delayedActionsFilter, filteredActionIds, auditActionsMap]);

  // Calculate filtered stats dynamically
  const filteredStats = useMemo(() => {
    return {
      totalAudits: filteredAudits.length,
      publishedAudits: filteredAudits.filter(a => a.status === 'published' || a.status === 'denetlendi').length,
      completedAudits: filteredAudits.filter(a => a.status === 'tamamlandı').length,
      inProgressAudits: filteredAudits.filter(a => a.status === 'devam').length,
      totalActions: filteredAudits.reduce((sum, audit) => sum + (audit.total_actions || 0), 0),
      openActions: filteredAudits.reduce((sum, audit) => sum + (audit.open_actions || 0), 0),
    };
  }, [filteredAudits]);

  // Calculate high priority actions for filtered audits
  const [filteredHighPriorityActionsCount, setFilteredHighPriorityActionsCount] = useState(0);

  useEffect(() => {
    const calculateHighPriorityActions = async () => {
      if (filteredAudits.length === 0) {
        setFilteredHighPriorityActionsCount(0);
        return;
      }

      let totalHighPriorityActions = 0;
      await Promise.all(filteredAudits.map(async (audit) => {
        try {
          const actions = await apiService.getActionsByAuditId(audit.id);
          const highPriorityCount = actions.filter((action: any) => {
            const priority = action.priority || action.Priority;
            return priority === 'Yüksek' && action.status !== 'closed';
          }).length;
          totalHighPriorityActions += highPriorityCount;
        } catch (error) {
          console.error(`Error loading actions for audit ${audit.id}:`, error);
        }
      }));
      setFilteredHighPriorityActionsCount(totalHighPriorityActions);

      // Update progress map for filtered audits
      const filteredProgressMap = new Map<number, { answered: number; total: number }>();
      filteredAudits.forEach(audit => {
        const progress = allAuditProgressMap.get(audit.id);
        if (progress) {
          filteredProgressMap.set(audit.id, progress);
        }
      });
      setAuditProgressMap(filteredProgressMap);
    };

    calculateHighPriorityActions();
  }, [filteredAudits, allAuditProgressMap]);

  const handleOpenPlanDialog = () => {
    setPlanForm({
      departmentId: 0,
      sectorId: 0,
      directorateId: 0,
      auditorId: user?.id || 0,
      areaId: 0,
      areaSupervisor: '',
      auditDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setPlanFormError('');
    setPlanDialogOpen(true);
  };

  const handleClosePlanDialog = () => {
    setPlanDialogOpen(false);
    setPlanFormError('');
    setPlanSubmitting(false);
  };

  const handleCreateAuditPlan = async () => {
    if (!planForm.departmentId || !planForm.auditorId || !planForm.auditDate) {
      setPlanFormError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setPlanSubmitting(true);
    setPlanFormError('');

    try {
      // Convert date to ISO format for backend
      const auditDateISO = planForm.auditDate
        ? new Date(planForm.auditDate + 'T00:00:00').toISOString()
        : new Date().toISOString();

      const requestData = {
        departmentId: planForm.departmentId,
        sectorId: planForm.sectorId || undefined,
        directorateId: planForm.directorateId || undefined,
        auditorId: planForm.auditorId,
        areaId: planForm.areaId || undefined,
        areaSupervisor: planForm.areaSupervisor || undefined,
        auditDate: auditDateISO,
        notes: planForm.notes || undefined,
      };

      console.log('Creating audit plan with data:', requestData);

      const response = await apiService.createAuditPlan(requestData);

      // Map backend response to frontend Audit type
      const responseData = response as any;
      const newAudit: Audit = {
        id: responseData.id,
        department_id: responseData.departmentId || responseData.department_id,
        department_name: responseData.departmentName || '',
        auditor_id: responseData.auditorId || responseData.auditor_id,
        auditor_name: responseData.auditorName || '',
        audit_date: responseData.auditDate ? new Date(responseData.auditDate).toISOString().split('T')[0] : planForm.auditDate,
        notes: responseData.notes,
        status: responseData.status || 'planlandı',
        total_score: responseData.totalScore || responseData.total_score || 0,
        max_possible_score: responseData.maxPossibleScore || responseData.max_possible_score || 0,
        level_achieved: responseData.levelAchieved || responseData.level_achieved,
        area_id: responseData.areaId || responseData.area_id,
        area_name: responseData.areaName || responseData.area_name,
        area_supervisor: responseData.areaSupervisor || responseData.area_supervisor,
        total_actions: 0,
        open_actions: 0,
        closed_actions: 0,
        created_at: responseData.createdAt || responseData.created_at ? new Date(responseData.createdAt || responseData.created_at).toISOString() : new Date().toISOString(),
        updated_at: responseData.updatedAt || responseData.updated_at ? new Date(responseData.updatedAt || responseData.updated_at).toISOString() : undefined,
      };

      setAudits(prev => [newAudit, ...prev]);
      setPlanDialogOpen(false);
      setPlanForm({
        departmentId: 0,
        sectorId: 0,
        directorateId: 0,
        auditorId: 0,
        areaId: 0,
        areaSupervisor: '',
        auditDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (error: any) {
      console.error('Error creating audit plan:', error);
      console.error('Error response:', error?.response?.data);

      // Show detailed error message from backend
      const errorMessage = error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || 'Denetim planı oluşturulurken bir hata oluştu.';

      setPlanFormError(errorMessage);
    } finally {
      setPlanSubmitting(false);
    }
  };

  const handleStartAudit = (audit: Audit) => {
    // Navigate to questions page
    navigate(`/audits/new?auditId=${audit.id}`);
  };


  const handleSearch = () => {
    setPage(1);
  };

  // Remove fetchAudits useEffect as we're using useMemo now

  const handleExport = () => {
    // Export functionality
    console.log('Excel export triggered');
  };

  const getActionStatusLabel = (status: NormalizedActionStatus) => {
    switch (status) {
      case 'closed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      default:
        return 'Açık';
    }
  };

  const getActionStatusChipColor = (
    status: NormalizedActionStatus
  ): 'default' | 'info' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'closed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'error';
    }
  };

  const handleActionsClick = (audit: Audit) => {
    setSelectedAudit(audit);
    setSelectedAuditActions([]);
    setActionsDialogOpen(true);
    loadAuditActions(audit.id);
  };

  const handleEditAction = (action: Action) => {
    // Map action to ensure all fields are properly set
    const mappedAction = mapActionDtoToAction(action);
    setEditingAction(mappedAction);
    setEditDialogOpen(true);
  };

  const handleCompleteAction = async (actionId: number) => {
    try {
      // Update action status to closed via API
      await apiService.updateAction(actionId, {
        status: 'closed',
      });

      // Update local state
      setSelectedAuditActions(prev =>
        prev.map(action =>
          action.id === actionId
            ? { ...action, status: 'closed' }
            : action
        )
      );

      // Reload audits to update action counts
      await loadAudits();
    } catch (error: any) {
      console.error('Error completing action:', error);
      alert(error?.response?.data?.message || 'Aksiyon tamamlanırken hata oluştu');
    }
  };

  const handleSaveAction = async (updatedAction: Action | null) => {
    if (!updatedAction || !selectedAudit) {
      return;
    }

    try {
      if (updatedAction.id === 0) {
        // Validate required fields for new action
        if (!updatedAction.question_id || updatedAction.question_id === 0) {
          alert('Lütfen bir soru seçin');
          return;
        }
        if (!updatedAction.description || !updatedAction.suggested_activity || !updatedAction.planned_activity || !updatedAction.responsible_person || !updatedAction.target_date) {
          alert('Lütfen tüm alanları doldurun');
          return;
        }
        // Create new action
        await apiService.createAction({
          questionId: updatedAction.question_id,
          auditId: selectedAudit.id,
          description: updatedAction.description,
          suggestedActivity: updatedAction.suggested_activity,
          plannedActivity: updatedAction.planned_activity,
          responsiblePerson: updatedAction.responsible_person,
          targetDate: updatedAction.target_date,
          priority: updatedAction.priority,
        });
        // Reload actions
        await loadAuditActions(selectedAudit.id);
        // Reload audits to update action counts
        await loadAudits();
      } else {
        // Update existing action
        const targetDateISO = updatedAction.target_date
          ? (updatedAction.target_date.length === 10
            ? new Date(updatedAction.target_date + 'T00:00:00').toISOString()
            : new Date(updatedAction.target_date).toISOString())
          : undefined;

        await apiService.updateAction(updatedAction.id, {
          description: updatedAction.description,
          suggestedActivity: updatedAction.suggested_activity,
          plannedActivity: updatedAction.planned_activity,
          responsiblePerson: updatedAction.responsible_person,
          targetDate: targetDateISO,
          status: updatedAction.status as 'open' | 'in_progress' | 'closed',
          priority: updatedAction.priority,
        });

        // Reload actions
        await loadAuditActions(selectedAudit.id);
        // Reload audits to update action counts
        await loadAudits();
      }
      setEditDialogOpen(false);
      setEditingAction(null);
    } catch (error: any) {
      console.error('Error saving action:', error);
      alert(error?.response?.data?.message || 'Aksiyon kaydedilirken hata oluştu');
    }
  };

  const handleViewDetails = (audit: Audit) => {
    navigate(`/audits/${audit.id}`);
  };

  const handleViewActions = (audit: Audit) => {
    setSelectedAudit(audit);
    setSelectedAuditActions([]);
    setActionsDialogOpen(true);
    loadAuditActions(audit.id);
  };

  const handleEdit = (audit: Audit) => {
    navigate(`/audits/${audit.id}/edit`);
  };

  const handleDelete = (audit: Audit) => {
    if (window.confirm('Bu denetimi silmek istediğinizden emin misiniz?')) {
      // Remove from mock data
      setAudits(prev => prev.filter(a => a.id !== audit.id));
    }
  };

  const handlePrint = (audit: Audit) => {
    window.open(`/audits/${audit.id}/print`, '_blank');
  };

  const getStatusText = (status: RowStatus) => {
    if (status === 'published' || status === 'denetlendi') return 'Denetlendi';
    if (status === 'tamamlandı') return 'Tamamlandı';
    if (status === 'devam') return 'Devam';
    if (status === 'planlandı') return 'Planlandı';
    return 'Taslak';
  };

  const getStatusColor = (status: RowStatus): string => {
    if (status === 'devam') return '#2196f3'; // Mavi
    if (status === 'denetlendi') return '#ff9800'; // Turuncu
    if (status === 'tamamlandı') return '#4caf50'; // Yeşil
    if (status === 'published') return '#673ab7'; // Mor (Yayınlandı)
    return '#757575'; // Gri (Taslak/Planlandı)
  };

  const getStatusIcon = (status: RowStatus) => {
    if (status === 'published' || status === 'tamamlandı') {
      return <CheckCircle sx={{ color: getStatusColor(status), fontSize: 14 }} />;
    } else if (status === 'devam') {
      return <Schedule sx={{ color: getStatusColor(status), fontSize: 14 }} />;
    } else {
      return <Schedule sx={{ color: getStatusColor(status), fontSize: 14 }} />;
    }
  };

  const getLevelColor = (level: string | null | undefined): 'success' | 'info' | 'primary' | 'warning' | 'error' | 'default' => {
    if (!level) return 'default';
    switch (level) {
      case '5S': return 'success';
      case '4S': return 'info';
      case '3S': return 'primary';
      case '2S': return 'warning';
      case '1S': return 'error';
      default: return 'default';
    }
  };

  const getActionStatusColor = (openActions: number, totalActions: number) => {
    if (totalActions === 0) return 'success';
    if (openActions === 0) return 'success';
    if (openActions <= totalActions / 2) return 'warning';
    return 'error';
  };

  const handleSort = (property: keyof AuditTableRow) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const tableRows = useMemo<AuditTableRow[]>(() => {
    const mappedRows = filteredAudits.map((audit) => {
      const auditAny = audit as any;
      const sector = auditAny.sector_name || auditAny.sector || '';
      const directorate = auditAny.directorate_name || auditAny.directorate || '';
      const sectorDirectorate = sector && directorate ? `${sector} / ${directorate}` : (sector || directorate || '-');

      return {
        key: `audit-${audit.id}`,
        displayId: `#${audit.id.toString().padStart(3, '0')}`,
        date: audit.audit_date,
        departmentName: audit.department_name,
        sectorDirectorate,
        areaName: audit.area_name,
        areaSupervisor: audit.area_supervisor,
        level: audit.level_achieved,
        totalActions: audit.total_actions,
        openActions: audit.open_actions,
        closedActions: audit.closed_actions,
        totalScore: audit.total_score,
        maxPossibleScore: audit.max_possible_score,
        auditorName: audit.auditor_name,
        status: audit.status,
        audit,
      };
    });

    return mappedRows.sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];

      // Handle date sorting
      if (orderBy === 'date') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      // Handle number sorting
      else if (orderBy === 'totalActions' || orderBy === 'openActions' || orderBy === 'closedActions' || orderBy === 'totalScore') {
        aValue = aValue ?? 0;
        bValue = bValue ?? 0;
      }
      // Handle string sorting
      else {
        aValue = (aValue ?? '').toString().toLowerCase();
        bValue = (bValue ?? '').toString().toLowerCase();
      }

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredAudits, orderBy, order]);

  const totalPages = Math.max(1, Math.ceil(tableRows.length / rowsPerPage));

  const paginatedRows = useMemo(
    () => tableRows.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [tableRows, page, rowsPerPage]
  );

  // Reset page when filtered results change
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [filteredAudits, totalPages, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ py: 1, px: 2, width: '100%' }}>
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={20} />
        </Box>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
      </Container>
    );
  }

  return (
    <Fade in timeout={800}>
      <Container maxWidth={false} sx={{ py: 1, px: 2, width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5, width: 32, height: 32 }}>
              <Assignment fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                Denetimler
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                5S denetim listesi ve yönetimi
              </Typography>
            </Box>
          </Box>

          {canAccessButton('Denetimler', 'AddPlan') && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenPlanDialog}
              size="small"
              sx={{ fontSize: '0.7rem' }}
            >
              Denetim Planı
            </Button>
          )}
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {[
            { title: 'Toplam Denetim', value: filteredStats.totalAudits, icon: <Assignment />, color: '#1976d2' },
            { title: 'Yayınlanmış', value: filteredStats.publishedAudits, icon: <CheckCircle />, color: '#2e7d32' },
            { title: 'Tamamlanmış', value: filteredStats.completedAudits, icon: <CheckCircle />, color: '#4caf50' },
            { title: 'Devam Ediyor', value: filteredStats.inProgressAudits, icon: <Schedule />, color: '#ff9800' },
            { title: 'Toplam Aksiyon', value: filteredStats.totalActions, icon: <Assignment />, color: '#7b1fa2' },
            { title: 'Açık Aksiyon', value: filteredStats.openActions, icon: <Warning />, color: '#d32f2f' },
            { title: 'Kritik Aksiyon', value: filteredHighPriorityActionsCount, icon: <PriorityHigh />, color: '#c62828' },
          ].map((stat, index) => (
            <Card key={index} sx={{ flex: '1 1 auto', minWidth: 120, maxWidth: 'calc(14.28% - 6px)' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.65rem', mb: 0.5 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.7 }}>
                    {React.cloneElement(stat.icon, { fontSize: 'small' })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 1, fontSize: '0.8rem' }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 1, width: '100%' }}>
          <CardContent sx={{ py: 1, px: 1.5 }}>
            {/* Single Row: All Filters */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
              <Box sx={{ flex: '0 0 100px', minWidth: 100 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Genel ara"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem' } }}
                />
              </Box>
              <Box sx={{ flex: '0 0 100px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.7rem' }}>Bölüm</InputLabel>
                  <Select
                    value={departmentFilter}
                    label="Bölüm"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '0 0 100px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.7rem' }}>Alan</InputLabel>
                  <Select
                    value={areaFilter}
                    label="Alan"
                    onChange={(e) => setAreaFilter(e.target.value)}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    {areas.map((area) => (
                      <MenuItem key={area.id} value={area.id}>
                        {area.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '0 0 100px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.7rem' }}>Denetleyen</InputLabel>
                  <Select
                    value={auditorFilter}
                    label="Denetleyen"
                    onChange={(e) => setAuditorFilter(e.target.value)}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    {auditors.map((auditor) => (
                      <MenuItem key={auditor.id} value={auditor.id}>
                        {auditor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '0 0 100px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.7rem' }}>Alan Sorumlusu</InputLabel>
                  <Select
                    value={areaSupervisorFilter}
                    label="Alan Sorumlusu"
                    onChange={(e) => setAreaSupervisorFilter(e.target.value)}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    {areaSupervisors.map((supervisor) => (
                      <MenuItem key={supervisor.id} value={supervisor.name}>
                        {supervisor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '0 0 100px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.7rem' }}>Durum</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Durum"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="devam">Devam</MenuItem>
                    <MenuItem value="denetlendi">Denetlendi</MenuItem>
                    <MenuItem value="tamamlandı">Tamamlandı</MenuItem>
                    <MenuItem value="yayınlandı">Yayınlandı</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '0 0 100px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.7rem' }}>Aksiyon</InputLabel>
                  <Select
                    value={actionFilter}
                    label="Aksiyon"
                    onChange={(e) => setActionFilter(e.target.value)}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="with_open">Açık Aksiyon Var</MenuItem>
                    <MenuItem value="without_open">Açık Aksiyon Yok</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '0 0 80px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.7rem' }}>5S Min</InputLabel>
                  <Select
                    value={levelMinFilter}
                    label="5S Min"
                    onChange={(e) => setLevelMinFilter(e.target.value)}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="1S">1S</MenuItem>
                    <MenuItem value="2S">2S</MenuItem>
                    <MenuItem value="3S">3S</MenuItem>
                    <MenuItem value="4S">4S</MenuItem>
                    <MenuItem value="5S">5S</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '0 0 80px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.7rem' }}>5S Max</InputLabel>
                  <Select
                    value={levelMaxFilter}
                    label="5S Max"
                    onChange={(e) => setLevelMaxFilter(e.target.value)}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="1S">1S</MenuItem>
                    <MenuItem value="2S">2S</MenuItem>
                    <MenuItem value="3S">3S</MenuItem>
                    <MenuItem value="4S">4S</MenuItem>
                    <MenuItem value="5S">5S</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '0 0 100px' }}>
                <TextField
                  label="Tarih Başlangıç"
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true, sx: { fontSize: '0.7rem' } }}
                  sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem' } }}
                  fullWidth
                />
              </Box>
              <Box sx={{ flex: '0 0 100px' }}>
                <TextField
                  label="Tarih Bitiş"
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true, sx: { fontSize: '0.7rem' } }}
                  sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem' } }}
                  fullWidth
                />
              </Box>
              <Box sx={{ flex: '0 0 auto' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<GetApp />}
                  color="success"
                  onClick={handleExport}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Excel
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Audits Table */}
        <Card sx={{ width: '100%' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)', width: '100%' }}>
            <Table size="small" sx={{ width: '100%', tableLayout: 'auto' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>
                    <TableSortLabel
                      active={orderBy === 'displayId'}
                      direction={orderBy === 'displayId' ? order : 'asc'}
                      onClick={() => handleSort('displayId')}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Denetim No
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'desc'}
                      onClick={() => handleSort('date')}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Tarih
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>
                    <TableSortLabel
                      active={orderBy === 'departmentName'}
                      direction={orderBy === 'departmentName' ? order : 'asc'}
                      onClick={() => handleSort('departmentName')}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Bölüm / Alan
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>
                    <TableSortLabel
                      active={orderBy === 'sectorDirectorate'}
                      direction={orderBy === 'sectorDirectorate' ? order : 'asc'}
                      onClick={() => handleSort('sectorDirectorate')}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Sektör / Direktörlük
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>
                    <TableSortLabel
                      active={orderBy === 'areaSupervisor'}
                      direction={orderBy === 'areaSupervisor' ? order : 'asc'}
                      onClick={() => handleSort('areaSupervisor')}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Alan Sorumlusu
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>İlerleme</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>
                    <TableSortLabel
                      active={orderBy === 'level'}
                      direction={orderBy === 'level' ? order : 'asc'}
                      onClick={() => handleSort('level')}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      5S Seviyesi
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>
                    <TableSortLabel
                      active={orderBy === 'totalActions'}
                      direction={orderBy === 'totalActions' ? order : 'desc'}
                      onClick={() => handleSort('totalActions')}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Aksiyon Adedi
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>Geçmiş Aksiyonlar</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>
                    <TableSortLabel
                      active={orderBy === 'totalScore'}
                      direction={orderBy === 'totalScore' ? order : 'desc'}
                      onClick={() => handleSort('totalScore')}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Toplam Puan
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>
                    <TableSortLabel
                      active={orderBy === 'auditorName'}
                      direction={orderBy === 'auditorName' ? order : 'asc'}
                      onClick={() => handleSort('auditorName')}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Denetleyen
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleSort('status')}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Durum
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '8px 4px' }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row) => (
                  <TableRow key={row.key} hover>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                        {row.displayId}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {row.date ? format(new Date(row.date), 'dd.MM.yyyy') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {row.departmentName}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                          {row.areaName || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {row.sectorDirectorate || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {row.areaSupervisor || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      {(() => {
                        const progress = auditProgressMap.get(row.audit.id);
                        if (!progress || progress.total === 0) return <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>-</Typography>;
                        const percentage = Math.round((progress.answered / progress.total) * 100);
                        return (
                          <Tooltip title={`${progress.answered}/${progress.total} soru cevaplandı (%${percentage})`}>
                            <Box sx={{ width: 70 }}>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{
                                  height: 6,
                                  borderRadius: 4,
                                  bgcolor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: percentage === 100 ? 'success.main' : percentage >= 50 ? 'warning.main' : 'error.main'
                                  }
                                }}
                              />
                              <Typography variant="caption" sx={{ fontSize: '0.6rem', mt: 0.5, display: 'block' }}>
                                %{percentage}
                              </Typography>
                            </Box>
                          </Tooltip>
                        );
                      })()}
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      <Chip
                        label={row.level || 'Başlangıç'}
                        size="small"
                        color={getLevelColor(row.level)}
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 18 }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      <Tooltip
                        title={
                          (row.totalActions || 0) === 0
                            ? 'Açık Aksiyon Yok'
                            : (row.openActions || 0) === 0
                              ? `Toplam ${row.totalActions} aksiyon tamamlandı`
                              : `Kritik Aksiyon Var: ${row.openActions} açık, ${row.closedActions} tamamlandı`
                        }
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {(row.totalActions || 0) > 0 && (
                            <Chip
                              label={`${row.openActions || 0}/${row.totalActions}`}
                              size="small"
                              color={getActionStatusColor(row.openActions || 0, row.totalActions || 0)}
                              sx={{
                                fontSize: '0.65rem',
                                height: 18,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 }
                              }}
                              onClick={() => handleActionsClick(row.audit)}
                            />
                          )}
                          {(row.totalActions || 0) === 0 && (
                            <CheckCircle sx={{ color: 'success.main', fontSize: 14 }} />
                          )}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      <Tooltip
                        title={
                          (overdueActionsMap.get(row.audit.id) || 0) > 0
                            ? `${overdueActionsMap.get(row.audit.id)} geçmiş aksiyon var`
                            : 'Geçmiş aksiyon yok'
                        }
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {(overdueActionsMap.get(row.audit.id) || 0) > 0 && (
                            <Chip
                              label={`${overdueActionsMap.get(row.audit.id)}`}
                              size="small"
                              color="error"
                              sx={{
                                fontSize: '0.65rem',
                                height: 18,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 }
                              }}
                              onClick={() => handleActionsClick(row.audit)}
                            />
                          )}
                          {(overdueActionsMap.get(row.audit.id) || 0) === 0 && (
                            <CheckCircle sx={{ color: 'success.main', fontSize: 14 }} />
                          )}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      <Typography variant="body2" fontWeight={600} color="primary.main" sx={{ fontSize: '0.75rem' }}>
                        {row.totalScore !== undefined && row.maxPossibleScore && row.maxPossibleScore > 0
                          ? `${row.totalScore}/${row.maxPossibleScore} (%${Math.round((row.totalScore / row.maxPossibleScore) * 100)})`
                          : row.totalScore !== undefined && row.totalScore > 0
                            ? `${row.totalScore}`
                            : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {row.auditorName || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getStatusIcon(row.status)}
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.65rem',
                            color: getStatusColor(row.status),
                            fontWeight: 500
                          }}
                        >
                          {getStatusText(row.status)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                        {row.status === 'planlandı' && actionPermissions['Start'] && canAccessButton('Denetimler', 'edit') && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleStartAudit(row.audit)}
                            sx={{ fontSize: '0.65rem', textTransform: 'none', padding: '2px 8px', minWidth: 'auto' }}
                          >
                            Başlat
                          </Button>
                        )}
                        {row.status === 'devam' && actionPermissions['Continue'] && canAccessButton('Denetimler', 'edit') && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleStartAudit(row.audit)}
                            sx={{ fontSize: '0.65rem', textTransform: 'none', padding: '2px 8px', minWidth: 'auto' }}
                          >
                            Devam
                          </Button>
                        )}
                        {row.status === 'tamamlandı' && actionPermissions['Publish'] && canAccessButton('Denetimler', 'edit') && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={async () => {
                              try {
                                await apiService.publishAudit(row.audit.id);
                                await loadAudits();
                              } catch (error: any) {
                                console.error('Error publishing audit:', error);
                                alert(error?.response?.data?.message || 'Yayınlama hatası');
                              }
                            }}
                            sx={{ fontSize: '0.65rem', textTransform: 'none', padding: '2px 8px', minWidth: 'auto' }}
                          >
                            Yayınla
                          </Button>
                        )}
                        {/* Görüntüle butonu her zaman görünür - yetki kontrolü yok */}
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleViewDetails(row.audit)}
                          sx={{ fontSize: '0.65rem', textTransform: 'none', padding: '2px 8px', minWidth: 'auto' }}
                        >
                          Görüntüle
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              size="small"
            />
          </Box>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography sx={{ fontSize: '1rem' }}>
                  Denetim Detayı #{selectedAudit?.id.toString().padStart(3, '0')}
                </Typography>
              </Box>
              <IconButton onClick={() => setDetailDialogOpen(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            {selectedAudit && (
              <Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Card variant="outlined" sx={{ flex: '1 1 200px', p: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Bölüm
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                      {selectedAudit.department_name}
                    </Typography>
                  </Card>
                  <Card variant="outlined" sx={{ flex: '1 1 150px', p: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Tarih
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                      {format(new Date(selectedAudit.audit_date), 'dd/MM/yyyy')}
                    </Typography>
                  </Card>
                  <Card variant="outlined" sx={{ flex: '1 1 150px', p: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Seviye
                    </Typography>
                    <Chip
                      label={selectedAudit.level_achieved || 'Başlangıç'}
                      size="small"
                      color={getLevelColor(selectedAudit.level_achieved)}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Card>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.9rem' }}>
                  Denetim Bilgileri
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText
                      primary="Denetçi"
                      secondary={selectedAudit.auditor_name}
                      primaryTypographyProps={{ fontSize: '0.8rem' }}
                      secondaryTypographyProps={{ fontSize: '0.7rem' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText
                      primary="Toplam Puan"
                      secondary={selectedAudit.status === 'published' ?
                        `${selectedAudit.total_score}/${selectedAudit.max_possible_score} (%${Math.round((selectedAudit.total_score / selectedAudit.max_possible_score) * 100)})` :
                        'Henüz puanlanmamış'
                      }
                      primaryTypographyProps={{ fontSize: '0.8rem' }}
                      secondaryTypographyProps={{ fontSize: '0.7rem' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText
                      primary="Aksiyon Durumu"
                      secondary={(selectedAudit.total_actions || 0) > 0 ?
                        `${selectedAudit.open_actions} açık, ${selectedAudit.closed_actions} kapalı` :
                        'Aksiyon yok'
                      }
                      primaryTypographyProps={{ fontSize: '0.8rem' }}
                      secondaryTypographyProps={{ fontSize: '0.7rem' }}
                    />
                  </ListItem>
                  {selectedAudit.notes && (
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText
                        primary="Notlar"
                        secondary={selectedAudit.notes}
                        primaryTypographyProps={{ fontSize: '0.8rem' }}
                        secondaryTypographyProps={{ fontSize: '0.7rem' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ pt: 1 }}>
            {canAccessButton('Denetimler', 'edit') && (
              <Button
                onClick={() => selectedAudit && handleEdit(selectedAudit)}
                size="small"
                sx={{ fontSize: '0.7rem' }}
              >
                Düzenle
              </Button>
            )}
            {canAccessButton('Denetimler', 'delete') && (
              <Button
                onClick={() => selectedAudit && handleDelete(selectedAudit)}
                color="error"
                size="small"
                sx={{ fontSize: '0.7rem' }}
              >
                Sil
              </Button>
            )}
            <Button
              onClick={() => selectedAudit && handlePrint(selectedAudit)}
              variant="contained"
              size="small"
              sx={{ fontSize: '0.7rem' }}
            >
              Yazdır
            </Button>
          </DialogActions>
        </Dialog>

        {/* Actions Dialog */}
        <Dialog open={actionsDialogOpen} onClose={() => setActionsDialogOpen(false)} maxWidth="xl" fullWidth>
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography sx={{ fontSize: '1rem' }}>
                  Denetim Aksiyonları #{selectedAudit?.id.toString().padStart(3, '0')}
                </Typography>
              </Box>
              <IconButton onClick={() => setActionsDialogOpen(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            {selectedAudit && (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    <strong>Bölüm:</strong> {selectedAudit.department_name} |
                    <strong> Tarih:</strong> {format(new Date(selectedAudit.audit_date), 'dd/MM/yyyy')} |
                    <strong> Denetçi:</strong> {selectedAudit.auditor_name}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  {actionPermissions['Action_Create'] && (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                      onClick={() => {
                        if (selectedAudit) {
                          setEditingAction({
                            id: 0,
                            audit_id: selectedAudit.id,
                            question_id: 0,
                            description: '',
                            suggested_activity: '',
                            planned_activity: '',
                            responsible_person: selectedAudit.area_supervisor || '',
                            target_date: undefined,
                            status: 'open',
                            priority: 'Orta',
                            created_at: new Date().toISOString(),
                          } as Action);
                          setEditDialogOpen(true);
                        }
                      }}
                    >
                      Yeni Aksiyon Ekle
                    </Button>
                  )}
                </Box>

                {actionsError && (
                  <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>
                    {actionsError}
                  </Alert>
                )}

                {actionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : selectedAuditActions.length > 0 ? (
                  <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 25, p: 0.5 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 35, p: 0.5 }}>5S</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 150, p: 0.5 }}>Soru</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 150, p: 0.5 }}>Uygunsuzluk</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 120, p: 0.5 }}>Önerilen Faaliyet</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 120, p: 0.5 }}>Planlanan Faaliyet</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 80, p: 0.5 }}>Denetleyen</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 80, p: 0.5 }}>Sorumlu</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 65, p: 0.5 }}>Açılma</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 65, p: 0.5 }}>Hedef</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 45, p: 0.5 }}>Açık</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 50, p: 0.5 }}>Gecikme</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 55, p: 0.5 }}>Görsel</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 55, p: 0.5 }}>Kanıt</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 50, p: 0.5 }}>Öncelik</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 90, p: 0.5 }}>Durum</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'grey.100', minWidth: 100, p: 0.5 }}>İşlemler</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedAuditActions.map((action, index) => {
                          // Calculate days open
                          const createdDate = action.created_at ? new Date(action.created_at) : new Date();
                          const today = new Date();
                          const daysOpen = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

                          // Calculate delay days
                          const targetDate = action.target_date ? new Date(action.target_date) : null;
                          const delayDays = targetDate && normalizeActionStatus(action.status) !== 'closed'
                            ? Math.max(0, Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)))
                            : 0;

                          // Extract S category from category_name (e.g., "Seiri"=S1, "Seiton"=S2, etc.)
                          const categoryMap: { [key: string]: string } = {
                            'seiri': 'S1', 'seiton': 'S2', 'seiso': 'S3',
                            'seiketsu': 'S4', 'shitsuke': 'S5',
                            'ayıklama': 'S1', 'düzenleme': 'S2', 'temizlik': 'S3',
                            'standartlaştırma': 'S4', 'disiplin': 'S5',
                            'seiri (ayıklama)': 'S1', 'seiton (düzenleme)': 'S2',
                            'seiso (temizlik)': 'S3', 'seiketsu (standartlaştırma)': 'S4',
                            'shitsuke (disiplin)': 'S5'
                          };
                          const catName = (action.category_name || action.categoryName || '').toLowerCase();
                          const sCategory = categoryMap[catName] ||
                            catName.match(/s[1-5]/i)?.[0]?.toUpperCase() ||
                            action.question_text?.match(/S[1-5]/i)?.[0]?.toUpperCase() ||
                            (catName ? catName.substring(0, 4) : '-');

                          return (
                            <TableRow key={action.id} hover>
                              <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>{index + 1}</TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>
                                <Chip label={sCategory} size="small" color={sCategory !== '-' ? 'primary' : 'default'} sx={{ fontSize: '0.5rem', height: 16, minWidth: 25 }} />
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', maxWidth: 150, p: 0.5 }} title={action.question_text}>
                                {action.question_text?.substring(0, 40) || '-'}{action.question_text && action.question_text.length > 40 ? '...' : ''}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', maxWidth: 150, p: 0.5 }} title={action.description}>
                                {action.description?.substring(0, 40) || '-'}{action.description && action.description.length > 40 ? '...' : ''}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', maxWidth: 120, p: 0.5 }} title={action.suggested_activity}>
                                {action.suggested_activity?.substring(0, 30) || '-'}{action.suggested_activity && action.suggested_activity.length > 30 ? '...' : ''}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', maxWidth: 120, p: 0.5 }} title={action.planned_activity}>
                                {action.planned_activity?.substring(0, 30) || '-'}{action.planned_activity && action.planned_activity.length > 30 ? '...' : ''}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>
                                {selectedAudit?.auditor_name || '-'}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>
                                {action.responsible_person || '-'}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>
                                {action.created_at ? format(new Date(action.created_at), 'dd/MM/yy') : '-'}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', p: 0.5, color: delayDays > 0 ? 'error.main' : 'text.primary' }}>
                                {action.target_date ? format(new Date(action.target_date), 'dd/MM/yy') : '-'}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', p: 0.5, textAlign: 'center' }}>
                                {daysOpen}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', p: 0.5, textAlign: 'center', color: delayDays > 0 ? 'error.main' : 'text.secondary' }}>
                                {delayDays > 0 ? delayDays : '-'}
                              </TableCell>
                              <TableCell sx={{ p: 0.5, textAlign: 'center' }}>
                                {(() => {
                                  // Get action images (imageType = 'Aksiyon')
                                  const actionImages = action.images?.filter(img => img.imageType === 'Aksiyon') || [];
                                  if (actionImages.length === 0) return <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>-</Typography>;
                                  const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || `http://${window.location.hostname}:5000`;

                                  const handleOpenGallery = () => {
                                    const images = actionImages.map(img =>
                                      img.imagePath.startsWith('http') ? img.imagePath : `${baseUrl}${img.imagePath.startsWith('/') ? img.imagePath : '/' + img.imagePath}`
                                    );
                                    setGalleryImages(images);
                                    setGalleryTitle('Aksiyon Görselleri');
                                    setGalleryOpen(true);
                                  };

                                  return (
                                    <Tooltip title={`${actionImages.length} Görseli Görüntüle`}>
                                      <IconButton size="small" onClick={handleOpenGallery} color="primary">
                                        <CollectionsIcon fontSize="small" sx={{ fontSize: '1rem' }} />
                                      </IconButton>
                                    </Tooltip>
                                  );
                                })()}
                              </TableCell>
                              <TableCell sx={{ p: 0.5, textAlign: 'center' }}>
                                {(() => {
                                  // Get evidence images (imageType = 'Kanit')
                                  const evidenceImages = action.images?.filter(img => img.imageType === 'Kanit') || [];
                                  if (evidenceImages.length === 0) return <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>-</Typography>;
                                  const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || `http://${window.location.hostname}:5000`;

                                  const handleOpenGallery = () => {
                                    const images = evidenceImages.map(img =>
                                      img.imagePath.startsWith('http') ? img.imagePath : `${baseUrl}${img.imagePath.startsWith('/') ? img.imagePath : '/' + img.imagePath}`
                                    );
                                    setGalleryImages(images);
                                    setGalleryTitle('Kanıt Görselleri');
                                    setGalleryOpen(true);
                                  };

                                  return (
                                    <Tooltip title={`${evidenceImages.length} Kanıtı Görüntüle`}>
                                      <IconButton size="small" onClick={handleOpenGallery} color="success">
                                        <CollectionsIcon fontSize="small" sx={{ fontSize: '1rem' }} />
                                      </IconButton>
                                    </Tooltip>
                                  );
                                })()}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>
                                {action.priority ? (
                                  <Chip
                                    label={action.priority.charAt(0)}
                                    size="small"
                                    color={
                                      action.priority === 'Yüksek' ? 'error' :
                                        action.priority === 'Orta' ? 'warning' : 'info'
                                    }
                                    sx={{ fontSize: '0.5rem', height: 16, minWidth: 20 }}
                                    title={action.priority}
                                  />
                                ) : '-'}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>
                                <Chip
                                  label={getActionStatusLabel(normalizeActionStatus(action.status))}
                                  size="small"
                                  color={getActionStatusChipColor(normalizeActionStatus(action.status))}
                                  sx={{ fontSize: '0.5rem', height: 16 }}
                                />
                              </TableCell>
                              <TableCell sx={{ p: 0.5 }}>
                                <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
                                  <Tooltip title="Tarihçe">
                                    <IconButton size="small" onClick={() => handleViewHistory(action.id)} sx={{ p: 0.25 }}>
                                      <History sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>

                                  {actionPermissions['Action_Edit'] && (
                                    <Tooltip title="Düzenle">
                                      <IconButton size="small" onClick={() => handleEditAction(action)} sx={{ p: 0.25 }}>
                                        <Edit sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  {/* Workflow Buttons */}
                                  {action.status === 'open' && (user?.role?.includes('admin') || user?.name === action.responsible_person) && (
                                    <Tooltip title="Denetçiye Gönder">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleRequestStatusChange(action, 'PendingApproval', 'Denetçiye Gönder')}
                                        sx={{ p: 0.25 }}
                                      >
                                        <Send sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  {action.status === 'pending_approval' && (user?.role?.includes('admin') || (selectedAudit && user?.id === selectedAudit.auditor_id)) && (
                                    <>
                                      <Tooltip title="Tamamlandı">
                                        <IconButton
                                          size="small"
                                          color="success"
                                          onClick={() => handleRequestStatusChange(action, 'Closed', 'Aksiyonu Kapat (Tamamlandı)')}
                                          sx={{ p: 0.25 }}
                                        >
                                          <CheckCircle sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Revizyon İste">
                                        <IconButton
                                          size="small"
                                          color="warning"
                                          onClick={() => handleRequestStatusChange(action, 'Open', 'Revizyon İste')}
                                          sx={{ p: 0.25 }}
                                        >
                                          <Undo sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </Tooltip>
                                    </>
                                  )}

                                  {actionPermissions['Action_Complete'] && action.status === 'in_progress' && (
                                    <Tooltip title="Tamamla">
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={() => handleRequestStatusChange(action, 'Closed', 'Aksiyonu Tamamla')}
                                        sx={{ p: 0.25 }}
                                      >
                                        <CheckCircle sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      Bu denetim için aksiyon bulunmamaktadır.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ pt: 1 }}>
            <Button
              onClick={() => setActionsDialogOpen(false)}
              size="small"
              sx={{ fontSize: '0.7rem' }}
            >
              Kapat
            </Button>
            {actionPermissions['Action_Create'] && (
              <Button
                variant="contained"
                size="small"
                sx={{ fontSize: '0.7rem' }}
                onClick={() => {
                  if (selectedAudit) {
                    setEditingAction({
                      id: 0,
                      audit_id: selectedAudit.id,
                      question_id: 0,
                      description: '',
                      suggested_activity: '',
                      planned_activity: '',
                      responsible_person: selectedAudit.area_supervisor || '',
                      target_date: undefined,
                      status: 'open',
                      priority: 'Orta',
                      created_at: new Date().toISOString(),
                    } as Action);
                    setEditDialogOpen(true);
                  }
                }}
              >
                Yeni Aksiyon Ekle
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Plan Dialog */}
        <Dialog open={planDialogOpen} onClose={handleClosePlanDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ pb: 1 }}>Denetim Planı Oluştur</DialogTitle>
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCreateAuditPlan(); }}>
            <DialogContent sx={{ pt: 1.5 }}>
              {planFormError && (
                <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>
                  {planFormError}
                </Alert>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Sektör</InputLabel>
                  <Select
                    value={planForm.sectorId || ''}
                    label="Sektör"
                    onChange={(e) => setPlanForm(prev => ({
                      ...prev,
                      sectorId: Number(e.target.value) || 0,
                      directorateId: 0, // Reset directorate when sector changes
                      departmentId: 0, // Reset department when sector changes
                      areaId: 0 // Reset area when sector changes
                    }))}
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {sectors.filter(s => s.isActive !== false).map((sector) => (
                      <MenuItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" required>
                  <InputLabel>Direktörlük</InputLabel>
                  <Select
                    value={planForm.directorateId || ''}
                    label="Direktörlük"
                    onChange={(e) => setPlanForm(prev => ({
                      ...prev,
                      directorateId: Number(e.target.value) || 0,
                      departmentId: 0, // Reset department when directorate changes
                      areaId: 0 // Reset area when directorate changes
                    }))}
                    disabled={!planForm.sectorId}
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {directorates
                      .filter(d => {
                        if (!planForm.sectorId) return false;
                        return d.sectorId === planForm.sectorId;
                      })
                      .map((directorate) => (
                        <MenuItem key={directorate.id} value={directorate.id}>
                          {directorate.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" required>
                  <InputLabel>Departman</InputLabel>
                  <Select
                    value={planForm.departmentId || ''}
                    label="Departman"
                    onChange={(e) => setPlanForm(prev => ({
                      ...prev,
                      departmentId: Number(e.target.value),
                      areaId: 0 // Reset area when department changes
                    }))}
                    disabled={!planForm.directorateId}
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {departments
                      .filter(dept => {
                        if (!planForm.directorateId) return false;
                        return dept.directorateId === planForm.directorateId;
                      })
                      .map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" required>
                  <InputLabel>Denetçi</InputLabel>
                  <Select
                    value={planForm.auditorId || ''}
                    label="Denetçi"
                    onChange={(e) => setPlanForm(prev => ({ ...prev, auditorId: Number(e.target.value) }))}
                    disabled={!planForm.directorateId}
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {auditors
                      .filter(auditor => {
                        if (!planForm.directorateId) return false;
                        // Filter by roleId=2 (Denetci) and matching directorateId
                        return auditor.roleId === 2 && auditor.directorateId === planForm.directorateId;
                      })
                      .map((auditor) => (
                        <MenuItem key={auditor.id} value={auditor.id}>
                          {auditor.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Alan</InputLabel>
                  <Select
                    value={planForm.areaId || ''}
                    label="Alan"
                    onChange={(e) => setPlanForm(prev => ({ ...prev, areaId: Number(e.target.value) || 0 }))}
                    disabled={!planForm.departmentId}
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {areas
                      .filter(area => {
                        if (!planForm.departmentId) return false;
                        return area.departmentId === planForm.departmentId;
                      })
                      .map((area) => (
                        <MenuItem key={area.id} value={area.id}>
                          {area.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Alan Sorumlusu</InputLabel>
                  <Select
                    value={planForm.areaSupervisor || ''}
                    label="Alan Sorumlusu"
                    onChange={(e) => setPlanForm(prev => ({ ...prev, areaSupervisor: e.target.value as string }))}
                    disabled={!planForm.departmentId}
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {areaSupervisors
                      .filter(supervisor => {
                        if (!planForm.departmentId) return false;
                        // Filter by roleId=3 (AlanSorumlusu) and matching departmentId
                        return supervisor.roleId === 3 && supervisor.departmentId === planForm.departmentId;
                      })
                      .map((supervisor) => (
                        <MenuItem key={supervisor.id} value={supervisor.name}>
                          {supervisor.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Denetim Tarihi"
                  type="date"
                  fullWidth
                  size="small"
                  value={planForm.auditDate}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, auditDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  required
                />

                <TextField
                  label="Notlar"
                  fullWidth
                  size="small"
                  multiline
                  minRows={3}
                  value={planForm.notes}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ pt: 1 }}>
              <Button onClick={handleClosePlanDialog} size="small">
                İptal
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={planSubmitting}
              >
                {planSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        {/* Edit Action Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingAction?.id === 0 ? 'Yeni Aksiyon Ekle' : 'Aksiyon Düzenle'}</DialogTitle>
          <DialogContent sx={{ pt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
            {editingAction && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {editingAction.id === 0 && (
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Soru</InputLabel>
                    <Select
                      value={editingAction.question_id || ''}
                      onChange={(e) =>
                        setEditingAction({
                          ...editingAction,
                          question_id: Number(e.target.value) || 0,
                        })
                      }
                      label="Soru"
                    >
                      <MenuItem value="">
                        <em>Seçiniz</em>
                      </MenuItem>
                      {questions.map((q: any) => (
                        <MenuItem key={q.id} value={q.id}>
                          {q.text}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <TextField
                  label="Tespit Edilen Uygunsuzluk"
                  value={editingAction.description || ''}
                  onChange={(e) => setEditingAction({ ...editingAction, description: e.target.value })}
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                  required
                />
                <TextField
                  label="Önerilen Faaliyet"
                  value={editingAction.suggested_activity || ''}
                  onChange={(e) => setEditingAction({ ...editingAction, suggested_activity: e.target.value })}
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                  required
                />
                <TextField
                  label="Planlanan Faaliyet"
                  value={editingAction.planned_activity || ''}
                  onChange={(e) => setEditingAction({ ...editingAction, planned_activity: e.target.value })}
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                  required
                />
                <TextField
                  label="Sorumlu Kişi"
                  value={editingAction.responsible_person || ''}
                  onChange={(e) =>
                    setEditingAction({
                      ...editingAction,
                      responsible_person: e.target.value || undefined,
                    })
                  }
                  fullWidth
                  size="small"
                  required
                />
                <TextField
                  label="Hedef Tarih"
                  type="date"
                  value={editingAction.target_date ? editingAction.target_date.substring(0, 10) : ''}
                  onChange={(e) =>
                    setEditingAction({
                      ...editingAction,
                      target_date: e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : undefined,
                    })
                  }
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Öncelik</InputLabel>
                  <Select
                    value={editingAction.priority || 'Orta'}
                    onChange={(e) =>
                      setEditingAction({
                        ...editingAction,
                        priority: e.target.value as 'Düşük' | 'Orta' | 'Yüksek',
                      })
                    }
                    label="Öncelik"
                  >
                    <MenuItem value="Düşük">Düşük</MenuItem>
                    <MenuItem value="Orta">Orta</MenuItem>
                    <MenuItem value="Yüksek">Yüksek</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={editingAction.status}
                    onChange={(e) =>
                      setEditingAction({
                        ...editingAction,
                        status: e.target.value as NormalizedActionStatus,
                      })
                    }
                    label="Durum"
                  >
                    <MenuItem value="open">Açık</MenuItem>
                    <MenuItem value="in_progress">Devam Ediyor</MenuItem>
                    <MenuItem value="closed">Tamamlandı</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} size="small">İptal</Button>
            <Button
              onClick={() => handleSaveAction(editingAction)}
              variant="contained"
              size="small"
              disabled={!editingAction}
            >
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>

        {/* New Dialogs */}
        <ActionHistoryDialog
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          actionId={selectedActionId}
        />

        <NoteDialog
          open={noteDialogOpen}
          title={noteDialogTitle}
          onClose={() => setNoteDialogOpen(false)}
          onConfirm={handleConfirmStatusChange}
          confirmLabel="Onayla"
          requireImage={pendingStatusChange?.status === 'PendingApproval'}
          showImageUpload={pendingStatusChange?.status !== 'Open'} // Hide for "Revizyon İste" (requesting Open status)
        />

        {/* Gallery Dialog */}
        <Dialog open={galleryOpen} onClose={() => setGalleryOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ m: 0, p: 2 }}>
            {galleryTitle}
            <IconButton
              onClick={() => setGalleryOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              {galleryImages.map((img, idx) => (
                <Box
                  key={idx}
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid #eee',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8, boxShadow: 2 }
                  }}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`Galeri ${idx}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGalleryOpen(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* Lightbox / Full Image Dialog */}
        <Dialog
          open={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          maxWidth={false}
          PaperProps={{
            sx: {
              maxWidth: '95vw',
              maxHeight: '95vh',
              bgcolor: 'black',
              boxShadow: 'none',
              overflow: 'hidden',
              borderRadius: 0
            }
          }}
        >
          <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <IconButton
              onClick={() => setSelectedImage(null)}
              sx={{ position: 'absolute', right: 10, top: 10, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
            >
              <Close />
            </IconButton>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Tam ekran"
                style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }}
              />
            )}
          </Box>
        </Dialog>
      </Container>
    </Fade >
  );
};

export default AuditsPage;