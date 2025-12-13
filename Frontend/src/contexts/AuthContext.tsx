import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, LoginRequest } from '../types';
import { apiService } from '../services/api';

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Auth actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

// Auth context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithKeycloak: (code: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Initial state - check localStorage
const getInitialState = (): AuthState => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return {
        user,
        token,
        isLoading: true, // Start with loading true to verify token on mount
        isAuthenticated: true,
      };
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  return {
    user: null,
    token: null,
    isLoading: true, // Start with loading true for auto-login
    isAuthenticated: false,
  };
};

const initialState: AuthState = getInitialState();

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check token on mount and refresh user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
    } else {
      // Refresh user data from backend to get latest role
      // If API call fails, we'll keep using localStorage data
      const refreshUserData = async () => {
        try {
          const response = await apiService.getCurrentUser();
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            dispatch({ type: 'UPDATE_USER', payload: response.user });
          }
          dispatch({ type: 'SET_LOADING', payload: false });
        } catch (error: any) {
          console.error('Error refreshing user data:', error);
          // If API call fails but we have token and user in localStorage, keep using them
          // Only clear if it's a 401 (unauthorized) - which is handled by interceptor
          if (error.response?.status === 401) {
            // 401 is handled by interceptor, it will redirect to login
            // Just set loading to false here
            dispatch({ type: 'SET_LOADING', payload: false });
          } else {
            // For other errors (network, 500, etc.), keep using localStorage data
            // User data is already loaded from localStorage in getInitialState
            // Just ensure we're authenticated and set loading to false
            if (userStr) {
              try {
                const user = JSON.parse(userStr);
                dispatch({ type: 'UPDATE_USER', payload: user });
              } catch (e) {
                console.error('Error parsing user from localStorage:', e);
              }
            }
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      };
      refreshUserData();
    }
  }, []);

  // Login function
  const login = React.useCallback(async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await apiService.login(credentials);

      // Save to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token }
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  }, []);

  // Keycloak Login function
  const loginWithKeycloak = React.useCallback(async (code: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await apiService.loginWithKeycloak(code);

      // Save to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token }
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  }, []);

  // Logout function
  const logout = React.useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Update user function
  const updateUser = React.useCallback((user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  const value: AuthContextType = React.useMemo(() => ({
    ...state,
    login,
    loginWithKeycloak,
    logout,
    updateUser,
  }), [state, login, loginWithKeycloak, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Role-based permissions hook
// NOTE: Role-based permissions are handled by backend, not frontend
// This hook is kept for compatibility but all permissions return true
// Backend will enforce actual role-based restrictions
export const useRole = () => {
  const { user } = useAuth();

  // All role checks return true - backend handles authorization
  const hasRole = (roles: string | string[]): boolean => {
    return true; // Backend handles role validation
  };

  const canManageUsers = () => {
    return true; // Backend handles authorization
  };

  const canManageDepartments = () => {
    return true; // Backend handles authorization
  };

  const canManageSettings = () => {
    return true; // Backend handles authorization
  };

  const canCreateAudits = () => {
    return true; // Backend handles authorization
  };

  const canViewReports = () => {
    return true; // Backend handles authorization
  };

  const canViewDepartments = () => {
    return true; // Backend handles authorization
  };

  const canViewAreas = () => {
    return true; // Backend handles authorization
  };

  const canStartAudit = () => {
    return true; // Backend handles authorization
  };

  const getUserDepartmentId = (): number | null => {
    return user?.department_id || user?.departmentId || null;
  };

  const getUserAreaIds = (): number[] => {
    // This would need to be fetched from API based on user's areas
    // For now, return empty array - will be implemented per page
    return [];
  };

  return {
    hasRole,
    canManageUsers,
    canManageDepartments,
    canManageSettings,
    canCreateAudits,
    canViewReports,
    canViewDepartments,
    canViewAreas,
    canStartAudit,
    getUserDepartmentId,
    getUserAreaIds,
  };
};

// HOC for protected routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>; // You can replace with a proper loading component
    }

    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
};


export default AuthContext;
