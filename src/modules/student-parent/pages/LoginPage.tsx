import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import {
  GraduationCap,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  User,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<UserRole>('STUDENT');
  const [identifier, setIdentifier] = useState('AAR-2026-0001');
  const [password, setPassword] = useState('Student@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'PARENT') navigate('/parent/dashboard');
    }
  }, [isAuthenticated, role, navigate]);

  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    setErrorMessage(null);
    if (newRole === 'STUDENT') {
      setIdentifier('AAR-2026-0001');
      setPassword('Student@123');
    } else {
      setIdentifier('AAR-P-0001');
      setPassword('Parent@123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);
      if (res.success) {
        if (activeRole === 'STUDENT') {
          navigate('/student/dashboard');
        } else {
          navigate('/parent/dashboard');
        }
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 400);
  };

  const handleQuickFill = (id: string, pass: string, roleToSet: UserRole) => {
    setActiveRole(roleToSet);
    setIdentifier(id);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 flex flex-col justify-between p-4 sm:p-6 text-slate-100">
      {/* Top Bar Branding */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">AAROHAN</h1>
            <p className="text-[10px] text-blue-300 font-semibold uppercase tracking-widest">
              Education Trust • 6 Campuses
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="brand" size="sm" className="bg-blue-900/60 text-blue-200 border-blue-700/60">
            Institutional ERP
          </Badge>
          <span className="text-xs text-slate-400 font-mono">v2.4.0</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-6 sm:my-8 bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-900">
        {/* Institutional Card Header */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/40 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            {activeRole === 'STUDENT' ? (
              <GraduationCap className="w-8 h-8 text-white" />
            ) : (
              <Users className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {activeRole === 'STUDENT' ? 'Student Self-Service Portal' : 'Parent & Guardian Portal'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Unified access to student academics, attendance, fees, and hostel records.
          </p>

          {/* Sandbox Notice Banner */}
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            Demo Mode — In-Memory Mock Data
          </div>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200">
          <button
            type="button"
            onClick={() => handleRoleChange('STUDENT')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeRole === 'STUDENT'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student Login
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('PARENT')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeRole === 'PARENT'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Parent Login
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {activeRole === 'STUDENT' ? 'Student Master ID' : 'Parent Account ID'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={activeRole === 'STUDENT' ? 'e.g. AAR-2026-0001' : 'e.g. AAR-P-0001'}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {activeRole === 'STUDENT'
                ? 'Enter your canonical Master ID assigned upon admission.'
                : 'Enter your guardian ID linked with enrolled ward(s).'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50/50 hover:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 text-xs font-bold rounded-xl shadow-md shadow-blue-500/20"
            isLoading={isLoading}
          >
            Sign In to {activeRole === 'STUDENT' ? 'Student Portal' : 'Parent Portal'}
          </Button>

          {/* Quick 1-Click Demo Fillers */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
              Quick 1-Click Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('AAR-2026-0001', 'Student@123', 'STUDENT')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11px]">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Student Demo
                </div>
                <p className="text-[10px] font-mono text-slate-700 mt-0.5">AAR-2026-0001</p>
                <p className="text-[9px] text-slate-500 font-mono">Student@123</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('AAR-P-0001', 'Parent@123', 'PARENT')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                  <Users className="w-3.5 h-3.5" />
                  Parent Demo
                </div>
                <p className="text-[10px] font-mono text-slate-700 mt-0.5">AAR-P-0001</p>
                <p className="text-[9px] text-slate-500 font-mono">Parent@123</p>
              </button>
            </div>

            <div className="mt-2 text-center">
              <span className="text-[10px] text-slate-400">
                Linked wards for Parent: <strong>Aarav</strong> (Engg) & <strong>Ananya</strong> (Polytechnic)
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* Footer information */}
      <div className="text-center text-xs text-slate-400 max-w-md mx-auto py-2">
        <p>© 2026 Aarohan Education Trust. Official ERP Prototype.</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          AIT Pune • ACE Nagpur • ASET Pune • APC Aurangabad • ATP Nashik • APS Pune
        </p>
      </div>
    </div>
  );
};
