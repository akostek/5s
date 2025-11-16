import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

interface Permission {
  id: number;
  roleId: number; // RoleId from backend
  role: string; // Role name (for display)
  page: string;
  button?: string;
  filterSektor: boolean;
  filterDirektorluk: boolean;
  showPlanlananTarih: boolean;
  showPlanlandiDurum: boolean;
  canView: boolean;
}

interface PermissionContextType {
  permissions: Permission[];
  loading: boolean;
  canAccessPage: (page: string) => boolean;
  canAccessButton: (page: string, button: string) => boolean;
  getPagePermission: (page: string) => Permission | null;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!isAuthenticated || !user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      const data = await apiService.getMyPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPermissions();
    } else {
      setPermissions([]);
      setLoading(false);
    }
  }, [isAuthenticated, user?.roleId, user?.role]); // Watch for roleId and role changes

  const canAccessPage = (page: string): boolean => {
    // Use roleId if available, otherwise fallback to role name
    const userRoleId = user?.roleId || user?.RoleId;
    if (!userRoleId && !user?.role) return false;
    
    const permission = permissions.find(
      p => {
        // First try to match by roleId (preferred)
        if (userRoleId && p.roleId === userRoleId) {
          return p.page === page && !p.button;
        }
        // Fallback to role name matching
        if (user?.role && p.role === user.role) {
          return p.page === page && !p.button;
        }
        return false;
      }
    );
    
    return permission?.canView ?? false;
  };

  const canAccessButton = (page: string, button: string): boolean => {
    // Use roleId if available, otherwise fallback to role name
    const userRoleId = user?.roleId || user?.RoleId;
    if (!userRoleId && !user?.role) return false;
    
    const permission = permissions.find(
      p => {
        // First try to match by roleId (preferred)
        if (userRoleId && p.roleId === userRoleId) {
          return p.page === page && p.button === button;
        }
        // Fallback to role name matching
        if (user?.role && p.role === user.role) {
          return p.page === page && p.button === button;
        }
        return false;
      }
    );
    
    return permission?.canView ?? false;
  };

  const getPagePermission = (page: string): Permission | null => {
    // Use roleId if available, otherwise fallback to role name
    const userRoleId = user?.roleId || user?.RoleId;
    if (!userRoleId && !user?.role) return null;
    
    return permissions.find(
      p => {
        // First try to match by roleId (preferred)
        if (userRoleId && p.roleId === userRoleId) {
          return p.page === page && !p.button;
        }
        // Fallback to role name matching
        if (user?.role && p.role === user.role) {
          return p.page === page && !p.button;
        }
        return false;
      }
    ) || null;
  };

  const refreshPermissions = async () => {
    await fetchPermissions();
  };

  const value: PermissionContextType = {
    permissions,
    loading,
    canAccessPage,
    canAccessButton,
    getPagePermission,
    refreshPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

