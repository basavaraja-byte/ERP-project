import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Campus,
  User,
  FeeStructure,
  StudentFeeAssessment,
  InstallmentPlan,
  Payment,
  Receipt,
  Concession,
  Refund,
  RefundableDeposit,
  Expense,
  Budget,
  Vendor,
  ReconciliationException,
  AuditHistoryEntry,
  PaymentMethod,
} from '../types/finance';
import {
  INITIAL_CAMPUSES,
  INITIAL_USERS,
  INITIAL_FEE_STRUCTURES,
  INITIAL_STUDENT_ASSESSMENTS,
  INITIAL_INSTALLMENTS,
  INITIAL_PAYMENTS,
  INITIAL_RECEIPTS,
  INITIAL_CONCESSIONS,
  INITIAL_REFUNDS,
  INITIAL_DEPOSITS,
  INITIAL_EXPENSES,
  INITIAL_BUDGETS,
  INITIAL_VENDORS,
  INITIAL_RECONCILIATION_EXCEPTIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

interface FinanceContextType {
  // Current session
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeCampusId: string; // 'all' or specific campus id
  setActiveCampusId: (id: string) => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  availableCampuses: Campus[];
  users: User[];

  // Entities
  campuses: Campus[];
  feeStructures: FeeStructure[];
  studentAssessments: StudentFeeAssessment[];
  installments: InstallmentPlan[];
  payments: Payment[];
  receipts: Receipt[];
  concessions: Concession[];
  refunds: Refund[];
  deposits: RefundableDeposit[];
  expenses: Expense[];
  budgets: Budget[];
  vendors: Vendor[];
  reconciliationExceptions: ReconciliationException[];
  auditLogs: AuditHistoryEntry[];

  // Filtered views respecting campus & role scope
  scopedAssessments: StudentFeeAssessment[];
  scopedPayments: Payment[];
  scopedReceipts: Receipt[];
  scopedExpenses: Expense[];
  scopedBudgets: Budget[];
  scopedConcessions: Concession[];
  scopedRefunds: Refund[];
  scopedDeposits: RefundableDeposit[];
  scopedExceptions: ReconciliationException[];
  scopedFeeStructures: FeeStructure[];

  // Actions
  addFeeStructure: (fee: Omit<FeeStructure, 'id' | 'created_at'>) => void;
  updateFeeStructure: (id: string, updates: Partial<FeeStructure>) => void;
  toggleFeeStatus: (id: string) => void;
  duplicateFeeStructure: (id: string, targetAcademicYear: string) => void;

  addStudentAssessment: (asm: Omit<StudentFeeAssessment, 'id' | 'created_at'>) => void;

  recordPayment: (paymentData: {
    student_code: string;
    campus_id: string;
    amount: number;
    payment_method: PaymentMethod;
    payment_reference: string;
    notes?: string;
    allocations: { assessment_id: string; allocated_amount: number; fee_category: string; fee_subcategory: string }[];
  }) => { success: boolean; error?: string; paymentId?: string };

  approveConcession: (concessionId: string) => void;
  rejectConcession: (concessionId: string, reason?: string) => void;
  addConcessionRequest: (concession: Omit<Concession, 'id' | 'created_at' | 'approval_status' | 'applied_amount'>) => void;

  requestRefund: (refund: Omit<Refund, 'id' | 'requested_at' | 'approval_status' | 'refund_status'>) => void;
  approveRefund: (refundId: string) => void;
  completeRefund: (refundId: string, mode: string) => void;

  addDeposit: (deposit: Omit<RefundableDeposit, 'id'>) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'submitted_by' | 'approval_status' | 'payment_status'>) => void;
  approveExpense: (expenseId: string) => void;
  rejectExpense: (expenseId: string, reason?: string) => void;
  markExpensePaid: (expenseId: string) => void;

  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;

  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;

  resolveException: (id: string, outcome: string, newStatus: 'resolved' | 'escalated') => void;

  resetDemoData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'FINANCE_SYSTEM_DEMO_';

export interface FinanceProviderProps {
  children: React.ReactNode;
  initialUser?: any;
  initialCampusId?: string;
  onSelectCampus?: (campusId: string) => void;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ 
  children,
  initialUser,
  initialCampusId,
  onSelectCampus
}) => {
  // Load initial states from localStorage safely
  const loadStored = <T,>(key: string, defaultVal: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
      console.warn(`Failed reading ${key} from storage:`, e);
      return defaultVal;
    }
  };

  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUserState] = useState<User>(() => loadStored('USER', INITIAL_USERS[0]));
  const [activeCampusId, setActiveCampusIdState] = useState<string>(() => {
    if (initialCampusId) return initialCampusId;
    const saved = loadStored<string>('ACTIVE_CAMPUS', 'all');
    // If user is dean, lock to dean's assigned campus!
    if (INITIAL_USERS[0].role === 'dean' && INITIAL_USERS[0].assignedCampusId) {
      return INITIAL_USERS[0].assignedCampusId;
    }
    return saved;
  });
  const [academicYear, setAcademicYearState] = useState<string>(() => loadStored('ACADEMIC_YEAR', '2026-27'));

  // Synchronize authenticated user from parent TrustView application
  useEffect(() => {
    if (initialUser) {
      const rawRole = (initialUser.role || '').toUpperCase();
      let financeRole: Role = 'trustee';
      if (rawRole === 'DEAN' || rawRole === 'PRINCIPAL') {
        financeRole = 'dean';
      } else if (rawRole === 'HOD' || rawRole === 'FACULTY') {
        financeRole = 'admin';
      } else if (rawRole === 'STUDENT' || rawRole === 'PARENT' || rawRole === 'WARDEN') {
        financeRole = 'accounts';
      }

      setCurrentUserState({
        id: initialUser.userId || initialUser.id || 'usr-1',
        name: initialUser.name || 'User',
        role: financeRole,
        assignedCampusId: initialUser.assignedCampusId,
        email: initialUser.email || 'user@trustview.edu'
      });

      if (rawRole !== 'TRUSTEE' && initialUser.assignedCampusId) {
        setActiveCampusIdState(initialUser.assignedCampusId);
      }
    }
  }, [initialUser]);

  // Synchronize selected campus from parent TrustView application
  useEffect(() => {
    if (initialCampusId !== undefined) {
      if (currentUser.role === 'dean' && currentUser.assignedCampusId) {
        setActiveCampusIdState(currentUser.assignedCampusId);
      } else {
        setActiveCampusIdState(initialCampusId);
      }
    }
  }, [initialCampusId, currentUser.role, currentUser.assignedCampusId]);

  const [campuses] = useState<Campus[]>(INITIAL_CAMPUSES);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(() => loadStored('FEE_STRUCTURES', INITIAL_FEE_STRUCTURES));
  const [studentAssessments, setStudentAssessments] = useState<StudentFeeAssessment[]>(() => loadStored('STUDENT_ASSESSMENTS', INITIAL_STUDENT_ASSESSMENTS));
  const [installments, setInstallments] = useState<InstallmentPlan[]>(() => loadStored('INSTALLMENTS', INITIAL_INSTALLMENTS));
  const [payments, setPayments] = useState<Payment[]>(() => loadStored('PAYMENTS', INITIAL_PAYMENTS));
  const [receipts, setReceipts] = useState<Receipt[]>(() => loadStored('RECEIPTS', INITIAL_RECEIPTS));
  const [concessions, setConcessions] = useState<Concession[]>(() => loadStored('CONCESSIONS', INITIAL_CONCESSIONS));
  const [refunds, setRefunds] = useState<Refund[]>(() => loadStored('REFUNDS', INITIAL_REFUNDS));
  const [deposits, setDeposits] = useState<RefundableDeposit[]>(() => loadStored('DEPOSITS', INITIAL_DEPOSITS));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadStored('EXPENSES', INITIAL_EXPENSES));
  const [budgets, setBudgets] = useState<Budget[]>(() => loadStored('BUDGETS', INITIAL_BUDGETS));
  const [vendors, setVendors] = useState<Vendor[]>(() => loadStored('VENDORS', INITIAL_VENDORS));
  const [reconciliationExceptions, setReconciliationExceptions] = useState<ReconciliationException[]>(() => loadStored('EXCEPTIONS', INITIAL_RECONCILIATION_EXCEPTIONS));
  const [auditLogs, setAuditLogs] = useState<AuditHistoryEntry[]>(() => loadStored('AUDIT_LOGS', INITIAL_AUDIT_LOGS));

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'USER', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'ACTIVE_CAMPUS', JSON.stringify(activeCampusId));
  }, [activeCampusId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'ACADEMIC_YEAR', JSON.stringify(academicYear));
  }, [academicYear]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'FEE_STRUCTURES', JSON.stringify(feeStructures));
  }, [feeStructures]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'STUDENT_ASSESSMENTS', JSON.stringify(studentAssessments));
  }, [studentAssessments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'INSTALLMENTS', JSON.stringify(installments));
  }, [installments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'PAYMENTS', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'RECEIPTS', JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'CONCESSIONS', JSON.stringify(concessions));
  }, [concessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'REFUNDS', JSON.stringify(refunds));
  }, [refunds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'DEPOSITS', JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'EXPENSES', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'BUDGETS', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'VENDORS', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'EXCEPTIONS', JSON.stringify(reconciliationExceptions));
  }, [reconciliationExceptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'AUDIT_LOGS', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Handle user switching: if role is Dean, strictly enforce Dean's campus
  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    if (user.role === 'dean' && user.assignedCampusId) {
      setActiveCampusIdState(user.assignedCampusId);
    }
  };

  const setActiveCampusId = (campusId: string) => {
    // If dean or principal, prevent switching away from assigned campus
    if (currentUser.role === 'dean') {
      if (currentUser.assignedCampusId && campusId !== currentUser.assignedCampusId) {
        alert('Access Restricted: Deans and Principals can only view and manage their assigned campus.');
        return;
      }
    }
    setActiveCampusIdState(campusId);
    if (onSelectCampus) {
      onSelectCampus(campusId);
    }
  };

  const setAcademicYear = (year: string) => {
    setAcademicYearState(year);
  };

  // Helper for audit logging
  const logAudit = (action: string, entityType: string, entityId: string, reason: string, beforeData?: Record<string, unknown> | null, afterData?: Record<string, unknown> | null) => {
    const newEntry: AuditHistoryEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actor_user_id: currentUser.id,
      actor_name: currentUser.name,
      campus_id: activeCampusId !== 'all' ? activeCampusId : currentUser.assignedCampusId || 'all',
      action,
      entity_type: entityType,
      entity_id: entityId,
      timestamp: new Date().toISOString(),
      reason,
      before_data: beforeData || null,
      after_data: afterData || null,
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Scoped views calculation
  const isAll = activeCampusId === 'all';

  const scopedAssessments = useMemo(() => {
    let list = isAll ? studentAssessments : studentAssessments.filter(a => a.campus_id === activeCampusId);
    if (initialUser?.role === 'STUDENT' && initialUser?.studentId) {
      list = list.filter(a => a.student_code === initialUser.studentId);
    } else if (initialUser?.role === 'PARENT' && (initialUser?.wardStudentId || initialUser?.studentId)) {
      const wardId = initialUser.wardStudentId || initialUser.studentId;
      list = list.filter(a => a.student_code === wardId);
    }
    return list;
  }, [isAll, activeCampusId, studentAssessments, initialUser]);

  const scopedPayments = useMemo(() => {
    let list = isAll ? payments : payments.filter(p => p.campus_id === activeCampusId);
    if (initialUser?.role === 'STUDENT' && initialUser?.studentId) {
      list = list.filter(p => p.student_code === initialUser.studentId);
    } else if (initialUser?.role === 'PARENT' && (initialUser?.wardStudentId || initialUser?.studentId)) {
      const wardId = initialUser.wardStudentId || initialUser.studentId;
      list = list.filter(p => p.student_code === wardId);
    }
    return list;
  }, [isAll, activeCampusId, payments, initialUser]);

  const scopedReceipts = useMemo(() => {
    let list = isAll ? receipts : receipts.filter(r => r.campus_id === activeCampusId);
    if (initialUser?.role === 'STUDENT' && initialUser?.studentId) {
      list = list.filter(r => r.student_code === initialUser.studentId);
    } else if (initialUser?.role === 'PARENT' && (initialUser?.wardStudentId || initialUser?.studentId)) {
      const wardId = initialUser.wardStudentId || initialUser.studentId;
      list = list.filter(r => r.student_code === wardId);
    }
    return list;
  }, [isAll, activeCampusId, receipts, initialUser]);

  const scopedExpenses = useMemo(() => {
    return isAll ? expenses : expenses.filter(e => e.campus_id === activeCampusId);
  }, [isAll, activeCampusId, expenses]);

  const scopedBudgets = useMemo(() => {
    return isAll ? budgets : budgets.filter(b => b.campus_id === activeCampusId);
  }, [isAll, activeCampusId, budgets]);

  const scopedConcessions = useMemo(() => {
    return isAll ? concessions : concessions.filter(c => c.campus_id === activeCampusId);
  }, [isAll, activeCampusId, concessions]);

  const scopedRefunds = useMemo(() => {
    return isAll ? refunds : refunds.filter(r => r.campus_id === activeCampusId);
  }, [isAll, activeCampusId, refunds]);

  const scopedDeposits = useMemo(() => {
    return isAll ? deposits : deposits.filter(d => d.campus_id === activeCampusId);
  }, [isAll, activeCampusId, deposits]);

  const scopedExceptions = useMemo(() => {
    return isAll ? reconciliationExceptions : reconciliationExceptions.filter(e => e.campus_id === activeCampusId);
  }, [isAll, activeCampusId, reconciliationExceptions]);

  const scopedFeeStructures = useMemo(() => {
    return isAll ? feeStructures : feeStructures.filter(f => f.campus_id === activeCampusId || f.campus_id === 'all');
  }, [isAll, activeCampusId, feeStructures]);

  // --- ACTIONS ---

  const addFeeStructure = (fee: Omit<FeeStructure, 'id' | 'created_at'>) => {
    const newFee: FeeStructure = {
      ...fee,
      id: `fee-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setFeeStructures(prev => [newFee, ...prev]);
    logAudit('CREATE_FEE_STRUCTURE', 'FeeStructure', newFee.id, `Created ${newFee.fee_category} - ${newFee.fee_subcategory}`, null, newFee as unknown as Record<string, unknown>);
  };

  const updateFeeStructure = (id: string, updates: Partial<FeeStructure>) => {
    const existing = feeStructures.find(f => f.id === id);
    setFeeStructures(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    logAudit('UPDATE_FEE_STRUCTURE', 'FeeStructure', id, `Updated fee structure fields`, existing as unknown as Record<string, unknown>, updates as unknown as Record<string, unknown>);
  };

  const toggleFeeStatus = (id: string) => {
    const existing = feeStructures.find(f => f.id === id);
    if (!existing) return;
    const newStatus = existing.status === 'active' ? 'inactive' : 'active';
    setFeeStructures(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
    logAudit('TOGGLE_FEE_STATUS', 'FeeStructure', id, `Changed fee status to ${newStatus}`, { status: existing.status }, { status: newStatus });
  };

  const duplicateFeeStructure = (id: string, targetAcademicYear: string) => {
    const original = feeStructures.find(f => f.id === id);
    if (!original) return;
    const duplicated: FeeStructure = {
      ...original,
      id: `fee-${Date.now()}`,
      academic_year: targetAcademicYear,
      created_at: new Date().toISOString(),
    };
    setFeeStructures(prev => [duplicated, ...prev]);
    logAudit('DUPLICATE_FEE_STRUCTURE', 'FeeStructure', duplicated.id, `Duplicated from ${original.academic_year} to ${targetAcademicYear}`, { originalId: id }, duplicated as unknown as Record<string, unknown>);
  };

  const addStudentAssessment = (asm: Omit<StudentFeeAssessment, 'id' | 'created_at'>) => {
    const newAsm: StudentFeeAssessment = {
      ...asm,
      id: `asm-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setStudentAssessments(prev => [newAsm, ...prev]);
    logAudit('CREATE_ASSESSMENT', 'StudentFeeAssessment', newAsm.id, `Assessed ${newAsm.fee_category} to ${newAsm.student_name} (${newAsm.student_code})`, null, newAsm as unknown as Record<string, unknown>);
  };

  const recordPayment = (paymentData: {
    student_code: string;
    campus_id: string;
    amount: number;
    payment_method: PaymentMethod;
    payment_reference: string;
    notes?: string;
    allocations: { assessment_id: string; allocated_amount: number; fee_category: string; fee_subcategory: string }[];
  }) => {
    // 1. Validation: check for duplicate payment reference among existing payments
    const isDuplicate = payments.some(
      p => p.payment_reference.trim().toLowerCase() === paymentData.payment_reference.trim().toLowerCase()
    );
    if (isDuplicate) {
      return {
        success: false,
        error: `Duplicate payment reference "${paymentData.payment_reference}" detected. Please verify bank slip.`,
      };
    }

    const studentAss = studentAssessments.find(a => a.student_code === paymentData.student_code);
    const studentName = studentAss ? studentAss.student_name : 'Student ' + paymentData.student_code;

    const totalAllocated = paymentData.allocations.reduce((s, a) => s + a.allocated_amount, 0);
    const unallocated = Math.max(0, paymentData.amount - totalAllocated);

    const paymentId = `pay-${Date.now()}`;
    const receiptId = `rec-${Date.now()}`;
    const receiptNumber = `REC-${new Date().getFullYear()}-${paymentData.campus_id.toUpperCase().replace('CAMPUS-', 'C')}-${String(receipts.length + 1).padStart(4, '0')}`;

    const newPayment: Payment = {
      id: paymentId,
      campus_id: paymentData.campus_id,
      student_code: paymentData.student_code,
      student_name: studentName,
      payment_reference: paymentData.payment_reference,
      payment_date: new Date().toISOString().split('T')[0],
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      status: 'confirmed',
      allocated_amount: totalAllocated,
      unallocated_amount: unallocated,
      receipt_id: receiptId,
      notes: paymentData.notes || '',
      allocations: paymentData.allocations,
      created_at: new Date().toISOString(),
    };

    // 2. Update Student Fee Assessments (reduce outstanding balance, increase amount_paid, update status)
    setStudentAssessments(prev => {
      return prev.map(asm => {
        const alloc = paymentData.allocations.find(a => a.assessment_id === asm.id);
        if (!alloc) return asm;

        const newPaid = asm.amount_paid + alloc.allocated_amount;
        const newOutstanding = Math.max(0, asm.net_amount_due - newPaid);
        const newStatus = newOutstanding === 0 ? 'paid' : 'partial';

        return {
          ...asm,
          amount_paid: newPaid,
          outstanding_balance: newOutstanding,
          status: newStatus,
        };
      });
    });

    // 3. Update Installments if applicable
    setInstallments(prev => {
      return prev.map(inst => {
        const alloc = paymentData.allocations.find(a => a.assessment_id === inst.student_fee_assessment_id);
        if (!alloc) return inst;
        if (inst.status === 'paid') return inst;

        // Apply to installment
        const needed = inst.amount_due - inst.amount_paid;
        const toApply = Math.min(needed, alloc.allocated_amount);
        if (toApply <= 0) return inst;

        const newInstPaid = inst.amount_paid + toApply;
        const newInstOut = inst.amount_due - newInstPaid;
        return {
          ...inst,
          amount_paid: newInstPaid,
          outstanding_amount: newInstOut,
          status: newInstOut === 0 ? 'paid' : 'partially_paid',
        };
      });
    });

    // 4. Create Official Demo Receipt
    const newReceipt: Receipt = {
      receipt_id: receiptId,
      receipt_number: receiptNumber,
      payment_id: paymentId,
      student_code: paymentData.student_code,
      student_name: studentName,
      campus_id: paymentData.campus_id,
      receipt_date: new Date().toISOString().split('T')[0],
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      payment_reference: paymentData.payment_reference,
      status: 'issued',
      fee_breakdown: paymentData.allocations.map(a => ({
        category: a.fee_category,
        subcategory: a.fee_subcategory,
        amount: a.allocated_amount,
      })),
      remarks: paymentData.notes || 'Institutional fee collection confirmed',
    };

    setPayments(prev => [newPayment, ...prev]);
    setReceipts(prev => [newReceipt, ...prev]);

    logAudit(
      'RECORD_PAYMENT',
      'Payment',
      paymentId,
      `Recorded payment of ₹${paymentData.amount.toLocaleString('en-IN')} for ${studentName} (${paymentData.student_code})`,
      null,
      newPayment as unknown as Record<string, unknown>
    );

    return { success: true, paymentId };
  };

  const approveConcession = (concessionId: string) => {
    const conc = concessions.find(c => c.id === concessionId);
    if (!conc) return;

    // Apply concession discount directly to matching eligible student fee assessments
    let amountLeftToApply = conc.value;
    setStudentAssessments(prev => {
      return prev.map(asm => {
        if (asm.student_code !== conc.student_code) return asm;
        // Check if applicable category matches
        const matchesCategory = conc.applicable_fee_categories.includes(asm.fee_category);
        if (!matchesCategory || amountLeftToApply <= 0) return asm;

        const deduction = Math.min(amountLeftToApply, asm.net_amount_due);
        amountLeftToApply -= deduction;

        const newConcessionAmt = asm.approved_concession_amount + deduction;
        const newNetDue = Math.max(0, asm.original_amount - newConcessionAmt);
        const newOutstanding = Math.max(0, newNetDue - asm.amount_paid);
        const newStatus = newOutstanding === 0 ? 'paid' : (asm.amount_paid > 0 ? 'partial' : 'pending');

        return {
          ...asm,
          approved_concession_amount: newConcessionAmt,
          net_amount_due: newNetDue,
          outstanding_balance: newOutstanding,
          status: newStatus,
        };
      });
    });

    setConcessions(prev => {
      return prev.map(c => {
        if (c.id !== concessionId) return c;
        return {
          ...c,
          approval_status: 'approved',
          approved_by: currentUser.name,
          approved_at: new Date().toISOString(),
          applied_amount: conc.value - amountLeftToApply,
        };
      });
    });

    logAudit('APPROVE_CONCESSION', 'Concession', concessionId, `Approved concession of ₹${conc.value} for ${conc.student_name}`, { status: 'pending' }, { status: 'approved', approvedBy: currentUser.name });
  };

  const rejectConcession = (concessionId: string, reason?: string) => {
    setConcessions(prev => prev.map(c => c.id === concessionId ? { ...c, approval_status: 'rejected', approved_by: currentUser.name, approved_at: new Date().toISOString() } : c));
    logAudit('REJECT_CONCESSION', 'Concession', concessionId, `Rejected concession request. Reason: ${reason || 'Ineligible criteria'}`, { status: 'pending' }, { status: 'rejected' });
  };

  const addConcessionRequest = (concData: Omit<Concession, 'id' | 'created_at' | 'approval_status' | 'applied_amount'>) => {
    const newConc: Concession = {
      ...concData,
      id: `con-${Date.now()}`,
      approval_status: 'pending',
      applied_amount: 0,
      created_at: new Date().toISOString(),
    };
    setConcessions(prev => [newConc, ...prev]);
    logAudit('REQUEST_CONCESSION', 'Concession', newConc.id, `Submitted concession request of ₹${newConc.value} for ${newConc.student_name}`, null, newConc as unknown as Record<string, unknown>);
  };

  const requestRefund = (refData: Omit<Refund, 'id' | 'requested_at' | 'approval_status' | 'refund_status'>) => {
    const newRef: Refund = {
      ...refData,
      id: `ref-${Date.now()}`,
      approval_status: 'pending',
      refund_status: 'pending',
      requested_at: new Date().toISOString(),
    };
    setRefunds(prev => [newRef, ...prev]);
    logAudit('REQUEST_REFUND', 'Refund', newRef.id, `Submitted refund request of ₹${newRef.refund_amount} (${newRef.refund_reason_category})`, null, newRef as unknown as Record<string, unknown>);
  };

  const approveRefund = (refundId: string) => {
    setRefunds(prev => prev.map(r => r.id === refundId ? { ...r, approval_status: 'approved', refund_status: 'processing', approved_by: currentUser.name, approved_at: new Date().toISOString() } : r));
    logAudit('APPROVE_REFUND', 'Refund', refundId, `Approved refund request for processing`, { approval_status: 'pending' }, { approval_status: 'approved' });
  };

  const completeRefund = (refundId: string, mode: string) => {
    setRefunds(prev => prev.map(r => r.id === refundId ? { ...r, refund_status: 'completed', completed_at: new Date().toISOString(), payment_mode: mode } : r));
    logAudit('COMPLETE_REFUND', 'Refund', refundId, `Refund completed via ${mode}`, { refund_status: 'processing' }, { refund_status: 'completed' });
  };

  const addDeposit = (deposit: Omit<RefundableDeposit, 'id'>) => {
    const newDep: RefundableDeposit = {
      ...deposit,
      id: `dep-${Date.now()}`,
    };
    setDeposits(prev => [newDep, ...prev]);
    logAudit('COLLECT_DEPOSIT', 'RefundableDeposit', newDep.id, `Collected ${newDep.deposit_type} of ₹${newDep.collected_amount} from ${newDep.student_name}`, null, newDep as unknown as Record<string, unknown>);
  };

  const addExpense = (expData: Omit<Expense, 'id' | 'created_at' | 'submitted_by' | 'approval_status' | 'payment_status'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      approval_status: 'pending',
      payment_status: 'unpaid',
      submitted_by: currentUser.name,
      created_at: new Date().toISOString(),
    };
    setExpenses(prev => [newExp, ...prev]);
    logAudit('SUBMIT_EXPENSE', 'Expense', newExp.id, `Submitted expense ${newExp.reference_number} for ₹${newExp.amount}`, null, newExp as unknown as Record<string, unknown>);
  };

  const approveExpense = (expenseId: string) => {
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, approval_status: 'approved', approved_by: currentUser.name } : e));
    logAudit('APPROVE_EXPENSE', 'Expense', expenseId, `Approved expense entry`, { approval_status: 'pending' }, { approval_status: 'approved' });
  };

  const rejectExpense = (expenseId: string, reason?: string) => {
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, approval_status: 'rejected', approved_by: currentUser.name } : e));
    logAudit('REJECT_EXPENSE', 'Expense', expenseId, `Rejected expense. Reason: ${reason || 'Budget or invoice issue'}`, { approval_status: 'pending' }, { approval_status: 'rejected' });
  };

  const markExpensePaid = (expenseId: string) => {
    const exp = expenses.find(e => e.id === expenseId);
    if (!exp) return;
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, payment_status: 'paid' } : e));

    // Update actual expense amount in corresponding budget
    setBudgets(prev => {
      return prev.map(b => {
        if (b.campus_id === exp.campus_id && b.expense_category === exp.expense_category) {
          const newActual = b.actual_expense_amount + exp.amount;
          const ratio = (newActual + b.committed_amount) / b.allocated_amount;
          const newStatus = ratio > 1 ? 'exceeded' : (ratio > 0.85 ? 'warning' : 'healthy');
          return {
            ...b,
            actual_expense_amount: newActual,
            status: newStatus,
          };
        }
        return b;
      });
    });

    logAudit('PAY_EXPENSE', 'Expense', expenseId, `Marked expense as paid (₹${exp.amount}) and updated budget ledger`, { payment_status: 'unpaid' }, { payment_status: 'paid' });
  };

  const addBudget = (b: Omit<Budget, 'id'>) => {
    const newBdg: Budget = {
      ...b,
      id: `bdg-${Date.now()}`,
    };
    setBudgets(prev => [newBdg, ...prev]);
    logAudit('CREATE_BUDGET', 'Budget', newBdg.id, `Allocated ₹${newBdg.allocated_amount} for ${newBdg.expense_category} (${newBdg.budget_period})`, null, newBdg as unknown as Record<string, unknown>);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    logAudit('UPDATE_BUDGET', 'Budget', id, `Updated budget parameters`, null, updates as unknown as Record<string, unknown>);
  };

  const addVendor = (v: Omit<Vendor, 'id'>) => {
    const newVen: Vendor = {
      ...v,
      id: `ven-${Date.now()}`,
    };
    setVendors(prev => [newVen, ...prev]);
    logAudit('CREATE_VENDOR', 'Vendor', newVen.id, `Registered vendor ${newVen.name} (${newVen.vendor_code})`, null, newVen as unknown as Record<string, unknown>);
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    logAudit('UPDATE_VENDOR', 'Vendor', id, `Updated vendor details`, null, updates as unknown as Record<string, unknown>);
  };

  const resolveException = (id: string, outcome: string, newStatus: 'resolved' | 'escalated') => {
    setReconciliationExceptions(prev => prev.map(e => e.id === id ? { ...e, status: newStatus, review_outcome: outcome, assigned_reviewer: currentUser.name, updated_at: new Date().toISOString() } : e));
    logAudit('RESOLVE_EXCEPTION', 'ReconciliationException', id, `Reconciliation outcome: ${outcome}`, null, { status: newStatus, outcome });
  };

  const resetDemoData = () => {
    localStorage.clear();
    setFeeStructures(INITIAL_FEE_STRUCTURES);
    setStudentAssessments(INITIAL_STUDENT_ASSESSMENTS);
    setInstallments(INITIAL_INSTALLMENTS);
    setPayments(INITIAL_PAYMENTS);
    setReceipts(INITIAL_RECEIPTS);
    setConcessions(INITIAL_CONCESSIONS);
    setRefunds(INITIAL_REFUNDS);
    setDeposits(INITIAL_DEPOSITS);
    setExpenses(INITIAL_EXPENSES);
    setBudgets(INITIAL_BUDGETS);
    setVendors(INITIAL_VENDORS);
    setReconciliationExceptions(INITIAL_RECONCILIATION_EXCEPTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUserState(INITIAL_USERS[0]);
    setActiveCampusIdState('all');
    setAcademicYearState('2026-27');
    alert('System Reset: Demo datasets restored to initial factory values.');
  };

  return (
    <FinanceContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeCampusId,
        setActiveCampusId,
        academicYear,
        setAcademicYear,
        availableCampuses: campuses,
        users,

        campuses,
        feeStructures,
        studentAssessments,
        installments,
        payments,
        receipts,
        concessions,
        refunds,
        deposits,
        expenses,
        budgets,
        vendors,
        reconciliationExceptions,
        auditLogs,

        scopedAssessments,
        scopedPayments,
        scopedReceipts,
        scopedExpenses,
        scopedBudgets,
        scopedConcessions,
        scopedRefunds,
        scopedDeposits,
        scopedExceptions,
        scopedFeeStructures,

        addFeeStructure,
        updateFeeStructure,
        toggleFeeStatus,
        duplicateFeeStructure,
        addStudentAssessment,
        recordPayment,
        approveConcession,
        rejectConcession,
        addConcessionRequest,
        requestRefund,
        approveRefund,
        completeRefund,
        addDeposit,
        addExpense,
        approveExpense,
        rejectExpense,
        markExpensePaid,
        addBudget,
        updateBudget,
        addVendor,
        updateVendor,
        resolveException,
        resetDemoData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
