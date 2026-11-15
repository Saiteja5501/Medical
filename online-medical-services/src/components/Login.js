
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setRole }) {
  const [isRegister, setIsRegister] = useState(false);
  const [page, setPage] = useState("login");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient"
  });

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ================= COMMON INPUT HANDLER =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  };

  // ================= PASSWORD VALIDATION =================

  const password = formData.password;

  const validations = {
    startsWithCapital: /^[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
    isEightChars: password.length >= 8
  };

  const isPasswordValid =
    validations.startsWithCapital &&
    validations.hasNumber &&
    validations.hasSpecial &&
    validations.isEightChars;

  const validateNewPassword = (value) => {
    return (
      typeof value === "string" &&
      /^[A-Z](?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,}$/.test(value)
    );
  };

  // ================= LOGIN =================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.email.trim() || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      if (
        !data.token ||
        !data.user ||
        !data.user.id ||
        !data.user.role
      ) {
        setError("Invalid login response from server");
        return;
      }

      // Clear previous login details
      [
        "token",
        "isLoggedIn",
        "role",
        "userId",
        "userName",
        "email",
        "patientId",
        "doctorId"
      ].forEach((key) => sessionStorage.removeItem(key));

      // Store current login details
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("role", data.user.role);
      sessionStorage.setItem("userId", String(data.user.id));
      sessionStorage.setItem("userName", data.user.name || "");
      sessionStorage.setItem("email", data.user.email || "");

      if (data.user.role === "patient") {
        sessionStorage.setItem("patientId", String(data.user.id));
      }

      if (data.user.role === "doctor") {
        sessionStorage.setItem("doctorId", String(data.user.id));
      }

      if (typeof setRole === "function") {
        setRole(data.user.role);
      }

      // Replace login history with the dashboard route
      if (data.user.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (data.user.role === "doctor") {
        navigate("/doctor-dashboard", { replace: true });
      } else if (data.user.role === "patient") {
        navigate("/patient-dashboard", { replace: true });
      } else {
        setError("Invalid user role");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("Server unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= REGISTER =================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();

    if (!name || !email || !formData.password || !phone) {
      setError("All fields are required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Phone number must contain exactly 10 digits");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet the required conditions");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password: formData.password,
          phone
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
      console.error("Registration error:", err);
      setError("Server unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEND OTP =================

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const email = formData.email.trim().toLowerCase();

    if (!email) {
      setError("Please enter your registered email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to send OTP");
        return;
      }

      setFormData((previous) => ({
        ...previous,
        email
      }));

      setPage("verifyOtp");
      setSuccess(data.message || "OTP sent successfully. Check your email.");

    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Server unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!/^[0-9]{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/auth/verify-reset-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            otp
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "OTP verification failed");
        return;
      }

      if (!data.resetToken) {
        setError("Reset token was not returned by the server");
        return;
      }

      setResetToken(data.resetToken);
      setOtp("");
      setPage("resetPassword");
      setSuccess("OTP verified successfully.");

    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Server unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESET PASSWORD =================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }

    if (!validateNewPassword(newPassword)) {
      setError(
        "Password must start with a capital letter, contain a number and special character, and be at least 8 characters"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            resetToken,
            newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Password reset failed");
        return;
      }

      setSuccess("Password reset successfully! Please login.");

      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
      setOtp("");

      setFormData((previous) => ({
        ...previous,
        password: ""
      }));

      setPage("login");
      setIsRegister(false);

    } catch (err) {
      console.error("Reset password error:", err);
      setError("Server unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= SWITCH LOGIN / REGISTER =================

  const switchMode = () => {
    setError("");
    setSuccess("");
    setIsRegister((previous) => !previous);
  };

  // ================= BACK TO LOGIN =================

  const backToLogin = () => {
    setPage("login");
    setIsRegister(false);
    setError("");
    setSuccess("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
  };

  // ================= UI =================

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>

        <h2 style={titleStyle}>
          {page === "login"
            ? isRegister
              ? "Patient Registration"
              : "Online Medical Login"
            : page === "forgot"
              ? "Forgot Password"
              : page === "verifyOtp"
                ? "Verify OTP"
                : "Reset Password"}
        </h2>

        {/* ================= LOGIN / REGISTER ================= */}

        {page === "login" && (
          <form onSubmit={isRegister ? handleRegister : handleLogin}>

            {isRegister && (
              <>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Enter your full name"
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
              placeholder="Enter your email"
              required
            />

            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter your password"
              required
            />

            {isRegister && (
              <div style={passwordChecklistStyle}>
                <p style={{ color: validations.startsWithCapital ? "green" : "red" }}>
                  {validations.startsWithCapital ? "✔" : "✖"} Starts with Capital Letter
                </p>
                <p style={{ color: validations.isEightChars ? "green" : "red" }}>
                  {validations.isEightChars ? "✔" : "✖"} Must be at least 8 characters
                </p>
                <p style={{ color: validations.hasNumber ? "green" : "red" }}>
                  {validations.hasNumber ? "✔" : "✖"} Must contain a number
                </p>
                <p style={{ color: validations.hasSpecial ? "green" : "red" }}>
                  {validations.hasSpecial ? "✔" : "✖"} Must contain a special character
                </p>
              </div>
            )}

            {isRegister && (
              <>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  required
                />
              </>
            )}

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

                <p style={forgotLinkContainer}>
                  <span
                    style={linkStyle}
                    onClick={() => {
                      setPage("forgot");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Forgot Password?
                  </span>
                </p>
              </>
            )}

            <button
              type="submit"
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
              disabled={loading || (isRegister && !isPasswordValid)}
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Register"
                  : "Sign In"}
            </button>
          </form>
        )}

        {/* ================= FORGOT PASSWORD ================= */}

        {page === "forgot" && (
          <form onSubmit={handleForgotPassword}>
            <p style={descriptionStyle}>
              Enter your registered email address. We will send you a 6-digit OTP.
            </p>

            <label style={labelStyle}>Registered Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((previous) => ({
                  ...previous,
                  email: e.target.value
                }));
                setError("");
              }}
              style={inputStyle}
              placeholder="Enter your registered email"
              required
            />

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* ================= VERIFY OTP ================= */}

        {page === "verifyOtp" && (
          <form onSubmit={handleVerifyOtp}>
            <p style={descriptionStyle}>
              Enter the 6-digit OTP sent to {formData.email}.
            </p>

            <label style={labelStyle}>Enter OTP</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              style={inputStyle}
              placeholder="Enter 6-digit OTP"
              required
            />

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* ================= RESET PASSWORD ================= */}

        {page === "resetPassword" && (
          <form onSubmit={handleResetPassword}>
            <p style={descriptionStyle}>
              Create a new password for your HealthWave account.
            </p>

            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
              }}
              style={inputStyle}
              placeholder="Enter new password"
              required
            />

            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              style={inputStyle}
              placeholder="Confirm new password"
              required
            />

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "Updating Password..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* ================= MESSAGES ================= */}

        {error && <p style={errorStyle}>{error}</p>}
        {success && <p style={successStyle}>{success}</p>}

        {/* ================= FOOTER LINKS ================= */}

        {page === "login" && (
          <p style={footerText}>
            {isRegister ? "Already have an account?" : "New user?"}{" "}
            <span style={linkStyle} onClick={switchMode}>
              {isRegister ? "Login here" : "Create Account"}
            </span>
          </p>
        )}

        {page !== "login" && (
          <p style={footerText}>
            <span style={linkStyle} onClick={backToLogin}>
              Back to Login
            </span>
          </p>
        )}

      </div>
    </div>
  );
}

// ================= STYLES =================

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #e0f7fa, #e3f2fd)",
  padding: "20px"
};

const cardStyle = {
  width: "380px",
  maxWidth: "100%",
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
  boxSizing: "border-box",
  padding: "12px",
  marginBottom: "16px",
  borderRadius: "8px",
  border: "1px solid #cfd8dc",
  fontSize: "14px"
};

const passwordChecklistStyle = {
  fontSize: "13px",
  marginBottom: "10px"
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

const successStyle = {
  marginTop: "12px",
  color: "#2e7d32",
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

const forgotLinkContainer = {
  textAlign: "right",
  marginTop: "-5px",
  marginBottom: "15px",
  fontSize: "14px"
};

const descriptionStyle = {
  color: "#546e7a",
  fontSize: "14px",
  lineHeight: "1.6",
  marginBottom: "20px"
};

export default Login;
