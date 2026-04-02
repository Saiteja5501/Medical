import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setRole }) {
  const [isRegister, setIsRegister] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient"
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /* ================= PASSWORD VALIDATION ================= */
  const password = formData.password;

  const validations = {
    startsWithCapital: /^[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password),
    isEightChars: password.length >= 8
  };

  const isPasswordValid =
    validations.startsWithCapital &&
    validations.hasNumber &&
    validations.hasSpecial &&
    validations.isEightChars;

  /* ================= LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password.trim(),
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      sessionStorage.clear();
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("role", data.user.role);
      sessionStorage.setItem("userId", data.user.id);
      sessionStorage.setItem("userName", data.user.name);
      sessionStorage.setItem("email", data.user.email);

      setRole(data.user.role);

      if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/patient-dashboard");
      }

    } catch (err) {
      setError("Server unreachable. Please try again.");
    }
  };

  /* ================= REGISTER ================= */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("All fields are required");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Phone must be 10 digits");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet required conditions");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
          phone: formData.phone.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      alert("Registration successful! Please login.");

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "patient"
      });

      setIsRegister(false);

    } catch (err) {
      setError("Server unreachable.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>
          {isRegister ? "Patient Registration" : "Online Medical Login"}
        </h2>

        <form onSubmit={isRegister ? handleRegister : handleLogin}>

          {/* REGISTER ONLY NAME */}
          {isRegister && (
            <>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </>
          )}

          <label style={labelStyle}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          {/* LIVE PASSWORD CHECKLIST */}
          {isRegister && (
            <div style={{ fontSize: "13px", marginBottom: "10px" }}>
              <p style={{ color: validations.startsWithCapital ? "green" : "red" }}>
                {validations.startsWithCapital ? "✔" : "✖"} Starts with Capital Letter
              </p>
              <p style={{ color: validations.isEightChars ? "green" : "red" }}>
                {validations.isEightChars ? "✔" : "✖"} Must be 8 characters
              </p>
              <p style={{ color: validations.hasNumber ? "green" : "red" }}>
                {validations.hasNumber ? "✔" : "✖"} Must contain a number
              </p>
              <p style={{ color: validations.hasSpecial ? "green" : "red" }}>
                {validations.hasSpecial ? "✔" : "✖"} Must contain special character (@$!%*?&)
              </p>
            </div>
          )}

          {/* REGISTER ONLY PHONE */}
          {isRegister && (
            <>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </>
          )}

          {/* LOGIN ONLY ROLE */}
          {!isRegister && (
            <>
              <label style={labelStyle}>Login As</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}

          <button
            type="submit"
            style={{
              ...buttonStyle,
              background: isRegister && !isPasswordValid ? "#ccc" : buttonStyle.background
            }}
            disabled={isRegister && !isPasswordValid}
          >
            {isRegister ? "Register" : "Sign In"}
          </button>
        </form>

        {error && <p style={errorStyle}>{error}</p>}

        <p style={footerText}>
          {isRegister ? "Already have an account?" : "New user?"}{" "}
          <span
            style={linkStyle}
            onClick={() => {
              setError("");
              setIsRegister(!isRegister);
            }}
          >
            {isRegister ? "Login here" : "Create Account"}
          </span>
        </p>
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #e0f7fa, #e3f2fd)"
};

const cardStyle = {
  width: "380px",
  padding: "35px",
  borderRadius: "16px",
  backgroundColor: "#ffffff",
  boxShadow: "0 15px 40px rgba(0,0,0,0.12)"
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "20px",
  color: "#01579b"
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
  marginBottom: "16px",
  borderRadius: "8px",
  border: "1px solid #cfd8dc",
  fontSize: "14px"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg, #0288d1, #26c6da)",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer"
};

const errorStyle = {
  marginTop: "12px",
  color: "#d32f2f",
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
  color: "#0288d1",
  fontWeight: "600",
  cursor: "pointer"
};

export default Login;