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
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.studentId || 'AAR-2026-0001';

  const student = erpService.getStudentProfile(studentId);
  const campus = student ? erpService.getCampus(student.campusId) : undefined;
  const fees = erpService.getStudentFees(studentId);
  const attendance = erpService.getStudentAttendance(studentId);
  const hostel = erpService.getStudentHostel(studentId);
  const notices = erpService.getAcademicNotices();

  // Aggregate fee metrics
  const primaryAssessment = fees[0];
  const totalAssessed = primaryAssessment?.totalAssessed || 0;
  const confirmedPaid = primaryAssessment?.confirmedPaid || 0;
  const outstandingBalance = primaryAssessment?.outstandingBalance || 0;

  if (!student) {
    return <div className="p-8 text-center text-slate-500">Student profile could not be loaded.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Institutional Hero Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background patterns */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-600/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/40 backdrop-blur-md flex items-center justify-center text-2xl font-bold text-white shadow-inner">
              {student.firstName[0]}
              {student.lastName[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Welcome, {student.firstName} {student.lastName}
                </h2>
                <Badge variant="brand" size="sm" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                  {student.status}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                {student.programName} • {student.semester}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="font-mono bg-navy-800/80 px-2 py-0.5 rounded border border-navy-700/60">
                  Master ID: {student.id}
                </span>
                <span>•</span>
                <span className="font-mono bg-navy-800/80 px-2 py-0.5 rounded border border-navy-700/60">
                  Roll: {student.enrollmentNumber}
                </span>
                <span>•</span>
                <span className="text-blue-300 font-medium">{campus?.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/student/profile">
              <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                View Full Profile
              </Button>
            </Link>
            <Link to="/student/fees">
              <Button variant="primary" size="sm">
                Pay Fees Online
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Stat */}
        <StatCard
          title="Overall Attendance"
          value={`${attendance?.overallPercentage ?? 0}%`}
          subtitle={`Required Campus Minimum: ${attendance?.campusThreshold ?? 75}%`}
          icon={<CalendarCheck className="w-6 h-6" />}
          colorScheme={attendance?.isBelowThreshold ? 'amber' : 'emerald'}
          trend={{
            label: attendance?.isBelowThreshold ? 'Below Threshold' : 'Good Standing',
            positive: !attendance?.isBelowThreshold
          }}
          onClick={() => {}}
        />

        {/* Outstanding Dues */}
        <StatCard
          title="Outstanding Fees"
          value={formatCurrency(outstandingBalance)}
          subtitle={outstandingBalance > 0 ? `Due on ${formatDate(primaryAssessment?.dueDate || '')}` : 'All fees settled'}
          icon={<CreditCard className="w-6 h-6" />}
          colorScheme={outstandingBalance > 0 ? 'amber' : 'emerald'}
        />

        {/* Confirmed Amount Paid */}
        <StatCard
          title="Confirmed Paid"
          value={formatCurrency(confirmedPaid)}
          subtitle={`Total Assessed: ${formatCurrency(totalAssessed)}`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="blue"
        />

        {/* Hostel Allocation */}
        <StatCard
          title="Hostel Status"
          value={hostel.hasAllocation ? hostel.roomNumber : 'Day Scholar'}
          subtitle={hostel.hasAllocation ? `${hostel.block} (${hostel.bedNumber})` : 'No active room allocation'}
          icon={<Building className="w-6 h-6" />}
          colorScheme={hostel.hasAllocation ? 'purple' : 'slate'}
        />
      </div>

      {/* Main Grid: Attendance & Schedule on Left, Notifications & Fees on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Low Attendance Alert if any */}
          {attendance?.isBelowThreshold && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Mandatory Attendance Notice
                </h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Your overall attendance of {attendance.overallPercentage}% is below the campus regulation requirement of {attendance.campusThreshold}%. Please meet your departmental advisor to avoid exam registration withholding.
                </p>
              </div>
            </div>
          )}

          {/* Subject-Wise Attendance Overview */}
          <Card>
            <CardHeader
              title="Subject Attendance Summary"
              subtitle="Current Semester Theory & Laboratory Sessions"
              icon={<CalendarCheck className="w-5 h-5" />}
              action={
                <Link to="/student/attendance">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Detailed Log
                  </Button>
                </Link>
              }
            />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Faculty</th>
                      <th className="py-3 px-4 text-center">Attended / Total</th>
                      <th className="py-3 px-4 text-right">Percentage</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance?.subjectWise.map((sub) => (
                      <tr key={sub.subjectCode} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div>{sub.subjectName}</div>
                          <span className="font-mono text-[10px] text-slate-400">{sub.subjectCode}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{sub.facultyName}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                          {sub.attendedSessions} / {sub.totalSessions}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-bold text-slate-900">{sub.percentage}%</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant={sub.isLow ? 'warning' : 'success'} size="sm">
                            {sub.isLow ? 'Low' : 'Adequate'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Attendance Session Logs */}
          <Card>
            <CardHeader
              title="Recent Class Attendance Log"
              subtitle="Latest marked biometric and classroom attendance"
              icon={<Clock className="w-5 h-5" />}
            />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {attendance?.recentSessions.slice(0, 4).map((session) => (
                  <div key={session.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{session.subjectName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({session.subjectCode})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{session.topic}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span>{session.timeSlot}</span>
                      </div>
                    </div>
                    <div>
                      <Badge variant={session.status === 'PRESENT' ? 'success' : 'danger'} size="sm">
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col wide) */}
        <div className="space-y-6">
          {/* Quick Fee Assessment Widget */}
          <Card>
            <CardHeader
              title="Fee Overview"
              subtitle={primaryAssessment?.term}
              icon={<CreditCard className="w-5 h-5" />}
              action={
                <Link to="/student/fees">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Details
                  </Button>
                </Link>
              }
            />
            <CardContent className="space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Gross Assessed Amount:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(totalAssessed)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                  <span>Merit Concession / Scholarship:</span>
                  <span className="font-semibold">-{formatCurrency(primaryAssessment?.totalConcessions || 0)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Confirmed Amount Paid:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(confirmedPaid)}</span>
                </div>
                {primaryAssessment && primaryAssessment.pendingAmount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-amber-700 bg-amber-50/50 px-2 rounded">
                    <span>Pending Bank Verification:</span>
                    <span className="font-semibold">{formatCurrency(primaryAssessment.pendingAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-sm font-bold text-slate-900 bg-slate-50 px-2 rounded-lg">
                  <span>Net Outstanding Balance:</span>
                  <span className="text-blue-700">{formatCurrency(outstandingBalance)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/student/fees" className="w-full block">
                  <Button variant="primary" className="w-full text-xs" size="sm">
                    View Payment Schedule & Receipts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Academic Notices Widget */}
          <Card>
            <CardHeader
              title="Academic Notices"
              subtitle="Circulars from Trust & Examination Branch"
              icon={<Bell className="w-5 h-5" />}
              action={
                <Link to="/student/academics">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    All
                  </Button>
                </Link>
              }
            />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {notices.slice(0, 3).map((notice) => (
                  <div key={notice.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {notice.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{notice.date}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 mt-1.5 line-clamp-1">{notice.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Hostel Box */}
          <Card>
            <CardHeader
              title="Hostel Accommodation"
              subtitle={hostel.hasAllocation ? hostel.hostelName : 'Day Scholar'}
              icon={<Building className="w-5 h-5" />}
            />
            <CardContent className="text-xs space-y-3">
              {hostel.hasAllocation ? (
                <>
                  <div className="bg-slate-50 p-3 rounded-lg space-y-1.5 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Block & Wing:</span>
                      <span className="font-semibold text-slate-800">{hostel.block}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Room Number:</span>
                      <span className="font-semibold text-slate-800">{hostel.roomNumber} ({hostel.bedNumber})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Warden In-Charge:</span>
                      <span className="font-semibold text-slate-800">{hostel.wardenName}</span>
                    </div>
                  </div>
                  <Link to="/student/hostel" className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-800">
                    View Hostel Notices & Rules →
                  </Link>
                </>
              ) : (
                <div className="text-center py-4 text-slate-500">
                  <p>Registered as Day Scholar.</p>
                  <Link to="/student/hostel" className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:text-blue-800">
                    Apply for Hostel Allocation →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
