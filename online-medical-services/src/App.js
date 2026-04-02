import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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

import DoctorDashboard from "./components/DoctorDashboard";
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

/* ✅ ADMIN IMPORTS */
import UsersList from "./components/UsersList";
import AdminAppointments from "./components/AdminAppointments";

/* ✅ VIDEO CALL (FROM COMPONENTS) */
import VideoCall from "./components/VideoCall";

function App() {
  const [role, setRole] = useState("guest");
  const [authReady, setAuthReady] = useState(false);

  /* ================= RESTORE SESSION ================= */
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const storedRole = sessionStorage.getItem("role");

    if (isLoggedIn === "true" && storedRole) {
      setRole(storedRole);
    } else {
      setRole("guest");
    }

    setAuthReady(true);
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    sessionStorage.clear();
    setRole("guest");
    window.location.href = "/login";
  };

  /* ================= NAVBAR ================= */
  const renderNavbar = () => {
    if (!authReady) return null;

    if (role === "doctor") return <DoctorNavbar onLogout={handleLogout} />;
    if (role === "patient") return <PatientNavbar onLogout={handleLogout} />;
    if (role === "admin") return <AdminNavbar onLogout={handleLogout} />;

    return <GuestNavbar />;
  };

  /* ================= PROTECTED ROUTE ================= */
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const storedRole = sessionStorage.getItem("role");

    return isLoggedIn === "true" && allowedRoles.includes(storedRole)
      ? children
      : <Navigate to="/login" replace />;
  };

  if (!authReady) return null;

  return (
    <Router>
      {renderNavbar()}

      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <Routes>

          {/* ===== HOME ===== */}
          <Route
            path="/"
            element={
              role === "doctor" ? <Navigate to="/doctor-dashboard" /> :
              role === "patient" ? <Navigate to="/patient-dashboard" /> :
              role === "admin" ? <Navigate to="/admin-dashboard" /> :
              <Home />
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/doctors" element={<Doctors />} />

          <Route path="/login" element={<Login setRole={setRole} />} />
          <Route path="/register" element={<Register />} />

          {/* ===== PATIENT ===== */}
          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <Appointments patientId={sessionStorage.getItem("patientId")} />
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
            path="/patient/available-slots/:doctorId"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientAvailableSlots />
              </ProtectedRoute>
            }
          />

          {/* ===== DOCTOR ===== */}
          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorDashboard />
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

          {/* ===== VIDEO CALL (DOCTOR + PATIENT) ===== */}
          <Route
            path="/video-call/:roomId"
            element={
              <ProtectedRoute allowedRoles={["doctor", "patient"]}>
                <VideoCall />
              </ProtectedRoute>
            }
          />

          {/* ===== ADMIN ===== */}
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
      </div>
    </Router>
  );
}

export default App;
