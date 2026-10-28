import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import { Card, CardHeader, CardContent, StatCard } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Building,
  Bed,
  Phone,
  FileText,
  Clock,
  Coffee,
  CheckCircle2,
  Users
} from 'lucide-react';

export const ParentHostel: React.FC = () => {
  const { activeChildId, setActiveChildId, linkedChildren } = useAuth();
  const currentChildId = activeChildId || (linkedChildren[0]?.id ?? 'AAR-2026-0001');
  const child = erpService.getStudentProfile(currentChildId);
  const hostel = erpService.getStudentHostel(currentChildId);
  const campus = child ? erpService.getCampus(child.campusId) : undefined;

  if (!child) {
    return <div className="p-8 text-center text-slate-500">Child record not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Parent Portal', href: '/parent/dashboard' }, { label: 'Hostel Accommodation' }]} />

      {/* Header and Child Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              Hostel Allotment: {child.firstName} {child.lastName}
            </h2>
            <Badge variant={hostel.hasAllocation ? 'success' : 'neutral'} size="md">
              {hostel.hasAllocation ? 'RESIDENTIAL WARD' : 'DAY SCHOLAR'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {campus?.name} • Student Master ID: <span className="font-mono font-bold">{child.id}</span>
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

      {!hostel.hasAllocation ? (
        <Card className="p-8">
          <EmptyState
            icon={Building}
            title={`${child.firstName} has No Active Hostel Allocation`}
            description={`${child.firstName} is currently registered as a Day Scholar at ${campus?.name}. Daily commute records are logged via main campus access gates.`}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Campus Hostel"
              value={hostel.hostelName || 'Aryabhata Hostel'}
              subtitle={hostel.block}
              icon={<Building className="w-6 h-6" />}
              colorScheme="purple"
            />

            <StatCard
              title="Room Details"
              value={`Room ${hostel.roomNumber}`}
              subtitle={hostel.bedNumber}
              icon={<Bed className="w-6 h-6" />}
              colorScheme="blue"
            />

            <StatCard
              title="Allotment Status"
              value={hostel.allocationStatus || 'ACTIVE'}
              subtitle="Current Term"
              icon={<CheckCircle2 className="w-6 h-6" />}
              colorScheme="emerald"
            />

            <StatCard
              title="Mess Facility"
              value="Trust Mess"
              subtitle={hostel.messType || 'Full Board'}
              icon={<Coffee className="w-6 h-6" />}
              colorScheme="slate"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader
                  title="Residential Room Details"
                  icon={<Bed className="w-5 h-5" />}
                />
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500">Hostel Building:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{hostel.hostelName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Block & Wing:</span>
                      <p className="font-semibold text-slate-900 mt-0.5">{hostel.block}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Room Number:</span>
                      <p className="font-mono font-bold text-blue-700 text-sm mt-0.5">{hostel.roomNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Bed Identification:</span>
                      <p className="font-semibold text-slate-900 mt-0.5">{hostel.bedNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Catering Plan:</span>
                      <p className="font-semibold text-slate-900 mt-0.5">{hostel.messType}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Gate Security Clearance:</span>
                      <p className="font-semibold text-emerald-700 mt-0.5">Biometric Gate ID Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hostel Circulars */}
              {hostel.notices && hostel.notices.length > 0 && (
                <Card>
                  <CardHeader
                    title="Hostel Circulars & Maintenance Notices"
                    icon={<FileText className="w-5 h-5" />}
                  />
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {hostel.notices.map((n) => (
                        <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Warden Contacts */}
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Warden & Caretaker Office"
                  icon={<Phone className="w-5 h-5" />}
                />
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Chief Warden:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{hostel.wardenName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Direct Telephone:</span>
                    <p className="font-mono text-slate-800 mt-0.5">{hostel.contactPhone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">24/7 Security Gatehouse:</span>
                    <p className="font-mono text-slate-800 mt-0.5">+91 20 2740 5099</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  title="Parent Leave Protocol"
                  icon={<Clock className="w-5 h-5" />}
                />
                <CardContent className="text-xs text-slate-600 leading-relaxed space-y-2">
                  <p>• <strong>Weekend Leave:</strong> Parents can submit digital leave intimations through the Queries & Support module.</p>
                  <p>• <strong>Visitor Hours:</strong> Parents are welcome to visit hostel meeting lounges on Saturdays and Sundays (10:00 AM - 06:00 PM).</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
