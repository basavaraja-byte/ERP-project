import {
  AttendanceSession,
  Campus,
  ClassSection,
  Complaint,
  Course,
  Department,
  DepartmentAnnouncement,
  DemoUser,
  FacultyAssignment,
  FacultyMember,
  Student,
  Subject,
  TimetableSession,
} from '../types/erp';
import { initialCampuses } from '../data/campuses';
import { initialDepartments } from '../data/departments';
import { initialFaculty } from '../data/faculty';
import { initialCourses, initialSubjects } from '../data/courses';
import { initialSections } from '../data/sections';
import { initialFacultyAssignments } from '../data/facultyAssignments';
import { initialTimetableSessions } from '../data/timetable';
import { initialStudents } from '../data/students';
import { initialAttendanceSessions } from '../data/attendance';
import { initialComplaints } from '../data/complaints';
import { initialAnnouncements } from '../data/announcements';
import { demoUsers } from '../data/demoUsers';

export interface ErpMockState {
  campuses: Campus[];
  departments: Department[];
  faculty: FacultyMember[];
  courses: Course[];
  subjects: Subject[];
  sections: ClassSection[];
  facultyAssignments: FacultyAssignment[];
  timetableSessions: TimetableSession[];
  students: Student[];
  attendanceSessions: AttendanceSession[];
  complaints: Complaint[];
  announcements: DepartmentAnnouncement[];
  users: DemoUser[];
  lowAttendanceThreshold: number;
}

const STORAGE_KEY = 'aarohan_erp_dept_mgmt_state_v1';

function cloneInitialState(): ErpMockState {
  return JSON.parse(
    JSON.stringify({
      campuses: initialCampuses,
      departments: initialDepartments,
      faculty: initialFaculty,
      courses: initialCourses,
      subjects: initialSubjects,
      sections: initialSections,
      facultyAssignments: initialFacultyAssignments,
      timetableSessions: initialTimetableSessions,
      students: initialStudents,
      attendanceSessions: initialAttendanceSessions,
      complaints: initialComplaints,
      announcements: initialAnnouncements,
      users: demoUsers,
      lowAttendanceThreshold: 75,
    } satisfies ErpMockState)
  );
}

function loadState(): ErpMockState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ErpMockState;
      if (parsed && Array.isArray(parsed.departments) && Array.isArray(parsed.students)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage read errors in restricted environments
  }
  return cloneInitialState();
}

let state: ErpMockState = loadState();
let versionCounter = 1;
const listeners = new Set<() => void>();

function persistAndNotify() {
  versionCounter += 1;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
  listeners.forEach((listener) => listener());
}

export const mockStore = {
  getState(): ErpMockState {
    return state;
  },

  getVersion(): number {
    return versionCounter;
  },

  mutate(mutator: (draft: ErpMockState) => void): void {
    mutator(state);
    persistAndNotify();
  },

  reset(): void {
    state = cloneInitialState();
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    persistAndNotify();
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

