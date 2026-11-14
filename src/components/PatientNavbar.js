
import React from "react";
import { useNavigate } from "react-router-dom";

function PatientNavbar({ onLogout }) {
  const name = sessionStorage.getItem("userName") || "Patient";
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
  };

  const handleProfileClick = () => {
    navigate("/patient/profile");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.left}>
        <span style={styles.brandIcon}>✚</span>

        <span style={styles.brand}>
          health<span style={styles.brandAccent}>wave</span>
        </span>

        <span style={styles.portalLabel}>PATIENT PORTAL</span>
      </div>

      <div style={styles.right}>
        <button
          type="button"
          onClick={handleProfileClick}
          style={styles.profile}
          title="View Profile"
          aria-label="Open patient profile"
        >
          <div style={styles.avatar}>
            {name.charAt(0).toUpperCase()}
          </div>

          <div style={styles.profileDetails}>
            <div style={styles.name}>{name}</div>
            <div style={styles.role}>PATIENT</div>
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
    padding: "0 28px",
    boxSizing: "border-box",
    background: "#0D1011",
    borderBottom: "1px solid #24292B",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    zIndex: 1000,
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  brandIcon: {
    width: "35px",
    height: "35px",
    borderRadius: "9px",
    background: "#20DCC0",
    color: "#07110F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "bold",
  },

  brand: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: "-0.5px",
  },

  brandAccent: {
    color: "#20DCC0",
  },

  portalLabel: {
    marginLeft: "12px",
    paddingLeft: "18px",
    borderLeft: "1px solid #303638",
    color: "#899497",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1.5px",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#FFFFFF",
    textAlign: "left",
  },

  avatar: {
    width: "39px",
    height: "39px",
    borderRadius: "10px",
    background: "#1D3934",
    color: "#20DCC0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
  },

  profileDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  name: {
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "600",
  },

  role: {
    color: "#899497",
    fontSize: "9px",
    letterSpacing: "1.2px",
  },

  logoutButton: {
    padding: "11px 17px",
    borderRadius: "8px",
    border: "1px solid #303638",
    background: "#1B2021",
    color: "#C3CDCF",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default PatientNavbar;
