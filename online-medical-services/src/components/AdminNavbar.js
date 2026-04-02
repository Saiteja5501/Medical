import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminNavbar({ onLogout }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // ✅ Get logged-in admin name (universal storage from Login.js)
  const name = sessionStorage.getItem("userName");

  const [notifications] = useState([
    { msg: "New appointment booked", time: "Just now" },
    { msg: "Doctor cancelled an appointment", time: "2 mins ago" }
  ]);

  const handleLogout = () => {
    onLogout();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={navStyle}>
      {/* LEFT SIDE - Welcome Message */}
      <div style={logoStyle}>
        🛠 Welcome, {name || "Admin"}
      </div>

      {/* CENTER MENU */}
      <ul style={menuStyle}>
        <li>
          <Link to="/admin-dashboard" style={linkStyle}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/manage-users" style={linkStyle}>
            Users
          </Link>
        </li>
        <li>
          <Link to="/manage-doctors" style={linkStyle}>
            Doctors
          </Link>
        </li>
        <li>
          <Link to="/admin/add-doctor" style={linkStyle}>
            Add Doctor
          </Link>
        </li>
        <li>
          <Link to="/admin/appointments" style={linkStyle}>
            Appointments
          </Link>
        </li>
        <li>
          <Link to="/reports" style={linkStyle}>
            Reports
          </Link>
        </li>
      </ul>

      {/* RIGHT SIDE - Notifications + Logout */}
      <div style={rightBox}>
        <div style={bellBox}>
          <span
            style={bellIcon}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔 {notifications.length > 0 && `(${notifications.length})`}
          </span>

          {showNotifications && (
            <div style={notifPanel}>
              {notifications.length === 0 ? (
                <p style={notifEmpty}>No notifications</p>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} style={notifItem}>
                    <p style={notifMsg}>{n.msg}</p>
                    <span style={notifTime}>{n.time}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button onClick={handleLogout} style={logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
}

/* ===================== STYLES ===================== */

const navStyle = {
  background: "linear-gradient(90deg, #263238, #37474f)",
  padding: "14px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
  position: "sticky",
  top: 0,
  zIndex: 1000
};

const logoStyle = {
  color: "#fff",
  fontSize: "20px",
  fontWeight: "700",
  letterSpacing: "0.5px"
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
  color: "#eceff1",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: "500"
};

const rightBox = {
  display: "flex",
  alignItems: "center",
  gap: "20px"
};

const bellBox = {
  position: "relative"
};

const bellIcon = {
  color: "#fff",
  cursor: "pointer",
  fontSize: "18px"
};

const notifPanel = {
  position: "absolute",
  top: "32px",
  right: "0",
  width: "260px",
  background: "#ffffff",
  borderRadius: "12px",
  padding: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  zIndex: 100
};

const notifItem = {
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: "8px",
  marginBottom: "8px"
};

const notifMsg = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#111827",
  margin: 0
};

const notifTime = {
  fontSize: "12px",
  color: "#6b7280"
};

const notifEmpty = {
  fontSize: "14px",
  color: "#6b7280",
  textAlign: "center"
};

const logoutBtn = {
  backgroundColor: "#ffffff",
  color: "#263238",
  border: "none",
  padding: "8px 18px",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "600"
};

export default AdminNavbar;