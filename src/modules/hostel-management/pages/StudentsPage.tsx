import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  KeyRound,
  History,
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import type { Student, StudentGender, StudentStatus } from '../types/hostel';

export const StudentsPage: React.FC = () => {
  const location = useLocation();
  const {
    students,
    campuses,
    hostels,
    rooms,
    beds,
    selectedCampusId,
    registerStudent,
    updateStudent,
    getStudentActiveAllocation,
    getStudentAllocationHistory,
  } = useHostel();

  const [searchTerm, setSearchTerm] = useState('');
  const [campusFilter, setCampusFilter] = useState<string>(selectedCampusId);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    campus_id: string;
    student_code: string;
    full_name: string;
    date_of_birth: string;
    gender: StudentGender;
    department: string;
    course: string;
    academic_year: string;
    phone_number: string;
    guardian_name: string;
    guardian_phone: string;
    address: string;
    status: StudentStatus;
  }>({
    campus_id: campuses[0]?.id || '',
    student_code: '',
    full_name: '',
    date_of_birth: '',
    gender: 'Male',
    department: '',
    course: '',
    academic_year: 'Year 1',
    phone_number: '',
    guardian_name: '',
    guardian_phone: '',
    address: '',
    status: 'Active',
  });
  const [formError, setFormError] = useState('');

  // Sync header campus filter
  useEffect(() => {
    setCampusFilter(selectedCampusId);
  }, [selectedCampusId]);

  // Handle URL query parameter `?action=register` from Quick Actions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'register') {
      handleOpenRegister();
    }
  }, [location.search]);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.course?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesCampus = campusFilter === 'all' || s.campus_id === campusFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesCampus && matchesStatus;
  });

  const handleOpenRegister = () => {
    setFormData({
      campus_id: campuses[0]?.id || '',
      student_code: '',
      full_name: '',
      date_of_birth: '',
      gender: 'Male',
      department: '',
      course: '',
      academic_year: 'Year 1',
      phone_number: '',
      guardian_name: '',
      guardian_phone: '',
      address: '',
      status: 'Active',
    });
    setFormError('');
    setIsRegisterModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      campus_id: student.campus_id,
      student_code: student.student_code,
      full_name: student.full_name,
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || 'Male',
      department: student.department || '',
      course: student.course || '',
      academic_year: student.academic_year || 'Year 1',
      phone_number: student.phone_number || '',
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
      address: student.address || '',
      status: student.status,
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleSaveRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_code.trim() || !formData.full_name.trim() || !formData.campus_id) {
      setFormError('Please fill in student code, full name, and campus.');
      return;
    }
    const res = registerStudent(formData);
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setIsRegisterModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!formData.student_code.trim() || !formData.full_name.trim()) {
      setFormError('Please fill in student code and full name.');
      return;
    }
    const res = updateStudent(selectedStudent.id, formData);
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Residents Directory"
        subtitle="Manage student profiles, department affiliations, active hostel bed allocations, and historical stays"
        actions={
          <button
            type="button"
            onClick={handleOpenRegister}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register Student
          </button>
        }
      />

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, student code, course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={campusFilter}
            onChange={(e) => setCampusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Campuses</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name.split(' (')[0]}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Graduated">Graduated</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-3">Student Name</th>
                <th className="px-4 py-3">Student Code</th>
                <th className="px-4 py-3">Campus</th>
                <th className="px-4 py-3">Course / Dept</th>
                <th className="px-4 py-3">Current Bed Allocation</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const campus = campuses.find((c) => c.id === student.campus_id);
                const activeAlloc = getStudentActiveAllocation(student.id);

                let allocationDisplay = <span className="text-slate-400 italic">Not Allocated</span>;
                if (activeAlloc) {
                  const bed = beds.find((b) => b.id === activeAlloc.bed_id);
                  const room = bed ? rooms.find((r) => r.id === bed.room_id) : undefined;
                  const hostel = room ? hostels.find((h) => h.id === room.hostel_id) : undefined;

                  allocationDisplay = (
                    <div className="text-slate-800">
                      <span className="font-semibold text-indigo-700">{hostel?.name.split(' ')[0]}</span>{' '}
                      • Room {room?.room_number} (Bed {bed?.bed_number})
                    </div>
                  );
                }

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-6 py-3.5 font-medium text-slate-900">
                      <div className="font-bold text-slate-900">{student.full_name}</div>
                      <div className="text-[11px] text-slate-400">{student.gender || 'Not specified'}</div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-700 font-semibold">
                      {student.student_code}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {campus?.name.split(' (')[0] || 'Campus'}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800">{student.course || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">{student.academic_year}</div>
                    </td>

                    <td className="px-4 py-3.5">{allocationDisplay}</td>

                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={
                          student.status === 'Active'
                            ? 'success'
                            : student.status === 'Graduated'
                            ? 'info'
                            : student.status === 'Suspended'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {student.status}
                      </Badge>
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenView(student)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                          title="View student profile & allocation history"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(student)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Student Modal (Manual Only, No Bulk CSV Import) */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Student"
        subtitle="Manual student enrollment into institutional hostel system"
        maxWidth="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveRegister}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Register Student
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveRegister} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.campus_id}
                onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID / Roll Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NC-2024-0610"
                value={formData.student_code}
                onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">Must be unique within campus</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aryan Malhotra"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as StudentGender })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Program</label>
              <input
                type="text"
                placeholder="e.g. B.Tech CSE"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
              <select
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 91234 56789"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Name</label>
              <input
                type="text"
                placeholder="Parent / Guardian Name"
                value={formData.guardian_name}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Phone</label>
              <input
                type="text"
                placeholder="+91 98111 00000"
                value={formData.guardian_phone}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Residential Address</label>
            <input
              type="text"
              placeholder="City, State, PIN"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Profile"
        subtitle={selectedStudent?.full_name}
        maxWidth="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Update Profile
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Code</label>
              <input
                type="text"
                required
                value={formData.student_code}
                onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
              <select
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Phone</label>
              <input
                type="text"
                value={formData.guardian_phone}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Student Details & Allocation History Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedStudent?.full_name || 'Student Details'}
        subtitle={`Roll Code: ${selectedStudent?.student_code} • ${selectedStudent?.course}`}
        maxWidth="xl"
        footer={
          <button
            type="button"
            onClick={() => setIsViewModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        }
      >
        {selectedStudent && (
          <div className="space-y-5">
            {/* Active Allocation Card */}
            {(() => {
              const activeAlloc = getStudentActiveAllocation(selectedStudent.id);
              const history = getStudentAllocationHistory(selectedStudent.id);

              return (
                <>
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-indigo-600" />
                        Current Room Allocation
                      </span>
                      {activeAlloc ? (
                        <Badge variant="success" size="sm">
                          Active Stay
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          No Active Room
                        </Badge>
                      )}
                    </div>

                    {activeAlloc ? (
                      (() => {
                        const bed = beds.find((b) => b.id === activeAlloc.bed_id);
                        const room = bed ? rooms.find((r) => r.id === bed.room_id) : undefined;
                        const hostel = room ? hostels.find((h) => h.id === room.hostel_id) : undefined;

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                            <div>
                              <div className="text-slate-500">Hostel Building</div>
                              <div className="font-bold text-slate-900">{hostel?.name}</div>
                            </div>
                            <div>
                              <div className="text-slate-500">Room & Bed</div>
                              <div className="font-bold text-slate-900">
                                Room {room?.room_number} (Bed {bed?.bed_number})
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500">Allocation Date</div>
                              <div className="font-medium text-slate-800">
                                {new Date(activeAlloc.allocation_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-xs text-slate-500 pt-1">
                        This student does not currently hold an active room key.
                      </p>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400">Department:</span>{' '}
                      <span className="font-semibold text-slate-800">{selectedStudent.department || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Academic Year:</span>{' '}
                      <span className="font-semibold text-slate-800">{selectedStudent.academic_year || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Phone:</span>{' '}
                      <span className="font-mono text-slate-800">{selectedStudent.phone_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Guardian:</span>{' '}
                      <span className="text-slate-800">
                        {selectedStudent.guardian_name} ({selectedStudent.guardian_phone || 'N/A'})
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400">Address:</span>{' '}
                      <span className="text-slate-800">{selectedStudent.address || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Allocation History */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-slate-500" />
                      All Stays & Allocation History ({history.length})
                    </h4>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {history.map((h) => {
                        const bed = beds.find((b) => b.id === h.bed_id);
                        const room = bed ? rooms.find((r) => r.id === bed.room_id) : undefined;
                        const hostel = room ? hostels.find((bld) => bld.id === room.hostel_id) : undefined;

                        return (
                          <div
                            key={h.id}
                            className="p-3 rounded-lg border border-slate-200/80 bg-white flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">
                                {hostel?.name || 'Hostel'} — Room {room?.room_number || 'N/A'} (Bed {bed?.bed_number || 'N/A'})
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Allocated: {new Date(h.allocation_date).toLocaleDateString()}
                                {h.actual_checkout_date &&
                                  ` • Checked out: ${new Date(h.actual_checkout_date).toLocaleDateString()}`}
                              </div>
                            </div>

                            <Badge
                              variant={
                                h.status === 'Active'
                                  ? 'success'
                                  : h.status === 'Pending'
                                  ? 'warning'
                                  : 'neutral'
                              }
                              size="sm"
                            >
                              {h.status}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};
