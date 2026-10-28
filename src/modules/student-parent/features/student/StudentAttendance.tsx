import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import { Card, CardHeader, CardContent, StatCard } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Filter,
  Clock
} from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.studentId || 'AAR-2026-0001';
  const attendance = erpService.getStudentAttendance(studentId);

  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  if (!attendance) {
    return <div className="p-8 text-center text-slate-500">Attendance records not available.</div>;
  }

  const filteredSessions = attendance.recentSessions.filter((s) => {
    if (selectedSubject === 'ALL') return true;
    return s.subjectCode === selectedSubject;
  });

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Student Portal', href: '/student/dashboard' }, { label: 'My Attendance' }]} />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Classroom & Biometric Attendance</h2>
            <Badge variant={attendance.isBelowThreshold ? 'danger' : 'success'} size="md">
              {attendance.isBelowThreshold ? 'SHORTAGE ALERT' : 'GOOD STANDING'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Campus Regulation Minimum:{' '}
            <span className="font-semibold text-slate-800">{attendance.campusThreshold}%</span> across all theory and laboratory sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 font-medium"
          >
            <option value="ALL">All Subjects & Labs</option>
            {attendance.subjectWise.map((sub) => (
              <option key={sub.subjectCode} value={sub.subjectCode}>
                {sub.subjectCode}: {sub.subjectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Threshold Warning Banner */}
      {attendance.isBelowThreshold ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-800">Attendance Shortage Warning ({attendance.overallPercentage}%)</h4>
            <p className="mt-1 leading-relaxed text-rose-700">
              Your overall attendance is below the campus threshold of {attendance.campusThreshold}%. Under institutional academic regulations, students with attendance below {attendance.campusThreshold}% are not permitted to appear for end-term examinations without formal medical or condonation approval.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Your overall attendance is <span className="font-bold">{attendance.overallPercentage}%</span>, which exceeds the mandatory campus minimum of {attendance.campusThreshold}%.
          </span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${attendance.overallPercentage}%`}
          subtitle="Cumulative across all courses"
          icon={<CalendarCheck className="w-6 h-6" />}
          colorScheme={attendance.isBelowThreshold ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Total Sessions Conducted"
          value={attendance.totalSessions}
          subtitle="Official faculty sessions logged"
          icon={<Clock className="w-6 h-6" />}
          colorScheme="blue"
        />

        <StatCard
          title="Attended Sessions"
          value={attendance.attendedSessions}
          subtitle="Biometric & classroom verified"
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="emerald"
        />

        <StatCard
          title="Missed Sessions"
          value={attendance.totalSessions - attendance.attendedSessions}
          subtitle="Absences recorded"
          icon={<AlertTriangle className="w-6 h-6" />}
          colorScheme="slate"
        />
      </div>

      {/* Subject-Wise Detailed Table */}
      <Card>
        <CardHeader
          title="Subject-Wise Attendance Breakdown"
          subtitle="Theory lectures, practical laboratories, and tutorial attendance"
          icon={<BookOpen className="w-5 h-5" />}
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Subject Title</th>
                  <th className="py-3 px-4">Instructor</th>
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
                        {sub.isLow ? 'Shortage' : 'Compliant'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Classroom Biometric Logs */}
      <Card>
        <CardHeader
          title="Session-by-Session Biometric Log"
          subtitle="Detailed chronological classroom attendances"
          icon={<Clock className="w-5 h-5" />}
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Topic Covered</th>
                  <th className="py-3 px-4">Faculty</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No session logs found for selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-800">{session.date}</td>
                      <td className="py-3 px-4 text-slate-500">{session.timeSlot}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {session.subjectCode} - {session.subjectName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{session.topic}</td>
                      <td className="py-3 px-4 text-slate-500">{session.facultyName}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={session.status === 'PRESENT' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {session.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
