import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import { Card, CardHeader, CardContent, StatCard } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  Users
} from 'lucide-react';

export const ParentAttendance: React.FC = () => {
  const { activeChildId, setActiveChildId, linkedChildren } = useAuth();
  const currentChildId = activeChildId || (linkedChildren[0]?.id ?? 'AAR-2026-0001');
  const child = erpService.getStudentProfile(currentChildId);
  const attendance = erpService.getStudentAttendance(currentChildId);
  const campus = child ? erpService.getCampus(child.campusId) : undefined;

  if (!child || !attendance) {
    return <div className="p-8 text-center text-slate-500">Attendance records not found for this child.</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Parent Portal', href: '/parent/dashboard' }, { label: 'Ward Attendance' }]} />

      {/* Header and Child Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              Attendance Record: {child.firstName} {child.lastName}
            </h2>
            <Badge variant={attendance.isBelowThreshold ? 'danger' : 'success'} size="md">
              {attendance.isBelowThreshold ? 'SHORTAGE ALERT' : 'COMPLIANT'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Campus Threshold: <span className="font-bold text-slate-800">{attendance.campusThreshold}%</span> • Enrolled at {campus?.name}
          </p>
        </div>

        {linkedChildren.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
            <Users className="w-4 h-4 text-slate-500 ml-1" />
            <select
              value={currentChildId}
              onChange={(e) => setActiveChildId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 border-none outline-hidden cursor-pointer"
            >
              {linkedChildren.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} ({c.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Critical Shortage Alert */}
      {attendance.isBelowThreshold ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-800">
              Low Attendance Warning ({attendance.overallPercentage}%)
            </h4>
            <p className="mt-1 leading-relaxed text-rose-700">
              {child.firstName}'s cumulative attendance has dropped below the {attendance.campusThreshold}% mandatory campus minimum. Under Trust and university guidelines, shortfall in attendance may lead to examination debarment. Please review subject-wise absences below and connect with the department head.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {child.firstName}'s overall attendance is <span className="font-bold">{attendance.overallPercentage}%</span>, satisfying all campus academic attendance standards.
          </span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${attendance.overallPercentage}%`}
          subtitle={`Minimum required: ${attendance.campusThreshold}%`}
          icon={<CalendarCheck className="w-6 h-6" />}
          colorScheme={attendance.isBelowThreshold ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Sessions Conducted"
          value={attendance.totalSessions}
          subtitle="Lectures & practicals held"
          icon={<Clock className="w-6 h-6" />}
          colorScheme="slate"
        />

        <StatCard
          title="Sessions Attended"
          value={attendance.attendedSessions}
          subtitle="Biometric verified presence"
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="blue"
        />

        <StatCard
          title="Sessions Missed"
          value={attendance.totalSessions - attendance.attendedSessions}
          subtitle="Absences recorded"
          icon={<AlertTriangle className="w-6 h-6" />}
          colorScheme={attendance.isBelowThreshold ? 'amber' : 'slate'}
        />
      </div>

      {/* Subject-Wise Breakdown Table */}
      <Card>
        <CardHeader
          title="Course-by-Course Attendance"
          subtitle="Official faculty logged records for current term"
          icon={<BookOpen className="w-5 h-5" />}
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Subject Title</th>
                  <th className="py-3 px-4">Faculty Instructor</th>
                  <th className="py-3 px-4 text-center">Conducted</th>
                  <th className="py-3 px-4 text-center">Attended</th>
                  <th className="py-3 px-4 text-right">Percentage</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.subjectWise.map((sub) => (
                  <tr key={sub.subjectCode} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{sub.subjectCode}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{sub.subjectName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{sub.facultyName}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{sub.totalSessions}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                      {sub.attendedSessions}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${sub.isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="font-bold font-mono text-slate-900">{sub.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={sub.isLow ? 'danger' : 'success'} size="sm">
                        {sub.isLow ? 'Low' : 'Satisfactory'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
