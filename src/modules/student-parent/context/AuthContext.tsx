import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DemoUser, Student, UserRole } from '../types';
import { erpService } from '../services/erpService';

interface AuthContextType {
  user: DemoUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  activeChildId: string | null;
  linkedChildren: Student[];
  login: (identifier: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  setActiveChildId: (childId: string) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'AAROHAN_AUTH_USER';
const ACTIVE_CHILD_KEY = 'AAROHAN_ACTIVE_CHILD';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoUser | null>(() => {
    try {
      const saved = sessionStorage.getItem(AUTH_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeChildId, setActiveChildIdState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(ACTIVE_CHILD_KEY) || null;
    } catch {
      return null;
    }
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const role = user ? user.role : null;
  const isAuthenticated = !!user;

  // Compute linked children for parent
  const linkedChildren = React.useMemo(() => {
    if (user?.role === 'PARENT' && user.parentId) {
      void refreshTrigger; // ensures recomputation when mock storage updates
      return erpService.getLinkedChildren(user.parentId);
    }
    return [];
  }, [user, refreshTrigger]);

  // If parent logged in and no activeChildId set, default to first linked child
  useEffect(() => {
    if (user?.role === 'PARENT' && linkedChildren.length > 0) {
      if (!activeChildId || !linkedChildren.some((c) => c.id === activeChildId)) {
        const defaultChild = linkedChildren[0].id;
        setActiveChildIdState(defaultChild);
        sessionStorage.setItem(ACTIVE_CHILD_KEY, defaultChild);
      }
    }
  }, [user, linkedChildren, activeChildId]);

  const login = (identifier: string, pass: string) => {
    const res = erpService.authenticate(identifier, pass);
    if (res.user) {
      setUser(res.user);
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));

      if (res.user.role === 'PARENT' && res.user.parentId) {
        const children = erpService.getLinkedChildren(res.user.parentId);
        if (children.length > 0) {
          setActiveChildIdState(children[0].id);
          sessionStorage.setItem(ACTIVE_CHILD_KEY, children[0].id);
        }
      } else {
        setActiveChildIdState(null);
        sessionStorage.removeItem(ACTIVE_CHILD_KEY);
      }

      return { success: true };
    }
    return { success: false, error: res.error || 'Authentication failed' };
  };

  const logout = () => {
    setUser(null);
    setActiveChildIdState(null);
    sessionStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(ACTIVE_CHILD_KEY);
  };

  const setActiveChildId = (childId: string) => {
    // Security check: verify this child actually belongs to the authenticated parent
    if (user?.role === 'PARENT' && user.parentId) {
      const allowed = linkedChildren.some((c) => c.id === childId);
      if (allowed) {
        setActiveChildIdState(childId);
        sessionStorage.setItem(ACTIVE_CHILD_KEY, childId);
        triggerRefresh();
      } else {
        console.warn('Unauthorized attempt to switch to unlinked student ID:', childId);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        activeChildId,
        linkedChildren,
        login,
        logout,
        setActiveChildId,
        refreshTrigger,
        triggerRefresh
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
