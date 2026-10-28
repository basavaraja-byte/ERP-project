import { getInitialERPState, type ERPStoreState } from '../mock/seedData';
import type { PaymentRecord, SupportRequest, NotificationItem, FeeAssessment } from '../types';

const STORAGE_KEY = 'AAROHAN_ERP_DATA_V1';

class MockStorage {
  private state: ERPStoreState;

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): ERPStoreState {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // In case sessionStorage fails or is disabled
    }
    const initial = getInitialERPState();
    this.saveToStorage(initial);
    return initial;
  }

  private saveToStorage(state: ERPStoreState) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }

  public getState(): ERPStoreState {
    return this.state;
  }

  public resetToDefault(): ERPStoreState {
    this.state = getInitialERPState();
    this.saveToStorage(this.state);
    return this.state;
  }

  public markNotificationRead(notificationId: string): void {
    const notif = this.state.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.isRead = true;
      this.saveToStorage(this.state);
    }
  }

  public markAllNotificationsRead(recipientId: string): void {
    this.state.notifications.forEach((n) => {
      if (n.recipientId === recipientId || n.recipientId === 'ALL') {
        n.isRead = true;
      }
    });
    this.saveToStorage(this.state);
  }

  public addSupportRequest(request: Omit<SupportRequest, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>): SupportRequest {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newReq: SupportRequest = {
      ...request,
      id: `REQ-${Date.now()}`,
      ticketNumber: `TKT-2026-${randomSuffix}`,
      status: 'PENDING',
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      updatedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    this.state.supportRequests.unshift(newReq);
    this.saveToStorage(this.state);
    return newReq;
  }

  // Simulated Payment Execution:
  // 1. Validates outstanding assessment
  // 2. Records confirmed simulated payment
  // 3. Updates outstanding balance (Assessed - Concessions - Confirmed Payments)
  // 4. Updates assessment status (PAID or PARTIALLY_PAID)
  // 5. Generates receipt reference
  // 6. Creates an audit notification
  public processSimulatedPayment(feeAssessmentId: string, amount: number, notes?: string): { success: boolean; payment?: PaymentRecord; updatedAssessment?: FeeAssessment; error?: string } {
    const assessment = this.state.fees.find((f) => f.id === feeAssessmentId);
    if (!assessment) {
      return { success: false, error: 'Fee assessment record not found.' };
    }

    if (amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero.' };
    }

    if (amount > assessment.outstandingBalance) {
      return { success: false, error: `Payment amount ₹${amount.toLocaleString('en-IN')} exceeds current outstanding balance ₹${assessment.outstandingBalance.toLocaleString('en-IN')}.` };
    }

    const refNum = Math.floor(1000 + Math.random() * 9000);
    const receiptCode = `REC-SIM-${new Date().getFullYear()}-${refNum}`;

    const newPayment: PaymentRecord = {
      id: `PAY-SIM-${Date.now()}`,
      paymentReference: receiptCode,
      feeAssessmentId: assessment.id,
      studentId: assessment.studentId,
      amount: amount,
      paymentMethod: 'DEMO_SIMULATED',
      status: 'CONFIRMED',
      transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      receiptNumber: receiptCode,
      isSimulated: true,
      notes: notes || 'Simulated demonstration payment executed in demo sandbox mode.'
    };

    assessment.payments.push(newPayment);
    assessment.confirmedPaid += amount;
    assessment.outstandingBalance = assessment.totalAssessed - assessment.totalConcessions - assessment.confirmedPaid;
    if (assessment.outstandingBalance <= 0) {
      assessment.outstandingBalance = 0;
      assessment.status = 'PAID';
    } else {
      assessment.status = 'PARTIALLY_PAID';
    }

    // Add confirmation notification
    const student = this.state.students.find(s => s.id === assessment.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : assessment.studentId;

    const notif: NotificationItem = {
      id: `NOTIF-PAY-${Date.now()}`,
      recipientId: assessment.studentId,
      recipientRole: 'STUDENT',
      title: `Simulated Payment Confirmed: ₹${amount.toLocaleString('en-IN')}`,
      message: `Simulated receipt #${receiptCode} generated. Outstanding balance updated to ₹${assessment.outstandingBalance.toLocaleString('en-IN')}. (Demo Simulation Only).`,
      category: 'FEE',
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      link: '/student/fees'
    };
    this.state.notifications.unshift(notif);

    // Also notify parents linked to this student
    this.state.parents.forEach(p => {
      if (p.linkedStudentIds.includes(assessment.studentId)) {
        this.state.notifications.unshift({
          id: `NOTIF-PARENT-PAY-${Date.now()}-${p.id}`,
          recipientId: p.id,
          recipientRole: 'PARENT',
          title: `Fee Payment Received for ${studentName}: ₹${amount.toLocaleString('en-IN')}`,
          message: `Simulated payment of ₹${amount.toLocaleString('en-IN')} confirmed for ${studentName} (Ref: ${receiptCode}). Outstanding dues: ₹${assessment.outstandingBalance.toLocaleString('en-IN')}.`,
          category: 'FEE',
          isRead: false,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          link: '/parent/fees'
        });
      }
    });

    this.saveToStorage(this.state);
    return { success: true, payment: newPayment, updatedAssessment: assessment };
  }
}

export const mockStorage = new MockStorage();
