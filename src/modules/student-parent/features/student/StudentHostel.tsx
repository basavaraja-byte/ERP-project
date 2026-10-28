import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import { Card, CardHeader, CardContent, StatCard } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Building,
  Bed,
  Phone,
  FileText,
  Clock,
  Coffee,
  CheckCircle2
} from 'lucide-react';

export const StudentHostel: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.studentId || 'AAR-2026-0001';
  const hostel = erpService.getStudentHostel(studentId);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Student Portal', href: '/student/dashboard' }, { label: 'Hostel Accommodation' }]} />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Campus Residence & Hostel Services</h2>
            <Badge variant={hostel.hasAllocation ? 'success' : 'neutral'} size="md">
              {hostel.hasAllocation ? 'ACTIVE RESIDENCE' : 'DAY SCHOLAR'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Residential wing governed by Aarohan Central Hostel Board.
          </p>
        </div>
      </div>

      {!hostel.hasAllocation ? (
        <Card className="p-8">
          <EmptyState
            icon={Building}
            title="No Active Hostel Room Allocation"
            description="You are currently registered as a Day Scholar in institutional records. If you require on-campus accommodation, please apply for hostel room allotment during the annual admission window or submit a room request to the Chief Warden Office."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => alert('Hostel room application portal opens before every academic term.')}
              >
                Apply for Campus Hostel
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* Active Allocation Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Assigned Hostel"
              value={hostel.hostelName || 'Aryabhata Hostel'}
              subtitle={hostel.block}
              icon={<Building className="w-6 h-6" />}
              colorScheme="purple"
            />

            <StatCard
              title="Room & Bed"
              value={`Room ${hostel.roomNumber}`}
              subtitle={hostel.bedNumber}
              icon={<Bed className="w-6 h-6" />}
              colorScheme="blue"
            />

            <StatCard
              title="Allocation Status"
              value={hostel.allocationStatus || 'ACTIVE'}
              subtitle={`Allotted since ${hostel.checkInDate || '2025-08-01'}`}
              icon={<CheckCircle2 className="w-6 h-6" />}
              colorScheme="emerald"
            />

            <StatCard
              title="Catering / Mess Facility"
              value="Trust Mess"
              subtitle="Catered 4 meals daily"
              icon={<Coffee className="w-6 h-6" />}
              colorScheme="slate"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Details & Notices */}
            <div className="lg:col-span-2 space-y-6">
              {/* Room Specifications */}
              <Card>
                <CardHeader
                  title="Room Allotment & Amenity Details"
                  subtitle="Official residential allotment record"
                  icon={<Bed className="w-5 h-5" />}
                />
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 font-medium">Hostel Complex:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{hostel.hostelName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Block & Floor:</span>
                      <p className="font-semibold text-slate-900 mt-0.5">{hostel.block}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Room Number:</span>
                      <p className="font-mono font-bold text-blue-700 text-sm mt-0.5">{hostel.roomNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Bed Identifier:</span>
                      <p className="font-semibold text-slate-900 mt-0.5">{hostel.bedNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Mess Plan:</span>
                      <p className="font-semibold text-slate-900 mt-0.5">{hostel.messType}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Allocation Verification:</span>
                      <p className="font-semibold text-emerald-700 mt-0.5">Biometric Gate ID Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hostel Notices & Circulars */}
              <Card>
                <CardHeader
                  title="Hostel Circulars & Maintenance Notices"
                  subtitle="Published by Chief Warden Office"
                  icon={<FileText className="w-5 h-5" />}
                />
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {hostel.notices?.map((n) => (
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
            </div>

            {/* Right 1 Col: Warden Contacts & Rules */}
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Warden & Helpdesk Contacts"
                  icon={<Phone className="w-5 h-5" />}
                />
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Hostel Warden:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{hostel.wardenName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Contact Phone:</span>
                    <p className="font-mono text-slate-800 mt-0.5">{hostel.contactPhone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Emergency Security Desk:</span>
                    <p className="font-mono text-slate-800 mt-0.5">+91 20 2740 5099 (24/7)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  title="Resident Guidelines"
                  icon={<Clock className="w-5 h-5" />}
                />
                <CardContent className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <p>• <strong>Gate Timings:</strong> Main hostel gates close at 10:00 PM on weekdays and 10:30 PM on weekends.</p>
                  <p>• <strong>Mess Timings:</strong> Breakfast (07:30 - 09:00 AM), Lunch (12:30 - 02:00 PM), Dinner (07:30 - 09:30 PM).</p>
                  <p>• <strong>Night Out Pass:</strong> Digital leave approval from authorized parent required for overnight stay outside campus.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
