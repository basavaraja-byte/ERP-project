import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, UserCog } from 'lucide-react';
import { UserRole } from '../../types/erp';
import { useDemoAuth } from '../../context/DemoAuthContext';

interface RoleRouteGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export const RoleRouteGuard: React.FC<RoleRouteGuardProps> = ({
  requiredRole,
  children,
}) => {
  const { currentUser } = useDemoAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== requiredRole) {
    const ownDashboard =
      currentUser.role === 'HOD' ? '/hod/dashboard' : '/faculty/dashboard';

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-lg p-6 space-y-4">
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-navy-900">
              Demo Role Guard — {requiredRole} Portal Required
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              You are currently active as <strong>{currentUser.name}</strong> with the{' '}
              <strong>{currentUser.role}</strong> role. Switch to a{' '}
              <strong>{requiredRole}</strong> demo account to access this route.
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Note: Frontend usability guard only (Demo Mode — no backend authentication).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => navigate(ownDashboard)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-navy-900 hover:bg-navy-800 text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to {currentUser.role} Portal
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserCog className="w-3.5 h-3.5" />
              Switch Demo Role
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

