import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layouts/MainLayout';

// Auth
import { Login } from '../pages/auth/Login';

// Admin Pages
import { AdminDashboard } from '../pages/admin/Dashboard';
import { AdminStudents } from '../pages/admin/Students';
import { AdminDepartments } from '../pages/admin/Departments';
import { AdminBatches } from '../pages/admin/Batches';
import { AdminFocalPersons } from '../pages/admin/FocalPersons';
import { AdminInternships } from '../pages/admin/Internships';
import { AdminApplications } from '../pages/admin/Applications';
import { AdminReports } from '../pages/admin/Reports';
import { AdminReportRepository } from '../pages/admin/ReportRepository';
import { AdminSettings } from '../pages/admin/Settings';

// Focal Person Pages
import { FocalPersonDashboard } from '../pages/focal-person/Dashboard';
import { FocalPersonStudents } from '../pages/focal-person/Students';
import { FocalPersonInternships } from '../pages/focal-person/Internships';
import { FocalPersonApplications } from '../pages/focal-person/Applications';
import { FocalPersonReports } from '../pages/focal-person/Reports';
import { FocalPersonReportRepository } from '../pages/focal-person/ReportRepository';
import { FocalPersonProfile } from '../pages/focal-person/Profile';

// Student Pages
import { StudentDashboard } from '../pages/student/Dashboard';
import { StudentProfile } from '../pages/student/Profile';
import { StudentAvailableInternships } from '../pages/student/AvailableInternships';
import { StudentInternshipDetails } from '../pages/student/InternshipDetails';
import { StudentMyApplications } from '../pages/student/MyApplications';
import { StudentApprovalLetters } from '../pages/student/ApprovalLetters';
import { StudentCompletionReports } from '../pages/student/CompletionReports';
import { StudentNotifications } from '../pages/student/Notifications';
import { StudentSettings } from '../pages/student/Settings';

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'FOCAL_PERSON') {
    return <Navigate to="/focal-person/dashboard" replace />;
  } else {
    return <Navigate to="/student/dashboard" replace />;
  }
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Root Role Redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Admin / Director Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="batches" element={<AdminBatches />} />
        <Route path="focal-persons" element={<AdminFocalPersons />} />
        <Route path="internships" element={<AdminInternships />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="report-repository" element={<AdminReportRepository />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Department Focal Person Protected Routes */}
      <Route
        path="/focal-person"
        element={
          <ProtectedRoute allowedRoles={['FOCAL_PERSON']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/focal-person/dashboard" replace />} />
        <Route path="dashboard" element={<FocalPersonDashboard />} />
        <Route path="students" element={<FocalPersonStudents />} />
        <Route path="internships" element={<FocalPersonInternships />} />
        <Route path="nominations" element={<FocalPersonApplications />} />
        <Route path="reports" element={<FocalPersonReports />} />
        <Route path="report-repository" element={<FocalPersonReportRepository />} />
        <Route path="profile" element={<FocalPersonProfile />} />
      </Route>

      {/* Student Protected Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="internships" element={<StudentAvailableInternships />} />
        <Route path="internships/:id" element={<StudentInternshipDetails />} />
        <Route path="applications" element={<StudentMyApplications />} />
        <Route path="approval-letters" element={<StudentApprovalLetters />} />
        <Route path="completion-reports" element={<StudentCompletionReports />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="settings" element={<StudentSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
