import { 
  StudentFeeAssessment, 
  Payment, 
  Expense, 
  Concession, 
  Refund, 
  FinancialSummaryMetrics,
  Campus,
  Budget
} from '../types/finance';

export function calculateFinancialMetrics(
  assessments: StudentFeeAssessment[],
  payments: Payment[],
  expenses: Expense[],
  concessions: Concession[],
  refunds: Refund[]
): FinancialSummaryMetrics {
  // Total Fee Demand is the sum of net amounts due across eligible assessments
  const totalFeeDemand = assessments.reduce((acc, curr) => acc + curr.net_amount_due, 0);

  // Confirmed Collections: only count payments with status === 'confirmed'
  const confirmedCollections = payments
    .filter(p => p.status === 'confirmed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Outstanding Balance: sum of outstanding balance on assessments
  const outstandingBalance = assessments.reduce((acc, curr) => acc + curr.outstanding_balance, 0);

  // Collection Rate
  const collectionRate = totalFeeDemand > 0 ? (confirmedCollections / totalFeeDemand) * 100 : 0;

  // Approved Expenses: only count approved expenses
  const approvedExpenses = expenses
    .filter(e => e.approval_status === 'approved')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Pending Approvals count: pending concessions, pending expenses, pending refunds
  const pendingConcessions = concessions.filter(c => c.approval_status === 'pending').length;
  const pendingExpenses = expenses.filter(e => e.approval_status === 'pending').length;
  const pendingRefunds = refunds.filter(r => r.approval_status === 'pending').length;
  const pendingApprovalsCount = pendingConcessions + pendingExpenses + pendingRefunds;

  return {
    totalFeeDemand,
    confirmedCollections,
    outstandingBalance,
    collectionRate: Math.round(collectionRate * 10) / 10,
    approvedExpenses,
    pendingApprovalsCount,
  };
}

export function calculateFeeGroupBreakdown(assessments: StudentFeeAssessment[]) {
  const groups: Record<string, { demand: number; collected: number; outstanding: number }> = {
    Academic: { demand: 0, collected: 0, outstanding: 0 },
    Hostel: { demand: 0, collected: 0, outstanding: 0 },
    Examination: { demand: 0, collected: 0, outstanding: 0 },
    Transport: { demand: 0, collected: 0, outstanding: 0 },
    Other: { demand: 0, collected: 0, outstanding: 0 },
  };

  assessments.forEach(item => {
    const grp = item.fee_group || 'Other';
    if (!groups[grp]) {
      groups[grp] = { demand: 0, collected: 0, outstanding: 0 };
    }
    groups[grp].demand += item.net_amount_due;
    groups[grp].collected += item.amount_paid;
    groups[grp].outstanding += item.outstanding_balance;
  });

  return Object.entries(groups).map(([name, data]) => ({
    name,
    demand: data.demand,
    collected: data.collected,
    outstanding: data.outstanding,
    rate: data.demand > 0 ? Math.round((data.collected / data.demand) * 100) : 0,
  }));
}

export function calculateHostelFeeBreakdown(assessments: StudentFeeAssessment[]) {
  const hostelAssessments = assessments.filter(a => a.fee_group === 'Hostel');
  const subcats: Record<string, number> = {};

  hostelAssessments.forEach(a => {
    const subcat = a.fee_subcategory || a.fee_category || 'Other Hostel';
    subcats[subcat] = (subcats[subcat] || 0) + a.net_amount_due;
  });

  return Object.entries(subcats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function calculateExpenseCategoryBreakdown(expenses: Expense[]) {
  const catTotals: Record<string, { approved: number; paid: number; pending: number }> = {};

  expenses.forEach(e => {
    if (!catTotals[e.expense_category]) {
      catTotals[e.expense_category] = { approved: 0, paid: 0, pending: 0 };
    }
    if (e.approval_status === 'approved') {
      catTotals[e.expense_category].approved += e.amount;
    }
    if (e.approval_status === 'pending') {
      catTotals[e.expense_category].pending += e.amount;
    }
    if (e.payment_status === 'paid') {
      catTotals[e.expense_category].paid += e.amount;
    }
  });

  return Object.entries(catTotals).map(([name, data]) => ({
    name,
    approved: data.approved,
    paid: data.paid,
    pending: data.pending,
  }));
}

export function calculateCampusComparison(
  campuses: Campus[],
  assessments: StudentFeeAssessment[],
  payments: Payment[],
  expenses: Expense[],
  budgets: Budget[]
) {
  return campuses.map(campus => {
    const campusAssessments = assessments.filter(a => a.campus_id === campus.id);
    const demand = campusAssessments.reduce((sum, a) => sum + a.net_amount_due, 0);
    const outstanding = campusAssessments.reduce((sum, a) => sum + a.outstanding_balance, 0);
    
    const campusPayments = payments.filter(p => p.campus_id === campus.id && p.status === 'confirmed');
    const collections = campusPayments.reduce((sum, p) => sum + p.amount, 0);

    const campusExpenses = expenses.filter(e => e.campus_id === campus.id && e.approval_status === 'approved');
    const expenseTotal = campusExpenses.reduce((sum, e) => sum + e.amount, 0);

    const campusBudgets = budgets.filter(b => b.campus_id === campus.id);
    const allocatedBudget = campusBudgets.reduce((sum, b) => sum + b.allocated_amount, 0);
    const budgetUsed = campusBudgets.reduce((sum, b) => sum + b.actual_expense_amount, 0);
    const budgetUtilization = allocatedBudget > 0 ? Math.round((budgetUsed / allocatedBudget) * 100) : 0;

    const rate = demand > 0 ? Math.round((collections / demand) * 100 * 10) / 10 : 0;

    return {
      campusId: campus.id,
      campusCode: campus.code,
      campusName: campus.name,
      city: campus.city,
      totalStudents: campus.totalStudents,
      demand,
      collections,
      outstanding,
      collectionRate: rate,
      expenses: expenseTotal,
      allocatedBudget,
      budgetUsed,
      budgetUtilization,
    };
  });
}
