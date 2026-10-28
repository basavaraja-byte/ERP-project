// Strict TypeScript definitions for Hostel Management System

export type CampusStatus = 'Active' | 'Inactive';

export interface Campus {
  id: string;
  campus_code: string;
  name: string;
  status: CampusStatus;
  created_at: string;
}

export type HostelType = 'Boys' | 'Girls' | 'Co-ed' | 'Other';
export type HostelStatus = 'Active' | 'Inactive';

// Mandatory restriction: The hostel model and form must not contain an address field.
export interface Hostel {
  id: string;
  campus_id: string;
  hostel_code: string;
  name: string;
  hostel_type: HostelType;
  number_of_floors: number;
  warden_user_id: string;
  contact_number: string;
  status: HostelStatus;
  created_at: string;
}

export type RoomType = 'Single' | 'Double' | 'Triple' | 'Other';
export type RoomStatus = 'Available' | 'Maintenance' | 'Inactive';

// Mandatory restriction: The room model and form must not contain a remarks field.
export interface Room {
  id: string;
  hostel_id: string;
  floor_number: number;
  room_number: string;
  room_type: RoomType;
  bed_capacity: number;
  status: RoomStatus;
  facilities: string[];
  created_at: string;
}

export type BedStatus = 'Available' | 'Maintenance' | 'Inactive';

export interface Bed {
  id: string;
  room_id: string;
  bed_number: string; // e.g. "A", "B", "C"
  status: BedStatus;
  created_at: string;
}

export type StudentGender = 'Male' | 'Female' | 'Other';
export type StudentStatus = 'Active' | 'Inactive' | 'Graduated' | 'Suspended';

export interface Student {
  id: string;
  student_code: string;
  campus_id: string;
  full_name: string;
  date_of_birth?: string;
  gender?: StudentGender;
  department?: string;
  course?: string;
  academic_year?: string;
  phone_number?: string;
  guardian_name?: string;
  guardian_phone?: string;
  address?: string;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

export type AllocationStatus = 'Pending' | 'Active' | 'Checked Out' | 'Cancelled';

// Mandatory restriction: The allocation model and form must not contain a remarks field.
export interface RoomAllocation {
  id: string;
  student_id: string;
  bed_id: string;
  allocation_date: string;
  expected_checkout_date?: string;
  actual_checkout_date?: string;
  status: AllocationStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MaintenanceStatus = 'Open' | 'In Progress' | 'Resolved' | 'Cancelled';

// Mandatory restrictions:
// - Do not include a description field.
// - Do not include a resolution_notes field.
// - Do not recreate equivalent fields using different names.
export interface MaintenanceRecord {
  id: string;
  room_id: string;
  bed_id?: string;
  issue_title: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reported_at: string;
  reported_by: string;
  resolved_at?: string;
}

export type EntityType = 
  | 'Campus' 
  | 'Hostel' 
  | 'Room' 
  | 'Bed' 
  | 'Student' 
  | 'Allocation' 
  | 'Maintenance';

export interface AuditLog {
  id: string;
  actor_user_id: string;
  campus_id?: string;
  action: string;
  entity_type: EntityType;
  entity_id: string;
  timestamp: string;
  reason: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  request_id?: string;
}

// Activity Event for Dashboard Feed
export interface ActivityEvent {
  id: string;
  title: string;
  timestamp: string;
  type: 'STUDENT_REG' | 'ALLOC_APPROVE' | 'CHECK_IN' | 'CHECK_OUT' | 'ROOM_UPDATE' | 'MAINT_UPDATE';
  badgeColor: string;
}
