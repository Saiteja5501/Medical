import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);
  const navigate = useNavigate();

  /* ================= PASSWORD RULE CHECKS ================= */

  const hasMinLength = formData.password.length > 8;
  const startsWithCapital = /^[A-Z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*]/.test(formData.password);

  const isPasswordValid =
    hasMinLength && startsWithCapital && hasNumber && hasSpecialChar;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError(
        "Password must be more than 8 characters, start with a capital letter, and include at least one number and one special character"
      );
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Server unreachable. Try again later.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>

        {/* ===== Header ===== */}
        <div style={headerStyle}>
          <div style={iconStyle}>🩺</div>
          <h2 style={titleStyle}>Patient Registration</h2>
          <p style={subtitleStyle}>
            Create your secure medical account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Full Name</label>
          <input
            style={inputStyle}
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label style={labelStyle}>Email Address</label>
          <input
            style={inputStyle}
            type="email"
            name="email"
            placeholder="patient@hospital.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label style={labelStyle}>Password</label>
          <input
            style={inputStyle}
            type="password"
            name="password"
            placeholder="Create strong password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setShowRules(true)}
            required
          />

          {/* ===== Password Rules ===== */}
          {showRules && formData.password.length > 0 && (
            <div style={rulesBox}>
              <Rule text="More than 8 characters" valid={hasMinLength} />
              <Rule text="Starts with a capital letter" valid={startsWithCapital} />
              <Rule text="Contains at least one number" valid={hasNumber} />
              <Rule text="Contains at least one special character" valid={hasSpecialChar} />
            </div>
          )}

          <button style={buttonStyle} type="submit">
            Create Account
          </button>
        </form>

        {error && <p style={errorStyle}>{error}</p>}

        <p style={footerText}>
          Already registered?{" "}
          <a href="/login" style={linkStyle}>Login here</a>
        </p>
      </div>
    </div>
  );
}

/* ================= RULE COMPONENT ================= */

function Rule({ text, valid }) {
  return (
    <div style={{ color: valid ? "#2e7d32" : "#c62828", fontSize: "13px" }}>
      {valid ? "✔" : "✖"} {text}
    </div>
  );
}

/* ================= MEDICAL STYLES ================= */

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #e8f5e9, #e0f2f1)"
};

const cardStyle = {
  width: "400px",
  padding: "35px",
  borderRadius: "18px",
  backgroundColor: "#ffffff",
  boxShadow: "0 15px 45px rgba(0,0,0,0.12)"
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "25px"
};

const iconStyle = {
  fontSize: "36px",
  marginBottom: "10px"
};

const titleStyle = {
  margin: "0",
  color: "#1b5e20",
  fontWeight: "700"
};

const subtitleStyle = {
  fontSize: "14px",
  color: "#546e7a"
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#455a64",
  marginBottom: "6px",
  display: "block"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "8px",
  border: "1px solid #cfd8dc",
  fontSize: "14px",
  outline: "none"
};

const rulesBox = {
  marginBottom: "15px",
  paddingLeft: "5px"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg, #2e7d32, #66bb6a)",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "10px"
};

const errorStyle = {
  marginTop: "12px",
  color: "#c62828",
  textAlign: "center",
  fontSize: "14px"
};

const footerText = {
  marginTop: "22px",
  textAlign: "center",
  fontSize: "14px",
  color: "#546e7a"
};

const linkStyle = {
  color: "#2e7d32",
  textDecoration: "none",
  fontWeight: "600"
};

export default Register;
