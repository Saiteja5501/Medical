
import React, { useEffect, useState } from "react";
import API from "../api";

function PatientProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // FETCH PROFILE
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/users/profile");

      setProfile({
        name: response.data.profile.name || "",
        email: response.data.profile.email || "",
        phone: response.data.profile.phone || ""
      });
    } catch (err) {
      console.error("Fetch profile error:", err);

      setError(
        err.response?.data?.message || "Unable to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // UPDATE PROFILE
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!profile.name.trim() || !profile.email.trim()) {
      setError("Name and email are required");
      return;
    }

    if (
      profile.phone &&
      !/^[0-9]{10}$/.test(profile.phone)
    ) {
      setError("Phone number must contain exactly 10 digits");
      return;
    }

    try {
      setSaving(true);

      const response = await API.put("/users/profile", {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim()
      });

      setMessage(
        response.data.message || "Profile updated successfully"
      );

      sessionStorage.setItem(
        "userName",
        profile.name.trim()
      );
    } catch (err) {
      console.error("Update profile error:", err);

      setError(
        err.response?.data?.message || "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // HEALTHWAVE STYLES
  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      boxSizing: "border-box",
      background: "#0B0D0E",
      color: "#F3F4F6",
      padding: "40px 25px",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },

    content: {
      width: "100%",
      maxWidth: "1100px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },

    heading: {
      fontSize: "30px",
      fontWeight: "700",
      marginBottom: "10px",
      letterSpacing: "-0.5px",
      textAlign: "center"
    },

    subtitle: {
      color: "#899497",
      marginBottom: "35px",
      fontSize: "14px",
      textAlign: "center"
    },

    card: {
      width: "100%",
      maxWidth: "850px",
      boxSizing: "border-box",
      background: "linear-gradient(145deg, #191F20, #141819)",
      border: "1px solid #2A3031",
      borderRadius: "18px",
      padding: "36px",
      boxShadow: "0 15px 40px rgba(0,0,0,0.25)"
    },

    avatarSection: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
      marginBottom: "32px",
      paddingBottom: "28px",
      borderBottom: "1px solid #2A3031"
    },

    avatar: {
      width: "78px",
      height: "78px",
      flexShrink: 0,
      borderRadius: "20px",
      background: "linear-gradient(135deg, #164C43, #203A34)",
      border: "1px solid #23665A",
      color: "#20DCC0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "32px",
      fontWeight: "800",
      boxShadow: "0 5px 20px rgba(32,220,192,0.12)"
    },

    sectionTitle: {
      fontSize: "19px",
      fontWeight: "700",
      marginBottom: "25px",
      color: "#F3F4F6"
    },

    field: {
      marginBottom: "25px"
    },

    label: {
      display: "block",
      color: "#AAB4B5",
      fontSize: "13px",
      fontWeight: "600",
      marginBottom: "10px"
    },

    input: {
      width: "100%",
      padding: "15px 17px",
      boxSizing: "border-box",
      borderRadius: "10px",
      border: "1px solid #303839",
      background: "#101415",
      color: "#F3F4F6",
      fontSize: "14px",
      outline: "none"
    },

    button: {
      background: "#20DCC0",
      color: "#071411",
      padding: "14px 28px",
      border: "none",
      borderRadius: "9px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      marginTop: "8px",
      boxShadow: "0 5px 18px rgba(32,220,192,0.15)"
    },

    message: {
      color: "#20DCC0",
      background: "rgba(32,220,192,0.09)",
      border: "1px solid rgba(32,220,192,0.2)",
      padding: "14px",
      borderRadius: "9px",
      marginBottom: "22px",
      fontSize: "14px"
    },

    error: {
      color: "#FF7777",
      background: "rgba(255,80,80,0.08)",
      border: "1px solid rgba(255,80,80,0.2)",
      padding: "14px",
      borderRadius: "9px",
      marginBottom: "22px",
      fontSize: "14px"
    }
  };

  // LOADING
  if (loading) {
    return (
      <div style={styles.page}>
        <p style={{ color: "#899497" }}>
          Loading your profile...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.content}>

        <h1 style={styles.heading}>
          My Profile
        </h1>

        <p style={styles.subtitle}>
          View and manage your personal account information.
        </p>

        <div style={styles.card}>

          {/* PROFILE HEADER */}
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {profile.name
                ? profile.name.charAt(0).toUpperCase()
                : "P"}
            </div>

            <div>
              <h2 style={{
                margin: "0 0 7px",
                fontSize: "21px",
                fontWeight: "700"
              }}>
                {profile.name}
              </h2>

              <p style={{
                margin: 0,
                color: "#899497",
                fontSize: "13px"
              }}>
                Patient Account
              </p>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}
          <h3 style={styles.sectionTitle}>
            Personal Information
          </h3>

          {message && (
            <div style={styles.message}>
              {message}
            </div>
          )}

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div style={styles.field}>
              <label style={styles.label}>
                Full Name
              </label>

              <input
                style={styles.input}
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Email Address
              </label>

              <input
                style={styles.input}
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Phone Number
              </label>

              <input
                style={styles.input}
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter your 10-digit phone number"
                maxLength={10}
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: saving ? 0.7 : 1,
                cursor: saving ? "not-allowed" : "pointer"
              }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
