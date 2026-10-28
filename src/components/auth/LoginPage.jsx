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
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Master Demonstration Accounts Registered in MongoDB Atlas trustview_erp.users
const ALL_DEMO_ACCOUNTS = [
  // 1. TRUSTEE (Trust-Wide)
  {
    role: 'TRUSTEE',
    title: 'Trustee',
    name: 'Dr. Vikram Mehta',
    email: 'trustee@trustview.edu',
    campusId: 'all',
    campusLabel: 'All 6 Campuses',
    scope: 'Board of Trustees • Consolidated Trust-Wide',
    icon: ShieldCheck,
    color: 'emerald'
  },

  // 2. CAMPUS 1 (Maharaja Institute of Technology)
  {
    role: 'DEAN',
    title: 'Dean',
    name: 'Prof. Rajesh Swaminathan',
    email: 'dean.campus1@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Academic Oversight • Maharaja Institute of Technology',
    icon: GraduationCap,
    color: 'indigo'
  },
  {
    role: 'PRINCIPAL',
    title: 'Principal',
    name: 'Dr. K. S. Ramanathan',
    email: 'principal.campus1@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Institutional Administration • Maharaja Institute of Technology',
    icon: Building,
    color: 'amber'
  },
  {
    role: 'FINANCE_MANAGER',
    title: 'Finance Manager',
    name: 'Mr. Anand Srinivasan (CA)',
    email: 'finance.campus1@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Finance Controller • Fee Ledgers, Reconciliations & Budgets',
    icon: IndianRupee,
    color: 'emerald'
  },
  {
    role: 'HOD',
    title: 'HOD (Computer Science)',
    name: 'Dr. Aruna Natarajan',
    email: 'hod.cs@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Dept of Computer Science & Engineering',
    icon: Users,
    color: 'blue'
  },
  {
    role: 'FACULTY',
    title: 'Faculty (CSE)',
    name: 'Prof. Suresh Kumar',
    email: 'faculty.cs@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'CSE • Computer Networks & Operating Systems',
    icon: UserCheck,
    color: 'cyan'
  },
  {
    role: 'STUDENT',
    title: 'Student (CSE)',
    name: 'Rahul Sharma',
    email: 'student.rahul@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'MIT2023-CS-042 • CSE Resident Student',
    icon: User,
    color: 'purple'
  },
  {
    role: 'PARENT',
    title: 'Parent',
    name: 'Mr. Ramesh Sharma',
    email: 'parent.sharma@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Ward: Rahul Sharma (MIT2023-CS-042)',
    icon: HeartHandshake,
    color: 'pink'
  },
  {
    role: 'WARDEN',
    title: 'Hostel Warden',
    name: 'Col. M. Sundaram',
    email: 'warden.blocka@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'CampusStay • Block A (Boys Hostel)',
    icon: Home,
    color: 'orange'
  },

  // 3. CAMPUS 2 (Maharaja Polytechnic College)
  {
    role: 'DEAN',
    title: 'Dean',
    name: 'Prof. M. Venkatesan',
    email: 'dean.campus2@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Academic Oversight • Maharaja Polytechnic College',
    icon: GraduationCap,
    color: 'indigo'
  },
  {
    role: 'PRINCIPAL',
    title: 'Principal',
    name: 'Prof. M. Anbarasan',
    email: 'principal.campus2@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Administration • Maharaja Polytechnic College',
    icon: Building,
    color: 'amber'
  },
  {
    role: 'FINANCE_MANAGER',
    title: 'Finance Manager',
    name: 'Mrs. Jayashree Venkat',
    email: 'finance.campus2@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Finance Controller • Fee Structures & Cash Flows',
    icon: IndianRupee,
    color: 'emerald'
  },
  {
    role: 'HOD',
    title: 'HOD (Automobile)',
    name: 'Prof. R. Balaji',
    email: 'hod.auto@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Automobile Engineering Dept',
    icon: Users,
    color: 'blue'
  },
  {
    role: 'FACULTY',
    title: 'Faculty (Automobile)',
    name: 'Prof. Deepa Mani',
    email: 'faculty.auto@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Automobile Engineering • Thermal Engg',
    icon: UserCheck,
    color: 'cyan'
  },
  {
    role: 'STUDENT',
    title: 'Student (Automobile)',
    name: 'Priya Patel',
    email: 'student.priya@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'APC2024-AUT-108 • Automobile Engineering',
    icon: User,
    color: 'purple'
  },
  {
    role: 'PARENT',
    title: 'Parent',
    name: 'Mrs. Gita Patel',
    email: 'parent.patel@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Ward: Priya Patel (APC2024-AUT-108)',
    icon: HeartHandshake,
    color: 'pink'
  },
  {
    role: 'WARDEN',
    title: 'Hostel Warden',
    name: 'Mr. P. Murugesan',
    email: 'warden.polyres@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Polytechnic Residence Facilities',
    icon: Home,
    color: 'orange'
  },

  // 4. CAMPUS 3 (Maharaja College of Arts & Science)
  {
    role: 'DEAN',
    title: 'Dean',
    name: 'Prof. S. Meenakshi',
    email: 'dean.campus3@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'Dean of Sciences & Humanities',
    icon: GraduationCap,
    color: 'indigo'
  },
  {
    role: 'PRINCIPAL',
    title: 'Principal',
    name: 'Dr. Lakshmi Parthasarathy',
    email: 'principal.campus3@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'Administration • Arts & Science College',
    icon: Building,
    color: 'amber'
  },
  {
    role: 'HOD',
    title: 'HOD (Commerce)',
    name: 'Dr. N. Sengottaiyan',
    email: 'hod.commerce@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'Commerce & Accounting Department',
    icon: Users,
    color: 'blue'
  },
  {
    role: 'FACULTY',
    title: 'Faculty (Commerce)',
    name: 'Prof. Karthik Raja',
    email: 'faculty.commerce@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'Financial Accounting & Taxation',
    icon: UserCheck,
    color: 'cyan'
  },
  {
    role: 'STUDENT',
    title: 'Student (BCA)',
    name: 'Ananya Krishnan',
    email: 'student.ananya@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'ACAS2024-BCA-055 • Computer Applications',
    icon: User,
    color: 'purple'
  },
  {
    role: 'PARENT',
    title: 'Parent',
    name: 'Mr. K. Krishnan',
    email: 'parent.krishnan@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'Ward: Ananya Krishnan (ACAS2024-BCA-055)',
    icon: HeartHandshake,
    color: 'pink'
  },
  {
    role: 'WARDEN',
    title: 'Hostel Warden',
    name: 'Mrs. S. Vasanthi',
    email: 'warden.cityarts@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'City Arts & Science Hall',
    icon: Home,
    color: 'orange'
  },

  // 5. CAMPUS 4 (Maharaja PU College)
  {
    role: 'DEAN',
    title: 'Dean',
    name: 'Dr. G. Jayaraman',
    email: 'dean.campus4@trustview.edu',
    campusId: 'campus-4',
    campusLabel: 'Campus 4',
    scope: 'Pre-University & Higher Secondary Academic Head',
    icon: GraduationCap,
    color: 'indigo'
  },
  {
    role: 'PRINCIPAL',
    title: 'Principal',
    name: 'Mrs. Revathi Sundaram',
    email: 'principal.campus4@trustview.edu',
    campusId: 'campus-4',
    campusLabel: 'Campus 4',
    scope: 'Pre-University & Higher Secondary Head',
    icon: Building,
    color: 'amber'
  },

  // 6. CAMPUS 5 (Maharaja School)
  {
    role: 'DEAN',
    title: 'Dean',
    name: 'Dr. Harish Chandra',
    email: 'dean.campus5@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'Curriculum & Senior Secondary Oversight',
    icon: GraduationCap,
    color: 'indigo'
  },
  {
    role: 'PRINCIPAL',
    title: 'Principal',
    name: 'Dr. Rajeshwar Rao',
    email: 'principal.campus5@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'K-12 School Administration',
    icon: Building,
    color: 'amber'
  },
  {
    role: 'HOD',
    title: 'HOD (Secondary)',
    name: 'Dr. Preeti Shenoy',
    email: 'hod.mba@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'Senior Secondary Sciences',
    icon: Users,
    color: 'blue'
  },
  {
    role: 'STUDENT',
    title: 'Student',
    name: 'Aditya Verma',
    email: 'student.aditya@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'AIMR2024-MBA-019 • Senior Student',
    icon: User,
    color: 'purple'
  },
  {
    role: 'PARENT',
    title: 'Parent',
    name: 'Mr. Sanjay Verma',
    email: 'parent.verma@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'Ward: Aditya Verma',
    icon: HeartHandshake,
    color: 'pink'
  },
  {
    role: 'WARDEN',
    title: 'Hostel Warden',
    name: 'Capt. V. Narayanan',
    email: 'warden.execmgmt@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'School Residential Hall',
    icon: Home,
    color: 'orange'
  },

  // 7. CAMPUS 6 (MIT for Masters)
  {
    role: 'PRINCIPAL',
    title: 'Principal / Director',
    name: 'Mr. T. Govindaraj',
    email: 'principal.campus6@trustview.edu',
    campusId: 'campus-6',
    campusLabel: 'Campus 6',
    scope: 'Postgraduate & Research Institute Director',
    icon: Building,
    color: 'amber'
  }
];

export default function LoginPage({
  selectedCampus = null,
  onBackToAllCampuses,
  isTrusteeMode = false
}) {
  const { login, error: authError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // Default campus fallback if accessed directly
  const activeCampus = selectedCampus || {
    id: 'campus-1',
    campusNumber: 1,
    name: 'Maharaja Institute of Technology',
    code: 'MIT-ENG',
    category: 'Engineering & Technology (Autonomous)'
  };

  // Filter accounts strictly to the selected campus
  const campusAccounts = ALL_DEMO_ACCOUNTS.filter(
    (acc) => acc.campusId === activeCampus.id
  );

  const trusteeAccount = ALL_DEMO_ACCOUNTS.find((acc) => acc.role === 'TRUSTEE');

  // Handle prefill on demo persona click
  const handleSelectDemoAccount = (acc) => {
    setEmail(acc.email);
    setPassword('TrustView@2026');
    setLocalError('');
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
          <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
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
                      <span>Sign In to Dashboard</span>
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
                onClick={() => handleSelectDemoAccount(trusteeAccount)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  email === trusteeAccount.email
                    ? 'bg-emerald-600/20 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-700/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-emerald-300">Board of Trustees</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-100">
                        Consolidated Trust-Wide
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{trusteeAccount.name} ({trusteeAccount.email})</div>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-semibold shrink-0">Use Credential →</span>
              </button>
            )}

            {/* Campus Accounts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {campusAccounts.map((acc, idx) => {
                const IconComponent = acc.icon;
                const isSelected = email === acc.email;

                return (
                  <button
                    key={`${acc.role}-${acc.email}-${idx}`}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc)}
                    className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/30'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-700/70 flex items-center justify-center shrink-0 mt-0.5 text-blue-400">
                      <IconComponent size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-white truncate">{acc.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300 shrink-0">
                          {acc.campusLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate">{acc.name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{acc.scope}</p>
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
