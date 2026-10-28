import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import { StatCard, Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  CalendarCheck,
  CreditCard,
  Building,
  GraduationCap,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ParentDashboard: React.FC = () => {
  const { user, activeChildId, setActiveChildId, linkedChildren } = useAuth();
  const parentId = user?.parentId || 'AAR-P-0001';
  const parent = erpService.getParentProfile(parentId);

  // Active child resolution
  const currentChildId = activeChildId || (linkedChildren[0]?.id ?? 'AAR-2026-0001');
  const selectedChild = erpService.getStudentProfile(currentChildId);
  const campus = selectedChild ? erpService.getCampus(selectedChild.campusId) : undefined;
  const fees = erpService.getStudentFees(currentChildId);
  const attendance = erpService.getStudentAttendance(currentChildId);
  const hostel = erpService.getStudentHostel(currentChildId);
  const notifications = erpService.getNotifications(parentId);

  const primaryAssessment = fees[0];
  const outstandingBalance = primaryAssessment?.outstandingBalance ?? 0;
  const confirmedPaid = primaryAssessment?.confirmedPaid ?? 0;
  const totalAssessed = primaryAssessment?.totalAssessed ?? 0;

  if (!parent || !selectedChild) {
    return <div className="p-8 text-center text-slate-500">Parent account records could not be loaded.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Parent Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
                PARENT / GUARDIAN PORTAL
              </Badge>
              <span className="text-xs text-slate-400 font-mono">ID: {parent.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1.5">
              Welcome, {parent.firstName} {parent.lastName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Monitoring portal for {linkedChildren.length} registered wards across Aarohan Education Trust campuses.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/parent/fees">
              <Button variant="primary" size="sm" leftIcon={<CreditCard className="w-4 h-4" />}>
                Pay Child Fees
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Linked Children Switcher Bar */}
      <Card className="p-4 bg-white border-blue-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Switch Ward / Selected Child:
              </h4>
              <p className="text-xs text-slate-600">
                Switching child instantly refreshes academics, fees, and attendance below.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {linkedChildren.map((child) => {
              const childCampus = erpService.getCampus(child.campusId);
              const isSelected = child.id === currentChildId;
              return (
                <button
                  key={child.id}
                  onClick={() => setActiveChildId(child.id)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {child.firstName[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-bold leading-tight">{child.firstName} {child.lastName}</p>
                    <p className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {childCampus?.code} • {child.id}
                    </p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 ml-1 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Active Child Overview Card */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">
                {selectedChild.firstName} {selectedChild.lastName}
              </span>
              <Badge variant="brand" size="sm">
                {selectedChild.semester}
              </Badge>
              <Badge variant={selectedChild.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                {selectedChild.status}
              </Badge>
            </div>
            <p className="text-slate-600 mt-0.5">
              {selectedChild.programName} • {campus?.name} ({campus?.code})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <span>Master ID: <strong className="text-slate-800">{selectedChild.id}</strong></span>
          <span>•</span>
          <span>Roll No: <strong className="text-slate-800">{selectedChild.enrollmentNumber}</strong></span>
        </div>
      </div>

      {/* Critical Alerts (e.g. Low attendance or overdue fees for current child) */}
      {attendance?.isBelowThreshold && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-800">
              Low Attendance Warning for {selectedChild.firstName}: {attendance.overallPercentage}%
            </h4>
            <p className="text-rose-700 mt-0.5 leading-relaxed">
              Your ward's attendance is currently below the campus statutory minimum of {attendance.campusThreshold}%. Please review the subject breakdown and contact the faculty advisor.
            </p>
          </div>
        </div>
      )}

      {primaryAssessment?.status === 'OVERDUE' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-amber-800">
                Fee Payment Overdue for {selectedChild.firstName}: {formatCurrency(outstandingBalance)}
              </h4>
              <p className="text-amber-700 mt-0.5">
                The fee installment was due on {formatDate(primaryAssessment.dueDate)}. Please settle dues promptly to avoid examination hold.
              </p>
            </div>
            <Link to="/parent/fees">
              <Button variant="danger" size="sm">
                Pay Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Ward Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Standing"
          value={`${attendance?.overallPercentage ?? 0}%`}
          subtitle={`Campus Minimum: ${attendance?.campusThreshold ?? 75}%`}
          icon={<CalendarCheck className="w-6 h-6" />}
          colorScheme={attendance?.isBelowThreshold ? 'amber' : 'emerald'}
          trend={{
            label: attendance?.isBelowThreshold ? 'Below Threshold' : 'Adequate',
            positive: !attendance?.isBelowThreshold
          }}
        />

        <StatCard
          title="Fee Outstanding"
          value={formatCurrency(outstandingBalance)}
          subtitle={outstandingBalance > 0 ? `Due Date: ${formatDate(primaryAssessment?.dueDate || '')}` : 'Fully Cleared'}
          icon={<CreditCard className="w-6 h-6" />}
          colorScheme={primaryAssessment?.status === 'OVERDUE' ? 'amber' : outstandingBalance > 0 ? 'blue' : 'emerald'}
        />

        <StatCard
          title="Confirmed Paid"
          value={formatCurrency(confirmedPaid)}
          subtitle={`Assessed: ${formatCurrency(totalAssessed)}`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="blue"
        />

        <StatCard
          title="Hostel Status"
          value={hostel.hasAllocation ? `Room ${hostel.roomNumber}` : 'Day Scholar'}
          subtitle={hostel.hasAllocation ? hostel.block : 'Non-Resident'}
          icon={<Building className="w-6 h-6" />}
          colorScheme={hostel.hasAllocation ? 'purple' : 'slate'}
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attendance & Fee breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Attendance for Selected Ward */}
          <Card>
            <CardHeader
              title={`Subject Attendance (${selectedChild.firstName})`}
              subtitle="Current term conducted vs attended lecture tracking"
              icon={<CalendarCheck className="w-5 h-5" />}
              action={
                <Link to="/parent/attendance">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Full Record
                  </Button>
                </Link>
              }
            />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4 text-center">Attended / Conducted</th>
                      <th className="py-3 px-4 text-right">Percentage</th>
                      <th className="py-3 px-4 text-center">Standing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance?.subjectWise.map((sub) => (
                      <tr key={sub.subjectCode} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {sub.subjectName}
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{sub.subjectCode}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-700">
                          {sub.attendedSessions} / {sub.totalSessions}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {sub.percentage}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={sub.isLow ? 'danger' : 'success'} size="sm">
                            {sub.isLow ? 'Warning' : 'Good'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Fee Summary */}
          <Card>
            <CardHeader
              title={`Fee Account Summary (${selectedChild.firstName})`}
              subtitle={primaryAssessment?.term}
              icon={<CreditCard className="w-5 h-5" />}
              action={
                <Link to="/parent/fees">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Pay & Receipts
                  </Button>
                </Link>
              }
            />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500">Gross Assessed:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{formatCurrency(totalAssessed)}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-emerald-700">Scholarship / Waiver:</span>
                  <p className="font-bold text-emerald-800 text-sm mt-0.5">-{formatCurrency(primaryAssessment?.totalConcessions || 0)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-blue-700">Confirmed Paid:</span>
                  <p className="font-bold text-blue-900 text-sm mt-0.5">{formatCurrency(confirmedPaid)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-300 font-medium">Net Outstanding Due:</span>
                  <p className="text-lg font-bold font-mono">{formatCurrency(outstandingBalance)}</p>
                </div>
                {outstandingBalance > 0 ? (
                  <Link to="/parent/fees">
                    <Button variant="primary" size="sm">
                      Proceed to Pay
                    </Button>
                  </Link>
                ) : (
                  <Badge variant="success" size="md">All Fees Settled</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Notifications & Quick Contacts */}
        <div className="space-y-6">
          {/* Notifications for Parent */}
          <Card>
            <CardHeader
              title="Parent Alerts & Notices"
              subtitle="Official trust communications"
              action={
                <Link to="/parent/notifications">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    All
                  </Button>
                </Link>
              }
            />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {notifications.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mt-1.5">{item.title}</h5>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campus Administration Contacts */}
          <Card>
            <CardHeader
              title="Campus Administration"
              subtitle={campus?.name}
            />
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Campus Office Phone:</span>
                <p className="font-mono text-slate-800 mt-0.5">{campus?.contactPhone}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Helpdesk Email:</span>
                <p className="text-slate-800 mt-0.5">{campus?.email}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Campus Address:</span>
                <p className="text-slate-600 mt-0.5">{campus?.address}, {campus?.city}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
