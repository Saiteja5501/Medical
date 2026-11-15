
import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";

function DoctorDashboard() {
  const navigate = useNavigate();
  const doctorId = sessionStorage.getItem("doctorId");
  const doctorName = sessionStorage.getItem("userName") || "Doctor";

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH DOCTOR APPOINTMENTS
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorId) {
        setError("Doctor ID not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/appointments/doctor/${doctorId}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch appointments");
        }

        setAppointments(
          Array.isArray(data) ? data : data.appointments || []
        );
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message || "Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  // DASHBOARD STATISTICS
  const totalAppointments = appointments.length;

  const pendingAppointments = appointments.filter(
    (appointment) =>
      appointment.status?.toLowerCase() === "pending"
  ).length;

  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status?.toLowerCase() === "completed"
  ).length;

  const uniquePatients = new Set(
    appointments
      .map((appointment) => appointment.patient_id)
      .filter((id) => id !== undefined && id !== null)
  ).size;

  const recentAppointments = [...appointments]
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || "00:00:00"}`);
      const dateB = new Date(`${b.date}T${b.time || "00:00:00"}`);
      return dateB - dateA;
    })
    .slice(0, 5);

  // DOCTOR SIDEBAR MENU
  const menuItems = [
    { name: "Dashboard", icon: "▦", path: "/doctor-dashboard" },
    { name: "Appointments", icon: "▣", path: "/doctor/appointments" },
    { name: "Availability", icon: "◷", path: "/doctor/availability" },
    { name: "Prescriptions", icon: "✚", path: "/doctor/prescriptions" },
    { name: "Reports", icon: "▤", path: "/doctor/reports" }
  ];

  // QUICK ACTIONS
  const quickActions = [
    {
      title: "Appointments",
      description: "View and manage patient appointments",
      icon: "📅",
      path: "/doctor/appointments"
    },
    {
      title: "Prescriptions",
      description: "Create and manage patient prescriptions",
      icon: "💊",
      path: "/doctor/prescriptions"
    },
    {
      title: "Medical Reports",
      description: "Review patient medical reports",
      icon: "📄",
      path: "/doctor/reports"
    },
    {
      title: "Availability",
      description: "Manage your available time slots",
      icon: "🕒",
      path: "/doctor/availability"
    }
  ];

  const getStatusStyle = (status) => {
    const value = status?.toLowerCase();

    if (value === "completed") {
      return { color: "#20DCC0", background: "#153C36" };
    }

    if (value === "pending") {
      return { color: "#FFC857", background: "#45391E" };
    }

    if (value === "approved") {
      return { color: "#60A5FA", background: "#1D3550" };
    }

    if (value === "rejected" || value === "missed") {
      return { color: "#FF7777", background: "#452626" };
    }

    return { color: "#B8C2C3", background: "#303738" };
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div style={styles.layout}>

      {/* LEFT SIDEBAR */}
      <aside style={styles.sidebar}>

        <div style={styles.sidebarSectionLabel}>
          DOCTOR WORKSPACE
        </div>

        <div style={styles.sidebarMenu}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/doctor-dashboard"}
              style={({ isActive }) => ({
                ...styles.sidebarLink,
                ...(isActive ? styles.activeSidebarLink : {})
              })}
            >
              <span style={styles.sidebarIcon}>
                {item.icon}
              </span>

              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        <div style={styles.sidebarBottom}>
          <div style={styles.supportCard}>
            <span style={styles.supportIcon}>✚</span>

            <div>
              <div style={styles.supportTitle}>
                Your care matters
              </div>

              <div style={styles.supportText}>
                Manage appointments and patient care in one place.
              </div>
            </div>
          </div>

          <div style={styles.sidebarFooter}>
            HealthWave Doctor Portal
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={styles.mainArea}>

        <main style={styles.content}>

          {/* HEADER */}
          <div style={styles.header}>
            <div>
              <p style={styles.eyebrow}>
                HEALTHWAVE / DOCTOR PORTAL
              </p>

              <h1 style={styles.title}>
                Doctor Dashboard
              </h1>

              <p style={styles.subtitle}>
                Welcome back, {doctorName}. Manage your appointments
                and patient activities.
              </p>
            </div>

            <div style={styles.doctorBadge}>
              <span style={styles.onlineDot}></span>
              Doctor Portal
            </div>
          </div>

          {/* STATISTICS */}
          <div style={styles.statsGrid}>

            <StatCard
              icon="📅"
              label="Total Appointments"
              value={loading ? "..." : totalAppointments}
              description="All your appointments"
            />

            <StatCard
              icon="⏳"
              label="Pending Appointments"
              value={loading ? "..." : pendingAppointments}
              description="Awaiting your action"
            />

            <StatCard
              icon="✓"
              label="Completed Appointments"
              value={loading ? "..." : completedAppointments}
              description="Successfully completed"
            />

            <StatCard
              icon="👥"
              label="Total Patients"
              value={loading ? "..." : uniquePatients}
              description="Unique patients"
            />

          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div style={styles.errorBox}>
              {error}

              <button
                style={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}

          {/* QUICK ACTIONS */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Quick Actions
                </h2>

                <p style={styles.sectionSubtitle}>
                  Access your frequently used modules.
                </p>
              </div>
            </div>

            <div style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <div
                  key={action.title}
                  style={styles.actionCard}
                  onClick={() => navigate(action.path)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#20DCC0";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#2A3031";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={styles.actionIcon}>
                    {action.icon}
                  </div>

                  <h3 style={styles.actionTitle}>
                    {action.title}
                  </h3>

                  <p style={styles.actionDescription}>
                    {action.description}
                  </p>

                  <span style={styles.actionLink}>
                    Open Module →
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* RECENT APPOINTMENTS */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Recent Appointments
                </h2>

                <p style={styles.sectionSubtitle}>
                  Your latest patient appointments.
                </p>
              </div>

              <button
                style={styles.viewAllButton}
                onClick={() => navigate("/doctor/appointments")}
              >
                View All →
              </button>
            </div>

            {loading ? (
              <div style={styles.emptyState}>
                Loading appointments...
              </div>
            ) : recentAppointments.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: "35px" }}>📅</div>

                <h3 style={{ color: "#FFFFFF" }}>
                  No appointments yet
                </h3>

                <p style={{ color: "#899497" }}>
                  Your appointments will appear here.
                </p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Patient Name</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Time</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td style={styles.td}>
                          {appointment.patient_name || "Patient"}
                        </td>

                        <td style={styles.td}>
                          {formatDate(appointment.date)}
                        </td>

                        <td style={styles.td}>
                          {appointment.time || "N/A"}
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              ...getStatusStyle(appointment.status)
                            }}
                          >
                            {appointment.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}

// STATISTICS CARD
function StatCard({ icon, label, value, description }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <span style={styles.statIcon}>{icon}</span>
        <span style={styles.statIndicator}>●</span>
      </div>

      <h2 style={styles.statValue}>{value}</h2>
      <h3 style={styles.statLabel}>{label}</h3>
      <p style={styles.statDescription}>{description}</p>
    </div>
  );
}

// STYLES
const styles = {
  layout: {
    display: "flex",
    minHeight: "calc(100vh - 68px)",
    width: "100%",
    background: "#0B0D0E",
    color: "#F3F4F6",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif"
  },

  sidebar: {
    width: "238px",
    minWidth: "238px",
    background: "#0D1011",
    borderRight: "1px solid #24292B",
    padding: "35px 16px 20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
  },

  sidebarSectionLabel: {
    padding: "0 13px",
    fontSize: "10px",
    letterSpacing: "1.6px",
    fontWeight: "700",
    color: "#697579",
    marginBottom: "22px"
  },

  sidebarMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "7px"
  },

  sidebarLink: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "13px 14px",
    color: "#939EA1",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
    borderRadius: "8px"
  },

  activeSidebarLink: {
    color: "#20DCC0",
    background: "#142824",
    fontWeight: "600"
  },

  sidebarIcon: {
    fontSize: "19px",
    width: "22px",
    textAlign: "center"
  },

  sidebarBottom: {
    marginTop: "auto",
    paddingTop: "35px"
  },

  supportCard: {
    background: "#171C1D",
    border: "1px solid #252D2F",
    borderRadius: "11px",
    padding: "16px",
    display: "flex",
    gap: "12px"
  },

  supportIcon: {
    color: "#20DCC0",
    fontSize: "22px"
  },

  supportTitle: {
    color: "#E8EEEE",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "6px"
  },

  supportText: {
    color: "#818C90",
    fontSize: "11px",
    lineHeight: "1.6"
  },

  sidebarFooter: {
    padding: "22px 8px 0",
    color: "#657174",
    fontSize: "11px"
  },

  mainArea: {
    flex: 1,
    minWidth: 0
  },

  content: {
    padding: "35px",
    maxWidth: "1500px",
    margin: "0 auto",
    boxSizing: "border-box"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "35px"
  },

  eyebrow: {
    color: "#20DCC0",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "2px",
    marginBottom: "10px"
  },

  title: {
    fontSize: "30px",
    fontWeight: "800",
    margin: "0 0 8px"
  },

  subtitle: {
    color: "#899497",
    fontSize: "14px",
    margin: 0
  },

  doctorBadge: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background: "#182421",
    color: "#20DCC0",
    padding: "10px 16px",
    borderRadius: "25px",
    fontSize: "13px",
    fontWeight: "600"
  },

  onlineDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#20DCC0"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: "20px",
    marginBottom: "40px"
  },

  statCard: {
    background: "#181C1D",
    border: "1px solid #2A3031",
    borderRadius: "16px",
    padding: "23px",
    minWidth: 0
  },

  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  statIcon: {
    fontSize: "25px"
  },

  statIndicator: {
    color: "#20DCC0",
    fontSize: "10px"
  },

  statValue: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#20DCC0",
    margin: "20px 0 5px"
  },

  statLabel: {
    color: "#FFFFFF",
    fontSize: "15px",
    margin: "0 0 8px"
  },

  statDescription: {
    color: "#899497",
    fontSize: "12px",
    margin: 0
  },

  section: {
    margin: "0 auto 40px"
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "20px"
  },

  sectionTitle: {
    fontSize: "21px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: "0 0 7px"
  },

  sectionSubtitle: {
    fontSize: "13px",
    color: "#899497",
    margin: 0
  },

  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
    gap: "20px"
  },

  actionCard: {
    background: "#181C1D",
    border: "1px solid #2A3031",
    borderRadius: "15px",
    padding: "24px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },

  actionIcon: {
    fontSize: "28px",
    marginBottom: "15px"
  },

  actionTitle: {
    color: "#FFFFFF",
    fontSize: "17px",
    margin: "0 0 10px"
  },

  actionDescription: {
    color: "#899497",
    fontSize: "13px",
    lineHeight: "1.6",
    minHeight: "42px"
  },

  actionLink: {
    color: "#20DCC0",
    fontSize: "13px",
    fontWeight: "700"
  },

  viewAllButton: {
    background: "transparent",
    color: "#20DCC0",
    border: "1px solid #20DCC0",
    borderRadius: "8px",
    padding: "9px 15px",
    cursor: "pointer",
    fontWeight: "600"
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    background: "#181C1D",
    border: "1px solid #2A3031",
    borderRadius: "14px"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px"
  },

  th: {
    padding: "17px",
    textAlign: "left",
    color: "#899497",
    fontSize: "12px",
    borderBottom: "1px solid #303738",
    whiteSpace: "nowrap"
  },

  td: {
    padding: "17px",
    color: "#E3EAEA",
    fontSize: "13px",
    borderBottom: "1px solid #252B2C"
  },

  statusBadge: {
    display: "inline-block",
    padding: "6px 11px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "capitalize"
  },

  emptyState: {
    background: "#181C1D",
    border: "1px solid #2A3031",
    borderRadius: "14px",
    padding: "40px 20px",
    textAlign: "center",
    color: "#899497"
  },

  errorBox: {
    margin: "0 auto 25px",
    padding: "15px",
    background: "#452626",
    border: "1px solid #743A3A",
    color: "#FFB4B4",
    borderRadius: "10px"
  },

  retryButton: {
    marginLeft: "15px",
    padding: "7px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer"
  }
};

export default DoctorDashboard;
