import React from "react";
import { Link, useNavigate } from "react-router-dom";

function PatientNavbar({ onLogout }) {
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
      <div style={logoStyle}>
        🧑‍⚕️ Welcome, {name || "Patient"}
      </div>

      <ul style={menuStyle}>
        <li>
          <Link to="/patient-dashboard" style={linkStyle}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/patient/appointments" style={linkStyle}>
            Appointments
          </Link>
        </li>
        <li>
          <Link to="/patient/medical-history" style={linkStyle}>
            History
          </Link>
        </li>
        <li>
          <Link to="/patient/prescriptions" style={linkStyle}>
            Prescriptions
          </Link>
        </li>
        <li>
          <Link to="/patient/reports" style={linkStyle}>
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
  background: "linear-gradient(90deg, #2e7d32, #66bb6a)",
  padding: "14px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 4px 14px rgba(0,0,0,0.18)"
};

const logoStyle = {
  color: "#fff",
  fontSize: "20px",
  fontWeight: "700"
};

const menuStyle = {
  listStyle: "none",
  display: "flex",
  gap: "22px",
  margin: 0,
  padding: 0,
  alignItems: "center"
};

const linkStyle = {
  color: "#f1f8e9",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: "500"
};

const logoutBtn = {
  backgroundColor: "#ffffff",
  color: "#2e7d32",
  border: "none",
  padding: "8px 18px",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "600"
};

export default PatientNavbar;