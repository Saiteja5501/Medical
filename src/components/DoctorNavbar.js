
import React from "react";
import { useNavigate } from "react-router-dom";

function DoctorNavbar({ onLogout }) {
  const name = sessionStorage.getItem("userName") || "Doctor";
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>
      {/* BRAND */}
      <div style={styles.left}>
        <span style={styles.brandIcon}>✚</span>

        <span style={styles.brand}>
          health<span style={styles.brandAccent}>wave</span>
        </span>

        <span style={styles.portalLabel}>DOCTOR PORTAL</span>
      </div>

      {/* PROFILE AND LOGOUT */}
      <div style={styles.right}>
        <button
          type="button"
          onClick={() => navigate("/doctor/profile")}
          style={styles.profile}
          title="View Doctor Profile"
          aria-label="Open doctor profile"
        >
          <div style={styles.avatar}>
            {name.charAt(0).toUpperCase()}
          </div>

          <div style={styles.profileDetails}>
            <div style={styles.name}>{name}</div>
            <div style={styles.role}>DOCTOR</div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          ↪ Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    width: "100%",
    minHeight: "68px",
    padding: "10px 28px",
    boxSizing: "border-box",
    background: "#0D1011",
    borderBottom: "1px solid #24292B",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    position: "relative",
    zIndex: 1000
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0
  },

  brandIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    background: "#20DCC0",
    color: "#071411",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800"
  },

  brand: {
    color: "#F3F4F6",
    fontSize: "20px",
    fontWeight: "800"
  },

  brandAccent: {
    color: "#20DCC0"
  },

  portalLabel: {
    marginLeft: "12px",
    paddingLeft: "16px",
    borderLeft: "1px solid #343D3E",
    color: "#899497",
    fontSize: "10px",
    letterSpacing: "1.4px",
    fontWeight: "700"
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexShrink: 0
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "transparent",
    border: "none",
    padding: "5px",
    borderRadius: "9px",
    cursor: "pointer",
    textAlign: "left"
  },

  profileDetails: {
    display: "flex",
    flexDirection: "column"
  },

  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    background: "#203A34",
    color: "#20DCC0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "15px"
  },

  name: {
    color: "#F3F4F6",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "4px"
  },

  role: {
    color: "#899497",
    fontSize: "9px",
    letterSpacing: "1px"
  },

  logoutButton: {
    background: "#202626",
    color: "#B9C2C2",
    border: "1px solid #343D3E",
    borderRadius: "7px",
    padding: "9px 15px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer"
  }
};

export default DoctorNavbar;
