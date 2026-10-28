import React, { useState } from 'react';
import { 
  PieChart, 
  Search, 
  Plus, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  SlidersHorizontal 
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/currency';
import { exportToCSV } from '../utils/csvExport';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Budget, ExpenseCategory } from '../types/finance';

export const BudgetsPage: React.FC = () => {
  const { 
    scopedBudgets, 
    addBudget, 
    updateBudget, 
    campuses, 
    currentUser, 
    activeCampusId 
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    campus_id: string;
    budget_period: string;
    expense_category: ExpenseCategory;
    allocated_amount: number;
    committed_amount: number;
    actual_expense_amount: number;
    status: 'healthy' | 'warning' | 'exceeded';
  }>({
    campus_id: activeCampusId !== 'all' ? activeCampusId : 'campus-1',
    budget_period: 'FY 2026-27',
    expense_category: 'Hostel and Facility Maintenance',
    allocated_amount: 2500000,
    committed_amount: 150000,
    actual_expense_amount: 0,
    status: 'healthy',
  });

  const isReadOnly = currentUser.role === 'auditor';

  const getCampusCity = (campusId: string) => {
    const c = campuses.find(item => item.id === campusId);
    return c ? c.city : campusId;
  };

  const filteredBudgets = scopedBudgets.filter(b => {
    const matchesSearch = b.expense_category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || b.expense_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAllocated = scopedBudgets.reduce((s, b) => s + b.allocated_amount, 0);
  const totalActual = scopedBudgets.reduce((s, b) => s + b.actual_expense_amount, 0);
  const totalCommitted = scopedBudgets.reduce((s, b) => s + b.committed_amount, 0);

  const handleExportCSV = () => {
    const rows = filteredBudgets.map(b => {
      const remaining = Math.max(0, b.allocated_amount - (b.actual_expense_amount + b.committed_amount));
      const util = b.allocated_amount > 0 ? Math.round(((b.actual_expense_amount + b.committed_amount) / b.allocated_amount) * 100) : 0;
      return {
        ID: b.id,
        Campus: getCampusCity(b.campus_id),
        Period: b.budget_period,
        Category: b.expense_category,
        Allocated: b.allocated_amount,
        ActualExpense: b.actual_expense_amount,
        Committed: b.committed_amount,
        Remaining: remaining,
        Utilization: `${util}%`,
        Status: b.status,
      };
    });
    exportToCSV('Institutional_Budgets_Utilization', rows);
  };

  const handleOpenEdit = (b: Budget) => {
    setFormData({
      campus_id: b.campus_id,
      budget_period: b.budget_period,
      expense_category: b.expense_category,
      allocated_amount: b.allocated_amount,
      committed_amount: b.committed_amount,
      actual_expense_amount: b.actual_expense_amount,
      status: b.status,
    });
    setEditingBudget(b);
    setIsAddModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.allocated_amount <= 0) {
      alert('Please enter a valid allocated budget amount.');
      return;
    }

    const ratio = (formData.actual_expense_amount + formData.committed_amount) / formData.allocated_amount;
    const computedStatus = ratio > 1 ? 'exceeded' : (ratio > 0.85 ? 'warning' : 'healthy');

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        ...formData,
        status: computedStatus,
      });
    } else {
      addBudget({
        ...formData,
        status: computedStatus,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Budgets & Utilization</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Campus-level expenditure limits, committed purchase orders and overspend threshold guards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={() => {
                setEditingBudget(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Budget Allocation</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Allocated FY Budget</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{formatINR(totalAllocated)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <PieChart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Realized Expenses Outflow</span>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{formatINR(totalActual)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Committed Liabilities</span>
            <div className="text-xl font-bold text-amber-600 mt-0.5">{formatINR(totalCommitted)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">All Categories</option>
              <option value="Utilities">Utilities</option>
              <option value="Hostel and Facility Maintenance">Hostel & Maintenance</option>
              <option value="IT and Software">IT and Software</option>
              <option value="Laboratory Supplies">Laboratory Supplies</option>
              <option value="Academic Operations">Academic Operations</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {filteredBudgets.length} budget heads
        </div>
      </div>

      {/* Grid of Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBudgets.map(b => {
          const used = b.actual_expense_amount + b.committed_amount;
          const remaining = Math.max(0, b.allocated_amount - used);
          const utilPct = b.allocated_amount > 0 ? Math.round((used / b.allocated_amount) * 100) : 0;

          return (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="purple" size="sm">{b.budget_period}</Badge>
                  <Badge
                    variant={
                      b.status === 'healthy' ? 'success' :
                      b.status === 'warning' ? 'warning' : 'danger'
                    }
                    size="sm"
                  >
                    {b.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{b.expense_category}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Scope: {getCampusCity(b.campus_id)} Campus</p>
                </div>

                {/* Amount grid */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Sanctioned</span>
                    <span className="font-bold text-slate-900">{formatINR(b.allocated_amount, { compact: true })}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Available</span>
                    <span className="font-bold text-emerald-700">{formatINR(remaining, { compact: true })}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Utilization</span>
                    <span className={utilPct > 90 ? 'text-rose-600 font-bold' : 'text-slate-900'}>{utilPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        utilPct > 95 ? 'bg-rose-500' :
                        utilPct > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, utilPct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Disbursed: {formatINR(b.actual_expense_amount)}</span>
                    <span>Committed: {formatINR(b.committed_amount)}</span>
                  </div>
                </div>
              </div>

              {!isReadOnly && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 py-1 px-3 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    Adjust Budget
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Budget Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={editingBudget ? 'Adjust Budget Parameters' : 'Create New Budget Allocation'}
          subtitle="Define institutional spending cap for academic or facility categories"
          maxWidth="md"
        >
          <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus *</label>
              <select
                value={formData.campus_id}
                onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
              >
                {campuses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Budget Fiscal Period *</label>
              <input
                type="text"
                value={formData.budget_period}
                onChange={(e) => setFormData({ ...formData, budget_period: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Category *</label>
              <select
                value={formData.expense_category}
                onChange={(e) => setFormData({ ...formData, expense_category: e.target.value as ExpenseCategory })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Utilities">Utilities</option>
                <option value="Hostel and Facility Maintenance">Hostel and Facility Maintenance</option>
                <option value="Supplies">Supplies</option>
                <option value="Academic Operations">Academic Operations</option>
                <option value="Laboratory Supplies">Laboratory Supplies</option>
                <option value="Administrative Expenses">Administrative Expenses</option>
                <option value="IT and Software">IT and Software</option>
                <option value="Repairs">Repairs</option>
                <option value="Events">Events</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Allocated Budget Cap (₹ INR) *</label>
              <input
                type="number"
                value={formData.allocated_amount || ''}
                onChange={(e) => setFormData({ ...formData, allocated_amount: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-900"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Committed PO Reserve (₹ INR)</label>
              <input
                type="number"
                value={formData.committed_amount || ''}
                onChange={(e) => setFormData({ ...formData, committed_amount: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                min="0"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs"
              >
                Save Budget
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
