import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { formatDate } from '../../utils/formatters';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Users
} from 'lucide-react';

export const ParentChildProfile: React.FC = () => {
  const { user, activeChildId, setActiveChildId, linkedChildren } = useAuth();
  const currentChildId = activeChildId || (linkedChildren[0]?.id ?? 'AAR-2026-0001');
  const child = erpService.getStudentProfile(currentChildId);
  const campus = child ? erpService.getCampus(child.campusId) : undefined;
  const parent = user?.parentId ? erpService.getParentProfile(user.parentId) : undefined;

  if (!child) {
    return <div className="p-8 text-center text-slate-500">Child profile could not be loaded.</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Parent Portal', href: '/parent/dashboard' }, { label: 'Child Profile' }]} />

      {/* Header and Child Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
            {child.firstName[0]}
            {child.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {child.firstName} {child.lastName}
              </h2>
              <Badge variant="brand" size="sm">
                {child.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Student Master ID: <span className="font-mono font-bold text-slate-800">{child.id}</span>
            </p>
          </div>
        </div>

        {linkedChildren.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <Users className="w-4 h-4 text-slate-500 ml-1" />
            <select
              value={currentChildId}
              onChange={(e) => setActiveChildId(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-800 border-none outline-hidden cursor-pointer"
            >
              {linkedChildren.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Child Official Academic Details */}
        <Card>
          <CardHeader
            title="Academic Program & Enrollment"
            icon={<GraduationCap className="w-5 h-5" />}
          />
          <CardContent className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Campus of Study:</span>
              <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                {campus?.name} ({campus?.code})
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Enrolled Course:</span>
              <p className="font-semibold text-slate-900 mt-0.5">{child.programName}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Department:</span>
              <p className="font-semibold text-slate-900 mt-0.5">{child.department}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-500 font-medium">Semester / Year:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{child.semester}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Academic Session:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{child.academicYear}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Campus Roll Number:</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{child.enrollmentNumber}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Admission Date:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{formatDate(child.enrollmentDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guardian & Relationship Authorization */}
        <Card>
          <CardHeader
            title="Guardian Relationship & Emergency Record"
            icon={<ShieldCheck className="w-5 h-5" />}
          />
          <CardContent className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Registered Primary Guardian:</span>
              <p className="font-bold text-slate-900 mt-0.5">{parent?.firstName} {parent?.lastName}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Relationship to Ward:</span>
              <p className="font-semibold text-slate-900 mt-0.5">{parent?.relationship}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Guardian Contact Phone:</span>
              <p className="font-mono text-slate-900 mt-0.5">{parent?.phone}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Guardian Registered Email:</span>
              <p className="text-slate-900 mt-0.5">{parent?.email}</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-medium">Permanent Residential Address:</span>
              <p className="text-slate-700 mt-0.5 leading-relaxed">{parent?.address}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
