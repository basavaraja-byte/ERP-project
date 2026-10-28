import React from 'react';
import { Building2, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

const OFFICIAL_CAMPUSES = [
  {
    id: 'campus-1',
    campusNumber: 1,
    name: 'Maharaja Institute of Technology',
    code: 'MIT-ENG',
    category: 'Engineering & Technology (Autonomous)'
  },
  {
    id: 'campus-2',
    campusNumber: 2,
    name: 'Maharaja Polytechnic College',
    code: 'MPC-POLY',
    category: 'Diploma & Applied Polytechnic'
  },
  {
    id: 'campus-3',
    campusNumber: 3,
    name: 'Maharaja College of Arts & Science',
    code: 'MCAS-GEN',
    category: 'Arts, Science & Commerce'
  },
  {
    id: 'campus-4',
    campusNumber: 4,
    name: 'Maharaja PU College',
    code: 'MPUC-SCH',
    category: 'Pre-University & Higher Secondary'
  },
  {
    id: 'campus-5',
    campusNumber: 5,
    name: 'Maharaja School',
    code: 'MS-SCH',
    category: 'K-12 Secondary & Primary Schooling'
  },
  {
    id: 'campus-6',
    campusNumber: 6,
    name: 'MIT for Masters',
    code: 'MITM-PG',
    category: 'Postgraduate, Masters & Research'
  }
];

export default function PublicCampusSelectionHome({ onSelectCampus, onSelectTrusteeLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-10">
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
              <ShieldCheck size={16} /> Central Institutional ERP Portal
            </div>
            {onSelectTrusteeLogin && (
              <button
                type="button"
                onClick={onSelectTrusteeLogin}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                title="Sign in with central Board of Trustees executive credentials"
              >
                <Lock size={13} className="text-amber-400" />
                <span>Board of Trustees / Central Sign In →</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
              MAHARAJA EDUCATIONAL TRUST
            </h1>
            <p className="text-sm sm:text-base text-blue-400 font-medium tracking-wide">
              Central Enterprise Governance &amp; Multi-Campus ERP
            </p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed pt-1">
              Select an institution below to access its dedicated campus login portal and operational services.
            </p>
          </div>
        </div>

        {/* Exactly Six Rectangular Clickable Campus Cards — 3 Columns × 2 Rows on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OFFICIAL_CAMPUSES.map((campus) => (
            <button
              key={campus.id}
              type="button"
              onClick={() => onSelectCampus(campus)}
              className="group text-left p-6 sm:p-7 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between min-h-[190px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 relative overflow-hidden cursor-pointer"
            >
              {/* Top Accent Line on Hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-xs">
                    <Building2 size={24} />
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-700/80 text-blue-300 border border-slate-600/60 uppercase tracking-wider">
                    Campus {campus.campusNumber}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                    {campus.code}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                    {campus.name}
                  </h2>
                  <p className="text-xs text-slate-400 leading-normal pt-1">
                    {campus.category}
                  </p>
                </div>
              </div>

              {/* Clickable Appearance CTA */}
              <div className="pt-4 border-t border-slate-700/60 mt-5 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-blue-300 transition-colors">
                <span>Access Campus Portal</span>
                <ArrowRight size={16} className="text-blue-400 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        MAHARAJA EDUCATIONAL TRUST • Central Governance &amp; Multi-Campus ERP • AY 2025–26
      </footer>
    </div>
  );
}

