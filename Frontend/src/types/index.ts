// User types
export interface User {
  id: number;
  email: string;
  name: string;
  username?: string; // Kullanıcı adı
  Username?: string; // PascalCase from backend
  sicil?: string; // Sicil numarası
  Sicil?: string; // PascalCase from backend
  role: string; // Role name from Roller table (Ad column)
  roleId?: number; // RoleId from backend
  Role?: string; // PascalCase from backend
  RoleId?: number; // PascalCase from backend
  sector?: string; // Sektör (örn: UGES)
  Sector?: string; // PascalCase from backend
  sectorId?: number;
  SectorId?: number;
  directorate?: string; // Direktörlük (örn: Üretim Direktörlüğü)
  Directorate?: string; // PascalCase from backend
  directorateId?: number;
  DirectorateId?: number;
  department_id?: number;
  departmentId?: number; // PascalCase from backend
  DepartmentId?: number; // PascalCase from backend
  department_name?: string;
  DepartmentName?: string; // PascalCase from backend
  is_active: boolean;
  isActive?: boolean; // PascalCase from backend
  last_login?: string;
  lastLogin?: string; // PascalCase from backend
  created_at: string;
  createdAt?: string; // PascalCase from backend
  updated_at?: string;
  updatedAt?: string; // PascalCase from backend
  isDemo?: boolean; // Demo user flag
}

// Department types
export interface Department {
  id: number;
  name: string;
  sector?: string; // Sektör (örn: UGES)
  sectorId?: number; // Sektör ID (for create/update operations)
  directorate?: string; // Direktörlük (örn: Üretim Direktörlüğü)
  directorateId?: number; // Direktörlük ID (for create/update operations)
  description?: string;
  is_active?: boolean; // Made optional for mock data compatibility
  isActive?: boolean; // PascalCase from backend
  user_count?: number;
  userCount?: number; // PascalCase from backend
  audit_count?: number;
  auditCount?: number; // PascalCase from backend
  created_at: string;
  createdAt?: string; // PascalCase from backend
  updated_at?: string;
  updatedAt?: string; // PascalCase from backend
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  questions?: Question[];
  created_at: string;
}

// Question types
export interface Question {
  id: number;
  categoryId?: number;
  category_id?: number;
  category?: string; // Added for mock data compatibility
  categoryName?: string;
  text: string;
  sector?: string; // Sektör
  directorate?: string; // Direktörlük
  department?: string; // Bölüm
  area?: string; // Alan
  order?: number; // Changed from order_index to order for mock data compatibility
  orderIndex?: number;
  order_index?: number;
  pointsHigh?: number;
  points_high?: number;
  pointsMedium?: number;
  points_medium?: number;
  pointsLow?: number;
  points_low?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Audit types
export interface Audit {
  id: number;
  department_id: number;
  auditor_id: number;
  audit_date: string;
  notes?: string;
  status: 'draft' | 'published' | 'planlandı' | 'devam' | 'tamamlandı' | 'denetlendi';
  total_score: number;
  max_possible_score: number;
  level_achieved?: string;
  department_name: string;
  area_id?: number; // Alan ID
  area_name?: string; // Alan Adı
  area_supervisor?: string; // Alan Sorumlusu
  auditor_name: string;
  auditor_email?: string;
  total_actions?: number;
  open_actions?: number;
  closed_actions?: number;
  created_at: string;
  updated_at?: string;
  sector_name?: string;
  directorate_name?: string;
}

// Audit Response types
export interface AuditResponse {
  id: number;
  audit_id: number;
  question_id: number;
  question_text: string;
  category: string;
  score: number;
  notes?: string;
  image_url?: string;
  response: 'high' | 'medium' | 'low';
  points_awarded: number;
  category_name?: string;
  category_order?: number;
  created_at: string;
}

// Action types
export interface Action {
  id: number;
  audit_id: number;
  auditId?: number; // PascalCase from backend
  question_id: number;
  questionId?: number; // PascalCase from backend
  image_path?: string;
  imagePath?: string; // PascalCase from backend
  evidence_image_path?: string; // Kanıt görseli (alan sorumlusunun yüklediği)
  evidenceImagePath?: string; // PascalCase from backend
  description?: string;
  suggested_activity?: string;
  suggestedActivity?: string; // PascalCase from backend
  planned_activity?: string;
  plannedActivity?: string; // PascalCase from backend
  target_date?: string;
  targetDate?: string; // PascalCase from backend
  responsible_person_id?: number;
  responsiblePersonId?: number; // PascalCase from backend
  responsible_person_name?: string;
  responsiblePersonName?: string; // PascalCase from backend
  responsiblePersonUser?: User;
  responsible_person?: string; // Legacy
  responsiblePerson?: string; // PascalCase from backend
  status: 'open' | 'in_progress' | 'closed' | 'pending_approval' | 'Open' | 'InProgress' | 'Closed' | 'PendingApproval';
  statusText?: string; // Turkish status label from backend
  status_text?: string; // snake_case alternative
  priority?: 'Düşük' | 'Orta' | 'Yüksek';
  question_text?: string;
  questionText?: string; // PascalCase from backend
  category?: string; // Soru kategorisi (S1-S5)
  category_name?: string;
  categoryName?: string; // PascalCase from backend
  departmentName?: string; // From backend ActionDto
  department_id?: number;
  departmentId?: number; // PascalCase from backend
  created_at: string;
  createdAt?: string; // PascalCase from backend
  updated_at?: string;
  updatedAt?: string; // PascalCase from backend
  images?: ActionImage[]; // New images array from AksiyonGorselleri table
}

export interface ActionImage {
  id: number;
  actionId: number;
  imagePath: string;
  imageType: 'Aksiyon' | 'Kanit';
  createdAt: string;
}

export interface ActionHistory {
  id: number;
  actionId: number;
  statusFrom: number | string;
  statusTo: number | string;
  changedBy?: string;
  comment?: string;
  createdAt: string;
}

// Audit Action types (for detail view)
export interface AuditAction {
  id: number;
  audit_id: number;
  question_id: number;
  description: string;
  responsible_user_id: number;
  responsible_user_name: string;
  target_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'Düşük' | 'Orta' | 'Yüksek';
  created_at: string;
  completed_at?: string;
}

// Level Threshold types
export interface LevelThreshold {
  id: number;
  levelName: string;
  minPercentage: number;
  maxPercentage: number;
  sectorId?: number | null;
  sectorName?: string | null;
  createdAt: string;
  updatedAt?: string;
}

// Settings types
export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  errors?: any[];
}

// Pagination types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

// Dashboard Stats types
export interface DashboardStats {
  totalAudits: number;
  publishedAudits: number;
  draftAudits: number;
  totalActions: number;
  openActions: number;
  averageScore: string;
  recentAudits: Audit[];
}

// Department Report types
export interface DepartmentReport {
  id: number;
  name: string;
  description?: string;
  latest_score: number;
  latest_max_score: number;
  current_level: string;
  last_audit_date?: string;
  percentage: number;
  total_audits: number;
  open_actions: number;
}

// Progress Data types
export interface ProgressData {
  audit_date: string;
  total_score: number;
  max_possible_score: number;
  level_achieved: string;
  percentage: number;
  auditor_name: string;
}

// Level Distribution types
export interface LevelDistribution {
  level: string;
  count: number;
}

// Action Statistics types
export interface ActionStatistics {
  statusDistribution: Array<{ status: string; count: number }>;
  departmentActions: Array<{
    department_name: string;
    total_actions: number;
    open_actions: number;
    in_progress_actions: number;
    closed_actions: number;
  }>;
  overdueActions: Array<{
    id: number;
    target_date: string;
    description?: string;
    responsible_person?: string;
    department_name: string;
    question_text: string;
  }>;
}

// Area types
export interface Area {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Announcement types
export interface Announcement {
  id: number;
  title: string;
  content: string;
  announcementDate: string;
  isActive: boolean;
  createdById?: number | null;
  createdAt: string;
  updatedAt?: string | null;
}

// Form types
export interface AuditFormData {
  department_id: number;
  audit_date: string;
  notes?: string;
}

export interface ResponseFormData {
  responses: Array<{
    question_id: number;
    response: 'high' | 'medium' | 'low';
  }>;
}

export interface ActionFormData {
  description?: string;
  suggested_activity?: string;
  planned_activity?: string;
  target_date?: string;
  responsible_person?: string;
  status?: 'open' | 'in_progress' | 'closed';
  image?: File;
}
