import { mockCampuses } from './campuses';
import { mockDemoUsers } from './users';
import { mockStudents } from './students';
import { mockParents } from './parents';
import { mockFeeAssessments } from './fees';
import { mockAttendanceSummaries } from './attendance';
import { mockHostelAllocations } from './hostel';
import { mockTimetables, mockAcademicNotices } from './academics';
import { mockNotifications } from './notifications';
import { mockSupportRequests } from './support';

export interface ERPStoreState {
  campuses: typeof mockCampuses;
  demoUsers: typeof mockDemoUsers;
  students: typeof mockStudents;
  parents: typeof mockParents;
  fees: typeof mockFeeAssessments;
  attendance: typeof mockAttendanceSummaries;
  hostelAllocations: typeof mockHostelAllocations;
  timetables: typeof mockTimetables;
  academicNotices: typeof mockAcademicNotices;
  notifications: typeof mockNotifications;
  supportRequests: typeof mockSupportRequests;
}

export const getInitialERPState = (): ERPStoreState => ({
  campuses: JSON.parse(JSON.stringify(mockCampuses)),
  demoUsers: JSON.parse(JSON.stringify(mockDemoUsers)),
  students: JSON.parse(JSON.stringify(mockStudents)),
  parents: JSON.parse(JSON.stringify(mockParents)),
  fees: JSON.parse(JSON.stringify(mockFeeAssessments)),
  attendance: JSON.parse(JSON.stringify(mockAttendanceSummaries)),
  hostelAllocations: JSON.parse(JSON.stringify(mockHostelAllocations)),
  timetables: JSON.parse(JSON.stringify(mockTimetables)),
  academicNotices: JSON.parse(JSON.stringify(mockAcademicNotices)),
  notifications: JSON.parse(JSON.stringify(mockNotifications)),
  supportRequests: JSON.parse(JSON.stringify(mockSupportRequests)),
});
