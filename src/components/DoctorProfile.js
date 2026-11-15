
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function DoctorProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/users/doctor/profile");

        if (response.data.success) {
          setProfile(response.data.profile);
        } else {
          setError(response.data.message || "Unable to load profile");
        }
      } catch (err) {
        console.error("Doctor profile error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load doctor profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading doctor profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorCard}>
          <h2>Unable to load profile</h2>
          <p>{error}</p>
          <button
            style={styles.backButton}
            onClick={() => navigate("/doctor-dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "D";

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* PAGE HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Profile</h1>
            <p style={styles.subtitle}>
              View your professional and account information
            </p>
          </div>

          <button
            style={styles.backButton}
            onClick={() => navigate("/doctor-dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        {/* PROFILE CARD */}
        <div style={styles.profileCard}>
          <div style={styles.profileTop}>
            <div style={styles.avatar}>{initial}</div>

            <div style={styles.profileHeading}>
              <h2 style={styles.doctorName}> {profile.name}</h2>

              <p style={styles.specialization}>
                {profile.specialization || "Specialization not provided"}
              </p>

              <span style={styles.roleBadge}>
                DOCTOR ACCOUNT
              </span>
            </div>

            <div style={styles.readOnlyBadge}>
              <span style={styles.lockIcon}>🔒</span>
              Read Only
            </div>
          </div>

          <div style={styles.divider} />

          {/* PERSONAL INFORMATION */}
          <h3 style={styles.sectionTitle}>
            Personal Information
          </h3>

          <div style={styles.detailsGrid}>
            <Detail
              label="Full Name"
              value={profile.name}
            />

            <Detail
              label="Email Address"
              value={profile.email}
            />

            <Detail
              label="Doctor ID"
              value={`DOC-${profile.id}`}
            />

            <Detail
              label="Account Role"
              value="Doctor"
            />
          </div>

          <div style={styles.divider} />

          {/* PROFESSIONAL INFORMATION */}
          <h3 style={styles.sectionTitle}>
            Professional Information
          </h3>

          <div style={styles.detailsGrid}>
            <Detail
              label="Specialization"
              value={profile.specialization}
            />

            <Detail
              label="Account Created"
              value={formatDate(profile.created_at)}
            />
          </div>

          {/* ADMIN NOTICE */}
          <div style={styles.notice}>
            <span style={styles.noticeIcon}>ⓘ</span>

            <div>
              <strong style={styles.noticeTitle}>
                Profile managed by administrator
              </strong>

              <p style={styles.noticeText}>
                Your account information is managed by the
                HealthWave administrator. Contact the admin
                if any information needs to be corrected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* REUSABLE DETAIL COMPONENT */

function Detail({ label, value }) {
  return (
    <div style={styles.detailItem}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>
        {value || "Not provided"}
      </span>
    </div>
  );
}

/* DARK HEALTHWAVE STYLES */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0B0D0E",
    padding: "35px 30px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
    color: "#E8EEEE"
  },

  container: {
    maxWidth: "1000px",
    margin: "0 auto"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "25px"
  },

  title: {
    fontSize: "28px",
    color: "#F1F5F5",
    margin: "0 0 8px",
    fontWeight: "700"
  },

  subtitle: {
    fontSize: "14px",
    color: "#899497",
    margin: 0
  },

  profileCard: {
    background: "#181C1D",
    border: "1px solid #293333",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 12px 35px rgba(0,0,0,0.2)"
  },

  profileTop: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap"
  },

  avatar: {
    width: "75px",
    height: "75px",
    borderRadius: "15px",
    background: "#203A34",
    color: "#20DCC0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "700"
  },

  profileHeading: {
    flex: 1
  },

  doctorName: {
    fontSize: "21px",
    color: "#F1F5F5",
    margin: "0 0 7px"
  },

  specialization: {
    color: "#20DCC0",
    fontSize: "14px",
    margin: "0 0 10px"
  },

  roleBadge: {
    display: "inline-block",
    background: "#203A34",
    color: "#20DCC0",
    padding: "6px 10px",
    borderRadius: "5px",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px"
  },

  readOnlyBadge: {
    background: "#202626",
    border: "1px solid #343D3E",
    color: "#B9C2C2",
    borderRadius: "7px",
    padding: "9px 12px",
    fontSize: "12px",
    fontWeight: "600"
  },

  lockIcon: {
    marginRight: "5px"
  },

  divider: {
    height: "1px",
    background: "#293333",
    margin: "28px 0"
  },

  sectionTitle: {
    color: "#F1F5F5",
    fontSize: "16px",
    margin: "0 0 20px",
    fontWeight: "700"
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "22px"
  },

  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    background: "#101515",
    border: "1px solid #293333",
    borderRadius: "9px",
    padding: "16px"
  },

  detailLabel: {
    color: "#899497",
    fontSize: "12px"
  },

  detailValue: {
    color: "#E8EEEE",
    fontSize: "14px",
    fontWeight: "600",
    overflowWrap: "anywhere"
  },

  notice: {
    display: "flex",
    gap: "12px",
    background: "#153A35",
    border: "1px solid #216B60",
    borderRadius: "10px",
    padding: "17px",
    marginTop: "30px"
  },

  noticeIcon: {
    color: "#20DCC0",
    fontSize: "20px"
  },

  noticeTitle: {
    color: "#20DCC0",
    fontSize: "13px"
  },

  noticeText: {
    color: "#B5C8C4",
    fontSize: "12px",
    lineHeight: 1.7,
    margin: "7px 0 0"
  },

  backButton: {
    background: "#202626",
    color: "#20DCC0",
    border: "1px solid #343D3E",
    borderRadius: "7px",
    padding: "10px 16px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer"
  },

  loading: {
    textAlign: "center",
    padding: "80px 20px",
    color: "#20DCC0"
  },

  errorCard: {
    maxWidth: "550px",
    margin: "60px auto",
    padding: "30px",
    background: "#181C1D",
    border: "1px solid #293333",
    borderRadius: "12px",
    textAlign: "center",
    color: "#E8EEEE"
  }
};

export default DoctorProfile;
