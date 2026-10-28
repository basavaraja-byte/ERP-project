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

export const ParentSupport: React.FC = () => {
  const { user, linkedChildren, activeChildId, triggerRefresh } = useAuth();
  const parentId = user?.parentId || 'AAR-P-0001';

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportRequest | null>(null);

  // Form state
  const [selectedChildForTicket, setSelectedChildForTicket] = useState(
    activeChildId || linkedChildren[0]?.id || ''
  );
  const [category, setCategory] = useState<SupportRequest['category']>('ATTENDANCE');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const requests = erpService.getSupportRequests(parentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const child = linkedChildren.find((c) => c.id === selectedChildForTicket);
    const studentName = child ? `${child.firstName} ${child.lastName}` : 'Ward';

    erpService.submitSupportRequest({
      requesterId: parentId,
      requesterRole: 'PARENT',
      studentId: selectedChildForTicket,
      studentName,
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
      <Breadcrumb items={[{ label: 'Parent Portal', href: '/parent/dashboard' }, { label: 'Parent Queries & Grievances' }]} />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Parent Grievance & Inquiries Desk</h2>
            <Badge variant="brand" size="md">GUARDIAN SUPPORT</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submit formal inquiries to campus administrations regarding fees, attendance, medical leave, or records.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setIsNewModalOpen(true)}
        >
          Submit New Query
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Submitted Inquiries & Administrative Responses"
          subtitle="All correspondence with Trust administrations"
          icon={<LifeBuoy className="w-5 h-5" />}
        />
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No inquiries logged yet by your guardian account.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Ticket Number</th>
                    <th className="py-3 px-4">Ward / Student</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Submitted Date</th>
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
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {req.studentName}
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{req.studentId}</span>
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
                          View Status
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
          title={`Inquiry ${selectedTicket.ticketNumber}`}
          subtitle={`Ward: ${selectedTicket.studentName} (${selectedTicket.studentId})`}
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
                <span className="text-slate-500">Logged On:</span>
                <p className="font-mono text-slate-800 mt-1">{selectedTicket.createdAt}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Subject:</span>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{selectedTicket.subject}</p>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Guardian's Submitted Description:</span>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-1 text-slate-700 leading-relaxed">
                {selectedTicket.description}
              </div>
            </div>

            {selectedTicket.response ? (
              <div>
                <span className="text-slate-500 font-medium text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Official Administrative Feedback:
                </span>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 mt-1 text-emerald-900 leading-relaxed">
                  {selectedTicket.response}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Ticket is actively queued for review by the campus registrar desk.</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create New Query Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Submit Guardian Inquiry"
        subtitle="Direct channel to campus authorities"
      >
        {isSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">Inquiry Logged</h4>
            <p className="text-xs text-slate-500 mt-1">Your query has been recorded in the central ERP desk.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Relevant Ward</label>
              <select
                value={selectedChildForTicket}
                onChange={(e) => setSelectedChildForTicket(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-slate-800"
              >
                {linkedChildren.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Inquiry Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-slate-800"
              >
                <option value="ATTENDANCE">Attendance & Medical Condonation</option>
                <option value="FEE">Fee Schedule, Payment & Receipts</option>
                <option value="HOSTEL">Hostel Facilities & Leave Pass</option>
                <option value="ACADEMIC">Academic Progress & Examinations</option>
                <option value="GENERAL">General Administration Query</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="Brief summary of inquiry"
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
                placeholder="Provide complete details to help campus officials address your inquiry promptly."
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
                Submit Inquiry
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
