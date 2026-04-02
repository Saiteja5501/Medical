import React from "react";
import { Link, useNavigate } from "react-router-dom";

function DoctorNavbar({ onLogout }) {
  const navigate = useNavigate();

  // ✅ Universal storage
  const name = sessionStorage.getItem("userName");

  const handleLogout = () => {
    onLogout();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={navStyle}>
      {/* Welcome Message */}
      <div style={logoStyle}>
        <span style={logoIcon}>👨‍⚕️</span>
        Welcome, {name ? `Dr. ${name}` : "Doctor"}
      </div>

      <ul style={menuStyle}>
        <li>
          <Link to="/doctor-dashboard" style={linkStyle}>
            Dashboard
          </Link>
        </li>

        <li>
          <Link to="/doctor/appointments" style={linkStyle}>
            Appointments
          </Link>
        </li>

        <li>
          <Link to="/doctor/availability" style={linkStyle}>
            Availability
          </Link>
        </li>

        <li>
          <Link to="/doctor/prescriptions" style={linkStyle}>
            Prescriptions
          </Link>
        </li>

        <li>
          <Link to="/doctor/reports" style={linkStyle}>
            Reports
          </Link>
        </li>

        <li>
          <button onClick={handleLogout} style={logoutBtn}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

/* ================= STYLES (UNCHANGED) ================= */

const navStyle = {
  background: "linear-gradient(90deg, #0f4c81, #1976d2)",
  padding: "14px 42px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  position: "sticky",
  top: 0,
  zIndex: 1000
};

const logoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  letterSpacing: "0.4px"
};

const logoIcon = {
  fontSize: "22px"
};

const menuStyle = {
  listStyle: "none",
  display: "flex",
  gap: "26px",
  margin: 0,
  padding: 0,
  alignItems: "center"
};

const linkStyle = {
  color: "#e3f2fd",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: "500",
  padding: "6px 2px",
  borderBottom: "2px solid transparent",
  transition: "border-color 0.2s ease"
};

const logoutBtn = {
  backgroundColor: "#ffffff",
  color: "#0f4c81",
  border: "none",
  padding: "8px 20px",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
};

export default DoctorNavbar;