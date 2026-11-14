
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import GuestNavbar from "./components/GuestNavbar";
import PatientNavbar from "./components/PatientNavbar";
import DoctorNavbar from "./components/DoctorNavbar";
import AdminNavbar from "./components/AdminNavbar";

import Home from "./components/Home";
import About from "./components/About";
import Services from "./components/Services";
import Login from "./components/Login";
import Register from "./components/Register";
import Doctors from "./components/Doctors";

import Appointments from "./components/Appointments";
import MedicalHistory from "./components/MedicalHistory";
import Prescriptions from "./components/Prescriptions";
import PatientReports from "./components/PatientReport";
import PatientDashboard from "./components/PatientDashboard";
import PatientProfile from "./components/PatientProfile";
import FindDoctors from "./components/FindDoctors";

import DoctorDashboard from "./components/DoctorDashboard";
import DoctorProfile from "./components/DoctorProfile";
import DoctorAppointments from "./components/DoctorAppointments";
import DoctorPrescriptions from "./components/DoctorPrescriptions";
import DoctorReports from "./components/DoctorReport";
import DoctorAvailability from "./components/DoctorAvailability";

import PatientAvailableSlots from "./components/PatientAvailableSlots";

import AdminDashboard from "./components/AdminDashboard";
import ManageUsers from "./components/ManageUsers";
import ManageDoctors from "./components/ManageDoctors";
import Reports from "./components/Reports";
import AdminAddDoctor from "./components/AdminAddDoctor";

import UsersList from "./components/UsersList";
import AdminAppointments from "./components/AdminAppointments";

import VideoCall from "./components/VideoCall";

const dashboardPath = {
  patient: "/patient-dashboard",
  doctor: "/doctor-dashboard",
  admin: "/admin-dashboard"
};

function ProtectedRoute({ children, allowedRoles }) {
  const isLoggedIn =
    sessionStorage.getItem("isLoggedIn") === "true";

  const storedRole = sessionStorage.getItem("role");

  if (!isLoggedIn || !allowedRoles.includes(storedRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent({ role, setRole, authReady, handleLogout }) {
  const isLoggedIn =
    sessionStorage.getItem("isLoggedIn") === "true";

  const storedRole = sessionStorage.getItem("role");

  // Use the authenticated session role as the source of truth.
  const activeRole = isLoggedIn ? storedRole : role;

  const renderNavbar = () => {
    if (!authReady) return null;

    if (activeRole === "patient") {
      return <PatientNavbar onLogout={handleLogout} />;
    }

    if (activeRole === "doctor") {
      return <DoctorNavbar onLogout={handleLogout} />;
    }

    if (activeRole === "admin") {
      return <AdminNavbar onLogout={handleLogout} />;
    }

    return <GuestNavbar />;
  };

  if (!authReady) return null;

  const isSidebarRole = activeRole === "admin";

  const getGuestPageElement = (Component) => {
    if (isLoggedIn && dashboardPath[storedRole]) {
      return (
        <Navigate
          to={dashboardPath[storedRole]}
          replace
        />
      );
    }

    return <Component />;
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          min-height: 100%;
          width: 100%;
          margin: 0;
        }

        body {
          margin: 0;
          background: #0B0D0E;
          overflow-x: hidden;
        }

        .role-sidebar-main {
          margin-left: 238px;
          width: calc(100% - 238px);
          min-height: 100vh;
          min-width: 0;
          background: #0B0D0E;
          box-sizing: border-box;
        }

        .app-main {
          width: 100%;
          min-height: 100vh;
          background: #0B0D0E;
        }

        @media (max-width: 700px) {
          .role-sidebar-main {
            margin-left: 205px;
            width: calc(100% - 205px);
          }
        }
      `}</style>

      {/* GLOBAL ROLE-BASED NAVBAR */}
      {renderNavbar()}

      {/* PAGE CONTENT */}
      <main
        className={
          isSidebarRole ? "role-sidebar-main" : "app-main"
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              activeRole === "doctor" ? (
                <Navigate to="/doctor-dashboard" replace />
              ) : activeRole === "patient" ? (
                <Navigate to="/patient-dashboard" replace />
              ) : activeRole === "admin" ? (
                <Navigate to="/admin-dashboard" replace />
              ) : (
                <Home />
              )
            }
          />

          <Route
            path="/about"
            element={getGuestPageElement(About)}
          />

          <Route
            path="/services"
            element={getGuestPageElement(Services)}
          />

          <Route
            path="/doctors"
            element={getGuestPageElement(Doctors)}
          />

          <Route
            path="/login"
            element={
              isLoggedIn && dashboardPath[storedRole] ? (
                <Navigate
                  to={dashboardPath[storedRole]}
                  replace
                />
              ) : (
                <Login setRole={setRole} />
              )
            }
          />

          <Route
            path="/register"
            element={
              isLoggedIn && dashboardPath[storedRole] ? (
                <Navigate
                  to={dashboardPath[storedRole]}
                  replace
                />
              ) : (
                <Register />
              )
            }
          />

          {/* PATIENT ROUTES */}

          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/doctors"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <FindDoctors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <Appointments
                  patientId={sessionStorage.getItem("patientId")}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/medical-history"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <MedicalHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <Prescriptions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/reports"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/available-slots/:doctorId"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientAvailableSlots />
              </ProtectedRoute>
            }
          />

          {/* DOCTOR ROUTES */}

          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/prescriptions"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorPrescriptions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/reports"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/availability"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorAvailability />
              </ProtectedRoute>
            }
          />

          {/* VIDEO CALL */}

          <Route
            path="/video-call/:roomId"
            element={
              <ProtectedRoute allowedRoles={["doctor", "patient"]}>
                <VideoCall />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-doctors"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageDoctors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/add-doctor"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAddDoctor adminEmail="admin@gmail.com" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAppointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users-list"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UsersList users={[]} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Reports />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

function App() {
  const [role, setRole] = useState("guest");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const isLoggedIn =
      sessionStorage.getItem("isLoggedIn");

    const storedRole =
      sessionStorage.getItem("role");

    if (isLoggedIn === "true" && storedRole) {
      setRole(storedRole);
    } else {
      setRole("guest");
    }

    setAuthReady(true);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setRole("guest");
    window.location.replace("/login");
  };

  return (
    <Router>
      <AppContent
        role={role}
        setRole={setRole}
        authReady={authReady}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
