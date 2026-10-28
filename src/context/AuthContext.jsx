import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY_TOKEN = 'trustview_auth_token';
const STORAGE_KEY_USER = 'trustview_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Synchronize token into apiService
  useEffect(() => {
    if (token) {
      apiService.setAuthToken(token);
    } else {
      apiService.setAuthToken(null);
    }
  }, [token]);

  // Verify token on app startup
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        apiService.setAuthToken(storedToken);
        const res = await apiService.getMe();
        if (isMounted) {
          if (res && res.status === 'success' && res.user) {
            setUser(res.user);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
            const roleUpper = (res.user.role || '').toUpperCase();
            if (roleUpper === 'TRUSTEE') {
              const savedCampus = localStorage.getItem('trustview_selected_campus');
              if (!savedCampus || !savedCampus.startsWith('campus-')) {
                localStorage.setItem('trustview_selected_campus', 'all');
              }
            } else if (res.user.assignedCampusId) {
              localStorage.setItem('trustview_selected_campus', res.user.assignedCampusId);
            }
          } else {
            // Token expired or invalid
            logout();
          }
        }
      } catch {
        // Backend offline or token failure
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await apiService.login(email, password);

      if (response && response.status === 'success' && response.token) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem(STORAGE_KEY_TOKEN, response.token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));
        const roleUpper = (response.user?.role || '').toUpperCase();
        if (roleUpper === 'TRUSTEE') {
          localStorage.setItem('trustview_selected_campus', 'all');
        } else if (response.user?.assignedCampusId) {
          localStorage.setItem('trustview_selected_campus', response.user.assignedCampusId);
        }
        apiService.setAuthToken(response.token);
        setIsLoading(false);
        return { success: true, user: response.user };
      } else {
        const errorMsg = response?.message || 'Authentication failed. Please check credentials.';
        setAuthError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message || 'Unable to connect to authentication server.';
      setAuthError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  const logout = useCallback(() => {
    try {
      apiService.logout().catch(() => {});
    } catch {
      // Ignore network errors during logout
    }
    setToken(null);
    setUser(null);
    setAuthError(null);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem('trustview_selected_campus');
    apiService.setAuthToken(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    authError,
    login,
    logout,
    role: user?.role || null,
    assignedCampusId: user?.assignedCampusId || user?.campusId || null,
    department: user?.department || null,
    studentId: user?.studentId || null,
    wardStudentId: user?.wardStudentId || null,
    hostelId: user?.hostelId || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

