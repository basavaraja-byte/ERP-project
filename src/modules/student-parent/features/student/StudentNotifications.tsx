import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import { Card, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Bell, CheckCircle2, AlertCircle, CreditCard, Building, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentNotifications: React.FC = () => {
  const { user, triggerRefresh } = useAuth();
  const navigate = useNavigate();
  const studentId = user?.studentId || 'AAR-2026-0001';

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const notifications = erpService.getNotifications(studentId);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (categoryFilter === 'ALL') return true;
    return n.category === categoryFilter;
  });

  const handleMarkRead = (id: string) => {
    erpService.markNotificationRead(id);
    triggerRefresh();
  };

  const handleMarkAllRead = () => {
    erpService.markAllNotificationsRead(studentId);
    triggerRefresh();
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'FEE':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'ATTENDANCE':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'HOSTEL':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'ACADEMIC':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Student Portal', href: '/student/dashboard' }, { label: 'Notifications & Alerts' }]} />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Notifications & Broadcasts</h2>
            {unreadCount > 0 && <Badge variant="danger" size="md">{unreadCount} Unread</Badge>}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official announcements, fee reminders, and attendance notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {['ALL', 'FEE', 'ATTENDANCE', 'HOSTEL', 'ACADEMIC'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${categoryFilter === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            {cat === 'ALL' ? 'All Alerts' : cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No notifications found in this category.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 flex items-start justify-between gap-4 transition-colors ${!item.isRead ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs ${!item.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                          {item.title}
                        </h4>
                        {!item.isRead && (
                          <Badge variant="brand" size="sm">New</Badge>
                        )}
                        <Badge variant="neutral" size="sm">{item.category}</Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-2xl">
                        {item.message}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{item.createdAt}</span>
                        {item.link && (
                          <button
                            onClick={() => {
                              handleMarkRead(item.id);
                              navigate(item.link!);
                            }}
                            className="text-blue-600 font-semibold hover:underline"
                          >
                            Open linked page →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {!item.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(item.id)}
                      className="text-slate-400 hover:text-slate-700 shrink-0"
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
