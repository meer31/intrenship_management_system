import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, LogOut, CheckCircle2, ChevronDown, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notification.service';
import { Notification, Role } from '../../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar }) => {
  const { user, role, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      notificationService.getForUser(user.id).then(setNotifications);
    }
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notif: Notification) => {
    await notificationService.markAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleRoleSwitch = async (targetRole: Role, deptCode?: string) => {
    try {
      setShowRoleSwitcher(false);
      const switchedUser = await switchRole(targetRole, deptCode);
      toast.success(`Switched active view to ${switchedUser.name} (${switchedUser.role})`);

      if (switchedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (switchedUser.role === 'FOCAL_PERSON') {
        navigate('/focal-person/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch {
      toast.error('Failed to switch role');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out of institutional portal');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-border shadow-xs flex items-center justify-between px-4 sm:px-6">
      {/* Left: Hamburger & Institution Tag */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-navy hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-navy-900">
          <span className="h-2 w-2 rounded-full bg-teal" />
          <span>Directorate of Industrial Liaison & Internships</span>
        </div>
      </div>

      {/* Right: Controls & User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Demo Role Switcher Dropdown */}
        <div className="relative" ref={roleMenuRef}>
          <button
            type="button"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-teal" />
            <span className="hidden md:inline">Demo Switch:</span>
            <span className="font-bold">{role}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-border py-2 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-1.5 border-b border-border mb-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test Portal Roles
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRoleSwitch('ADMIN')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-navy">Prof. Dr. Arshad Munir</p>
                  <p className="text-[10px] text-text-secondary">Director / Admin</p>
                </div>
                {role === 'ADMIN' && <CheckCircle2 className="h-4 w-4 text-teal" />}
              </button>

              <button
                type="button"
                onClick={() => handleRoleSwitch('FOCAL_PERSON', 'CS')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-navy">Dr. Tariq Mahmood</p>
                  <p className="text-[10px] text-text-secondary">Focal Person (Computer Science)</p>
                </div>
                {role === 'FOCAL_PERSON' && user?.departmentName?.includes('Computer') && (
                  <CheckCircle2 className="h-4 w-4 text-teal" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRoleSwitch('FOCAL_PERSON', 'SE')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-navy">Engr. Aisha Siddiqui</p>
                  <p className="text-[10px] text-text-secondary">Focal Person (Software Eng.)</p>
                </div>
                {role === 'FOCAL_PERSON' && user?.departmentName?.includes('Software') && (
                  <CheckCircle2 className="h-4 w-4 text-teal" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRoleSwitch('STUDENT')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-navy">Hamza Farooq</p>
                  <p className="text-[10px] text-text-secondary">Student (2021-CS-104)</p>
                </div>
                {role === 'STUDENT' && <CheckCircle2 className="h-4 w-4 text-teal" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-navy hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-border py-2 z-50">
              <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-navy uppercase tracking-wider">
                  Notifications
                </span>
                <span className="text-[11px] text-teal font-medium">
                  {unreadCount} unread
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-text-secondary">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.isRead ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900">{notif.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">{notif.createdAt}</span>
                      </div>
                      <p className="mt-1 text-slate-600 leading-snug">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-navy text-white flex items-center justify-center font-bold text-xs ring-1 ring-border">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || 'US'
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-navy leading-none truncate max-w-[120px]">
                {user?.name}
              </p>
              <p className="text-[10px] text-text-secondary mt-0.5 capitalize leading-none">
                {user?.role?.toLowerCase().replace('_', ' ')}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-border py-1.5 z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  if (role === 'STUDENT') navigate('/student/profile');
                  else if (role === 'FOCAL_PERSON') navigate('/focal-person/profile');
                  else navigate('/admin/settings');
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="h-4 w-4 text-slate-400" />
                <span>My Profile & Settings</span>
              </button>

              <div className="border-t border-border my-1" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs text-danger hover:bg-red-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="h-4 w-4 text-danger" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
