import React from "react";

function DoctorDashboard() {
  return (
    <div style={page}>
      <h2 style={title}>Doctor Dashboard</h2>

      <div style={grid}>
        {/* Overview Card */}
        <div style={card}>
          <h3 style={cardTitle}>Today's Overview</h3>
          <p style={cardText}>
            Check today’s schedule, patient visits, and tasks at a glance.
          </p>
        </div>

        {/* Patients Card */}
        <div style={card}>
          <h3 style={cardTitle}>Patients</h3>
          <p style={cardText}>
            Access patient records, medical history, and recent updates.
          </p>
        </div>

        {/* Notifications Card */}
        <div style={card}>
          <h3 style={cardTitle}>Notifications</h3>
          <p style={cardText}>
            Stay updated with important alerts and reminders.
          </p>
        </div>

        {/* Settings Card */}
        <div style={card}>
          <h3 style={cardTitle}>Settings</h3>
          <p style={cardText}>
            Manage your profile, preferences, and security settings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;

/* ================== PROFESSIONAL STYLES ================== */

const page = {
  minHeight: "100vh",
  padding: "40px",
  background: "linear-gradient(135deg, #f8fafc, #eef2ff)",
  fontFamily: "Inter, system-ui, sans-serif"
};

const title = {
  textAlign: "center",
  marginBottom: "40px",
  fontSize: "32px",
  fontWeight: "800",
  color: "#0f172a"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "24px",
  maxWidth: "1200px",
  margin: "0 auto"
};

const card = {
  background: "#ffffff",
  padding: "26px",
  borderRadius: "18px",
  boxShadow: "0 15px 30px rgba(0,0,0,0.08)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  cursor: "pointer"
};

const cardTitle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1e293b",
  marginBottom: "12px"
};

const cardText = {
  fontSize: "15px",
  color: "#475569",
  lineHeight: "1.6"
};
