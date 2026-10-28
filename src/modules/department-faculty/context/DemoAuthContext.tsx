import React, { createContext, useContext, useState } from 'react';
import { Campus, Department, DemoUser, FacultyMember } from '../types/erp';
import { erpService } from '../services/erpService';
import { useErpStoreVersion } from '../hooks/useErpStoreVersion';

const USER_SESSION_KEY = 'aarohan_erp_active_demo_user_v1';

interface DemoAuthContextValue {
  currentUser: DemoUser | null;
  department: Department | null;
  campus: Campus | null;
  facultyProfile: FacultyMember | null;
  availableAccounts: Array<{ user: DemoUser; department: Department; campus: Campus }>;
  loginAs: (userId: string) => boolean;
  logout: () => void;
  resetAllDemoData: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextValue | undefined>(undefined);

export const DemoAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Subscribe to mock store mutations so context reflects live changes
  useErpStoreVersion();

  const [activeUserId, setActiveUserId] = useState<string | null>(() => {
    try {
      const saved = sessionStorage.getItem(USER_SESSION_KEY);
      if (saved && erpService.getUserContext(saved)) {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
    // Default to CSE HOD for immediate demo inspection, while allowing 1-click switch/logout
    return 'USR-HOD-CSE';
  });

  const userContext = activeUserId ? erpService.getUserContext(activeUserId) : null;
  const availableAccounts = erpService.getDemoUsers();

  const loginAs = (userId: string): boolean => {
    const ctx = erpService.getUserContext(userId);
    if (!ctx) return false;
    setActiveUserId(userId);
    try {
      sessionStorage.setItem(USER_SESSION_KEY, userId);
    } catch {
      // Ignore storage errors
    }
    return true;
  };

  const logout = () => {
    setActiveUserId(null);
    try {
      sessionStorage.removeItem(USER_SESSION_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  const resetAllDemoData = () => {
    erpService.resetDemoData();
  };

  return (
    <DemoAuthContext.Provider
      value={{
        currentUser: userContext?.user ?? null,
        department: userContext?.department ?? null,
        campus: userContext?.campus ?? null,
        facultyProfile: userContext?.facultyProfile ?? null,
        availableAccounts,
        loginAs,
        logout,
        resetAllDemoData,
      }}
    >
      {children}
    </DemoAuthContext.Provider>
  );
};

export function useDemoAuth(): DemoAuthContextValue {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) throw new Error('useDemoAuth must be used inside DemoAuthProvider');
  return ctx;
}

