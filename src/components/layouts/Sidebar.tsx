import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  UserCheck,
  Briefcase,
  FileCheck2,
  BarChart3,
  Archive,
  Settings,
  UserSquare2,
  FileText,
  FileSignature,
  Bell,
  GraduationCap,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role } = useAuth();

  const adminNav = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Batches', path: '/admin/batches', icon: Calendar },
    { label: 'Focal Persons', path: '/admin/focal-persons', icon: UserCheck },
    { label: 'Internships', path: '/admin/internships', icon: Briefcase },
    { label: 'Applications', path: '/admin/applications', icon: FileCheck2 },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Report Repository', path: '/admin/report-repository', icon: Archive },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const focalPersonNav = [
    { label: 'Overview', path: '/focal-person/dashboard', icon: LayoutDashboard },
    { label: 'Department Students', path: '/focal-person/students', icon: Users },
    { label: 'Internships', path: '/focal-person/internships', icon: Briefcase },
    { label: 'Nomination Requests', path: '/focal-person/nominations', icon: FileCheck2 },
    { label: 'Department Reports', path: '/focal-person/reports', icon: BarChart3 },
    { label: 'Report Repository', path: '/focal-person/report-repository', icon: Archive },
    { label: 'Profile', path: '/focal-person/profile', icon: UserSquare2 },
  ];

  const studentNav = [
    { label: 'Overview', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/student/profile', icon: UserSquare2 },
    { label: 'Available Internships', path: '/student/internships', icon: Briefcase },
    { label: 'My Applications', path: '/student/applications', icon: FileCheck2 },
    { label: 'Approval Letters', path: '/student/approval-letters', icon: FileSignature },
    { label: 'Completion Reports', path: '/student/completion-reports', icon: FileText },
    { label: 'Notifications', path: '/student/notifications', icon: Bell },
    { label: 'Settings', path: '/student/settings', icon: Settings },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'FOCAL_PERSON' ? focalPersonNav : studentNav;

  const roleLabels = {
    ADMIN: 'Director / Administrator',
    FOCAL_PERSON: 'Department Focal Person',
    STUDENT: 'Student Portal',
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 border-r border-navy-800 shadow-sidebar',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand / Logo header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-navy-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal text-white shadow-md">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white uppercase">Qodex IMS</h1>
              <p className="text-[10px] text-teal-200 tracking-wider font-medium">Internship Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Tag */}
        <div className="px-5 py-3.5 bg-navy-950/50 border-b border-navy-800/80">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-teal animate-pulse" />
            <p className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider">
              {role ? roleLabels[role] : 'Institutional User'}
            </p>
          </div>
          {role === 'FOCAL_PERSON' && user?.departmentName && (
            <p className="text-[11px] text-teal-300 truncate mt-0.5">{user.departmentName}</p>
          )}
          {role === 'STUDENT' && user?.rollNumber && (
            <p className="text-[11px] text-teal-300 font-mono mt-0.5">{user.rollNumber}</p>
          )}
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-teal text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-navy-800'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={clsx(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-300'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-navy-800 shrink-0 bg-navy-950/30">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal" />
              <span>Academic Edition</span>
            </div>
            <span className="font-mono text-[10px]">v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
