import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Clock, MapPin, User, FileText } from 'lucide-react';

export const StudentAcademics: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.studentId || 'AAR-2026-0001';
  const student = erpService.getStudentProfile(studentId);
  const timetable = erpService.getStudentTimetable(studentId);
  const notices = erpService.getAcademicNotices();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const filteredTimetable = timetable.filter((t) => t.day === selectedDay);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Student Portal', href: '/student/dashboard' }, { label: 'Timetable & Academic Notices' }]} />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Academic Schedule & Circulars</h2>
            <Badge variant="brand" size="md">TERM 2025-26</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {student?.programName} • {student?.semester} • {student?.department}
          </p>
        </div>
      </div>

      {/* Timetable Section */}
      <Card>
        <CardHeader
          title="Weekly Instructional Schedule"
          subtitle="Lecture halls and laboratory allocations"
          icon={<Clock className="w-5 h-5" />}
          action={
            <div className="flex gap-1 overflow-x-auto">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedDay === day
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          }
        />
        <CardContent className="p-0">
          {filteredTimetable.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No scheduled instructional sessions for {selectedDay}.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTimetable.map((slot) => (
                <div key={slot.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-mono font-bold text-xs shrink-0">
                      {slot.time}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{slot.subjectName}</span>
                        <span className="font-mono text-[10px] text-slate-400">({slot.subjectCode})</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {slot.faculty}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {slot.room}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge variant="neutral" size="sm">Regular Session</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Notices & Circulars */}
      <Card>
        <CardHeader
          title="Official Academic Announcements & Circulars"
          subtitle="Directives from University & Trust Examination Section"
          icon={<FileText className="w-5 h-5" />}
        />
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {notices.map((notice) => (
              <div key={notice.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={notice.priority === 'HIGH' ? 'danger' : 'info'} size="sm">
                      {notice.category}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">{notice.date}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 italic hidden sm:block">
                    Issued by: {notice.publishedBy}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{notice.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notice.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
