import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  User,
  Department,
  Area,
  Audit,
  Question,
  Category,
  Action,
  LevelThreshold,
  Setting,
  LoginRequest,
  LoginResponse,
  DashboardStats,
  DepartmentReport,
  ProgressData,
  LevelDistribution,
  ActionStatistics,
  AuditFormData,
  ResponseFormData,
  ActionFormData,
  Pagination,
  ApiResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // If data is FormData, remove Content-Type header to let browser set it with boundary
        if (config.data instanceof FormData) {
          // Remove Content-Type header - browser will set it automatically with boundary
          if (config.headers) {
            const headers = config.headers as any;
            // Remove from all possible header locations
            delete headers['Content-Type'];
            delete headers['content-type'];
            if (headers.common) {
              delete headers.common['Content-Type'];
            }
            if (headers.post) {
              delete headers.post['Content-Type'];
            }
          }
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Check if error should be suppressed (for getUsers 403/401)
        const shouldSuppress = error.config?._suppressError || 
                               (error.response?.status === 403 && error.config?.url?.includes('/users')) ||
                               (error.response?.status === 401 && error.config?.url?.includes('/users'));
        
        // Mark 403/401 errors as silent to prevent console logging
        if (error.response?.status === 403 || error.response?.status === 401) {
          error._silent = true;
        }
        
        // Only log non-403/401 errors and non-suppressed errors to avoid spam in console
        if (!error._silent && !shouldSuppress) {
          console.error('API Error:', error);
        }
        
        if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
          console.error('Network connection failed');
          error.message = 'Network Error: Cannot connect to server';
        }
        
        if (error.response?.status === 401 && !error._skipAuthRedirect) {
          // Token expired or invalid (but skip if marked to skip)
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.api.get<{ user: User }>('/auth/me');
    return response.data;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    const response = await this.api.post<ApiResponse>('/auth/change-password', data);
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.api.post<ApiResponse>('/auth/logout');
    return response.data;
  }

  // Permissions endpoints
  async getMyPermissions(): Promise<any[]> {
    const response = await this.api.get<any[]>('/permissions/my-permissions');
    return response.data;
  }

  async canAccessPage(page: string): Promise<{ canAccess: boolean }> {
    const response = await this.api.get<{ canAccess: boolean }>(`/permissions/can-access-page/${page}`);
    return response.data;
  }

  async canAccessButton(page: string, button: string): Promise<{ canAccess: boolean }> {
    const response = await this.api.get<{ canAccess: boolean }>(`/permissions/can-access-button/${page}/${button}`);
    return response.data;
  }

  async getPagePermission(page: string): Promise<any> {
    const response = await this.api.get<any>(`/permissions/page/${page}`);
    return response.data;
  }

  // Permission CRUD endpoints (Admin only)
  async getAllPermissions(): Promise<any[]> {
    const response = await this.api.get<any[]>('/permissions/all');
    return response.data;
  }

  async getPermissionById(id: number): Promise<any> {
    const response = await this.api.get<any>(`/permissions/${id}`);
    return response.data;
  }

  async createPermission(data: any): Promise<any> {
    const response = await this.api.post<any>('/permissions', data);
    return response.data;
  }

  async updatePermission(id: number, data: any): Promise<any> {
    const response = await this.api.put<any>(`/permissions/${id}`, data);
    return response.data;
  }

  async deletePermission(id: number): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/permissions/${id}`);
    return response.data;
  }

  async getRoles(): Promise<{ id: number; name: string }[]> {
    const response = await this.api.get<{ id: number; name: string }[]>('/permissions/roles');
    return response.data;
  }

  async canViewYetkilerTab(): Promise<{ canView: boolean }> {
    const response = await this.api.get<{ canView: boolean }>('/permissions/can-view-yetkiler-tab');
    return response.data;
  }

  // Users endpoints
  async getUsers(): Promise<User[]> {
    // No frontend restrictions - backend handles authorization
    try {
      const response = await this.api.get<User[]>('/users');
      return response.data;
    } catch (error: any) {
      // Re-throw errors - backend will handle authorization
      throw error;
    }
  }

  async getUser(id: number): Promise<{ user: User }> {
    const response = await this.api.get<{ user: User }>(`/users/${id}`);
    return response.data;
  }

  async createUser(data: Partial<User> & { password: string }): Promise<{ user: User; message: string }> {
    const response = await this.api.post<{ user: User; message: string }>('/users', data);
    return response.data;
  }

  async updateUser(id: number, data: Partial<User>): Promise<{ user: User; message: string }> {
    const response = await this.api.put<{ user: User; message: string }>(`/users/${id}`, data);
    return response.data;
  }

  async resetUserPassword(id: number, newPassword: string): Promise<ApiResponse> {
    const response = await this.api.post<ApiResponse>(`/users/${id}/reset-password`, { newPassword });
    return response.data;
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/users/${id}`);
    return response.data;
  }

  // Departments endpoints
  async getDepartments(): Promise<Department[]> {
    const response = await this.api.get<Department[]>('/departments');
    return response.data;
  }

  async getDepartment(id: number): Promise<{ 
    department: Department; 
    users: User[]; 
    recent_audits: Audit[] 
  }> {
    const response = await this.api.get(`/departments/${id}`);
    return response.data;
  }

  async createDepartment(data: Partial<Department>): Promise<{ department: Department; message: string }> {
    const response = await this.api.post<{ department: Department; message: string }>('/departments', data);
    return response.data;
  }

  async updateDepartment(id: number, data: Partial<Department>): Promise<{ department: Department; message: string }> {
    const response = await this.api.put<{ department: Department; message: string }>(`/departments/${id}`, data);
    return response.data;
  }

  async deleteDepartment(id: number): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/departments/${id}`);
    return response.data;
  }

  // Questions endpoints
  async getCategories(): Promise<{ categories: Category[] }> {
    const response = await this.api.get<{ categories: Category[] }>('/questions/categories');
    return response.data;
  }

  async getQuestionsByCategory(categoryId: number): Promise<{ questions: Question[] }> {
    const response = await this.api.get<{ questions: Question[] }>(`/questions/category/${categoryId}`);
    return response.data;
  }

  async createQuestion(data: Partial<Question>): Promise<{ question: Question; message: string }> {
    const response = await this.api.post<{ question: Question; message: string }>('/questions', data);
    return response.data;
  }

  async updateQuestion(id: number, data: Partial<Question>): Promise<{ question: Question; message: string }> {
    const response = await this.api.put<{ question: Question; message: string }>(`/questions/${id}`, data);
    return response.data;
  }

  async deleteQuestion(id: number): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/questions/${id}`);
    return response.data;
  }

  async createCategory(data: Partial<Category>): Promise<{ category: Category; message: string }> {
    const response = await this.api.post<{ category: Category; message: string }>('/questions/categories', data);
    return response.data;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<{ category: Category; message: string }> {
    const response = await this.api.put<{ category: Category; message: string }>(`/questions/categories/${id}`, data);
    return response.data;
  }

  // Audits endpoints
  async getAudits(params?: {
    page?: number;
    limit?: number;
    department_id?: number;
    status?: string;
    auditor_id?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<Audit[]> {
    const response = await this.api.get<Audit[]>('/audits', { params });
    return response.data;
  }

  async getAudit(id: number): Promise<{ 
    audit: Audit; 
    responses: any[]; 
    actions: Action[] 
  }> {
    const response = await this.api.get(`/audits/${id}`);
    return response.data;
  }

  async createAudit(data: AuditFormData): Promise<{ audit: Audit; message: string }> {
    const response = await this.api.post<{ audit: Audit; message: string }>('/audits', data);
    return response.data;
  }

  async createAuditPlan(data: {
    departmentId: number;
    auditorId: number;
    area?: string;
    areaSupervisor?: string;
    auditDate: string;
    notes?: string;
  }): Promise<Audit> {
    const response = await this.api.post<Audit>('/audits/plan', data);
    return response.data;
  }

  async publishAudit(auditId: number): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(`/audits/${auditId}/publish`);
    return response.data;
  }

  async getAllActions(): Promise<Action[]> {
    const response = await this.api.get<Action[]>('/Actions');
    return response.data;
  }

  async getActionsByAuditId(auditId: number): Promise<Action[]> {
    const response = await this.api.get<Action[]>(`/Actions/audit/${auditId}`);
    return response.data;
  }

  async getAuditResponsesByAuditId(auditId: number): Promise<Array<{ questionId: number; response: string }>> {
    const response = await this.api.get<Array<{ questionId: number; response: string }>>(`/AuditResponses/audit/${auditId}`);
    return response.data;
  }

  async getAuditDetailResponses(auditId: number): Promise<Array<{
    id: number;
    questionId: number;
    questionText?: string;
    categoryName?: string;
    response: string;
    pointsAwarded: number;
    imageUrls?: string[];
  }>> {
    const response = await this.api.get<Array<{
      id: number;
      questionId: number;
      questionText?: string;
      categoryName?: string;
      response: string;
      pointsAwarded: number;
      imageUrls?: string[];
    }>>(`/AuditResponses/audit/${auditId}`);
    return response.data;
  }

  async updateAudit(id: number, data: Partial<AuditFormData>): Promise<{ audit: Audit; message: string }> {
    const response = await this.api.put<{ audit: Audit; message: string }>(`/audits/${id}`, data);
    return response.data;
  }

  async submitAuditResponses(id: number, data: ResponseFormData): Promise<{
    message: string;
    totalScore: number;
    maxPossibleScore: number;
    percentage: string;
    levelAchieved: string;
    actionsCreated: number;
  }> {
    const response = await this.api.post(`/audits/${id}/responses`, data);
    return response.data;
  }

  async deleteAudit(id: number): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/audits/${id}`);
    return response.data;
  }

  // Reports endpoints
  async getDashboardStats(): Promise<{ stats: DashboardStats }> {
    const response = await this.api.get<{ stats: DashboardStats }>('/reports/dashboard');
    return response.data;
  }

  async getDepartmentReports(): Promise<{ departments: DepartmentReport[] }> {
    const response = await this.api.get<{ departments: DepartmentReport[] }>('/reports/departments');
    return response.data;
  }

  async getDepartmentProgress(id: number, months?: number): Promise<{ 
    department: Department; 
    progress: ProgressData[] 
  }> {
    const response = await this.api.get(`/reports/departments/${id}/progress`, { 
      params: { months } 
    });
    return response.data;
  }

  async getLevelDistribution(): Promise<{ levels: LevelDistribution[] }> {
    const response = await this.api.get<{ levels: LevelDistribution[] }>('/reports/levels');
    return response.data;
  }

  async getTopDepartments(limit?: number): Promise<{ departments: DepartmentReport[] }> {
    const response = await this.api.get<{ departments: DepartmentReport[] }>('/reports/top-departments', {
      params: { limit }
    });
    return response.data;
  }

  async getTrends(period?: string, months?: number): Promise<{ trends: any[] }> {
    const response = await this.api.get('/reports/trends', {
      params: { period, months }
    });
    return response.data;
  }

  async getActionStatistics(): Promise<ActionStatistics> {
    const response = await this.api.get<ActionStatistics>('/reports/actions');
    return response.data;
  }

  // Settings endpoints
  async getSettings(): Promise<{ settings: Record<string, any> }> {
    const response = await this.api.get<{ settings: Record<string, any> }>('/settings');
    return response.data;
  }

  async getLevelThresholds(): Promise<{ thresholds: LevelThreshold[] }> {
    const response = await this.api.get<{ thresholds: LevelThreshold[] }>('/questions/level-thresholds');
    return response.data;
  }

  async createLevelThreshold(data: Partial<LevelThreshold>): Promise<{ threshold: LevelThreshold; message: string }> {
    const response = await this.api.post<{ threshold: LevelThreshold; message: string }>('/questions/level-thresholds', data);
    return response.data;
  }

  async updateLevelThreshold(id: number, data: Partial<LevelThreshold>): Promise<{ threshold: LevelThreshold; message: string }> {
    const response = await this.api.put<{ threshold: LevelThreshold; message: string }>(`/questions/level-thresholds/${id}`, data);
    return response.data;
  }

  async deleteLevelThreshold(id: number): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/questions/level-thresholds/${id}`);
    return response.data;
  }

  async updateSetting(key: string, value: any): Promise<ApiResponse> {
    const response = await this.api.put<ApiResponse>(`/settings/${key}`, { value });
    return response.data;
  }

  async updateSettings(settings: Record<string, any>): Promise<ApiResponse> {
    const response = await this.api.put<ApiResponse>('/settings', { settings });
    return response.data;
  }

  async getSystemInfo(): Promise<{ stats: any }> {
    const response = await this.api.get('/settings/system-info');
    return response.data;
  }

  async backupSettings(): Promise<{ backup: any }> {
    const response = await this.api.get('/settings/backup');
    return response.data;
  }

  async restoreSettings(backup: any): Promise<ApiResponse> {
    const response = await this.api.post<ApiResponse>('/settings/restore', { backup });
    return response.data;
  }

  // Areas endpoints
  async getAreas(): Promise<Area[]> {
    const response = await this.api.get<Area[]>('/areas');
    return response.data;
  }

  async getAreasByDepartment(departmentId: number): Promise<Area[]> {
    const response = await this.api.get<Area[]>(`/areas/department/${departmentId}`);
    return response.data;
  }

  async getArea(id: number): Promise<Area> {
    const response = await this.api.get<Area>(`/areas/${id}`);
    return response.data;
  }

  async createArea(data: { departmentId: number; name: string; description?: string }): Promise<Area> {
    const response = await this.api.post<Area>('/areas', data);
    return response.data;
  }

  async updateArea(id: number, data: Partial<Area>): Promise<Area> {
    const response = await this.api.put<Area>(`/areas/${id}`, data);
    return response.data;
  }

  async deleteArea(id: number): Promise<void> {
    await this.api.delete(`/areas/${id}`);
  }


  // Sectors endpoints
  async getSectors(): Promise<any[]> {
    const response = await this.api.get<any[]>('/sectors');
    return response.data;
  }

  async getSector(id: number): Promise<any> {
    const response = await this.api.get<any>(`/sectors/${id}`);
    return response.data;
  }

  async createSector(data: { name: string; description?: string }): Promise<any> {
    const response = await this.api.post<any>('/sectors', data);
    return response.data;
  }

  async updateSector(id: number, data: { name: string; description?: string; isActive: boolean }): Promise<any> {
    const response = await this.api.put<any>(`/sectors/${id}`, data);
    return response.data;
  }

  async deleteSector(id: number): Promise<void> {
    await this.api.delete(`/sectors/${id}`);
  }

  // Directorates endpoints
  async getDirectorates(): Promise<any[]> {
    const response = await this.api.get<any[]>('/directorates');
    return response.data;
  }

  async getDirectorate(id: number): Promise<any> {
    const response = await this.api.get<any>(`/directorates/${id}`);
    return response.data;
  }

  async createDirectorate(data: { name: string; sectorId?: number | null; description?: string }): Promise<any> {
    const response = await this.api.post<any>('/directorates', data);
    return response.data;
  }

  async updateDirectorate(id: number, data: { name: string; sectorId?: number | null; description?: string; isActive: boolean }): Promise<any> {
    const response = await this.api.put<any>(`/directorates/${id}`, data);
    return response.data;
  }

  async deleteDirectorate(id: number): Promise<void> {
    await this.api.delete(`/directorates/${id}`);
  }

  // Questions
  async getQuestions(categoryId?: number, includeInactive: boolean = true, auditId?: number): Promise<Question[]> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (includeInactive) params.append('includeInactive', 'true');
    if (auditId) params.append('auditId', auditId.toString());
    const url = `/Questions${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.api.get<Question[]>(url);
    return response.data;
  }

  // Image Upload
  async uploadImage(file: File): Promise<{ fileName: string; imageUrl: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Don't set Content-Type header - let browser set it with boundary
    const response = await this.api.post<{ fileName: string; imageUrl: string; message: string }>(
      '/ImageUpload/upload',
      formData
    );
    return response.data;
  }

  async uploadImages(files: File[]): Promise<{ fileNames: string[]; imageUrls: string[]; message: string }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    // Don't set Content-Type header - let browser set it with boundary
    const response = await this.api.post<{ fileNames: string[]; imageUrls: string[]; message: string }>(
      '/ImageUpload/upload-multiple',
      formData
    );
    return response.data;
  }

  // Audit Responses
  async submitAuditResponse(data: {
    auditId: number;
    questionId: number;
    response: 'High' | 'Medium' | 'Low';
    imageUrls?: string[];
  }): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>('/AuditResponses', data);
    return response.data;
  }

  // Actions
  async createAction(data: {
    questionId: number;
    auditId: number;
    description?: string;
    suggestedActivity?: string;
    plannedActivity?: string;
    targetDate?: string;
    responsiblePerson?: string;
    departmentId?: number;
    imageUrls?: string[];
    priority?: 'Düşük' | 'Orta' | 'Yüksek';
  }): Promise<any> {
    const response = await this.api.post<any>('/Actions', data);
    return response.data;
  }

  async updateAction(id: number, data: {
    description?: string;
    suggestedActivity?: string;
    plannedActivity?: string;
    targetDate?: string;
    responsiblePerson?: string;
    departmentId?: number;
    imageUrls?: string[];
    status?: 'open' | 'in_progress' | 'closed';
    priority?: 'Düşük' | 'Orta' | 'Yüksek';
  }): Promise<any> {
    const response = await this.api.put<any>(`/Actions/${id}`, data);
    return response.data;
  }

}

export const apiService = new ApiService();
export default apiService;
