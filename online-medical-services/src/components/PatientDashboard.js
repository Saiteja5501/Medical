import React from "react";
import { Link } from "react-router-dom";

function PatientDashboard() {
  return (
    <div style={page}>
      <div style={header}>
        <h1 style={title}>Patient Dashboard</h1>
        <p style={subtitle}>
          Manage your health records and appointments in one place
        </p>
      </div>

      <div style={grid}>
        <Link to="/patient/appointments" style={{ ...card, ...accentBlue }}>
          <div style={cardHeader}>
            <span style={iconCircle}>📅</span>
            <span style={cardTitle}>Appointments</span>
          </div>
          <p style={cardDesc}>Schedule and track your doctor visits</p>
        </Link>

        <Link to="/patient/medical-history" style={{ ...card, ...accentGreen }}>
          <div style={cardHeader}>
            <span style={iconCircle}>📁</span>
            <span style={cardTitle}>Medical History</span>
          </div>
          <p style={cardDesc}>View diagnoses, reports, and records</p>
        </Link>

        <Link to="/patient/prescriptions" style={{ ...card, ...accentPurple }}>
          <div style={cardHeader}>
            <span style={iconCircle}>💊</span>
            <span style={cardTitle}>Prescriptions</span>
          </div>
          <p style={cardDesc}>Access medicines and dosage details</p>
        </Link>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  padding: "56px 36px",
  background: "linear-gradient(180deg, #f8fafc, #eef2f7)",
  fontFamily: "Inter, system-ui, sans-serif"
};

const header = {
  marginBottom: "42px"
};

const title = {
  fontSize: "36px",
  fontWeight: "600",
  color: "#0f172a",
  marginBottom: "8px"
};

const subtitle = {
  fontSize: "15px",
  color: "#64748b",
  maxWidth: "520px"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "32px"
};

const card = {
  position: "relative",
  backgroundColor: "#ffffff",
  borderRadius: "22px",
  padding: "30px",
  textDecoration: "none",
  color: "#0f172a",
  border: "1px solid #e5e7eb",
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
  boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "14px"
};

const iconCircle = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px"
};

const cardTitle = {
  fontSize: "19px",
  fontWeight: "600"
};

const cardDesc = {
  fontSize: "14px",
  color: "#64748b",
  lineHeight: "1.6"
};

/* Accent variations */
const accentBlue = {
  borderLeft: "6px solid #2563eb"
};

const accentGreen = {
  borderLeft: "6px solid #16a34a"
};

const accentPurple = {
  borderLeft: "6px solid #7c3aed"
};

export default PatientDashboard;
