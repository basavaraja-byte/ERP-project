import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ShieldAlert,
  Building2,
  FileEdit,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, triggerRefresh } = useAuth();
  const studentId = user?.studentId || 'AAR-2026-0001';
  const student = erpService.getStudentProfile(studentId);
  const campus = student ? erpService.getCampus(student.campusId) : undefined;

  // Profile correction modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [correctionSubject, setCorrectionSubject] = useState('');
  const [correctionDescription, setCorrectionDescription] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!student) {
    return <div className="p-8 text-center text-slate-500">Profile not found.</div>;
  }

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionSubject.trim() || !correctionDescription.trim()) return;

    erpService.submitSupportRequest({
      requesterId: student.id,
      requesterRole: 'STUDENT',
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      category: 'PROFILE_CORRECTION',
      subject: correctionSubject,
      description: correctionDescription
    });

    setSubmitSuccess(true);
    triggerRefresh();
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsModalOpen(false);
      setCorrectionSubject('');
      setCorrectionDescription('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Student Portal', href: '/student/dashboard' }, { label: 'My Official Profile' }]} />

      {/* Header banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-navy-900 text-white flex items-center justify-center text-xl font-bold shadow-md">
            {student.firstName[0]}
            {student.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {student.firstName} {student.lastName}
              </h2>
              <Badge variant="brand" size="sm">
                {student.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Canonical Student Master ID:{' '}
              <span className="font-mono font-bold text-slate-800">{student.id}</span>
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<FileEdit className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Request Profile Correction
        </Button>
      </div>

      {/* Notice regarding official records */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-blue-900 text-xs">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold">Official ERP Institutional Record:</span> Student demographic, enrollment, and guardian records are managed under strict institutional governance. Direct modifications are restricted. To update any information, please submit an official correction request with supporting proof.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Demographic Details */}
        <Card>
          <CardHeader
            title="Personal & Demographic Information"
            icon={<User className="w-5 h-5" />}
          />
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 font-medium">First Name:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{student.firstName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Last Name:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{student.lastName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Date of Birth:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{formatDate(student.dateOfBirth)}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Gender:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{student.gender}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Blood Group:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{student.bloodGroup}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Student Identity:</span>
                <p className="font-semibold text-blue-700 font-mono mt-0.5">{student.id}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{student.address}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic & Campus Enrollment */}
        <Card>
          <CardHeader
            title="Academic & Campus Enrollment"
            icon={<GraduationCap className="w-5 h-5" />}
          />
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-slate-500 font-medium">Campus of Study:</span>
                <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  {campus?.name} ({campus?.code})
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Enrolled Program:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{student.programName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Department:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{student.department}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-medium">Current Semester:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{student.semester}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Academic Year:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{student.academicYear}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Campus Enrollment No:</span>
                  <p className="font-semibold font-mono text-slate-900 mt-0.5">{student.enrollmentNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Admission Date:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{formatDate(student.enrollmentDate)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency & Guardian Contact */}
        <Card>
          <CardHeader
            title="Emergency Contact & Guardian"
            icon={<ShieldAlert className="w-5 h-5" />}
          />
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Guardian Name:</span>
              <p className="font-semibold text-slate-900 mt-0.5">{student.emergencyContact.name}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Relationship:</span>
              <p className="font-semibold text-slate-900 mt-0.5">{student.emergencyContact.relationship}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Emergency Contact Phone:</span>
              <p className="font-semibold text-slate-900 mt-0.5">{student.emergencyContact.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Campus Transfer History if present */}
        {student.transferHistory && student.transferHistory.length > 0 && (
          <Card>
            <CardHeader
              title="Campus Transfer History"
              icon={<Building2 className="w-5 h-5" />}
            />
            <CardContent className="space-y-3 text-xs">
              {student.transferHistory.map((th, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>Transferred From: {th.previousCampusName}</span>
                    <span className="text-slate-500 font-normal">{th.transferDate}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{th.remarks}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profile Correction Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Profile Correction Request"
        subtitle="Request changes to official demographic or guardian information"
      >
        {submitSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">Request Submitted Successfully</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your request has been routed to the Trust Registrar Office for verification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitCorrection} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Field / Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Correction in Permanent Address or Blood Group"
                value={correctionSubject}
                onChange={(e) => setCorrectionSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Description of Correction</label>
              <textarea
                required
                rows={4}
                placeholder="Specify the exact current value, the desired corrected value, and reference of any official document."
                value={correctionDescription}
                onChange={(e) => setCorrectionDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
              <p className="font-semibold text-slate-800">Verification Process:</p>
              <p className="mt-0.5">Official changes to legal name, date of birth, or guardian details will require presenting original certificates to the campus student section.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Request
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
