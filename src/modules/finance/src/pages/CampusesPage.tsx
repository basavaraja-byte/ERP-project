import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  UserCheck, 
  Users, 
  BookOpen, 
  Mail, 
  Phone, 
  Search, 
  ExternalLink 
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { calculateCampusComparison } from '../utils/calculations';
import { formatINR } from '../utils/currency';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Campus } from '../types/finance';

export const CampusesPage: React.FC = () => {
  const { 
    campuses, 
    studentAssessments, 
    payments, 
    expenses, 
    budgets, 
    activeCampusId, 
    setActiveCampusId,
    currentUser 
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);

  const isDean = currentUser.role === 'dean';

  const campusStats = calculateCampusComparison(
    campuses,
    studentAssessments,
    payments,
    expenses,
    budgets
  );

  const filteredCampuses = campuses.filter(c => {
    if (isDean && currentUser.assignedCampusId && c.id !== currentUser.assignedCampusId) {
      return false;
    }
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campuses Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional overview of all six constituent campuses across India
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search campus by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Grid of campuses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampuses.map(campus => {
          const stats = campusStats.find(s => s.campusId === campus.id);
          const isSelected = activeCampusId === campus.id;

          return (
            <div
              key={campus.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="purple" size="sm">{campus.code}</Badge>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        Active Scope
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{campus.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{campus.city}, {campus.state}</span>
                  </div>
                </div>

                {/* Dean & Contacts */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">Dean: {campus.deanName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {campus.totalStudents.toLocaleString('en-IN')} Enrolled
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      {campus.programsCount} Programs
                    </span>
                  </div>
                </div>

                {/* Key Financial summary metrics */}
                {stats && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Fee Demand</span>
                      <span className="font-bold text-slate-800">{formatINR(stats.demand, { compact: true })}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Realized</span>
                      <span className="font-bold text-emerald-600">{formatINR(stats.collections, { compact: true })}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedCampus(campus)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  View Details
                </button>

                {!isDean && (
                  <button
                    onClick={() => setActiveCampusId(isSelected ? 'all' : campus.id)}
                    className={`text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                    }`}
                  >
                    <span>{isSelected ? 'View All Campuses' : 'Filter by Campus'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Campus Details Modal */}
      {selectedCampus && (
        <Modal
          isOpen={!!selectedCampus}
          onClose={() => setSelectedCampus(null)}
          title={selectedCampus.name}
          subtitle={`Institutional code: ${selectedCampus.code}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Campus Address</p>
                  <p className="text-slate-600">{selectedCampus.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 font-mono">{selectedCampus.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 font-mono">{selectedCampus.contactPhone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Campus Dean</span>
                <span className="font-bold text-slate-900">{selectedCampus.deanName}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Academic Programs</span>
                <span className="font-bold text-slate-900">{selectedCampus.programsCount} Degree Programs</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCampus(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
