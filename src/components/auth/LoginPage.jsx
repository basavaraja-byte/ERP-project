import React, { useState } from 'react';
import {
  ShieldCheck,
  Building,
  GraduationCap,
  Users,
  UserCheck,
  Home,
  User,
  HeartHandshake,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Database,
  Sparkles,
  IndianRupee,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ALL_DEMO_ACCOUNTS } from '../../data/demoAccounts';

export default function LoginPage({
  selectedCampus = null,
  onBackToAllCampuses,
  isTrusteeMode = false
}) {
  const { login, authError, isLoading } = useAuth();

  // Default campus fallback if accessed directly
  const activeCampus = selectedCampus || {
    id: 'campus-1',
    campusNumber: 1,
    name: 'Maharaja Institute of Technology',
    code: 'MIT-ENG',
    category: 'Engineering & Technology (Autonomous)'
  };

  // Filter accounts strictly to the selected campus (excluding synthetic alias user@trustview.edu from card list)
  const campusAccounts = ALL_DEMO_ACCOUNTS.filter(
    (acc) => acc.campusId === activeCampus.id && acc.email !== 'user@trustview.edu'
  );

  const trusteeAccount = ALL_DEMO_ACCOUNTS.find((acc) => acc.role === 'TRUSTEE');

  // Intelligent default persona pre-selected so inputs are never empty
  const defaultAccount = isTrusteeMode ? trusteeAccount : (campusAccounts[0] || trusteeAccount);

  const [selectedPersona, setSelectedPersona] = useState(defaultAccount);
  const [email, setEmail] = useState(defaultAccount ? defaultAccount.email : 'dean.campus1@trustview.edu');
  const [password, setPassword] = useState('TrustView@2026');
  const [localError, setLocalError] = useState('');

  // Handle prefill on demo persona click
  const handleSelectDemoAccount = (acc, e, autoSubmit = false) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedPersona(acc);
    setEmail(acc.email);
    setPassword('TrustView@2026');
    setLocalError('');

    // Smoothly scroll to the login form on small/mobile screens
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const formEl = document.getElementById('login-form-panel');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    if (autoSubmit) {
      login(acc.email, 'TrustView@2026');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const res = await login(email.trim(), password);
    if (!res.success) {
      setLocalError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Top Navigation & Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          {onBackToAllCampuses ? (
            <button
              type="button"
              onClick={onBackToAllCampuses}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer shadow-xs w-fit"
            >
              <ArrowLeft size={15} />
              <span>← Back to All Campuses</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>MAHARAJA EDUCATIONAL TRUST</span>
            <span>/</span>
            <span className="text-blue-400 font-bold">
              {isTrusteeMode ? 'Board of Trustees' : activeCampus.name}
            </span>
          </div>
        </div>

        {/* Selected Campus Banner & Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Building size={14} />
            {isTrusteeMode ? (
              <span>Board of Trustees • Central Executive Access</span>
            ) : (
              <span>Campus {activeCampus.campusNumber} • {activeCampus.code}</span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">
            {isTrusteeMode ? 'Board of Trustees' : activeCampus.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            {isTrusteeMode
              ? 'Authorized Trust-Wide Governance & Six-Campus Selection Portal'
              : `${activeCampus.category} — Secure Authentication & Role-Based Services Desk`}
          </p>
        </div>

        {/* 2-Column Desktop Grid: Login Form + Campus Configured Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Column 1: Secure Sign In Form */}
          <div
            id="login-form-panel"
            className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Secure Sign In</h2>
                <p className="text-xs text-slate-400">Authenticated via MongoDB Atlas &amp; JWT</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Lock size={18} />
              </div>
            </div>

            {(localError || authError) && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                <span>{localError || authError}</span>
              </div>
            )}

            {/* Persona Populated Banner */}
            {selectedPersona && (
              <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-between text-xs text-blue-200">
                <div className="flex items-center gap-2.5 truncate">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-white">{selectedPersona.title}</span>
                    <span className="text-slate-300 ml-1.5 font-medium">({selectedPersona.name})</span>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{selectedPersona.email}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md shrink-0">
                  Ready
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="user@trustview.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>
                        {selectedPersona ? `Sign In as ${selectedPersona.title}` : 'Sign In to Dashboard'}
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Database size={13} /> Bcrypt Hashed • RBAC Scoped
              </span>
              <span className="font-mono text-slate-400">AY 2025–26</span>
            </div>
          </div>

          {/* Column 2: Campus-Specific Account Selection (Filtered Strictly to Selected Campus) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400 shrink-0" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Configured Accounts — {activeCampus.name}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Click persona to populate credentials</span>
            </div>

            {/* Central Trustee Quick Access Card */}
            {trusteeAccount && (
              <button
                type="button"
                onClick={(e) => {
                  if (email === trusteeAccount.email) {
                    handleSelectDemoAccount(trusteeAccount, e, true);
                  } else {
                    handleSelectDemoAccount(trusteeAccount, e, false);
                  }
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                  email === trusteeAccount.email
                    ? 'bg-emerald-600/25 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/40'
                    : 'bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-700/60 hover:border-emerald-600'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-emerald-300">Board of Trustees</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-100">
                        Consolidated Trust-Wide
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 truncate">
                      {trusteeAccount.name} <span className="text-slate-400 font-mono">({trusteeAccount.email})</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  {email === trusteeAccount.email ? (
                    <span className="text-xs text-emerald-300 font-bold inline-flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40">
                      <CheckCircle2 size={13} />
                      <span>Populated (Click to Enter)</span>
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold group-hover:text-emerald-300 inline-flex items-center gap-0.5">
                      <span>Use Credential</span>
                      <ArrowRight size={13} />
                    </span>
                  )}
                </div>
              </button>
            )}

            {/* Campus Accounts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
              {campusAccounts.map((acc, idx) => {
                const IconComponent = acc.icon;
                const isSelected = email === acc.email;

                return (
                  <button
                    key={`${acc.role}-${acc.email}-${idx}`}
                    type="button"
                    onClick={(e) => {
                      if (isSelected) {
                        handleSelectDemoAccount(acc, e, true);
                      } else {
                        handleSelectDemoAccount(acc, e, false);
                      }
                    }}
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-600/25 border-blue-400 ring-2 ring-blue-500/40 shadow-lg shadow-blue-950/30'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700/70 text-blue-400 group-hover:bg-slate-700'
                      }`}>
                        <IconComponent size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-xs text-white truncate">{acc.title}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300 shrink-0">
                            {acc.campusLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate font-medium">{acc.name}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{acc.scope}</p>
                      </div>
                    </div>

                    {/* Bottom Action Row: Email & Explicit Use Credential Action */}
                    <div className="w-full pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400 text-[10px] truncate max-w-[140px]">
                        {acc.email}
                      </span>
                      <span className={`text-[10px] font-semibold inline-flex items-center gap-1 ${
                        isSelected ? 'text-emerald-400 font-bold' : 'text-blue-400 group-hover:text-blue-300'
                      }`}>
                        {isSelected ? (
                          <>
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            <span>Populated (Click to Enter)</span>
                          </>
                        ) : (
                          <>
                            <span>Use Credential</span>
                            <ArrowRight size={11} />
                          </>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Honest Setup Message if Campus Has Limited Configured Roles */}
            {campusAccounts.length <= 3 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2">
                <Info size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Additional departmental and resident student accounts for <strong>{activeCampus.name}</strong> are currently in setup state. Sign in with the configured Principal or Dean account, or use central Board of Trustees credentials.
                </p>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Verification Integrity Safeguard: </span>
              All credentials authenticate against MongoDB Atlas <code className="text-blue-300 font-mono">trustview_erp.users</code>. Selecting a card prefills credentials; clicking Sign In triggers salted bcrypt validation and signed JWT issuance.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
        MAHARAJA EDUCATIONAL TRUST • Campus Secure Authentication Desk • AY 2025–26
      </footer>
    </div>
  );
}
