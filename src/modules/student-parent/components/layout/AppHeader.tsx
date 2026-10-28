import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import {
  Bell,
  LogOut,
  User as UserIcon,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Building2,
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../common/Badge';

export const AppHeader: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  const { user, logout, activeChildId, setActiveChildId, linkedChildren, triggerRefresh } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Derive notifications
  const recipientId = user?.role === 'STUDENT' ? user.studentId || '' : user?.parentId || '';
  const notifications = erpService.getNotifications(recipientId);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Derive active campus for student or active child
  const activeStudentId = user?.role === 'STUDENT' ? user.studentId : activeChildId;
  const currentStudent = activeStudentId ? erpService.getStudentProfile(activeStudentId) : undefined;
  const campus = currentStudent ? erpService.getCampus(currentStudent.campusId) : undefined;

  const handleResetData = () => {
    erpService.resetDemoDatabase();
    setShowResetConfirm(false);
    triggerRefresh();
  };

  const handleMarkAllRead = () => {
    if (recipientId) {
      erpService.markAllNotificationsRead(recipientId);
      triggerRefresh();
    }
  };

  const handleNotificationClick = (id: string, link?: string) => {
    erpService.markNotificationRead(id);
    setShowNotifications(false);
    triggerRefresh();
    if (link) {
      navigate(link);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger & campus / trust badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
          aria-label="Toggle navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Campus indicator */}
        {campus && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-800">{campus.name}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500 font-medium">{campus.code}</span>
          </div>
        )}

        {/* Demo Mode Notice */}
        <div className="flex items-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            DEMO SANDBOX
          </span>
        </div>
      </div>

      {/* Right controls: Child switcher (if Parent), Reset, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Multi-child selector for parent */}
        {user?.role === 'PARENT' && linkedChildren.length > 0 && (
          <div className="relative">
            <label className="text-[10px] font-semibold uppercase text-slate-400 block sm:hidden">Child</label>
            <div className="flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors">
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="text-left hidden md:block">
                <p className="text-[10px] font-semibold uppercase text-blue-600 leading-tight">Active Child</p>
                <select
                  value={activeChildId || ''}
                  onChange={(e) => setActiveChildId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 border-none outline-hidden cursor-pointer p-0 pr-4"
                >
                  {linkedChildren.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.firstName} {child.lastName} ({child.id})
                    </option>
                  ))}
                </select>
              </div>
              {/* Mobile selector */}
              <select
                value={activeChildId || ''}
                onChange={(e) => setActiveChildId(e.target.value)}
                className="md:hidden bg-transparent text-xs font-bold text-slate-800 border-none outline-hidden cursor-pointer"
              >
                {linkedChildren.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.firstName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Reset Database Button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          title="Reset demo data to initial baseline"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in-50 duration-100">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && <Badge variant="danger" size="sm">{unreadCount} New</Badge>}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">No notifications available</div>
                ) : (
                  notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id, notif.link)}
                      className={`p-3.5 text-left transition-colors cursor-pointer hover:bg-slate-50 ${
                        !notif.isRead ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${!notif.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1.5">{notif.createdAt}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                <Link
                  to={user?.role === 'STUDENT' ? '/student/notifications' : '/parent/notifications'}
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.avatarInitials || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">{user?.identifier}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 z-50 overflow-hidden p-1.5">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{user?.identifier}</p>
                <div className="mt-1.5">
                  <Badge variant={user?.role === 'STUDENT' ? 'brand' : 'success'} size="sm">
                    {user?.role} PORTAL
                  </Badge>
                </div>
              </div>

              <Link
                to={user?.role === 'STUDENT' ? '/student/profile' : '/parent/profile'}
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <UserIcon className="w-4 h-4 text-slate-500" />
                Profile Information
              </Link>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-1"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Resetting Demo Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900">Reset Demo Database?</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              This will restore all student records, fee assessments, attendance logs, and notifications to the original deterministic baseline.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
