import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleRoute } from '@/routes/RoleRoute';
import { Navbar } from '@/components/layout/Navbar';

// ==================== PUBLIC ====================

import LandingPage from '@/features/public/LandingPage';

// ==================== AUTH ====================

import AuthPage from '@/features/auth/AuthPage';

// ==================== PATIENT ====================

import PatientDashboard from '@/features/patient/PatientDashboard';
import PatientAppointmentsPage from '@/features/patient/PatientAppointmentsPage';
import FindDoctorsPage from '@/features/patient/FindDoctorsPage';
import DoctorProfileBookingPage from '@/features/patient/DoctorProfileBookingPage';
import AppointmentDetailPage from '@/features/patient/AppointmentDetailPage';
import ConsultationRecordPage from '@/features/patient/ConsultationRecordPage';
import MedicalHistoryPage from '@/features/patient/MedicalHistoryPage';
import PrescriptionsPage from '@/features/patient/PrescriptionsPage';

// ==================== DOCTOR ====================

import DoctorDashboard from '@/features/doctor/DoctorDashboard';
import DoctorAppointmentsPage from '@/features/doctor/DoctorAppointmentsPage';
import DoctorAppointmentDetailPage from '@/features/doctor/DoctorAppointmentDetailPage';
import DoctorConsultationViewPage from '@/features/doctor/DoctorConsultationViewPage';
import PatientHistoryPage from '@/features/doctor/PatientHistoryPage';
import PatientListPage from '@/features/doctor/PatientListPage';
import ActiveConsultationPage from '@/features/doctor/ActiveConsultationPage';
import ScheduleManagementPage from '@/features/doctor/ScheduleManagementPage';
import DoctorProfileSettingsPage from '@/features/doctor/DoctorProfileSettingsPage';

// ==================== ADMIN ====================

import AdminDashboard from '@/features/admin/AdminDashboard';
import DoctorVerificationPage from '@/features/admin/DoctorVerificationPage';
import PatientManagementPage from '@/features/admin/PatientManagementPage';
import AppointmentManagementPage from '@/features/admin/AppointmentManagementPage';
import HospitalManagementPage from '@/features/admin/HospitalManagementPage';
import AuditLogsPage from '@/features/admin/AuditLogsPage';

// ==================== SHARED ====================

import NotificationsPage from '@/features/shared/NotificationsPage';

// ==================== HOME REDIRECT ====================

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'PATIENT':
      return <Navigate to="/patient/dashboard" replace />;

    case 'DOCTOR':
      return <Navigate to="/doctor/dashboard" replace />;

    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
}

// ==================== ROOT ROUTE ====================

/*
 * The "/" route is accessible to both logged-out and logged-in users.
 *
 * Logged-out visitors see the public landing page.
 * Logged-in users are redirected to their role-specific dashboard.
 *
 * This route must remain outside ProtectedRoute because ProtectedRoute
 * would otherwise redirect logged-out visitors to /login before the
 * landing page could be rendered.
 */
function RootRoute() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <HomeRedirect /> : <LandingPage />;
}

// ==================== APP LAYOUT ====================

/*
 * Wraps every authenticated page with the persistent Navbar.
 *
 * Login, registration, and the public landing page are outside this
 * layout, so they do not display the authenticated Navbar.
 */
function AppLayout() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <Outlet />
    </div>
  );
}

// ==================== APP ROUTER ====================

export default function App() {
  return (
    <Routes>

      {/* =========================================================
          PUBLIC / ROOT
      ========================================================= */}

      <Route
        path="/"
        element={<RootRoute />}
      />

      {/* =========================================================
          AUTHENTICATION
      ========================================================= */}

      <Route
        path="/login"
        element={<AuthPage />}
      />

      <Route
        path="/register/patient"
        element={<AuthPage />}
      />

      <Route
        path="/register/doctor"
        element={<AuthPage />}
      />

      {/* =========================================================
          PROTECTED ROUTES
      ========================================================= */}

      <Route element={<ProtectedRoute />}>

        {/* =====================================================
            AUTHENTICATED APP LAYOUT
        ===================================================== */}

        <Route element={<AppLayout />}>

          {/* =====================================================
              SHARED ROUTES
          ===================================================== */}

          <Route
            path="/notifications"
            element={<NotificationsPage />}
          />

          {/* =====================================================
              PATIENT ROUTES
          ===================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={['PATIENT']} />
            }
          >

            <Route
              path="/patient/dashboard"
              element={<PatientDashboard />}
            />

            <Route
              path="/patient/find-doctors"
              element={<FindDoctorsPage />}
            />

            <Route
              path="/patient/doctors/:id"
              element={<DoctorProfileBookingPage />}
            />

            <Route
              path="/patient/appointments"
              element={<PatientAppointmentsPage />}
            />

            <Route
              path="/patient/appointments/:id"
              element={<AppointmentDetailPage />}
            />

            <Route
              path="/patient/appointments/:id/consultation"
              element={<ConsultationRecordPage />}
            />

            <Route
              path="/patient/medical-history"
              element={<MedicalHistoryPage />}
            />

            <Route
              path="/patient/prescriptions"
              element={<PrescriptionsPage />}
            />

          </Route>

          {/* =====================================================
              DOCTOR ROUTES
          ===================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={['DOCTOR']} />
            }
          >

            <Route
              path="/doctor/dashboard"
              element={<DoctorDashboard />}
            />

            <Route
              path="/doctor/appointments"
              element={<DoctorAppointmentsPage />}
            />

            <Route
              path="/doctor/appointments/:id"
              element={<DoctorAppointmentDetailPage />}
            />

            <Route
              path="/doctor/appointments/:id/consultation"
              element={<ActiveConsultationPage />}
            />

            <Route
              path="/doctor/appointments/:id/consultation-view"
              element={<DoctorConsultationViewPage />}
            />

            <Route
              path="/doctor/patients"
              element={<PatientListPage />}
            />

            <Route
              path="/doctor/patients/:patientProfileId/history"
              element={<PatientHistoryPage />}
            />

            <Route
              path="/doctor/schedule"
              element={<ScheduleManagementPage />}
            />

            <Route
              path="/doctor/profile"
              element={<DoctorProfileSettingsPage />}
            />

          </Route>

          {/* =====================================================
              ADMIN ROUTES
          ===================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={['ADMIN']} />
            }
          >

            {/* Admin Dashboard */}

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            {/* Admin Appointments */}

            <Route
              path="/admin/appointments"
              element={<AppointmentManagementPage />}
            />

            {/* Patient Management */}

            <Route
              path="/admin/patients"
              element={<PatientManagementPage />}
            />

            {/* Doctor Verification */}

            <Route
              path="/admin/doctors"
              element={<DoctorVerificationPage />}
            />

            {/* Hospital Management */}

            <Route
              path="/admin/hospitals"
              element={<HospitalManagementPage />}
            />

            {/* Audit Logs */}

            <Route
              path="/admin/audit-logs"
              element={<AuditLogsPage />}
            />

          </Route>

        </Route>

      </Route>

      {/* =========================================================
          FALLBACK
      ========================================================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}