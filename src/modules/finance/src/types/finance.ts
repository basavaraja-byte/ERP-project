export type Role = 'trustee' | 'dean' | 'admin' | 'accounts' | 'auditor';

export interface User {
  id: string;
  name: string;
  role: Role;
  assignedCampusId?: string; // If dean or admin/accounts
  email: string;
  avatar?: string;
}

export interface Campus {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  deanName: string;
  totalStudents: number;
  programsCount: number;
  address: string;
  contactEmail: string;
  contactPhone: string;
}

export type FeeGroup = 'Academic' | 'Hostel' | 'Examination' | 'Transport' | 'Other';

export type BillingFrequency = 'Annual' | 'Semester' | 'Monthly' | 'One-Time' | 'Per-Paper';

export interface FeeStructure {
  id: string;
  campus_id: string; // 'all' or specific campus
  academic_year: string; // e.g. '2026-27'
  course_or_program?: string;
  semester_or_year?: string;
  fee_group: FeeGroup;
  fee_category: string;
  fee_subcategory: string;
  description?: string;
  amount: number; // in Rupees
  billing_frequency: BillingFrequency;
  applicable_student_group?: string; // e.g. 'All Students', 'Hostel Residents', 'Day Scholars', 'Final Year'
  effective_from: string;
  effective_to?: string;
  mandatory_or_optional: 'Mandatory' | 'Optional';
  refundable_or_non_refundable: 'Non-Refundable' | 'Refundable';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface StudentFeeAssessment {
  id: string;
  student_code: string;
  student_name: string;
  campus_id: string;
  academic_year: string;
  course_or_program: string;
  semester_or_year: string;
  fee_structure_id?: string;
  fee_group: FeeGroup;
  fee_category: string;
  fee_subcategory: string;
  original_amount: number;
  approved_concession_amount: number;
  net_amount_due: number; // original_amount - approved_concession_amount
  due_date: string;
  amount_paid: number;
  outstanding_balance: number; // net_amount_due - amount_paid
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  created_at: string;
}

export interface InstallmentPlan {
  id: string;
  student_fee_assessment_id: string;
  student_code: string;
  student_name: string;
  campus_id: string;
  installment_number: number;
  total_installments: number;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  outstanding_amount: number;
  status: 'upcoming' | 'due' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
}

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'card' | 'cheque' | 'other';
export type PaymentStatus = 'confirmed' | 'pending' | 'failed' | 'reversed';

export interface PaymentAllocation {
  assessment_id: string;
  allocated_amount: number;
  fee_category: string;
  fee_subcategory: string;
}

export interface Payment {
  id: string;
  campus_id: string;
  student_code: string;
  student_name: string;
  payment_reference: string;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  allocated_amount: number;
  unallocated_amount: number;
  receipt_id?: string;
  notes?: string;
  allocations: PaymentAllocation[];
  created_at: string;
}

export interface Receipt {
  receipt_id: string;
  receipt_number: string; // e.g. 'REC-2026-001'
  payment_id: string;
  student_code: string;
  student_name: string;
  campus_id: string;
  receipt_date: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_reference: string;
  status: 'issued' | 'cancelled';
  fee_breakdown: { category: string; subcategory: string; amount: number }[];
  remarks?: string;
}

export type ConcessionType = 
  | 'Merit Scholarship'
  | 'Need-Based Scholarship'
  | 'Government Scholarship'
  | 'Institutional Scholarship'
  | 'Fee Waiver'
  | 'Fixed-Amount Concession'
  | 'Percentage Concession'
  | 'Other Approved Support';

export interface Concession {
  id: string;
  student_code: string;
  student_name: string;
  campus_id: string;
  concession_type: ConcessionType;
  amount_or_percentage: 'Fixed' | 'Percentage';
  value: number; // e.g., 25000 or 25%
  applicable_fee_categories: string[];
  reason_category: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  applied_amount: number; // Actual rupee amount applied to assessments
  created_at: string;
}

export type RefundReason = 
  | 'Course Withdrawal' 
  | 'Excess Payment' 
  | 'Hostel Vacating' 
  | 'Duplicate Payment' 
  | 'Admission Cancellation' 
  | 'Other';

export interface Refund {
  id: string;
  campus_id: string;
  student_code?: string;
  student_name?: string;
  original_payment_id?: string;
  refund_reason_category: RefundReason;
  refund_amount: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  refund_status: 'pending' | 'processing' | 'completed';
  requested_at: string;
  approved_by?: string;
  approved_at?: string;
  completed_at?: string;
  payment_mode?: string;
  notes?: string;
}

export type DepositType = 
  | 'Hostel Security Deposit'
  | 'Laboratory Deposit'
  | 'Library Deposit'
  | 'Caution Deposit'
  | 'Sports Equipment Deposit';

export interface RefundableDeposit {
  id: string;
  campus_id: string;
  student_code: string;
  student_name: string;
  deposit_type: DepositType;
  collected_amount: number;
  refundable_balance: number;
  amount_returned: number;
  status: 'active' | 'partially_refunded' | 'fully_refunded' | 'forfeited';
  collection_date: string;
  last_activity_date?: string;
}

export type ExpenseCategory = 
  | 'Utilities'
  | 'Hostel and Facility Maintenance'
  | 'Supplies'
  | 'Academic Operations'
  | 'Laboratory Supplies'
  | 'Administrative Expenses'
  | 'IT and Software'
  | 'Events'
  | 'Repairs'
  | 'Other Approved Expenses';

export interface Expense {
  id: string;
  campus_id: string;
  expense_category: ExpenseCategory;
  vendor_id?: string;
  vendor_name?: string;
  reference_number: string;
  expense_date: string;
  amount: number;
  approval_status: 'draft' | 'pending' | 'approved' | 'rejected';
  payment_status: 'unpaid' | 'partially_paid' | 'paid';
  submitted_by: string;
  approved_by?: string;
  description: string;
  created_at: string;
}

export interface Budget {
  id: string;
  campus_id: string;
  budget_period: string; // e.g. 'FY 2026-27'
  expense_category: ExpenseCategory;
  allocated_amount: number;
  committed_amount: number;
  actual_expense_amount: number;
  status: 'healthy' | 'warning' | 'exceeded';
}

export interface Vendor {
  id: string;
  vendor_code: string;
  name: string;
  category: string;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  status: 'active' | 'inactive';
  city: string;
}

export type ReconciliationExceptionType = 
  | 'Duplicate Payment Reference'
  | 'Amount Mismatch'
  | 'Unallocated Payment'
  | 'Missing Receipt Reference'
  | 'Payment Allocation Mismatch'
  | 'Refund Mismatch'
  | 'Manual Review Required';

export interface ReconciliationException {
  id: string;
  campus_id: string;
  reference: string;
  exception_type: ReconciliationExceptionType;
  expected_amount?: number;
  recorded_amount?: number;
  status: 'unresolved' | 'under_review' | 'resolved' | 'escalated';
  assigned_reviewer?: string;
  review_outcome?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditHistoryEntry {
  id: string;
  actor_user_id: string;
  actor_name: string;
  campus_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  reason?: string;
  before_data?: Record<string, unknown> | null;
  after_data?: Record<string, unknown> | null;
  request_id?: string;
}

export interface FinancialSummaryMetrics {
  totalFeeDemand: number;
  confirmedCollections: number;
  outstandingBalance: number;
  collectionRate: number; // percentage
  approvedExpenses: number;
  pendingApprovalsCount: number;
}
