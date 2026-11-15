
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function AdminAddDoctor() {
  const [doctorName, setDoctorName] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [status, setStatus] = useState({
    message: "",
    type: ""
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAddDoctor = async (e) => {
    e.preventDefault();

    setStatus({ message: "", type: "" });

    if (
      !doctorName.trim() ||
      !doctorEmail.trim() ||
      !doctorPassword ||
      !specialization.trim()
    ) {
      setStatus({
        message: "Please fill in all fields",
        type: "error"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/add-doctor", {
        doctorName: doctorName.trim(),
        doctorEmail: doctorEmail.trim().toLowerCase(),
        doctorPassword,
        specialization: specialization.trim()
      });

      const data = response.data;

      if (data.success) {
        setStatus({
          message: "Doctor added successfully!",
          type: "success"
        });

        setDoctorName("");
        setDoctorEmail("");
        setDoctorPassword("");
        setSpecialization("");

        setTimeout(() => {
          navigate("/manage-doctors");
        }, 1000);
      } else {
        setStatus({
          message: data.message || "Failed to add doctor",
          type: "error"
        });
      }
    } catch (error) {
      console.error(
        "Add doctor error:",
        error.response?.data || error.message
      );

      setStatus({
        message:
          error.response?.data?.message ||
          "Unable to add doctor. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* HEADER */}
        <div style={headerStyle}>
          <div style={iconContainerStyle}>
            <span style={{ fontSize: "27px" }}>👨‍⚕️</span>
          </div>

          <h2 style={titleStyle}>Add New Doctor</h2>

          <p style={subtitleStyle}>
            Register a new doctor to the HealthWave platform.
          </p>
        </div>

        {/* STATUS MESSAGE */}
        {status.message && (
          <div
            style={{
              ...statusStyle,
              color:
                status.type === "success" ? "#64DDA6" : "#FF8585",
              background:
                status.type === "success" ? "#142B23" : "#301C1C",
              borderColor:
                status.type === "success" ? "#245C45" : "#653333"
            }}
          >
            <span>
              {status.type === "success" ? "✓" : "⚠"}
            </span>
            {status.message}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleAddDoctor} style={formStyle}>

          <div style={fieldGroup}>
            <label htmlFor="doctorName" style={labelStyle}>
              Doctor Name
            </label>

            <input
              id="doctorName"
              type="text"
              placeholder="Enter doctor's full name"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={fieldGroup}>
            <label htmlFor="doctorEmail" style={labelStyle}>
              Email Address
            </label>

            <input
              id="doctorEmail"
              type="email"
              placeholder="doctor@example.com"
              value={doctorEmail}
              onChange={(e) => setDoctorEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={fieldGroup}>
            <label htmlFor="doctorPassword" style={labelStyle}>
              Password
            </label>

            <input
              id="doctorPassword"
              type="password"
              placeholder="Create a password"
              value={doctorPassword}
              onChange={(e) => setDoctorPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={fieldGroup}>
            <label htmlFor="specialization" style={labelStyle}>
              Specialization
            </label>

            <input
              id="specialization"
              type="text"
              placeholder="e.g. Cardiologist, Dentist"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={{
              ...buttonStyle,
              opacity: loading ? 0.65 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            disabled={loading}
          >
            {loading ? "Adding Doctor..." : "＋ Add Doctor"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/manage-doctors")}
            style={cancelButtonStyle}
          >
            Cancel
          </button>

        </form>

        <p style={footerStyle}>
          <span style={{ color: "#20DCC0" }}>●</span>{" "}
          Doctor information will be added to the HealthWave system.
        </p>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const pageStyle = {
  width: "100%",
  minWidth: 0,
  minHeight: "100vh",
  margin: 0,
  padding: "40px 20px",
  backgroundColor: "#0B0D0E",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  fontFamily: "Segoe UI, sans-serif",
  boxSizing: "border-box"
};

const containerStyle = {
  width: "100%",
  maxWidth: "520px",
  padding: "35px",
  backgroundColor: "#181C1D",
  border: "1px solid #293333",
  borderRadius: "16px",
  boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
  boxSizing: "border-box"
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "30px"
};

const iconContainerStyle = {
  width: "65px",
  height: "65px",
  margin: "0 auto 16px",
  borderRadius: "16px",
  backgroundColor: "#153B36",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #245B52"
};

const titleStyle = {
  color: "#E8EEEE",
  fontSize: "25px",
  fontWeight: "700",
  margin: "0 0 8px"
};

const subtitleStyle = {
  color: "#899497",
  fontSize: "14px",
  margin: 0,
  lineHeight: "1.5"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const fieldGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "9px",
  textAlign: "left"
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#C9D3D3"
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "8px",
  border: "1px solid #303B3B",
  backgroundColor: "#101515",
  color: "#E8EEEE",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box"
};

const buttonStyle = {
  padding: "14px",
  marginTop: "5px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#20DCC0",
  color: "#071412",
  fontSize: "15px",
  fontWeight: "700",
  transition: "0.2s"
};

const cancelButtonStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #303B3B",
  backgroundColor: "transparent",
  color: "#AAB5B5",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer"
};

const statusStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "9px",
  marginBottom: "22px",
  padding: "13px",
  borderRadius: "8px",
  border: "1px solid",
  fontSize: "14px",
  fontWeight: "600",
  textAlign: "center"
};

const footerStyle = {
  marginTop: "25px",
  paddingTop: "18px",
  borderTop: "1px solid #293333",
  color: "#899497",
  fontSize: "12px",
  textAlign: "center",
  lineHeight: "1.5"
};

export default AdminAddDoctor;
