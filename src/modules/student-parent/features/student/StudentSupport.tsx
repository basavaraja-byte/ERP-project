import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Modal } from '../../components/common/Modal';
import type { SupportRequest } from '../../types';
import { LifeBuoy, PlusCircle, CheckCircle2, Clock } from 'lucide-react';

export const StudentSupport: React.FC = () => {
  const { user, triggerRefresh } = useAuth();
  const studentId = user?.studentId || 'AAR-2026-0001';
  const student = erpService.getStudentProfile(studentId);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportRequest | null>(null);

  // Form state
  const [category, setCategory] = useState<SupportRequest['category']>('GENERAL');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const requests = erpService.getSupportRequests(studentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !student) return;

    erpService.submitSupportRequest({
      requesterId: student.id,
      requesterRole: 'STUDENT',
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      category,
      subject,
      description
    });

    setIsSuccess(true);
    triggerRefresh();

    setTimeout(() => {
      setIsSuccess(false);
      setIsNewModalOpen(false);
      setSubject('');
      setDescription('');
    }, 1200);
  };

  const getStatusBadge = (status: SupportRequest['status']) => {
    switch (status) {
      case 'RESOLVED':
        return <Badge variant="success" size="sm">RESOLVED</Badge>;
      case 'IN_REVIEW':
        return <Badge variant="warning" size="sm">IN REVIEW</Badge>;
      case 'PENDING':
        return <Badge variant="neutral" size="sm">PENDING</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Student Portal', href: '/student/dashboard' }, { label: 'Support & Grievances' }]} />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Student Support & Grievance Desk</h2>
            <Badge variant="brand" size="md">ERP HELPDESK</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submit service requests regarding academic fees, attendance verification, hostel maintenance, or record corrections.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setIsNewModalOpen(true)}
        >
          Create New Ticket
        </Button>
      </div>

      {/* Requests History List */}
      <Card>
        <CardHeader
          title="Submitted Requests & Resolution History"
          subtitle="All grievances tracked in official ERP system"
          icon={<LifeBuoy className="w-5 h-5" />}
        />
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              You have not submitted any support tickets yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Ticket Number</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {req.ticketNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                          {req.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {req.subject}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {req.createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTicket(req)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketNumber}`}
          subtitle={`Category: ${selectedTicket.category.replace('_', ' ')}`}
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-slate-500">Current Status:</span>
                <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Submitted On:</span>
                <p className="font-mono text-slate-800 mt-1">{selectedTicket.createdAt}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Subject:</span>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{selectedTicket.subject}</p>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Student Description:</span>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-1 text-slate-700 leading-relaxed">
                {selectedTicket.description}
              </div>
            </div>

            {selectedTicket.response ? (
              <div>
                <span className="text-slate-500 font-medium text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Official Administrative Response:
                </span>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 mt-1 text-emerald-900 leading-relaxed">
                  {selectedTicket.response}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Last Updated: {selectedTicket.updatedAt}</p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Ticket is pending review by the departmental administration coordinator.</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create New Ticket Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Submit New Support Request"
        subtitle="Direct communication with Campus Dean & Trust Administration"
      >
        {isSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">Support Ticket Created</h4>
            <p className="text-xs text-slate-500 mt-1">Your ticket has been logged and assigned to the relevant department.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-slate-800"
              >
                <option value="GENERAL">General Administrative Query</option>
                <option value="FEE">Fee Assessment & Receipt Verification</option>
                <option value="ATTENDANCE">Attendance Correction & Medical Leave</option>
                <option value="HOSTEL">Hostel Maintenance & Mess Grievance</option>
                <option value="ACADEMIC">Academic & Examination Query</option>
                <option value="PROFILE_CORRECTION">Official Profile Correction</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject / Summary</label>
              <input
                type="text"
                required
                placeholder="Brief subject of the inquiry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                required
                rows={4}
                placeholder="Provide complete details including dates, transaction references, or subject codes where relevant."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Ticket
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
