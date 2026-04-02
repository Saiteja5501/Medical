import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminAddDoctor() {
  const [doctorName, setDoctorName] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [status, setStatus] = useState({ message: "", type: "" });

  const navigate = useNavigate();

  const adminEmail = sessionStorage.getItem("email");

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setStatus({ message: "", type: "" });

    try {
      const res = await fetch("http://localhost:5000/auth/add-doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adminEmail,
          doctorName,
          doctorEmail,
          doctorPassword,
          specialization
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({
          message: data.message || "Failed to add doctor",
          type: "error"
        });
        return;
      }

      setStatus({
        message: "Doctor added successfully!",
        type: "success"
      });

      // Clear form
      setDoctorName("");
      setDoctorEmail("");
      setDoctorPassword("");
      setSpecialization("");

      // ✅ Redirect after success
      setTimeout(() => {
        navigate("/manage-doctors");
      }, 1000);

    } catch (err) {
      console.error(err);
      setStatus({
        message: "Server error",
        type: "error"
      });
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Add Doctor</h2>

      {status.message && (
        <p style={{
          ...statusStyle,
          color: status.type === "success" ? "green" : "red"
        }}>
          {status.message}
        </p>
      )}

      <form onSubmit={handleAddDoctor} style={formStyle}>
        <input
          type="text"
          placeholder="Doctor Name"
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Doctor Email"
          value={doctorEmail}
          onChange={(e) => setDoctorEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Doctor Password"
          value={doctorPassword}
          onChange={(e) => setDoctorPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Specialization"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Add Doctor
        </button>
      </form>
    </div>
  );
}

/* STYLES */
const containerStyle = {
  maxWidth: "500px",
  margin: "40px auto",
  padding: "30px",
  backgroundColor: "#f8fbff",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  textAlign: "center"
};

const titleStyle = { marginBottom: "20px", color: "#0072ff" };

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px"
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#0072ff",
  color: "#fff",
  cursor: "pointer"
};

const statusStyle = {
  marginBottom: "15px",
  fontWeight: "600"
};

export default AdminAddDoctor;