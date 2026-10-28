import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type {
  Campus,
  Hostel,
  Room,
  Bed,
  Student,
  RoomAllocation,
  MaintenanceRecord,
  AuditLog,
  ActivityEvent,
  BedStatus,
  MaintenanceStatus,
  EntityType,
} from '../types/hostel';
import {
  INITIAL_CAMPUSES,
  INITIAL_HOSTELS,
  INITIAL_ROOMS,
  INITIAL_BEDS,
  INITIAL_STUDENTS,
  INITIAL_ALLOCATIONS,
  INITIAL_MAINTENANCE,
  INITIAL_AUDIT_LOGS,
  INITIAL_ACTIVITY_EVENTS,
} from '../data/mockData';

const STORAGE_KEY = 'campusstay_hostel_storage_v1';

export interface RoomOccupancyInfo {
  room: Room;
  hostel?: Hostel;
  campus?: Campus;
  beds: Bed[];
  occupiedBedsCount: number;
  availableBedsCount: number;
  maintenanceBedsCount: number;
  inactiveBedsCount: number;
  occupancyState: 'Available' | 'Partially Occupied' | 'Fully Occupied' | 'Maintenance' | 'Inactive';
}

export interface HostelOccupancyInfo {
  hostel: Hostel;
  campus?: Campus;
  totalRooms: number;
  physicalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  usableCapacity: number;
  occupancyRate: number;
}

interface HostelContextType {
  // Selected Campus Filter
  selectedCampusId: string; // 'all' or specific campus id
  setSelectedCampusId: (id: string) => void;

  // Raw State Collections
  campuses: Campus[];
  hostels: Hostel[];
  rooms: Room[];
  beds: Bed[];
  students: Student[];
  allocations: RoomAllocation[];
  maintenanceRecords: MaintenanceRecord[];
  auditLogs: AuditLog[];
  activityEvents: ActivityEvent[];

  // Entity Lookups
  getCampusById: (id: string) => Campus | undefined;
  getHostelById: (id: string) => Hostel | undefined;
  getRoomById: (id: string) => Room | undefined;
  getBedById: (id: string) => Bed | undefined;
  getStudentById: (id: string) => Student | undefined;
  getRoomBeds: (roomId: string) => Bed[];
  getBedActiveAllocation: (bedId: string) => RoomAllocation | undefined;
  getStudentActiveAllocation: (studentId: string) => RoomAllocation | undefined;
  getStudentAllocationHistory: (studentId: string) => RoomAllocation[];
  
  // Computed Aggregations
  getHostelStats: (hostelId: string) => HostelOccupancyInfo;
  allHostelStats: HostelOccupancyInfo[];
  filteredHostelStats: HostelOccupancyInfo[];
  allRoomOccupancy: RoomOccupancyInfo[];
  filteredRoomOccupancy: RoomOccupancyInfo[];
  roomAvailabilityWidgetData: {
    availableRooms: number;
    partiallyOccupiedRooms: number;
    fullyOccupiedRooms: number;
    maintenanceRooms: number;
    inactiveRooms: number;
  };

  // Dashboard Metrics
  activeHostelsCount: number;
  totalPhysicalBeds: number;
  totalOccupiedBeds: number;
  totalAvailableBeds: number;
  totalMaintenanceBeds: number;
  totalPendingAllocations: number;
  globalOccupancyRate: number;

  // Actions
  addCampus: (data: Omit<Campus, 'id' | 'created_at'>) => { success: boolean; message: string };
  updateCampus: (id: string, updates: Partial<Campus>) => { success: boolean; message: string };
  
  addHostel: (data: Omit<Hostel, 'id' | 'created_at'>) => { success: boolean; message: string };
  updateHostel: (id: string, updates: Partial<Hostel>) => { success: boolean; message: string };

  addRoom: (roomData: Omit<Room, 'id' | 'created_at'>) => { success: boolean; message: string };
  updateRoom: (id: string, updates: Partial<Room>) => { success: boolean; message: string };
  updateBedStatus: (bedId: string, status: BedStatus) => { success: boolean; message: string };

  registerStudent: (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => { success: boolean; message: string };
  updateStudent: (id: string, updates: Partial<Student>) => { success: boolean; message: string };

  requestAllocation: (studentId: string, bedId: string, expectedCheckoutDate?: string) => { success: boolean; message: string };
  approveAllocation: (allocationId: string, approvedBy?: string) => { success: boolean; message: string };
  transferAllocation: (currentAllocationId: string, newBedId: string, reason: string) => { success: boolean; message: string };
  checkoutAllocation: (allocationId: string, reason: string) => { success: boolean; message: string };
  cancelAllocation: (allocationId: string, reason: string) => { success: boolean; message: string };

  reportMaintenance: (data: Omit<MaintenanceRecord, 'id' | 'reported_at' | 'status'>) => { success: boolean; message: string };
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus) => { success: boolean; message: string };

  resetDemoData: () => void;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export const HostelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCampusId, setSelectedCampusId] = useState<string>('all');

  // Initialize state from localStorage if exists
  const [campuses, setCampuses] = useState<Campus[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_campuses`);
      return saved ? JSON.parse(saved) : INITIAL_CAMPUSES;
    } catch {
      return INITIAL_CAMPUSES;
    }
  });

  const [hostels, setHostels] = useState<Hostel[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_hostels`);
      return saved ? JSON.parse(saved) : INITIAL_HOSTELS;
    } catch {
      return INITIAL_HOSTELS;
    }
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_rooms`);
      return saved ? JSON.parse(saved) : INITIAL_ROOMS;
    } catch {
      return INITIAL_ROOMS;
    }
  });

  const [beds, setBeds] = useState<Bed[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_beds`);
      return saved ? JSON.parse(saved) : INITIAL_BEDS;
    } catch {
      return INITIAL_BEDS;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [allocations, setAllocations] = useState<RoomAllocation[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_allocations`);
      return saved ? JSON.parse(saved) : INITIAL_ALLOCATIONS;
    } catch {
      return INITIAL_ALLOCATIONS;
    }
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_maintenance`);
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
    } catch {
      return INITIAL_MAINTENANCE;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activity`);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_EVENTS;
    } catch {
      return INITIAL_ACTIVITY_EVENTS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_campuses`, JSON.stringify(campuses));
      localStorage.setItem(`${STORAGE_KEY}_hostels`, JSON.stringify(hostels));
      localStorage.setItem(`${STORAGE_KEY}_rooms`, JSON.stringify(rooms));
      localStorage.setItem(`${STORAGE_KEY}_beds`, JSON.stringify(beds));
      localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
      localStorage.setItem(`${STORAGE_KEY}_allocations`, JSON.stringify(allocations));
      localStorage.setItem(`${STORAGE_KEY}_maintenance`, JSON.stringify(maintenanceRecords));
      localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
      localStorage.setItem(`${STORAGE_KEY}_activity`, JSON.stringify(activityEvents));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [campuses, hostels, rooms, beds, students, allocations, maintenanceRecords, auditLogs, activityEvents]);

  // Audit Logger Helper
  const logAudit = (
    action: string,
    entityType: EntityType,
    entityId: string,
    reason: string,
    beforeData: Record<string, unknown> | null,
    afterData: Record<string, unknown> | null,
    campusId?: string
  ) => {
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actor_user_id: 'Dr. Arthur Pendelton (Chief Warden)',
      campus_id: campusId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      timestamp: new Date().toISOString(),
      reason,
      before_data: beforeData,
      after_data: afterData,
      request_id: `REQ-${Date.now().toString().slice(-4)}`,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const addActivity = (
    title: string,
    type: ActivityEvent['type'],
    badgeColor: string
  ) => {
    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      title,
      timestamp: 'Just now',
      type,
      badgeColor,
    };
    setActivityEvents((prev) => [newEvent, ...prev.slice(0, 24)]);
  };

  // Lookups
  const getCampusById = (id: string) => campuses.find((c) => c.id === id);
  const getHostelById = (id: string) => hostels.find((h) => h.id === id);
  const getRoomById = (id: string) => rooms.find((r) => r.id === id);
  const getBedById = (id: string) => beds.find((b) => b.id === id);
  const getStudentById = (id: string) => students.find((s) => s.id === id);
  const getRoomBeds = (roomId: string) => beds.filter((b) => b.room_id === roomId);

  const getBedActiveAllocation = (bedId: string) =>
    allocations.find((a) => a.bed_id === bedId && a.status === 'Active');

  const getStudentActiveAllocation = (studentId: string) =>
    allocations.find((a) => a.student_id === studentId && a.status === 'Active');

  const getStudentAllocationHistory = (studentId: string) =>
    allocations.filter((a) => a.student_id === studentId);

  // Computed Hostel Occupancy Stats
  const getHostelStats = (hostelId: string): HostelOccupancyInfo => {
    const hostel = hostels.find((h) => h.id === hostelId)!;
    const campus = hostel ? getCampusById(hostel.campus_id) : undefined;
    const hostelRooms = rooms.filter((r) => r.hostel_id === hostelId);
    const roomIds = hostelRooms.map((r) => r.id);
    const hostelBeds = beds.filter((b) => roomIds.includes(b.room_id));

    const physicalBeds = hostelBeds.length;
    
    // Beds occupied by Active allocations
    const activeAllocBeds = new Set(
      allocations
        .filter((a) => a.status === 'Active' && hostelBeds.some((b) => b.id === a.bed_id))
        .map((a) => a.bed_id)
    );
    const occupiedBeds = activeAllocBeds.size;

    // Maintenance or inactive beds
    const maintenanceBeds = hostelBeds.filter(
      (b) => b.status === 'Maintenance' || b.status === 'Inactive' || 
             hostelRooms.find(r => r.id === b.room_id)?.status !== 'Available'
    ).length;

    // Usable capacity = physical beds minus maintenance/inactive
    const usableCapacity = Math.max(0, physicalBeds - maintenanceBeds);

    // Available beds = Usable beds not currently occupied
    const availableBeds = hostelBeds.filter(
      (b) => b.status === 'Available' && 
             !activeAllocBeds.has(b.id) &&
             hostelRooms.find(r => r.id === b.room_id)?.status === 'Available'
    ).length;

    // Occupancy rate = occupied beds / usable bed capacity * 100 (handling 0 capacity safely)
    const occupancyRate = usableCapacity > 0 
      ? Math.round((occupiedBeds / usableCapacity) * 100) 
      : 0;

    return {
      hostel,
      campus,
      totalRooms: hostelRooms.length,
      physicalBeds,
      occupiedBeds,
      availableBeds,
      maintenanceBeds,
      usableCapacity,
      occupancyRate,
    };
  };

  const allHostelStats = useMemo(() => {
    return hostels.map((h) => getHostelStats(h.id));
  }, [hostels, rooms, beds, allocations]);

  const filteredHostelStats = useMemo(() => {
    if (selectedCampusId === 'all') return allHostelStats;
    return allHostelStats.filter((h) => h.hostel.campus_id === selectedCampusId);
  }, [allHostelStats, selectedCampusId]);

  // Computed Room Occupancy Info
  const allRoomOccupancy = useMemo(() => {
    return rooms.map((room) => {
      const hostel = getHostelById(room.hostel_id);
      const campus = hostel ? getCampusById(hostel.campus_id) : undefined;
      const roomBeds = beds.filter((b) => b.room_id === room.id);
      
      const occupiedBedsCount = roomBeds.filter((b) => 
        allocations.some((a) => a.bed_id === b.id && a.status === 'Active')
      ).length;

      const maintenanceBedsCount = roomBeds.filter((b) => b.status === 'Maintenance').length;
      const inactiveBedsCount = roomBeds.filter((b) => b.status === 'Inactive').length;
      
      const availableBedsCount = roomBeds.filter((b) => 
        b.status === 'Available' &&
        !allocations.some((a) => a.bed_id === b.id && a.status === 'Active')
      ).length;

      let occupancyState: RoomOccupancyInfo['occupancyState'] = 'Available';
      if (room.status === 'Inactive') {
        occupancyState = 'Inactive';
      } else if (room.status === 'Maintenance' || maintenanceBedsCount === roomBeds.length) {
        occupancyState = 'Maintenance';
      } else if (occupiedBedsCount === room.bed_capacity && room.bed_capacity > 0) {
        occupancyState = 'Fully Occupied';
      } else if (occupiedBedsCount > 0) {
        occupancyState = 'Partially Occupied';
      } else {
        occupancyState = 'Available';
      }

      return {
        room,
        hostel,
        campus,
        beds: roomBeds,
        occupiedBedsCount,
        availableBedsCount,
        maintenanceBedsCount,
        inactiveBedsCount,
        occupancyState,
      };
    });
  }, [rooms, hostels, campuses, beds, allocations]);

  const filteredRoomOccupancy = useMemo(() => {
    if (selectedCampusId === 'all') return allRoomOccupancy;
    return allRoomOccupancy.filter((ro) => ro.campus?.id === selectedCampusId);
  }, [allRoomOccupancy, selectedCampusId]);

  // Room Availability Widget Breakdown
  const roomAvailabilityWidgetData = useMemo(() => {
    let availableRooms = 0;
    let partiallyOccupiedRooms = 0;
    let fullyOccupiedRooms = 0;
    let maintenanceRooms = 0;
    let inactiveRooms = 0;

    filteredRoomOccupancy.forEach((r) => {
      switch (r.occupancyState) {
        case 'Available':
          availableRooms++;
          break;
        case 'Partially Occupied':
          partiallyOccupiedRooms++;
          break;
        case 'Fully Occupied':
          fullyOccupiedRooms++;
          break;
        case 'Maintenance':
          maintenanceRooms++;
          break;
        case 'Inactive':
          inactiveRooms++;
          break;
      }
    });

    return {
      availableRooms,
      partiallyOccupiedRooms,
      fullyOccupiedRooms,
      maintenanceRooms,
      inactiveRooms,
    };
  }, [filteredRoomOccupancy]);

  // Global Dashboard Metrics
  const activeHostelsCount = useMemo(() => {
    const list = selectedCampusId === 'all' 
      ? hostels 
      : hostels.filter((h) => h.campus_id === selectedCampusId);
    return list.filter((h) => h.status === 'Active').length;
  }, [hostels, selectedCampusId]);

  const totalPhysicalBeds = useMemo(() => {
    return filteredHostelStats.reduce((sum, h) => sum + h.physicalBeds, 0);
  }, [filteredHostelStats]);

  const totalOccupiedBeds = useMemo(() => {
    return filteredHostelStats.reduce((sum, h) => sum + h.occupiedBeds, 0);
  }, [filteredHostelStats]);

  const totalAvailableBeds = useMemo(() => {
    return filteredHostelStats.reduce((sum, h) => sum + h.availableBeds, 0);
  }, [filteredHostelStats]);

  const totalMaintenanceBeds = useMemo(() => {
    return filteredHostelStats.reduce((sum, h) => sum + h.maintenanceBeds, 0);
  }, [filteredHostelStats]);

  const totalPendingAllocations = useMemo(() => {
    const pending = allocations.filter((a) => a.status === 'Pending');
    if (selectedCampusId === 'all') return pending.length;
    return pending.filter((a) => {
      const student = students.find((s) => s.id === a.student_id);
      return student?.campus_id === selectedCampusId;
    }).length;
  }, [allocations, students, selectedCampusId]);

  const globalOccupancyRate = useMemo(() => {
    const totalUsable = filteredHostelStats.reduce((sum, h) => sum + h.usableCapacity, 0);
    if (totalUsable === 0) return 0;
    return Math.round((totalOccupiedBeds / totalUsable) * 100);
  }, [filteredHostelStats, totalOccupiedBeds]);

  // ACTIONS

  // 1. Campus Actions
  const addCampus = (data: Omit<Campus, 'id' | 'created_at'>) => {
    const codeExists = campuses.some((c) => c.campus_code.toLowerCase() === data.campus_code.trim().toLowerCase());
    if (codeExists) {
      return { success: false, message: `Campus code "${data.campus_code}" already exists.` };
    }
    const newCampus: Campus = {
      id: `camp-${Date.now()}`,
      campus_code: data.campus_code.trim().toUpperCase(),
      name: data.name.trim(),
      status: data.status,
      created_at: new Date().toISOString(),
    };
    setCampuses((prev) => [...prev, newCampus]);
    logAudit('CAMPUS_CREATED', 'Campus', newCampus.id, `Created campus ${newCampus.name}`, null, { ...newCampus }, newCampus.id);
    addActivity(`Campus "${newCampus.name}" added`, 'ROOM_UPDATE', 'bg-blue-100 text-blue-800 border-blue-200');
    return { success: true, message: 'Campus created successfully.' };
  };

  const updateCampus = (id: string, updates: Partial<Campus>) => {
    const campus = campuses.find((c) => c.id === id);
    if (!campus) return { success: false, message: 'Campus not found.' };

    if (updates.campus_code && updates.campus_code !== campus.campus_code) {
      const codeExists = campuses.some(
        (c) => c.id !== id && c.campus_code.toLowerCase() === updates.campus_code!.trim().toLowerCase()
      );
      if (codeExists) return { success: false, message: `Campus code "${updates.campus_code}" already exists.` };
    }

    setCampuses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logAudit('CAMPUS_UPDATED', 'Campus', id, `Updated campus details for ${campus.name}`, { ...campus }, { ...campus, ...updates }, id);
    return { success: true, message: 'Campus updated successfully.' };
  };

  // 2. Hostel Actions (NO address field)
  const addHostel = (data: Omit<Hostel, 'id' | 'created_at'>) => {
    // Unique within campus
    const duplicate = hostels.some(
      (h) => h.campus_id === data.campus_id && h.hostel_code.toLowerCase() === data.hostel_code.trim().toLowerCase()
    );
    if (duplicate) {
      return { success: false, message: `Hostel code "${data.hostel_code}" already exists in this campus.` };
    }

    const newHostel: Hostel = {
      id: `hostel-${Date.now()}`,
      campus_id: data.campus_id,
      hostel_code: data.hostel_code.trim().toUpperCase(),
      name: data.name.trim(),
      hostel_type: data.hostel_type,
      number_of_floors: Number(data.number_of_floors),
      warden_user_id: data.warden_user_id.trim(),
      contact_number: data.contact_number.trim(),
      status: data.status,
      created_at: new Date().toISOString(),
    };

    setHostels((prev) => [...prev, newHostel]);
    logAudit('HOSTEL_CREATED', 'Hostel', newHostel.id, `Created hostel ${newHostel.name}`, null, { ...newHostel }, newHostel.campus_id);
    addActivity(`Hostel "${newHostel.name}" registered`, 'ROOM_UPDATE', 'bg-indigo-100 text-indigo-800 border-indigo-200');
    return { success: true, message: 'Hostel created successfully.' };
  };

  const updateHostel = (id: string, updates: Partial<Hostel>) => {
    const hostel = hostels.find((h) => h.id === id);
    if (!hostel) return { success: false, message: 'Hostel not found.' };

    if (updates.hostel_code && updates.hostel_code !== hostel.hostel_code) {
      const targetCampus = updates.campus_id || hostel.campus_id;
      const duplicate = hostels.some(
        (h) => h.id !== id && h.campus_id === targetCampus && h.hostel_code.toLowerCase() === updates.hostel_code!.trim().toLowerCase()
      );
      if (duplicate) return { success: false, message: `Hostel code "${updates.hostel_code}" already exists in this campus.` };
    }

    setHostels((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
    logAudit('HOSTEL_UPDATED', 'Hostel', id, `Updated hostel ${hostel.name}`, { ...hostel }, { ...hostel, ...updates }, hostel.campus_id);
    return { success: true, message: 'Hostel updated successfully.' };
  };

  // 3. Room & Bed Actions (NO remarks field on rooms)
  const addRoom = (roomData: Omit<Room, 'id' | 'created_at'>) => {
    // Check if room_number already exists in this hostel and floor
    const exists = rooms.some(
      (r) => r.hostel_id === roomData.hostel_id && r.room_number.trim().toLowerCase() === roomData.room_number.trim().toLowerCase()
    );
    if (exists) {
      return { success: false, message: `Room number "${roomData.room_number}" already exists in this hostel.` };
    }

    const roomId = `room-${Date.now()}`;
    const newRoom: Room = {
      id: roomId,
      hostel_id: roomData.hostel_id,
      floor_number: Number(roomData.floor_number),
      room_number: roomData.room_number.trim(),
      room_type: roomData.room_type,
      bed_capacity: Number(roomData.bed_capacity),
      status: roomData.status,
      facilities: roomData.facilities || [],
      created_at: new Date().toISOString(),
    };

    // Auto-provision configured bed records to strictly match bed_capacity
    const bedLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const newBeds: Bed[] = [];
    for (let i = 0; i < newRoom.bed_capacity; i++) {
      newBeds.push({
        id: `bed-${Date.now()}-${i}`,
        room_id: roomId,
        bed_number: bedLetters[i] || `Bed-${i + 1}`,
        status: newRoom.status === 'Available' ? 'Available' : 'Maintenance',
        created_at: new Date().toISOString(),
      });
    }

    setRooms((prev) => [...prev, newRoom]);
    setBeds((prev) => [...prev, ...newBeds]);

    const hostel = getHostelById(newRoom.hostel_id);
    logAudit(
      'ROOM_CREATED',
      'Room',
      roomId,
      `Created Room ${newRoom.room_number} (${newRoom.room_type}) with ${newBeds.length} configured beds`,
      null,
      { ...newRoom, bed_count: newBeds.length },
      hostel?.campus_id
    );
    addActivity(`Room ${newRoom.room_number} added with ${newBeds.length} beds`, 'ROOM_UPDATE', 'bg-blue-100 text-blue-800 border-blue-200');

    return { success: true, message: `Room ${newRoom.room_number} created with ${newBeds.length} beds.` };
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    const room = rooms.find((r) => r.id === id);
    if (!room) return { success: false, message: 'Room not found.' };

    const configuredBeds = beds.filter((b) => b.room_id === id);
    const activeAllocCount = configuredBeds.filter((b) =>
      allocations.some((a) => a.bed_id === b.id && a.status === 'Active')
    ).length;

    // Strict Rule: Do not permit local UI actions to reduce capacity below configured beds or invalidate active allocations
    if (updates.bed_capacity !== undefined) {
      if (updates.bed_capacity < activeAllocCount) {
        return {
          success: false,
          message: `Cannot reduce bed capacity to ${updates.bed_capacity}. There are currently ${activeAllocCount} students actively allocated to this room.`,
        };
      }
      if (updates.bed_capacity < configuredBeds.length) {
        return {
          success: false,
          message: `Cannot reduce capacity below configured beds (${configuredBeds.length}). Delete unused beds first.`,
        };
      }
    }

    // If changing room status to Inactive or Maintenance, verify active allocations
    if (updates.status && updates.status !== 'Available' && activeAllocCount > 0) {
      return {
        success: false,
        message: `Cannot mark room as ${updates.status} because it has ${activeAllocCount} active student allocations. Please transfer or checkout students first.`,
      };
    }

    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    
    // If status changed to Maintenance or Inactive, also cascade to beds if no active allocations
    if (updates.status && updates.status !== room.status) {
      setBeds((prev) =>
        prev.map((b) => {
          if (b.room_id === id) {
            return {
              ...b,
              status: updates.status === 'Available' ? 'Available' : (updates.status as BedStatus),
            };
          }
          return b;
        })
      );
    }

    const hostel = getHostelById(room.hostel_id);
    logAudit('ROOM_UPDATED', 'Room', id, `Updated Room ${room.room_number}`, { ...room }, { ...room, ...updates }, hostel?.campus_id);
    return { success: true, message: 'Room updated successfully.' };
  };

  const updateBedStatus = (bedId: string, status: BedStatus) => {
    const bed = beds.find((b) => b.id === bedId);
    if (!bed) return { success: false, message: 'Bed not found.' };

    const activeAlloc = allocations.find((a) => a.bed_id === bedId && a.status === 'Active');
    if (activeAlloc && status !== 'Available') {
      const student = students.find((s) => s.id === activeAlloc.student_id);
      return {
        success: false,
        message: `Cannot change bed status to ${status}. Bed is actively allocated to student ${student?.full_name || 'student'}.`,
      };
    }

    setBeds((prev) => prev.map((b) => (b.id === bedId ? { ...b, status } : b)));
    const room = getRoomById(bed.room_id);
    const hostel = room ? getHostelById(room.hostel_id) : undefined;
    logAudit(
      'BED_STATUS_UPDATED',
      'Bed',
      bedId,
      `Changed bed status from ${bed.status} to ${status}`,
      { status: bed.status },
      { status },
      hostel?.campus_id
    );
    addActivity(`Bed ${bed.bed_number} (Room ${room?.room_number}) set to ${status}`, 'ROOM_UPDATE', 'bg-slate-100 text-slate-800 border-slate-200');
    return { success: true, message: `Bed status updated to ${status}.` };
  };

  // 4. Student Actions
  const registerStudent = (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    // Unique student_code within campus
    const duplicate = students.some(
      (s) => s.campus_id === data.campus_id && s.student_code.toLowerCase() === data.student_code.trim().toLowerCase()
    );
    if (duplicate) {
      return { success: false, message: `Student code "${data.student_code}" already registered in this campus.` };
    }

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      student_code: data.student_code.trim().toUpperCase(),
      campus_id: data.campus_id,
      full_name: data.full_name.trim(),
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      department: data.department?.trim(),
      course: data.course?.trim(),
      academic_year: data.academic_year?.trim(),
      phone_number: data.phone_number?.trim(),
      guardian_name: data.guardian_name?.trim(),
      guardian_phone: data.guardian_phone?.trim(),
      address: data.address?.trim(),
      status: data.status || 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setStudents((prev) => [newStudent, ...prev]);
    logAudit('STUDENT_REGISTERED', 'Student', newStudent.id, `Manual student admission registration`, null, { ...newStudent }, newStudent.campus_id);
    addActivity(`Student ${newStudent.full_name} (${newStudent.student_code}) registered`, 'STUDENT_REG', 'bg-blue-100 text-blue-800 border-blue-200');
    return { success: true, message: `Student ${newStudent.full_name} registered successfully.` };
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const student = students.find((s) => s.id === id);
    if (!student) return { success: false, message: 'Student not found.' };

    if (updates.student_code && updates.student_code !== student.student_code) {
      const targetCampus = updates.campus_id || student.campus_id;
      const duplicate = students.some(
        (s) => s.id !== id && s.campus_id === targetCampus && s.student_code.toLowerCase() === updates.student_code!.trim().toLowerCase()
      );
      if (duplicate) return { success: false, message: `Student code "${updates.student_code}" already exists in this campus.` };
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s))
    );
    logAudit('STUDENT_UPDATED', 'Student', id, `Updated student profile`, { ...student }, { ...student, ...updates }, student.campus_id);
    return { success: true, message: 'Student profile updated successfully.' };
  };

  // 5. Allocation Actions (NO remarks field)
  const requestAllocation = (studentId: string, bedId: string, expectedCheckoutDate?: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return { success: false, message: 'Student not found.' };

    const bed = beds.find((b) => b.id === bedId);
    if (!bed) return { success: false, message: 'Bed not found.' };

    const room = rooms.find((r) => r.id === bed.room_id);
    if (!room || room.status !== 'Available') {
      return { success: false, message: 'Cannot allocate bed in an unavailable or maintenance room.' };
    }

    if (bed.status !== 'Available') {
      return { success: false, message: `Selected bed is currently ${bed.status} and cannot be allocated.` };
    }

    // Rule: Bed cannot have two simultaneous active allocations
    const activeBedAlloc = allocations.find((a) => a.bed_id === bedId && a.status === 'Active');
    if (activeBedAlloc) {
      return { success: false, message: 'This bed is already occupied by an active allocation.' };
    }

    // Rule: Student cannot have overlapping active allocations
    const activeStudentAlloc = allocations.find((a) => a.student_id === studentId && a.status === 'Active');
    if (activeStudentAlloc) {
      return { success: false, message: `Student ${student.full_name} already has an active room allocation.` };
    }

    const newAlloc: RoomAllocation = {
      id: `alloc-${Date.now()}`,
      student_id: studentId,
      bed_id: bedId,
      allocation_date: new Date().toISOString(),
      expected_checkout_date: expectedCheckoutDate || undefined,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };

    setAllocations((prev) => [newAlloc, ...prev]);
    const hostel = getHostelById(room.hostel_id);
    logAudit(
      'ALLOCATION_REQUESTED',
      'Allocation',
      newAlloc.id,
      `Requested allocation for ${student.full_name} in Room ${room.room_number} Bed ${bed.bed_number}`,
      null,
      { ...newAlloc },
      hostel?.campus_id
    );
    addActivity(`Allocation requested for ${student.full_name}`, 'ALLOC_APPROVE', 'bg-amber-100 text-amber-800 border-amber-200');

    return { success: true, message: 'Room allocation request submitted for warden review.' };
  };

  const approveAllocation = (allocationId: string, approvedBy: string = 'Dr. Arthur Pendelton (Chief Warden)') => {
    const alloc = allocations.find((a) => a.id === allocationId);
    if (!alloc) return { success: false, message: 'Allocation not found.' };

    const bed = beds.find((b) => b.id === alloc.bed_id);
    if (!bed || bed.status !== 'Available') {
      return { success: false, message: 'Cannot approve allocation: Bed is no longer available.' };
    }

    // Re-verify no simultaneous active allocation
    const bedAlreadyOccupied = allocations.find(
      (a) => a.id !== allocationId && a.bed_id === alloc.bed_id && a.status === 'Active'
    );
    if (bedAlreadyOccupied) {
      return { success: false, message: 'This bed has already been assigned to another active student.' };
    }

    const now = new Date().toISOString();
    setAllocations((prev) =>
      prev.map((a) =>
        a.id === allocationId
          ? { ...a, status: 'Active', approved_by: approvedBy, approved_at: now }
          : a
      )
    );

    const student = getStudentById(alloc.student_id);
    const room = bed ? getRoomById(bed.room_id) : undefined;
    const hostel = room ? getHostelById(room.hostel_id) : undefined;

    logAudit(
      'ALLOCATION_APPROVED',
      'Allocation',
      allocationId,
      `Approved room allocation for ${student?.full_name}`,
      { status: 'Pending' },
      { status: 'Active', approved_by: approvedBy, approved_at: now },
      hostel?.campus_id
    );
    addActivity(`Allocation approved for ${student?.full_name || 'Student'}`, 'ALLOC_APPROVE', 'bg-emerald-100 text-emerald-800 border-emerald-200');

    return { success: true, message: 'Allocation approved and activated successfully.' };
  };

  const transferAllocation = (currentAllocationId: string, newBedId: string, reason: string) => {
    const currentAlloc = allocations.find((a) => a.id === currentAllocationId);
    if (!currentAlloc || currentAlloc.status !== 'Active') {
      return { success: false, message: 'Active allocation record not found.' };
    }

    const newBed = beds.find((b) => b.id === newBedId);
    if (!newBed || newBed.status !== 'Available') {
      return { success: false, message: 'Target bed is not available for transfer.' };
    }

    const newRoom = rooms.find((r) => r.id === newBed.room_id);
    if (!newRoom || newRoom.status !== 'Available') {
      return { success: false, message: 'Target room is not available.' };
    }

    const bedOccupied = allocations.find((a) => a.bed_id === newBedId && a.status === 'Active');
    if (bedOccupied) {
      return { success: false, message: 'Target bed already has an active occupant.' };
    }

    const now = new Date().toISOString();

    // 1. Mark previous allocation as Checked Out, preserving history
    const updatedPrevAlloc: RoomAllocation = {
      ...currentAlloc,
      status: 'Checked Out',
      actual_checkout_date: now,
    };

    // 2. Create new active allocation
    const newAlloc: RoomAllocation = {
      id: `alloc-trans-${Date.now()}`,
      student_id: currentAlloc.student_id,
      bed_id: newBedId,
      allocation_date: now,
      expected_checkout_date: currentAlloc.expected_checkout_date,
      status: 'Active',
      approved_by: 'Dr. Arthur Pendelton (Chief Warden)',
      approved_at: now,
      created_at: now,
    };

    setAllocations((prev) => [
      newAlloc,
      ...prev.map((a) => (a.id === currentAllocationId ? updatedPrevAlloc : a)),
    ]);

    const student = getStudentById(currentAlloc.student_id);
    const oldBed = getBedById(currentAlloc.bed_id);
    const oldRoom = oldBed ? getRoomById(oldBed.room_id) : undefined;
    const hostel = newRoom ? getHostelById(newRoom.hostel_id) : undefined;

    logAudit(
      'BED_TRANSFERRED',
      'Allocation',
      newAlloc.id,
      `Bed transfer: ${reason || 'Approved administrative transfer'}. From Room ${oldRoom?.room_number || ''} Bed ${oldBed?.bed_number || ''} to Room ${newRoom.room_number} Bed ${newBed.bed_number}`,
      { previous_allocation_id: currentAllocationId, bed_id: currentAlloc.bed_id },
      { new_allocation_id: newAlloc.id, new_bed_id: newBedId },
      hostel?.campus_id
    );
    addActivity(`Student ${student?.full_name || 'student'} transferred to Bed ${newBed.bed_number}`, 'CHECK_IN', 'bg-indigo-100 text-indigo-800 border-indigo-200');

    return { success: true, message: `Student transferred to Room ${newRoom.room_number} Bed ${newBed.bed_number}.` };
  };

  const checkoutAllocation = (allocationId: string, reason: string) => {
    const alloc = allocations.find((a) => a.id === allocationId);
    if (!alloc || alloc.status !== 'Active') {
      return { success: false, message: 'Active allocation not found.' };
    }

    const now = new Date().toISOString();
    setAllocations((prev) =>
      prev.map((a) =>
        a.id === allocationId
          ? { ...a, status: 'Checked Out', actual_checkout_date: now }
          : a
      )
    );

    const student = getStudentById(alloc.student_id);
    const bed = getBedById(alloc.bed_id);
    const room = bed ? getRoomById(bed.room_id) : undefined;
    const hostel = room ? getHostelById(room.hostel_id) : undefined;

    logAudit(
      'STUDENT_CHECKOUT',
      'Allocation',
      allocationId,
      `Checkout processed: ${reason || 'Semester conclusion checkout'}`,
      { status: 'Active' },
      { status: 'Checked Out', actual_checkout_date: now },
      hostel?.campus_id
    );
    addActivity(`Student ${student?.full_name || 'Student'} completed checkout`, 'CHECK_OUT', 'bg-slate-100 text-slate-800 border-slate-200');

    return { success: true, message: 'Student checkout processed successfully. Bed is now available.' };
  };

  const cancelAllocation = (allocationId: string, reason: string) => {
    const alloc = allocations.find((a) => a.id === allocationId);
    if (!alloc) return { success: false, message: 'Allocation record not found.' };

    setAllocations((prev) =>
      prev.map((a) => (a.id === allocationId ? { ...a, status: 'Cancelled' } : a))
    );

    const student = getStudentById(alloc.student_id);
    logAudit(
      'ALLOCATION_CANCELLED',
      'Allocation',
      allocationId,
      `Allocation request cancelled: ${reason || 'Cancelled by warden'}`,
      { status: alloc.status },
      { status: 'Cancelled' }
    );
    addActivity(`Allocation cancelled for ${student?.full_name || 'Student'}`, 'CHECK_OUT', 'bg-rose-100 text-rose-800 border-rose-200');

    return { success: true, message: 'Allocation request cancelled.' };
  };

  // 6. Maintenance Actions (NO description, NO resolution_notes)
  const reportMaintenance = (data: Omit<MaintenanceRecord, 'id' | 'reported_at' | 'status'>) => {
    const room = rooms.find((r) => r.id === data.room_id);
    if (!room) return { success: false, message: 'Room not found.' };

    const newRecord: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      room_id: data.room_id,
      bed_id: data.bed_id || undefined,
      issue_title: data.issue_title.trim(),
      priority: data.priority,
      status: 'Open',
      reported_at: new Date().toISOString(),
      reported_by: data.reported_by.trim(),
    };

    setMaintenanceRecords((prev) => [newRecord, ...prev]);

    // If critical or high, mark specific bed or room as Maintenance if not occupied
    if (newRecord.bed_id && (newRecord.priority === 'Critical' || newRecord.priority === 'High')) {
      const activeAlloc = allocations.find((a) => a.bed_id === newRecord.bed_id && a.status === 'Active');
      if (!activeAlloc) {
        setBeds((prev) =>
          prev.map((b) => (b.id === newRecord.bed_id ? { ...b, status: 'Maintenance' } : b))
        );
      }
    }

    const hostel = getHostelById(room.hostel_id);
    logAudit(
      'MAINTENANCE_REPORTED',
      'Maintenance',
      newRecord.id,
      `Reported [${newRecord.priority}] priority issue: ${newRecord.issue_title}`,
      null,
      { ...newRecord },
      hostel?.campus_id
    );
    addActivity(`Maintenance reported: ${newRecord.issue_title}`, 'MAINT_UPDATE', 'bg-amber-100 text-amber-800 border-amber-200');

    return { success: true, message: 'Maintenance issue logged successfully.' };
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceStatus) => {
    const record = maintenanceRecords.find((m) => m.id === id);
    if (!record) return { success: false, message: 'Maintenance record not found.' };

    const now = new Date().toISOString();
    const resolvedAt = status === 'Resolved' ? now : record.resolved_at;

    setMaintenanceRecords((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status,
              resolved_at: resolvedAt,
            }
          : m
      )
    );

    // If resolved and bed was in maintenance, restore bed status to Available if applicable
    if (status === 'Resolved' && record.bed_id) {
      setBeds((prev) =>
        prev.map((b) => (b.id === record.bed_id && b.status === 'Maintenance' ? { ...b, status: 'Available' } : b))
      );
    }

    const room = getRoomById(record.room_id);
    const hostel = room ? getHostelById(room.hostel_id) : undefined;

    logAudit(
      'MAINTENANCE_STATUS_UPDATED',
      'Maintenance',
      id,
      `Updated status to ${status}`,
      { status: record.status },
      { status, resolved_at: resolvedAt },
      hostel?.campus_id
    );
    addActivity(`Maintenance "${record.issue_title}" marked as ${status}`, 'MAINT_UPDATE', status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200');

    return { success: true, message: `Maintenance status updated to ${status}.` };
  };

  // Reset Demo Data
  const resetDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_campuses`);
    localStorage.removeItem(`${STORAGE_KEY}_hostels`);
    localStorage.removeItem(`${STORAGE_KEY}_rooms`);
    localStorage.removeItem(`${STORAGE_KEY}_beds`);
    localStorage.removeItem(`${STORAGE_KEY}_students`);
    localStorage.removeItem(`${STORAGE_KEY}_allocations`);
    localStorage.removeItem(`${STORAGE_KEY}_maintenance`);
    localStorage.removeItem(`${STORAGE_KEY}_audit`);
    localStorage.removeItem(`${STORAGE_KEY}_activity`);

    setCampuses(INITIAL_CAMPUSES);
    setHostels(INITIAL_HOSTELS);
    setRooms(INITIAL_ROOMS);
    setBeds(INITIAL_BEDS);
    setStudents(INITIAL_STUDENTS);
    setAllocations(INITIAL_ALLOCATIONS);
    setMaintenanceRecords(INITIAL_MAINTENANCE);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActivityEvents(INITIAL_ACTIVITY_EVENTS);
    setSelectedCampusId('all');
  };

  return (
    <HostelContext.Provider
      value={{
        selectedCampusId,
        setSelectedCampusId,
        campuses,
        hostels,
        rooms,
        beds,
        students,
        allocations,
        maintenanceRecords,
        auditLogs,
        activityEvents,
        getCampusById,
        getHostelById,
        getRoomById,
        getBedById,
        getStudentById,
        getRoomBeds,
        getBedActiveAllocation,
        getStudentActiveAllocation,
        getStudentAllocationHistory,
        getHostelStats,
        allHostelStats,
        filteredHostelStats,
        allRoomOccupancy,
        filteredRoomOccupancy,
        roomAvailabilityWidgetData,
        activeHostelsCount,
        totalPhysicalBeds,
        totalOccupiedBeds,
        totalAvailableBeds,
        totalMaintenanceBeds,
        totalPendingAllocations,
        globalOccupancyRate,
        addCampus,
        updateCampus,
        addHostel,
        updateHostel,
        addRoom,
        updateRoom,
        updateBedStatus,
        registerStudent,
        updateStudent,
        requestAllocation,
        approveAllocation,
        transferAllocation,
        checkoutAllocation,
        cancelAllocation,
        reportMaintenance,
        updateMaintenanceStatus,
        resetDemoData,
      }}
    >
      {children}
    </HostelContext.Provider>
  );
};

export const useHostel = () => {
  const context = useContext(HostelContext);
  if (!context) {
    throw new Error('useHostel must be used within a HostelProvider');
  }
  return context;
};
