import React from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Receipt, 
  Clock 
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { useFinance } from '../../context/FinanceContext';
import { calculateFinancialMetrics } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';

export const KPICards: React.FC = () => {
  const {
    scopedAssessments,
    scopedPayments,
    scopedExpenses,
    scopedConcessions,
    scopedRefunds,
    activeCampusId,
    campuses,
  } = useFinance();

  const metrics = calculateFinancialMetrics(
    scopedAssessments,
    scopedPayments,
    scopedExpenses,
    scopedConcessions,
    scopedRefunds
  );

  const activeCampusObj = campuses.find(c => c.id === activeCampusId);
  const scopeLabel = activeCampusId === 'all' ? 'All 6 Campuses' : activeCampusObj?.name || 'Selected Campus';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Total Fee Demand */}
      <StatCard
        title="Total Fee Demand"
        value={formatINR(metrics.totalFeeDemand, { compact: true })}
        subtitle={formatINR(metrics.totalFeeDemand)}
        icon={DollarSign}
        variant="indigo"
        badgeText={scopeLabel}
        badgeVariant="info"
      />

      {/* 2. Confirmed Collections */}
      <StatCard
        title="Confirmed Collections"
        value={formatINR(metrics.confirmedCollections, { compact: true })}
        subtitle={formatINR(metrics.confirmedCollections)}
        icon={CheckCircle2}
        variant="emerald"
        badgeText="Realized"
        badgeVariant="success"
      />

      {/* 3. Outstanding Balance */}
      <StatCard
        title="Outstanding Balance"
        value={formatINR(metrics.outstandingBalance, { compact: true })}
        subtitle={formatINR(metrics.outstandingBalance)}
        icon={AlertCircle}
        variant="rose"
        badgeText="Pending Dues"
        badgeVariant="danger"
      />

      {/* 4. Collection Rate */}
      <StatCard
        title="Collection Rate"
        value={`${metrics.collectionRate}%`}
        subtitle="Demand Realization"
        icon={TrendingUp}
        variant={metrics.collectionRate >= 75 ? 'emerald' : 'amber'}
        badgeText={metrics.collectionRate >= 75 ? 'On Target' : 'Action Required'}
        badgeVariant={metrics.collectionRate >= 75 ? 'success' : 'warning'}
      />

      {/* 5. Approved Expenses */}
      <StatCard
        title="Approved Expenses"
        value={formatINR(metrics.approvedExpenses, { compact: true })}
        subtitle={formatINR(metrics.approvedExpenses)}
        icon={Receipt}
        variant="slate"
        badgeText="Committed Outflow"
        badgeVariant="info"
      />

      {/* 6. Pending Approvals */}
      <StatCard
        title="Pending Approvals"
        value={String(metrics.pendingApprovalsCount)}
        subtitle="Exceptions & Requests"
        icon={Clock}
        variant="amber"
        badgeText={metrics.pendingApprovalsCount > 0 ? 'Requires Action' : 'Cleared'}
        badgeVariant={metrics.pendingApprovalsCount > 0 ? 'warning' : 'success'}
      />
    </div>
  );
};
