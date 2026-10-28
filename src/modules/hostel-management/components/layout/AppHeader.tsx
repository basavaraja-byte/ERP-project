import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Building2,
  ChevronDown,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useHostel } from '../../context/HostelContext';

interface AppHeaderProps {
  onToggleMobileSidebar: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    campuses,
    selectedCampusId,
    setSelectedCampusId,
    students,
    rooms,
    hostels,
    allocations,
    maintenanceRecords,
  } = useHostel();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute page title & breadcrumbs
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard', section: 'Overview' };
    if (path === '/campuses') return { title: 'Campuses', section: 'Hostel Operations' };
    if (path === '/hostels') return { title: 'Hostels Directory', section: 'Hostel Operations' };
    if (path === '/rooms-beds') return { title: 'Rooms & Beds Inventory', section: 'Hostel Operations' };
    if (path === '/students') return { title: 'Students Directory', section: 'Hostel Operations' };
    if (path === '/allocations') return { title: 'Room & Bed Allocations', section: 'Hostel Operations' };
    if (path === '/maintenance') return { title: 'Maintenance Operations', section: 'Hostel Operations' };
    if (path === '/reports') return { title: 'Institutional Reports', section: 'Insights' };
    if (path === '/audit-history') return { title: 'Audit Trail History', section: 'Insights' };
    if (path === '/settings') return { title: 'System Settings', section: 'System' };
    return { title: 'Page', section: 'Hostel' };
  };

  const pageInfo = getPageInfo();

  // Search Results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return null;
    const q = searchQuery.toLowerCase();

    const matchedStudents = students
      .filter((s) => s.full_name.toLowerCase().includes(q) || s.student_code.toLowerCase().includes(q))
      .slice(0, 4);

    const matchedHostels = hostels
      .filter((h) => h.name.toLowerCase().includes(q) || h.hostel_code.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedRooms = rooms
      .filter((r) => r.room_number.toLowerCase().includes(q))
      .slice(0, 3);

    return {
      students: matchedStudents,
      hostels: matchedHostels,
      rooms: matchedRooms,
    };
  }, [searchQuery, students, hostels, rooms]);

  const pendingAllocations = allocations.filter((a) => a.status === 'Pending');
  const criticalMaintenance = maintenanceRecords.filter(
    (m) => (m.priority === 'Critical' || m.priority === 'High') && m.status !== 'Resolved'
  );

  const totalNotifications = pendingAllocations.length + criticalMaintenance.length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Left: Mobile Toggle & Page Title / Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-500 rounded-lg lg:hidden hover:bg-slate-100 focus:outline-hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>{pageInfo.section}</span>
            <span>/</span>
            <span className="text-slate-700">{pageInfo.title}</span>
          </nav>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none mt-0.5">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Actions: Campus Selector, Quick Search, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Campus Selector Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg px-2.5 py-1.5 transition-colors">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <select
              value={selectedCampusId}
              onChange={(e) => setSelectedCampusId(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-hidden cursor-pointer pr-1"
              title="Filter data by campus (local demo filter)"
            >
              <option value="all">All Campuses</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative hidden md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, room, hostel..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-48 lg:w-64 pl-8 pr-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Quick Search Dropdown Results */}
          {searchOpen && searchResults && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 space-y-3 max-h-96 overflow-y-auto">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Results
              </div>

              {searchResults.students.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Students</p>
                  {searchResults.students.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        navigate('/students');
                        setSearchOpen(false);
                      }}
                      className="px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs flex justify-between items-center"
                    >
                      <span className="font-medium text-slate-800">{s.full_name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{s.student_code}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.hostels.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Hostels</p>
                  {searchResults.hostels.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => {
                        navigate('/hostels');
                        setSearchOpen(false);
                      }}
                      className="px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs flex justify-between items-center"
                    >
                      <span className="font-medium text-slate-800">{h.name}</span>
                      <span className="text-indigo-600 font-mono text-[11px]">{h.hostel_code}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.rooms.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Rooms</p>
                  {searchResults.rooms.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        navigate('/rooms-beds');
                        setSearchOpen(false);
                      }}
                      className="px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs flex justify-between items-center"
                    >
                      <span className="font-medium text-slate-800">Room {r.room_number}</span>
                      <span className="text-slate-500 text-[11px]">{r.room_type} ({r.bed_capacity} beds)</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.students.length === 0 &&
                searchResults.hostels.length === 0 &&
                searchResults.rooms.length === 0 && (
                  <p className="text-xs text-slate-500 py-2 text-center">No matching records found.</p>
                )}
            </div>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Operational Alerts"
          >
            <Bell className="w-5 h-5" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-900 text-sm">System Alerts</span>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                  {totalNotifications} Open
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {pendingAllocations.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      navigate('/allocations');
                      setNotificationsOpen(false);
                    }}
                    className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 hover:bg-amber-100/60 cursor-pointer transition-colors text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-amber-900">Allocation Awaiting Approval</div>
                      <div className="text-amber-700 text-[11px] mt-0.5">
                        New request submitted on {new Date(a.allocation_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}

                {criticalMaintenance.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      navigate('/maintenance');
                      setNotificationsOpen(false);
                    }}
                    className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/60 hover:bg-rose-100/60 cursor-pointer transition-colors text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-rose-900">{m.issue_title}</div>
                      <div className="text-rose-700 text-[11px] mt-0.5">
                        {m.priority} priority reported by {m.reported_by}
                      </div>
                    </div>
                  </div>
                ))}

                {totalNotifications === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    All hostel operations healthy. No pending alerts.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 pl-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              AP
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">Dr. Arthur Pendelton</div>
              <div className="text-[11px] text-slate-500 leading-tight">Chief Warden & Dean</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 text-xs space-y-2">
              <div className="pb-2 border-b border-slate-100">
                <div className="font-bold text-slate-900">Dr. Arthur Pendelton</div>
                <div className="text-slate-500 text-[11px]">dean.affairs@university.edu</div>
                <div className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full mt-1.5 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  Administrator Role
                </div>
              </div>
              <div className="text-[11px] text-slate-500 italic">
                Demonstration prototype session. User authentication is simulated in local state.
              </div>
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/settings');
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-50 font-medium text-slate-700 flex items-center justify-between"
                >
                  System & Preferences
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
