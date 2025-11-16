import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Container,
  Fade,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  TextField,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  Star,
  Warning,
  DateRange,
  GetApp,
  FilterList,
  Assignment,
  CheckCircle,
  Schedule,
  People,
  Business,
  Timeline,
  BarChart,
  CalendarToday,
  Notifications,
  PieChart,
  ShowChart,
  InfoOutlined,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { apiService } from '../services/api';
import { Audit, Action } from '../types';

interface ReportData {
  // Dashboard Stats
  dashboardStats: {
    totalAudits: number;
    publishedAudits: number;
    draftAudits: number;
    totalActions: number;
    openActions: number;
    averageScore: number;
    improvementTrend: 'up' | 'down' | 'stable';
    activeDepartments: number;
    activeUsers: number;
    completionRate: number;
  };
  
  // Recent Activity
  recentAudits: Array<{
    id: number;
    department: string;
    auditor: string;
    score: number;
    level: string;
    date: string;
  }>;
  
  upcomingActions: Array<{
    id: number;
    description: string;
    responsible: string;
    department: string;
    target_date: string;
    priority: 'Yüksek' | 'Orta' | 'Düşük';
  }>;
  
  alerts: Array<{
    type: 'warning' | 'info' | 'success';
    message: string;
    date: string;
  }>;
  
  // Performance Data
  topAreas: Array<{
    name: string;
    score: number;
    level: string;
    trend: 'up' | 'down' | 'stable';
  }>;
  
  highestScores: Array<{
    department: string;
    area: string;
    score: number;
    date: string;
  }>;
  
  lowestScores: Array<{
    department: string;
    area: string;
    score: number;
    date: string;
  }>;
  
  departmentScores: Array<{
    department: string;
    lastScore: number;
    averageScore: number;
    auditCount: number;
    trend: 'up' | 'down' | 'stable';
  }>;

  // Department 5S breakdown
  department5SBreakdown: Array<{
    department: string;
    seiri: number;
    seiton: number;
    seiso: number;
    seiketsu: number;
    shitsuke: number;
    total: number;
  }>;
  
  // Charts Data
  weeklyProgress: Array<{
    day: string;
    audits: number;
    score: number;
  }>;
  
  departmentStatistics: Array<{
    department: string;
    totalAudits: number;
    ongoingAudits: number;
    openAudits: number;
    openActions: number;
    criticalActions: number;
  }>;
  
  monthlyComparison: Array<{
    month: string;
    score: number;
  }>;
  
  topPerformers: Array<{
    department: string;
    score: number;
    level: string;
    trend: 'up' | 'down' | 'stable';
  }>;

  departmentTrends: Array<{
    department: string;
    monthlyData: Array<{
      month: string;
      averageScore: number;
    }>;
  }>;

  top3Departments: Array<{
    name: string;
    score: number;
    level: string;
    trend: 'up' | 'down' | 'stable';
  }>;

  // Additional chart data
  scoreDistribution: Array<{
    range: string;
    count: number;
  }>;

  actionsByPriority: Array<{
    priority: string;
    count: number;
    completed: number;
  }>;
}

const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState<any[]>([]);
  const [trendPeriod, setTrendPeriod] = useState<3 | 6 | 9 | 12>(3); // Trend grafiği için dönem seçimi
  const [actionStatusFilter, setActionStatusFilter] = useState<string>('all'); // Aksiyon durumu filtresi
  const [actionDepartmentFilter, setActionDepartmentFilter] = useState<string>('all'); // Aksiyon bölüm filtresi

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [selectedDepartment]);

  const loadDepartments = async () => {
    try {
      const depts = await apiService.getDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const [auditsData, departmentsData, areasData] = await Promise.all([
        apiService.getAudits(),
        apiService.getDepartments(),
        apiService.getAreas(),
      ]);

      // Map audits data
      const audits = auditsData.map((a: any) => ({
        id: a.id || a.Id,
        department_id: a.departmentId || a.department_id || a.DepartmentId,
        department_name: a.departmentName || a.department_name || a.DepartmentName || '',
        auditor_id: a.auditorId || a.auditor_id || a.AuditorId,
        auditor_name: a.auditorName || a.auditor_name || a.AuditorName || '',
        audit_date: a.auditDate || a.audit_date || a.AuditDate ? new Date(a.auditDate || a.audit_date || a.AuditDate).toISOString().split('T')[0] : '',
        status: a.status || a.Status || 'draft',
        total_score: a.totalScore || a.total_score || a.TotalScore || 0,
        max_possible_score: a.maxPossibleScore || a.max_possible_score || a.MaxPossibleScore || 0,
        level_achieved: a.levelAchieved || a.level_achieved || a.LevelAchieved,
        area_id: a.areaId || a.area_id || a.AreaId,
        area_name: a.areaName || a.area_name || a.AreaName,
        total_actions: a.totalActions || a.total_actions || a.TotalActions || 0,
        open_actions: a.openActions || a.open_actions || a.OpenActions || 0,
        created_at: a.createdAt || a.created_at || a.CreatedAt ? new Date(a.createdAt || a.created_at || a.CreatedAt).toISOString() : new Date().toISOString(),
      }));

      // Calculate dashboard stats
      const totalAudits = audits.length;
      const publishedAudits = audits.filter(a => a.status === 'published' || a.status === 'tamamlandı' || a.status === 'denetlendi').length;
      const draftAudits = audits.filter(a => a.status === 'draft' || a.status === 'planlandı').length;
      const totalActions = audits.reduce((sum, a) => sum + (a.total_actions || 0), 0);
      const openActions = audits.reduce((sum, a) => sum + (a.open_actions || 0), 0);
      const totalScore = audits.reduce((sum, a) => sum + (a.total_score || 0), 0);
      const maxScore = audits.reduce((sum, a) => sum + (a.max_possible_score || 0), 0);
      const averageScore = totalAudits > 0 && maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
      const completionRate = totalAudits > 0 ? Math.round((publishedAudits / totalAudits) * 100) : 0;
      
      // Get unique departments and users
      const uniqueDepartments = new Set(audits.map(a => a.department_id).filter((id: any) => id));
      const uniqueAuditors = new Set(audits.map(a => a.auditor_id).filter((id: any) => id && id !== 0));
      const activeDepartments = uniqueDepartments.size;
      const activeUsers = uniqueAuditors.size;

      // Get recent audits (last 5)
      const recentAudits = audits
        .sort((a, b) => {
          const dateA = a.audit_date ? new Date(a.audit_date).getTime() : new Date(a.created_at).getTime();
          const dateB = b.audit_date ? new Date(b.audit_date).getTime() : new Date(b.created_at).getTime();
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(audit => {
          const score = audit.max_possible_score > 0 
            ? Math.round((audit.total_score / audit.max_possible_score) * 100) 
            : 0;
          return {
            id: audit.id,
            department: audit.department_name || 'Bilinmiyor',
            auditor: audit.auditor_name || 'Bilinmiyor',
            score,
            level: audit.level_achieved || 'Başlangıç',
            date: audit.audit_date || audit.created_at.split('T')[0],
          };
        });

      // Fetch all actions for upcoming actions - get directly from backend
      let allActions: Action[] = [];
      try {
        allActions = await apiService.getAllActions();
      } catch (error) {
        console.error('Error fetching all actions:', error);
        // Fallback: fetch by audit IDs
        for (const audit of audits) {
          try {
            const actions = await apiService.getActionsByAuditId(audit.id);
            allActions.push(...actions);
          } catch (err) {
            console.error(`Error fetching actions for audit ${audit.id}:`, err);
          }
        }
      }

      // Get upcoming actions (not closed, target date within 5 days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDays = 5; // Max 5 days remaining
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + maxDays);
      maxDate.setHours(23, 59, 59, 999);
      
      const upcomingActions = allActions
        .filter(action => {
          // Check if action is closed/completed
          const status = (action.status || '').toString().toLowerCase();
          const isClosed = status === 'closed' || status === 'completed' || status === 'tamamlandı' || status === 'Closed' || status === 'Completed';
          if (isClosed) return false;
          
          // Must have target date
          const targetDateStr = action.target_date || action.targetDate;
          if (!targetDateStr) return false;
          
          try {
            const target = new Date(targetDateStr);
            target.setHours(0, 0, 0, 0);
            // Include only actions with target date within maxDays (today to today + maxDays)
            return target >= today && target <= maxDate;
          } catch (e) {
            return false;
          }
        })
        .sort((a, b) => {
          // Sort by target date: earliest first
          const dateAStr = a.target_date || a.targetDate || '';
          const dateBStr = b.target_date || b.targetDate || '';
          const dateA = dateAStr ? new Date(dateAStr).getTime() : 0;
          const dateB = dateBStr ? new Date(dateBStr).getTime() : 0;
          return dateA - dateB;
        })
        .map(action => {
          // Find department from audit or use action's department
          const auditId = action.audit_id || action.auditId;
          const audit = audits.find(a => a.id === auditId);
          return {
            id: action.id || 0,
            description: action.description || '',
            responsible: action.responsible_person || action.responsiblePerson || '',
            department: audit?.department_name || action.departmentName || '',
            target_date: action.target_date || action.targetDate || '',
            priority: (action.priority || 'Orta') as 'Yüksek' | 'Orta' | 'Düşük',
          };
        });
      

      // Calculate top areas
      const areaScores: Record<string, { total: number; max: number; count: number; lastDate: string }> = {};
      audits.forEach(audit => {
        const areaName = audit.area_name || 'Bilinmeyen Alan';
        if (!areaScores[areaName]) {
          areaScores[areaName] = { total: 0, max: 0, count: 0, lastDate: '' };
        }
        const score = audit.max_possible_score > 0 
          ? Math.round((audit.total_score / audit.max_possible_score) * 100) 
          : 0;
        areaScores[areaName].total += score;
        areaScores[areaName].max += 100;
        areaScores[areaName].count += 1;
        const auditDate = audit.audit_date || audit.created_at.split('T')[0];
        if (auditDate > areaScores[areaName].lastDate) {
          areaScores[areaName].lastDate = auditDate;
        }
      });

      const topAreas = Object.entries(areaScores)
        .map(([name, data]) => ({
          name,
          score: data.count > 0 ? Math.round(data.total / data.count) : 0,
          level: data.count > 0 && (data.total / data.count) >= 90 ? '5S' : 
                 data.count > 0 && (data.total / data.count) >= 70 ? '4S' :
                 data.count > 0 && (data.total / data.count) >= 50 ? '3S' :
                 data.count > 0 && (data.total / data.count) >= 30 ? '2S' : '1S',
          trend: 'stable' as 'up' | 'down' | 'stable',
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      // Calculate highest and lowest scores
      const auditScores = audits
        .filter(a => a.max_possible_score > 0)
        .map(audit => {
          const score = Math.round((audit.total_score / audit.max_possible_score) * 100);
          return {
            department: audit.department_name || 'Bilinmiyor',
            area: audit.area_name || '-',
            score,
            date: audit.audit_date || audit.created_at.split('T')[0],
          };
        })
        .sort((a, b) => b.score - a.score);

      const highestScores = auditScores.slice(0, 5);
      // Only show scores below 70 as "needs improvement"
      const lowestScores = auditScores
        .filter(a => a.score < 70)
        .slice(0, 5)
        .reverse();

      // Calculate department scores
      const deptScores: Record<string, { scores: number[]; lastScore: number; lastDate: string }> = {};
      audits.forEach(audit => {
        const deptName = audit.department_name || 'Bilinmiyor';
        if (!deptScores[deptName]) {
          deptScores[deptName] = { scores: [], lastScore: 0, lastDate: '' };
        }
        const score = audit.max_possible_score > 0 
          ? Math.round((audit.total_score / audit.max_possible_score) * 100) 
          : 0;
        deptScores[deptName].scores.push(score);
        const auditDate = audit.audit_date || audit.created_at.split('T')[0];
        if (auditDate > deptScores[deptName].lastDate) {
          deptScores[deptName].lastDate = auditDate;
          deptScores[deptName].lastScore = score;
        }
      });

      const departmentScores = Object.entries(deptScores)
        .map(([department, data]) => ({
          department,
          lastScore: data.lastScore,
          averageScore: data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0,
          auditCount: data.scores.length,
          trend: 'stable' as 'up' | 'down' | 'stable',
        }))
        .sort((a, b) => b.averageScore - a.averageScore);

      const topPerformers = departmentScores.slice(0, 4).map(dept => ({
        department: dept.department,
        score: dept.averageScore,
        level: dept.averageScore >= 90 ? '5S' : 
               dept.averageScore >= 70 ? '4S' :
               dept.averageScore >= 50 ? '3S' :
               dept.averageScore >= 30 ? '2S' : '1S',
        trend: dept.trend,
      }));

      // Calculate top 3 departments by average score
      const top3Departments = departmentScores
        .slice(0, 3)
        .map(dept => ({
          name: dept.department,
          score: dept.averageScore,
          level: dept.averageScore >= 90 ? '5S' : 
                 dept.averageScore >= 70 ? '4S' :
                 dept.averageScore >= 50 ? '3S' :
                 dept.averageScore >= 30 ? '2S' : '1S',
          trend: dept.trend,
        }));

      // Calculate department 5S breakdown
      const department5SBreakdown: Array<{
        department: string;
        seiri: number;
        seiton: number;
        seiso: number;
        seiketsu: number;
        shitsuke: number;
        total: number;
      }> = [];

      for (const dept of departmentsData.slice(0, 10)) {
        const deptName = dept.name || '';
        const deptAudits = audits.filter(a => (a.department_name || '') === deptName);
        
        if (deptAudits.length === 0) continue;

        // Fetch responses for each audit to calculate 5S breakdown
        const categoryScores: Record<number, { total: number; max: number }> = {
          1: { total: 0, max: 0 },
          2: { total: 0, max: 0 },
          3: { total: 0, max: 0 },
          4: { total: 0, max: 0 },
          5: { total: 0, max: 0 },
        };

        try {
          const allQuestions = await apiService.getQuestions();
          const categoryMap: Record<number, number> = {};
          allQuestions.forEach((q: any) => {
            const categoryId = q.categoryId || q.CategoryId || q.category_id;
            const questionId = q.id || q.Id;
            if (categoryId && questionId) {
              const catIdNum = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
              if (!isNaN(catIdNum)) {
                categoryMap[questionId] = catIdNum;
              }
            }
          });

          for (const audit of deptAudits.slice(0, 5)) {
            try {
              const responses = await apiService.getAuditDetailResponses(audit.id);
              responses.forEach((response: any) => {
                const questionId = response.questionId || response.QuestionId;
                const categoryId = categoryMap[questionId];
                if (categoryId && categoryId >= 1 && categoryId <= 5) {
                  const points = response.pointsAwarded || response.PointsAwarded || 0;
                  const question = allQuestions.find((q: any) => (q.id || q.Id) === questionId);
                  const maxPoints = question?.pointsHigh || question?.points_high || 3;
                  categoryScores[categoryId].total += points;
                  categoryScores[categoryId].max += maxPoints;
                }
              });
            } catch (error) {
              console.error(`Error fetching responses for audit ${audit.id}:`, error);
            }
          }
        } catch (error) {
          console.error('Error calculating 5S breakdown:', error);
        }

        const seiri = categoryScores[1].max > 0 ? Math.round((categoryScores[1].total / categoryScores[1].max) * 100) : 0;
        const seiton = categoryScores[2].max > 0 ? Math.round((categoryScores[2].total / categoryScores[2].max) * 100) : 0;
        const seiso = categoryScores[3].max > 0 ? Math.round((categoryScores[3].total / categoryScores[3].max) * 100) : 0;
        const seiketsu = categoryScores[4].max > 0 ? Math.round((categoryScores[4].total / categoryScores[4].max) * 100) : 0;
        const shitsuke = categoryScores[5].max > 0 ? Math.round((categoryScores[5].total / categoryScores[5].max) * 100) : 0;
        const total = Math.round((seiri + seiton + seiso + seiketsu + shitsuke) / 5);

        department5SBreakdown.push({
          department: deptName,
          seiri,
          seiton,
          seiso,
          seiketsu,
          shitsuke,
          total,
        });
      }

      // Calculate actions by priority
      const actionsByPriority = [
        {
            priority: 'Yüksek',
          count: allActions.filter(a => (a.priority || '').toString().toLowerCase() === 'yüksek').length,
          completed: allActions.filter(a => {
            const priority = (a.priority || '').toString().toLowerCase();
            const status = (a.status || '').toString().toLowerCase();
            return priority === 'yüksek' && (status === 'closed' || status === 'completed');
          }).length,
        },
        {
            priority: 'Orta',
          count: allActions.filter(a => {
            const priority = (a.priority || '').toString().toLowerCase();
            return priority === 'orta' || (!priority || priority === '');
          }).length,
          completed: allActions.filter(a => {
            const priority = (a.priority || '').toString().toLowerCase();
            const status = (a.status || '').toString().toLowerCase();
            return (priority === 'orta' || (!priority || priority === '')) && (status === 'closed' || status === 'completed');
          }).length,
        },
        {
            priority: 'Düşük',
          count: allActions.filter(a => (a.priority || '').toString().toLowerCase() === 'düşük').length,
          completed: allActions.filter(a => {
            const priority = (a.priority || '').toString().toLowerCase();
            const status = (a.status || '').toString().toLowerCase();
            return priority === 'düşük' && (status === 'closed' || status === 'completed');
          }).length,
        },
      ];

      // Calculate score distribution
      const scoreRanges = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        '50-59': 0,
      };
      audits.forEach(audit => {
        if (audit.max_possible_score > 0) {
          const score = Math.round((audit.total_score / audit.max_possible_score) * 100);
          if (score >= 90) scoreRanges['90-100']++;
          else if (score >= 80) scoreRanges['80-89']++;
          else if (score >= 70) scoreRanges['70-79']++;
          else if (score >= 60) scoreRanges['60-69']++;
          else if (score >= 50) scoreRanges['50-59']++;
        }
      });

      const scoreDistribution = Object.entries(scoreRanges).map(([range, count]) => ({
        range,
        count,
      }));

      // Calculate weekly and monthly progress (simplified)
      const now = new Date();
      const weeklyProgress = [
        { day: 'Pazartesi', audits: 0, score: 0 },
        { day: 'Salı', audits: 0, score: 0 },
        { day: 'Çarşamba', audits: 0, score: 0 },
        { day: 'Perşembe', audits: 0, score: 0 },
        { day: 'Cuma', audits: 0, score: 0 },
          { day: 'Cumartesi', audits: 0, score: 0 },
          { day: 'Pazar', audits: 0, score: 0 },
      ];

      // Calculate department statistics
      const departmentStatisticsMap: Record<string, {
        totalAudits: number;
        ongoingAudits: number;
        openAudits: number;
        openActions: number;
        criticalActions: number;
      }> = {};

      // Initialize all departments
      departmentsData.forEach(dept => {
        const deptName = dept.name || '';
        if (deptName) {
          departmentStatisticsMap[deptName] = {
            totalAudits: 0,
            ongoingAudits: 0,
            openAudits: 0,
            openActions: 0,
            criticalActions: 0,
          };
        }
      });

      // Count audits by department
      audits.forEach(audit => {
        const deptName = audit.department_name || '';
        if (deptName && departmentStatisticsMap[deptName]) {
          departmentStatisticsMap[deptName].totalAudits++;
          const status = (audit.status || '').toString().toLowerCase();
          if (status === 'ongoing' || status === 'devam ediyor' || status === 'in_progress') {
            departmentStatisticsMap[deptName].ongoingAudits++;
          }
          if (status === 'draft' || status === 'taslak' || status === 'open' || status === 'açık') {
            departmentStatisticsMap[deptName].openAudits++;
          }
        }
      });

      // Count actions by department
      allActions.forEach(action => {
        const status = (action.status || '').toString().toLowerCase();
        const isClosed = status === 'closed' || status === 'completed' || status === 'tamamlandı' || status === 'Closed' || status === 'Completed';
        if (!isClosed) {
          const auditId = action.audit_id || action.auditId;
          const audit = audits.find(a => a.id === auditId);
          const deptName = action.departmentName || audit?.department_name || '';
          if (deptName && departmentStatisticsMap[deptName]) {
            departmentStatisticsMap[deptName].openActions++;
            const priority = (action.priority || '').toString().toLowerCase();
            if (priority === 'yüksek' || priority === 'high' || priority === 'kritik') {
              departmentStatisticsMap[deptName].criticalActions++;
            }
          }
        }
      });

      const departmentStatistics = Object.entries(departmentStatisticsMap)
        .map(([department, stats]) => ({
          department,
          ...stats,
        }))
        .filter(dept => dept.totalAudits > 0 || dept.openActions > 0)
        .sort((a, b) => b.totalAudits - a.totalAudits);

      // Calculate monthly comparison (last 4 months)
      const monthlyComparison: Array<{ month: string; score: number }> = [];
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = format(date, 'MMMM', { locale: tr });
        const monthAudits = audits.filter(a => {
          const auditDate = a.audit_date ? new Date(a.audit_date) : new Date(a.created_at);
          return auditDate.getMonth() === date.getMonth() && auditDate.getFullYear() === date.getFullYear();
        });
        const monthTotal = monthAudits.reduce((sum, a) => sum + (a.total_score || 0), 0);
        const monthMax = monthAudits.reduce((sum, a) => sum + (a.max_possible_score || 0), 0);
        const monthScore = monthMax > 0 ? Math.round((monthTotal / monthMax) * 100) : 0;
        monthlyComparison.push({ month: monthName, score: monthScore });
      }

      // Generate alerts
      const delayedActions = allActions.filter(action => {
        const status = (action.status || '').toString().toLowerCase();
        const isClosed = status === 'closed' || status === 'completed';
        if (isClosed) return false;
        if (!action.target_date) return false;
        try {
          const target = new Date(action.target_date);
          target.setHours(0, 0, 0, 0);
          return target < today;
        } catch (e) {
          return false;
        }
      });

      const alerts = [];
      if (delayedActions.length > 0) {
        alerts.push({
          type: 'warning' as const,
          message: `${delayedActions.length} aksiyon hedef tarihini geçti`,
          date: format(new Date(), 'yyyy-MM-dd'),
        });
      }
      if (topAreas.length > 0 && topAreas[0].level === '5S') {
        alerts.push({
          type: 'success' as const,
          message: `${topAreas[0].name} alanı 5S seviyesine ulaştı`,
          date: format(new Date(), 'yyyy-MM-dd'),
        });
      }
      if (totalAudits > 0) {
        alerts.push({
          type: 'info' as const,
          message: `Bu ay ${totalAudits} denetim tamamlandı`,
          date: format(new Date(), 'yyyy-MM-dd'),
        });
      }

      // Determine improvement trend
      let improvementTrend: 'up' | 'down' | 'stable' = 'stable';
      if (monthlyComparison.length >= 2) {
        const lastMonth = monthlyComparison[monthlyComparison.length - 1].score;
        const prevMonth = monthlyComparison[monthlyComparison.length - 2].score;
        if (lastMonth > prevMonth) improvementTrend = 'up';
        else if (lastMonth < prevMonth) improvementTrend = 'down';
      }

      // Calculate department trends (monthly average scores per department)
      const departmentTrendsMap: Record<string, Record<string, number[]>> = {};
      audits.forEach(audit => {
        const deptName = audit.department_name || 'Bilinmiyor';
        const auditDate = audit.audit_date ? new Date(audit.audit_date) : new Date(audit.created_at);
        const monthKey = `${auditDate.getFullYear()}-${String(auditDate.getMonth() + 1).padStart(2, '0')}`;
        const score = audit.max_possible_score > 0 
          ? Math.round((audit.total_score / audit.max_possible_score) * 100) 
          : 0;
        
        if (!departmentTrendsMap[deptName]) {
          departmentTrendsMap[deptName] = {};
        }
        if (!departmentTrendsMap[deptName][monthKey]) {
          departmentTrendsMap[deptName][monthKey] = [];
        }
        departmentTrendsMap[deptName][monthKey].push(score);
      });

      const departmentTrends = Object.entries(departmentTrendsMap).map(([department, monthlyScores]) => {
        const monthlyData = Object.entries(monthlyScores)
          .map(([monthKey, scores]) => {
            const [year, month] = monthKey.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            const monthName = format(date, 'MMM yyyy', { locale: tr });
            const averageScore = scores.length > 0 
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
              : 0;
            return { month: monthName, monthKey, averageScore };
          })
          .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
        
        return { department, monthlyData };
      });

      const reportData: ReportData = {
        dashboardStats: {
          totalAudits,
          publishedAudits,
          draftAudits,
          totalActions,
          openActions,
          averageScore,
          improvementTrend,
          activeDepartments,
          activeUsers,
          completionRate,
        },
        
        recentAudits,
        upcomingActions,
        alerts,
        topAreas,
        highestScores,
        lowestScores,
        departmentScores,
        department5SBreakdown,
        topPerformers,
        top3Departments,
        scoreDistribution,
        actionsByPriority,
        weeklyProgress,
        departmentStatistics,
        monthlyComparison,
        departmentTrends,
      };
      
      setReportData(reportData);
    } catch (error) {
      console.error('Report data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'info';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp sx={{ color: 'success.main', fontSize: '1rem' }} />;
      case 'down': return <TrendingDown sx={{ color: 'error.main', fontSize: '1rem' }} />;
      default: return <span style={{ fontSize: '0.8rem' }}>→</span>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Yüksek': return 'error';
      case 'Orta': return 'warning';
      case 'Düşük': return 'info';
      default: return 'default';
    }
  };

  const handleExport = () => {
    console.log('Exporting reports...');
  };

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ py: 1, px: 2, width: '100%' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
            Raporlar yükleniyor...
          </Typography>
        </Box>
        <LinearProgress />
      </Container>
    );
  }

  if (!reportData) {
    return (
      <Container maxWidth={false} sx={{ py: 1, px: 2, width: '100%' }}>
        <Typography variant="h6" color="error" sx={{ fontSize: '1rem' }}>
          Rapor verileri yüklenemedi
        </Typography>
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
              <Assessment fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                5S Denetim Raporları & İstatistikleri
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Detaylı analiz, performans takibi ve dashboard verileri • {format(new Date(), 'dd MMMM yyyy', { locale: tr })}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ fontSize: '0.8rem' }}>Bölüm</InputLabel>
              <Select
                value={selectedDepartment}
                label="Bölüm"
                onChange={(e) => setSelectedDepartment(e.target.value)}
                sx={{ fontSize: '0.8rem' }}
              >
                <MenuItem value="all">Tümü</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id || dept.Id} value={dept.id || dept.Id}>
                    {dept.name || dept.Name || ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<GetApp />}
              size="small"
              onClick={handleExport}
              sx={{ fontSize: '0.7rem' }}
            >
              Excel
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {reportData.alerts.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {reportData.alerts.map((alert, index) => (
                <Alert
                  key={index}
                  severity={alert.type}
                  sx={{ 
                    flex: '1 1 300px', 
                    minWidth: 250,
                    fontSize: '0.75rem',
                    '& .MuiAlert-message': { fontSize: '0.75rem' }
                  }}
                  icon={<Notifications fontSize="small" />}
                >
                  {alert.message}
                </Alert>
              ))}
            </Box>
          </Box>
        )}

        {/* Dashboard Stats - Simplified */}
        <Card sx={{ mb: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}>
              📊 Genel İstatistikler
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 150px', minWidth: 120, textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <Assignment sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Tooltip 
                    title="Tüm denetimlerin toplam sayısı. Yayınlanan ve taslak denetimler dahil."
                    arrow
                  >
                    <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }}>
                      <InfoOutlined sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="h5" fontWeight={700} sx={{ fontSize: '1.2rem', mb: 0.5 }}>
                  {reportData.dashboardStats.totalAudits}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                  Toplam Denetim
                </Typography>
                <Box sx={{ mt: 1, fontSize: '0.6rem', color: 'text.secondary' }}>
                  {reportData.dashboardStats.publishedAudits} Yayın • {reportData.dashboardStats.draftAudits} Taslak
                </Box>
              </Box>

              <Box sx={{ flex: '1 1 150px', minWidth: 120, textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <Schedule sx={{ fontSize: 32, color: 'warning.main' }} />
                  <Tooltip 
                    title="Henüz kapatılmamış aksiyonların sayısı. Toplam aksiyon sayısına göre oranı gösterilir."
                    arrow
                  >
                    <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }}>
                      <InfoOutlined sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="h5" fontWeight={700} sx={{ fontSize: '1.2rem', mb: 0.5 }}>
                  {reportData.dashboardStats.openActions}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                  Açık Aksiyon
                </Typography>
                <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem', mt: 0.5, color: 'text.secondary' }}>
                  / {reportData.dashboardStats.totalActions} toplam
                </Typography>
              </Box>

              <Box sx={{ flex: '1 1 150px', minWidth: 120, textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <Assessment sx={{ fontSize: 32, color: 'success.main' }} />
                  <Tooltip 
                    title="Tüm denetimlerin toplam puanının, maksimum mümkün puana bölünmesiyle hesaplanan ortalama yüzde. (Toplam Puan / Maksimum Puan) × 100"
                    arrow
                  >
                    <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }}>
                      <InfoOutlined sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: '1.2rem' }}>
                    %{reportData.dashboardStats.averageScore}
                  </Typography>
                  {getTrendIcon(reportData.dashboardStats.improvementTrend)}
                </Box>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                  Ortalama Puan
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={reportData.dashboardStats.averageScore}
                  sx={{ mt: 1, height: 4, borderRadius: 2 }}
                />
              </Box>

              <Box sx={{ flex: '1 1 120px', minWidth: 100, textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <Business sx={{ fontSize: 32, color: 'info.main' }} />
                  <Tooltip 
                    title="En az bir denetim yapılmış olan bölümlerin sayısı."
                    arrow
                  >
                    <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }}>
                      <InfoOutlined sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="h5" fontWeight={700} sx={{ fontSize: '1.2rem', mb: 0.5 }}>
                  {reportData.dashboardStats.activeDepartments}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                  Aktif Bölüm
                </Typography>
              </Box>

              <Box sx={{ flex: '1 1 120px', minWidth: 100, textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <People sx={{ fontSize: 32, color: 'secondary.main' }} />
                  <Tooltip 
                    title="En az bir denetim yapmış olan kullanıcıların sayısı."
                    arrow
                  >
                    <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }}>
                      <InfoOutlined sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="h5" fontWeight={700} sx={{ fontSize: '1.2rem', mb: 0.5 }}>
                  {reportData.dashboardStats.activeUsers}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                  Aktif Kullanıcı
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Top 3 Areas and Departments - Side by Side */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {/* Top 3 Areas - Half Width */}
          <Card sx={{ flex: '1 1 300px', minWidth: 250 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Star sx={{ color: 'warning.main', mr: 1, fontSize: '1.2rem' }} />
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                🏆 En Başarılı 3 Alan
              </Typography>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ 
                    bgcolor: 'grey.100', 
                    '& .MuiTableCell-root': { 
                      color: 'black !important', 
                      fontWeight: '600 !important',
                      borderBottom: '1px solid #ddd'
                    } 
                  }}>
                    <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Sıra</TableCell>
                    <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Alan</TableCell>
                    <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Puan</TableCell>
                    <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Seviye</TableCell>
                    <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.topAreas.map((area, index) => (
                    <TableRow key={area.name} hover>
                      <TableCell>
                        <Chip
                          label={index + 1}
                          size="small"
                          color={index === 0 ? 'warning' : 'default'}
                          sx={{ fontSize: '0.6rem', height: 20, width: 24 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          {area.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="success.main" sx={{ fontSize: '0.8rem' }}>
                          %{area.score}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={area.level}
                          size="small"
                          color={getScoreColor(area.score)}
                          sx={{ fontSize: '0.6rem', height: 18 }}
                        />
                      </TableCell>
                      <TableCell>
                        {getTrendIcon(area.trend)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

          {/* Top 3 Departments - Half Width */}
          <Card sx={{ flex: '1 1 300px', minWidth: 250 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Business sx={{ color: 'success.main', mr: 1, fontSize: '1.2rem' }} />
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  🏆 En Başarılı 3 Bölüm
                </Typography>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ 
                      bgcolor: 'grey.100', 
                      '& .MuiTableCell-root': { 
                        color: 'black !important', 
                        fontWeight: '600 !important',
                        borderBottom: '1px solid #ddd'
                      } 
                    }}>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Sıra</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Bölüm</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Ortalama Puan</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Seviye</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.top3Departments.map((dept, index) => (
                      <TableRow key={dept.name} hover>
                        <TableCell>
                          <Chip
                            label={index + 1}
                            size="small"
                            color={index === 0 ? 'warning' : 'default'}
                            sx={{ fontSize: '0.6rem', height: 20, width: 24 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            {dept.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="success.main" sx={{ fontSize: '0.8rem' }}>
                            %{dept.score}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={dept.level}
                            size="small"
                            color={getScoreColor(dept.score)}
                            sx={{ fontSize: '0.6rem', height: 18 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Department 5S Breakdown Table */}
        <Card sx={{ mb: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}>
              📋 Bölüm Bazlı 5S Kırılım Tablosu
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ 
                    bgcolor: 'grey.100', 
                    '& .MuiTableCell-root': { 
                      color: 'black !important', 
                      fontWeight: '600 !important',
                      borderBottom: '1px solid #ddd'
                    } 
                  }}>
                    <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Bölüm</TableCell>
                    <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>1S - Seiri</TableCell>
                    <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>2S - Seiton</TableCell>
                    <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>3S - Seiso</TableCell>
                    <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>4S - Seiketsu</TableCell>
                    <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>5S - Shitsuke</TableCell>
                    <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Toplam</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.department5SBreakdown.map((dept) => (
                    <TableRow key={dept.department} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {dept.department}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`%${dept.seiri}`}
                          size="small"
                          color={getScoreColor(dept.seiri)}
                          sx={{ fontSize: '0.6rem', height: 18, minWidth: 45 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`%${dept.seiton}`}
                          size="small"
                          color={getScoreColor(dept.seiton)}
                          sx={{ fontSize: '0.6rem', height: 18, minWidth: 45 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`%${dept.seiso}`}
                          size="small"
                          color={getScoreColor(dept.seiso)}
                          sx={{ fontSize: '0.6rem', height: 18, minWidth: 45 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`%${dept.seiketsu}`}
                          size="small"
                          color={getScoreColor(dept.seiketsu)}
                          sx={{ fontSize: '0.6rem', height: 18, minWidth: 45 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`%${dept.shitsuke}`}
                          size="small"
                          color={getScoreColor(dept.shitsuke)}
                          sx={{ fontSize: '0.6rem', height: 18, minWidth: 45 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontSize: '0.8rem' }}>
                          %{dept.total}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Action Status & Department Performance Row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {/* Actions by Priority */}
          <Card sx={{ flex: '1 1 300px', minWidth: 400 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShowChart sx={{ color: 'warning.main', mr: 1, fontSize: '1.2rem' }} />
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    🎯 Aksiyon Durumu
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <FormControl size="small" sx={{ minWidth: 70 }}>
                    <Select
                      value={actionStatusFilter}
                      onChange={(e) => setActionStatusFilter(e.target.value)}
                      displayEmpty
                      sx={{ fontSize: '0.7rem', height: 28 }}
                    >
                      <MenuItem value="all" sx={{ fontSize: '0.7rem' }}>Tümü</MenuItem>
                      <MenuItem value="open" sx={{ fontSize: '0.7rem' }}>Açık</MenuItem>
                      <MenuItem value="closed" sx={{ fontSize: '0.7rem' }}>Kapalı</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                      value={actionDepartmentFilter}
                      onChange={(e) => setActionDepartmentFilter(e.target.value)}
                      displayEmpty
                      sx={{ fontSize: '0.7rem', height: 28 }}
                    >
                      <MenuItem value="all" sx={{ fontSize: '0.7rem' }}>Tüm Bölümler</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id || dept.Id} value={dept.id || dept.Id} sx={{ fontSize: '0.7rem' }}>
                          {dept.name || dept.Name || ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(() => {
                  // Filter actionsByPriority based on filters
                  let filteredActions = reportData.actionsByPriority;
                  
                  // Apply department filter if needed
                  if (actionDepartmentFilter !== 'all') {
                    // This would require recalculating based on filtered actions
                    // For now, we'll show all but this should be implemented properly
                  }
                  
                  // Apply status filter if needed
                  if (actionStatusFilter !== 'all') {
                    // This would require recalculating based on filtered actions
                    // For now, we'll show all but this should be implemented properly
                  }
                  
                  return filteredActions.map((item) => (
                    <Box key={item.priority} sx={{ p: 1.5, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip
                          label={item.priority}
                          size="small"
                          color={getPriorityColor(item.priority) === 'default' ? 'primary' : getPriorityColor(item.priority) as any}
                          sx={{ fontSize: '0.6rem', height: 18 }}
                        />
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {item.completed}/{item.count}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={item.count > 0 ? (item.completed / item.count) * 100 : 0}
                        sx={{ height: 4, borderRadius: 2 }}
                        color={getPriorityColor(item.priority) === 'default' ? 'primary' : getPriorityColor(item.priority) as any}
                      />
                    </Box>
                  ));
                })()}
              </Box>
            </CardContent>
          </Card>

          {/* Department Trends */}
          <Card sx={{ flex: '1 1 300px', minWidth: 400 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Timeline sx={{ color: 'primary.main', mr: 1, fontSize: '1.2rem' }} />
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    📈 Bölüm Bazlı Trend
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={trendPeriod}
                    onChange={(e) => setTrendPeriod(e.target.value as 3 | 6 | 9 | 12)}
                    sx={{ fontSize: '0.7rem', height: 28 }}
                  >
                    <MenuItem value={3} sx={{ fontSize: '0.7rem' }}>3 Ay</MenuItem>
                    <MenuItem value={6} sx={{ fontSize: '0.7rem' }}>6 Ay</MenuItem>
                    <MenuItem value={9} sx={{ fontSize: '0.7rem' }}>9 Ay</MenuItem>
                    <MenuItem value={12} sx={{ fontSize: '0.7rem' }}>12 Ay</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ height: 300, position: 'relative' }}>
                {reportData.departmentTrends.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Veri bulunamadı
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {reportData.departmentTrends.slice(0, 5).map((deptTrend) => {
                      // Filter data by selected period
                      const filteredData = deptTrend.monthlyData.slice(-trendPeriod);
                      if (filteredData.length === 0) return null;
                      
                      const maxScore = Math.max(...filteredData.map(d => d.averageScore), 100);
                      const minScore = Math.min(...filteredData.map(d => d.averageScore), 0);
                      const scoreRange = maxScore - minScore || 100;
                      
                      // Calculate trend (up/down/stable)
                      let trend: 'up' | 'down' | 'stable' = 'stable';
                      if (filteredData.length >= 2) {
                        const first = filteredData[0].averageScore;
                        const last = filteredData[filteredData.length - 1].averageScore;
                        if (last > first + 2) trend = 'up';
                        else if (last < first - 2) trend = 'down';
                      }
                      
                      return (
                        <Box key={deptTrend.department} sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                              {deptTrend.department}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                                {filteredData[filteredData.length - 1]?.averageScore || 0}%
                              </Typography>
                              {getTrendIcon(trend)}
                            </Box>
                          </Box>
                          <Box sx={{ position: 'relative', height: 40, bgcolor: 'grey.50', borderRadius: 1, p: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: 0.5 }}>
                              {filteredData.map((data, idx) => {
                                const height = scoreRange > 0 ? ((data.averageScore - minScore) / scoreRange) * 100 : 50;
                                return (
                                  <Tooltip key={idx} title={`${data.month}: %${data.averageScore}`} arrow>
                                    <Box
                                      sx={{
                                        flex: 1,
                                        height: `${Math.max(height, 5)}%`,
                                        bgcolor: trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'warning.main',
                                        borderRadius: 0.5,
                                        minHeight: 4,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          opacity: 0.8,
                                          transform: 'scaleY(1.1)',
                                        },
                                      }}
                                    />
                                  </Tooltip>
                                );
                              })}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Department Statistics & Comparison Row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {/* Department Statistics */}
          <Card sx={{ flex: '1 1 300px', minWidth: 400 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Business sx={{ color: 'info.main', mr: 1, fontSize: '1.2rem' }} />
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    📊 Bölüm İstatistikleri
                  </Typography>
                </Box>
              </Box>
              
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: 'grey.100' }}>Bölüm</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: 'grey.100' }}>Toplam Denetim</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: 'grey.100' }}>Devam Eden</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: 'grey.100' }}>Açık Denetim</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: 'grey.100' }}>Açık Aksiyon</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: 'grey.100' }}>Kritik Aksiyon</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.departmentStatistics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Veri bulunamadı
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportData.departmentStatistics.map((dept) => (
                        <TableRow key={dept.department} hover>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{dept.department}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.75rem' }}>
                            <Chip label={dept.totalAudits} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.75rem' }}>
                            <Chip label={dept.ongoingAudits} size="small" color="info" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.75rem' }}>
                            <Chip label={dept.openAudits} size="small" color="warning" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.75rem' }}>
                            <Chip label={dept.openActions} size="small" color="secondary" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.75rem' }}>
                            <Chip 
                              label={dept.criticalActions} 
                              size="small" 
                              color={dept.criticalActions > 0 ? 'error' : 'default'} 
                              variant="outlined" 
                              sx={{ fontSize: '0.65rem', height: 20 }} 
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

          {/* Monthly Comparison */}
          <Card sx={{ flex: '1 1 300px', minWidth: 280 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DateRange sx={{ color: 'info.main', mr: 1, fontSize: '1.2rem' }} />
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    📊 Aylık Performans Karşılaştırması
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <FormControl size="small" sx={{ minWidth: 70 }}>
                    <Select
                      value="all"
                      displayEmpty
                      sx={{ fontSize: '0.7rem', height: 28 }}
                    >
                      <MenuItem value="all" sx={{ fontSize: '0.7rem' }}>Tümü</MenuItem>
                      <MenuItem value="1s" sx={{ fontSize: '0.7rem' }}>1S - Seiri</MenuItem>
                      <MenuItem value="2s" sx={{ fontSize: '0.7rem' }}>2S - Seiton</MenuItem>
                      <MenuItem value="3s" sx={{ fontSize: '0.7rem' }}>3S - Seiso</MenuItem>
                      <MenuItem value="4s" sx={{ fontSize: '0.7rem' }}>4S - Seiketsu</MenuItem>
                      <MenuItem value="5s" sx={{ fontSize: '0.7rem' }}>5S - Shitsuke</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                      value="all"
                      displayEmpty
                      sx={{ fontSize: '0.7rem', height: 28 }}
                    >
                      <MenuItem value="all" sx={{ fontSize: '0.7rem' }}>Tüm Bölümler</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id || dept.Id} value={dept.id || dept.Id} sx={{ fontSize: '0.7rem' }}>
                          {dept.name || dept.Name || ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              <Box sx={{ height: 150, display: 'flex', alignItems: 'end', gap: 2, px: 2 }}>
                {reportData.monthlyComparison.map((month, index) => {
                  const height = (month.score / 100) * 120;
                  const isLatest = index === reportData.monthlyComparison.length - 1;
                  const colors = ['#4caf50', '#8bc34a', '#cddc39', '#2196f3'];
                  const barColor = isLatest ? '#1976d2' : colors[index % colors.length];
                  
                  return (
                    <Box key={month.month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 120, justifyContent: 'flex-end' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 700, mb: 0.5, color: barColor }}>
                          %{month.score}
                        </Typography>
                        <Box
                          sx={{
                            height: Math.max(height, 12),
                            width: 24,
                            borderRadius: 2,
                            background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}DD 50%, ${barColor}AA 100%)`,
                            boxShadow: `0 4px 8px ${barColor}33`,
                            position: 'relative',
                            transition: 'all 0.4s ease',
                            '&:hover': {
                              transform: 'translateY(-3px) scale(1.02)',
                              boxShadow: `0 8px 16px ${barColor}44`,
                            },
                            '&::before': isLatest ? {
                              content: '""',
                              position: 'absolute',
                              top: -2,
                              left: -2,
                              right: -2,
                              bottom: -2,
                              borderRadius: 3,
                              background: `linear-gradient(45deg, ${barColor}33, transparent)`,
                              zIndex: -1,
                            } : {}
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', mt: 1.5, fontWeight: isLatest ? 600 : 500, color: isLatest ? 'primary.main' : 'text.primary' }}>
                        {month.month}
                      </Typography>
                      {isLatest && (
                        <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'primary.main', fontWeight: 600 }}>
                          Bu Ay
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity & Upcoming Actions */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {/* Recent Audits */}
          <Card sx={{ flex: '1 1 400px', minWidth: 300 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Timeline sx={{ color: 'primary.main', mr: 1, fontSize: '1.2rem' }} />
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    🕒 Son Denetimler
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  href="/audits"
                  sx={{ fontSize: '0.7rem' }}
                >
                  Tümünü Gör
                </Button>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Bölüm</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Puan</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Seviye</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Tarih</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.recentAudits.map((audit) => (
                      <TableRow key={audit.id} hover sx={{ cursor: 'pointer' }} onClick={() => window.location.href = `/audits/${audit.id}`}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                            {audit.department}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                            {audit.auditor}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="primary.main" sx={{ fontSize: '0.8rem' }}>
                            %{audit.score}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={audit.level}
                            size="small"
                            color={getScoreColor(audit.score)}
                            sx={{ fontSize: '0.6rem', height: 18 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                            {format(new Date(audit.date), 'dd/MM')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Upcoming Actions */}
          <Card sx={{ flex: '1 1 400px', minWidth: 300 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ color: 'warning.main', mr: 1, fontSize: '1.2rem' }} />
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    ⏰ Yaklaşan Aksiyonlar
                  </Typography>
                  <Chip
                    label={reportData.upcomingActions.length}
                    size="small"
                    color="warning"
                    sx={{ fontSize: '0.6rem', height: 18, ml: 1 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <FormControl size="small" sx={{ minWidth: 70 }}>
                    <Select
                      value="all"
                      displayEmpty
                      sx={{ fontSize: '0.7rem', height: 28 }}
                    >
                      <MenuItem value="all" sx={{ fontSize: '0.7rem' }}>Tüm Öncelik</MenuItem>
                      <MenuItem value="high" sx={{ fontSize: '0.7rem' }}>Yüksek</MenuItem>
                      <MenuItem value="medium" sx={{ fontSize: '0.7rem' }}>Orta</MenuItem>
                      <MenuItem value="low" sx={{ fontSize: '0.7rem' }}>Düşük</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                      value="all"
                      displayEmpty
                      sx={{ fontSize: '0.7rem', height: 28 }}
                    >
                      <MenuItem value="all" sx={{ fontSize: '0.7rem' }}>Tüm Bölümler</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id || dept.Id} value={dept.id || dept.Id} sx={{ fontSize: '0.7rem' }}>
                          {dept.name || dept.Name || ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ 
                      bgcolor: 'grey.100', 
                      '& .MuiTableCell-root': { 
                        color: 'black !important', 
                        fontWeight: '600 !important',
                        borderBottom: '1px solid #ddd'
                      } 
                    }}>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Öncelik</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Açıklama</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Sorumlu</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Bölüm</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Hedef Tarih</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.upcomingActions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Yaklaşan aksiyon bulunmamaktadır.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportData.upcomingActions.map((action) => (
                      <TableRow key={action.id} hover>
                        <TableCell>
                          <Chip
                            label={action.priority}
                            size="small"
                            color={getPriorityColor(action.priority) as any}
                            sx={{ fontSize: '0.6rem', height: 20, minWidth: 50 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            {action.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                            {action.responsible}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                            {action.department}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={format(new Date(action.target_date), 'dd/MM/yyyy')}
                            size="small"
                            color={new Date(action.target_date) < new Date() ? 'error' : 'default'}
                            variant="outlined"
                            sx={{ fontSize: '0.6rem', height: 20 }}
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

        {/* Score Tables */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {/* Highest Scores */}
          <Card sx={{ flex: '1 1 400px', minWidth: 300 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ color: 'success.main', mr: 1, fontSize: '1.2rem' }} />
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  🏅 En Yüksek Puanlı Alanlar
                </Typography>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ 
                      bgcolor: 'grey.100', 
                      '& .MuiTableCell-root': { 
                        color: 'black !important', 
                        fontWeight: '600 !important',
                        borderBottom: '1px solid #ddd'
                      } 
                    }}>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Sıra</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Bölüm/Alan</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Puan</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Tarih</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.highestScores.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Chip
                            label={index + 1}
                            size="small"
                            color={index < 3 ? 'success' : 'default'}
                            sx={{ fontSize: '0.6rem', height: 18, width: 24 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                            {item.department}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                            {item.area}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="success.main" sx={{ fontSize: '0.8rem' }}>
                            %{item.score}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                            {new Date(item.date).toLocaleDateString('tr-TR')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Lowest Scores */}
          <Card sx={{ flex: '1 1 400px', minWidth: 300 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning sx={{ color: 'error.main', mr: 1, fontSize: '1.2rem' }} />
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  ⚠️ Gelişim Gereken Alanlar
                </Typography>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ 
                    bgcolor: 'grey.100', 
                    '& .MuiTableCell-root': { 
                      color: 'black !important', 
                      fontWeight: '600 !important',
                      borderBottom: '1px solid #ddd'
                    } 
                  }}>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Sıra</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Bölüm/Alan</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Puan</TableCell>
                      <TableCell sx={{ fontWeight: '600 !important', fontSize: '0.7rem', color: 'black !important' }}>Tarih</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.lowestScores.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Chip
                            label={index + 1}
                            size="small"
                            color={index < 3 ? 'error' : 'default'}
                            sx={{ fontSize: '0.6rem', height: 18, width: 24 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                            {item.department}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                            {item.area}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="error.main" sx={{ fontSize: '0.8rem' }}>
                            %{item.score}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                            {new Date(item.date).toLocaleDateString('tr-TR')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Fade>
  );
};

export default ReportsPage;