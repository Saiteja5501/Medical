
import React, { useEffect, useMemo, useState } from "react";
import API from "../api";

function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications] = useState([
    { msg: "New appointment booked", time: "Just now" },
    { msg: "Doctor cancelled an appointment", time: "2 mins ago" }
  ]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [patientsRes, doctorsRes, appointmentsRes] =
        await Promise.all([
          API.get("/users"),
          API.get("/users/doctors"),
          API.get("/appointments/admin/all")
        ]);

      const patientsData = patientsRes.data;
      const doctorsData = doctorsRes.data;
      const appointmentsData = appointmentsRes.data;

      setPatients(
        patientsData.success && Array.isArray(patientsData.patients)
          ? patientsData.patients
          : []
      );

      setDoctors(
        Array.isArray(doctorsData)
          ? doctorsData
          : Array.isArray(doctorsData.doctors)
          ? doctorsData.doctors
          : []
      );

      setAppointments(
        appointmentsData.success &&
        Array.isArray(appointmentsData.appointments)
          ? appointmentsData.appointments
          : []
      );

    } catch (err) {
      console.error(
        "Dashboard error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        "Unable to load dashboard data. Check your backend APIs."
      );

      setPatients([]);
      setDoctors([]);
      setAppointments([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Normalize appointment statuses
  const normalizedStatus = (status) => {
    const value = (status || "").toLowerCase();

    if (value === "approved" || value === "accepted") {
      return "accepted";
    }

    if (value === "rejected" || value === "cancelled") {
      return "cancelled";
    }

    return value;
  };

  // Appointment counts
  const counts = useMemo(() => {
    const result = {
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
      missed: 0
    };

    appointments.forEach((appointment) => {
      const status = normalizedStatus(appointment.status);

      if (Object.prototype.hasOwnProperty.call(result, status)) {
        result[status]++;
      }
    });

    return result;
  }, [appointments]);

  // Recent appointments
  const recentAppointments = useMemo(
    () =>
      [...appointments]
        .sort((a, b) => {
          const dateA = new Date(a.booked_at || a.date || 0);
          const dateB = new Date(b.booked_at || b.date || 0);
          return dateB - dateA;
        })
        .slice(0, 6),
    [appointments]
  );

  // Date formatter
  const formatDate = (dateString) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Time formatter
  const formatTime = (time) => {
    if (!time) return "—";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // Today's date
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  // Completion rate
  const completionRate = appointments.length
    ? Math.round((counts.completed / appointments.length) * 100)
    : 0;

  // Statistics cards
  const statCards = [
    {
      title: "Total Doctors",
      value: doctors.length,
      icon: "🩺",
      color: "#203A34",
      textColor: "#20DCC0"
    },
    {
      title: "Total Patients",
      value: patients.length,
      icon: "👥",
      color: "#203A34",
      textColor: "#20DCC0"
    },
    {
      title: "Total Appointments",
      value: appointments.length,
      icon: "📅",
      color: "#382F1A",
      textColor: "#F5C76A"
    },
    {
      title: "Pending Appointments",
      value: counts.pending,
      icon: "⏳",
      color: "#302440",
      textColor: "#C5A3F5"
    }
  ];

  return (
    <div className="admin-dashboard-layout">

      <style>{`

        .admin-dashboard-layout {
          width: 100%;
          min-height: 100vh;
          background: #0B0D0E;
          color: #E8EEEE;
          font-family: Inter, Arial, sans-serif;
          box-sizing: border-box;
        }

        .admin-main-content {
          width: 100%;
          min-width: 0;
          padding: 30px;
          box-sizing: border-box;
        }

        /* WELCOME HEADER */

        .admin-welcome {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 28px;
        }

        .admin-welcome h2 {
          margin: 0 0 8px;
          color: #F1F5F5;
          font-size: 27px;
        }

        .admin-welcome p {
          margin: 0;
          color: #899497;
          font-size: 14px;
        }

        /* DATE AND NOTIFICATION */

        .welcome-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .welcome-date {
          padding: 14px 17px;
          background: #181C1D;
          border: 1px solid #293333;
          border-radius: 10px;
          color: #AAB5B5;
          font-size: 13px;
          white-space: nowrap;
        }

        .notification-button {
          position: relative;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          background: #181C1D;
          border: 1px solid #293333;
          border-radius: 10px;
          color: #E8EEEE;
          font-size: 19px;
          cursor: pointer;
          transition: .2s;
        }

        .notification-button:hover {
          background: #203A34;
          border-color: #20DCC0;
        }

        .notification-count {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 19px;
          height: 19px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #20DCC0;
          color: #071412;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
        }

        .notification-panel {
          position: absolute;
          top: 58px;
          right: 0;
          width: 280px;
          padding: 14px;
          background: #181C1D;
          border: 1px solid #303B3B;
          border-radius: 11px;
          box-shadow: 0 10px 30px rgba(0,0,0,.4);
          z-index: 1100;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #293333;
          margin-bottom: 10px;
          color: #E8EEEE;
          font-size: 14px;
        }

        .notification-close {
          background: transparent;
          border: none;
          color: #899497;
          font-size: 21px;
          cursor: pointer;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 2px;
          border-bottom: 1px solid #293333;
        }

        .notification-dot {
          width: 8px;
          height: 8px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #20DCC0;
          margin-top: 5px;
        }

        .notification-message {
          margin: 0 0 5px;
          color: #E8EEEE;
          font-size: 13px;
          font-weight: 500;
        }

        .notification-time {
          color: #899497;
          font-size: 11px;
        }

        /* ERROR */

        .admin-error {
          margin-bottom: 20px;
          padding: 14px;
          background: #301C1C;
          border: 1px solid #653333;
          border-radius: 9px;
          color: #FF8585;
          font-size: 13px;
        }

        /* STATISTICS */

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 25px;
        }

        .admin-stat-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 22px;
          background: #181C1D;
          border: 1px solid #293333;
          border-radius: 13px;
          transition: .2s;
        }

        .admin-stat-card:hover {
          transform: translateY(-3px);
          border-color: #20DCC0;
        }

        .admin-stat-card h4 {
          margin: 0 0 12px;
          color: #899497;
          font-size: 13px;
          font-weight: 500;
        }

        .admin-stat-card h2 {
          margin: 0;
          color: #F1F5F5;
          font-size: 27px;
        }

        .admin-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 12px;
          font-size: 23px;
        }

        /* MAIN GRID */

        .admin-main-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .admin-panel,
        .admin-recent {
          padding: 23px;
          background: #181C1D;
          border: 1px solid #293333;
          border-radius: 13px;
          min-width: 0;
        }

        .admin-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 23px;
        }

        .admin-panel-header h3 {
          margin: 0;
          color: #F1F5F5;
          font-size: 17px;
        }

        .admin-panel-header span {
          color: #899497;
          font-size: 12px;
        }

        /* OVERVIEW */

        .admin-overview {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .admin-overview-item {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .admin-overview-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 10px;
          font-size: 18px;
        }

        .admin-overview-info {
          flex: 1;
          min-width: 0;
        }

        .admin-overview-info h4 {
          margin: 0 0 5px;
          color: #E8EEEE;
          font-size: 13px;
        }

        .admin-overview-info p {
          margin: 0;
          color: #899497;
          font-size: 11px;
        }

        .admin-overview-count {
          color: #F1F5F5;
          font-size: 18px;
          font-weight: 700;
        }

        /* PROGRESS */

        .admin-progress {
          margin-top: 25px;
        }

        .admin-progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 9px;
          color: #AAB5B5;
          font-size: 12px;
        }

        .admin-progress-label strong {
          color: #20DCC0;
        }

        .admin-progress-bar {
          height: 8px;
          overflow: hidden;
          background: #303B3B;
          border-radius: 20px;
        }

        .admin-progress-fill {
          height: 100%;
          background: #20DCC0;
          border-radius: 20px;
          transition: width .3s;
        }

        /* REFRESH BUTTON */

        .admin-refresh {
          padding: 9px 15px;
          background: #203A34;
          border: 1px solid #28675A;
          border-radius: 8px;
          color: #20DCC0;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .admin-refresh:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        /* RECENT APPOINTMENTS TABLE */

        .admin-table-wrapper {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          min-width: 650px;
          border-collapse: collapse;
        }

        .admin-table th {
          padding: 14px 12px;
          background: #202727;
          color: #AAB5B5;
          font-size: 12px;
          text-align: left;
          white-space: nowrap;
        }

        .admin-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #293333;
          color: #C5CECE;
          font-size: 12px;
        }

        .admin-table td strong {
          color: #E8EEEE;
        }

        .admin-table tbody tr:hover {
          background: #202727;
        }

        .admin-table tbody tr:last-child td {
          border-bottom: none;
        }

        /* STATUS BADGES */

        .admin-status {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .admin-status.pending {
          background: #382F1A;
          color: #F5C76A;
        }

        .admin-status.accepted {
          background: #203A34;
          color: #20DCC0;
        }

        .admin-status.completed {
          background: #1C3040;
          color: #77BDF2;
        }

        .admin-status.cancelled,
        .admin-status.missed {
          background: #3B2424;
          color: #FF8585;
        }

        .admin-empty {
          padding: 30px 15px;
          text-align: center;
          color: #899497;
          font-size: 13px;
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .admin-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .admin-main-content {
            padding: 20px 14px;
          }

          .admin-welcome {
            align-items: flex-start;
          }

          .admin-welcome h2 {
            font-size: 22px;
          }

          .welcome-actions {
            width: 100%;
          }

          .welcome-date {
            flex: 1;
            white-space: normal;
          }

          .admin-stats {
            grid-template-columns: 1fr;
          }

          .admin-panel,
          .admin-recent {
            padding: 16px;
          }

          .notification-panel {
            width: min(280px, calc(100vw - 40px));
          }
        }

      `}</style>

      {/* MAIN DASHBOARD CONTENT */}

      <main className="admin-main-content">

        {/* WELCOME HEADER */}

        <div className="admin-welcome">

          <div>
            <h2>Welcome Back, Admin! 👋</h2>
            <p>Here's what's happening with your hospital today.</p>
          </div>

          {/* DATE AND NOTIFICATION BUTTON */}

          <div className="welcome-actions">

            <div className="welcome-date">
              📅 {today}
            </div>

            <button
              type="button"
              className="notification-button"
              onClick={() =>
                setShowNotifications((prev) => !prev)
              }
              aria-label="Notifications"
            >
              🔔

              {notifications.length > 0 && (
                <span className="notification-count">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}

            {showNotifications && (
              <div className="notification-panel">

                <div className="notification-header">
                  <strong>Notifications</strong>

                  <button
                    type="button"
                    className="notification-close"
                    onClick={() => setShowNotifications(false)}
                  >
                    ×
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="admin-empty">
                    No notifications
                  </p>
                ) : (
                  notifications.map((item, index) => (
                    <div
                      className="notification-item"
                      key={index}
                    >
                      <div className="notification-dot"></div>

                      <div>
                        <p className="notification-message">
                          {item.msg}
                        </p>

                        <span className="notification-time">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}

              </div>
            )}

          </div>
        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {/* STATISTICS */}

        <div className="admin-stats">

          {statCards.map((item) => (
            <div className="admin-stat-card" key={item.title}>

              <div>
                <h4>{item.title}</h4>

                <h2>
                  {loading
                    ? "—"
                    : item.value.toLocaleString("en-IN")}
                </h2>
              </div>

              <div
                className="admin-stat-icon"
                style={{
                  background: item.color,
                  color: item.textColor
                }}
              >
                {item.icon}
              </div>

            </div>
          ))}

        </div>

        {/* APPOINTMENT OVERVIEW AND HOSPITAL SUMMARY */}

        <div className="admin-main-grid">

          {/* APPOINTMENT OVERVIEW */}

          <section className="admin-panel">

            <div className="admin-panel-header">
              <h3>Appointment Overview</h3>
              <span>All time</span>
            </div>

            {loading ? (
              <div className="admin-empty">
                Loading appointment statistics...
              </div>
            ) : (
              <>
                <div className="admin-overview">

                  {[
                    {
                      title: "Completed Appointments",
                      description: "Successfully completed",
                      value: counts.completed,
                      icon: "✅",
                      color: "#203A34"
                    },
                    {
                      title: "Pending Appointments",
                      description: "Waiting for confirmation",
                      value: counts.pending,
                      icon: "⏳",
                      color: "#382F1A"
                    },
                    {
                      title: "Accepted Appointments",
                      description: "Approved by doctors",
                      value: counts.accepted,
                      icon: "👍",
                      color: "#203A34"
                    },
                    {
                      title: "Rejected / Cancelled",
                      description: "Not going ahead",
                      value: counts.cancelled,
                      icon: "❌",
                      color: "#3B2424"
                    }
                  ].map((item) => (
                    <div
                      className="admin-overview-item"
                      key={item.title}
                    >

                      <div
                        className="admin-overview-icon"
                        style={{ background: item.color }}
                      >
                        {item.icon}
                      </div>

                      <div className="admin-overview-info">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>

                      <span className="admin-overview-count">
                        {item.value}
                      </span>

                    </div>
                  ))}

                </div>

                {/* COMPLETION RATE */}

                <div className="admin-progress">

                  <div className="admin-progress-label">
                    <span>Appointment Completion Rate</span>
                    <strong>{completionRate}%</strong>
                  </div>

                  <div className="admin-progress-bar">
                    <div
                      className="admin-progress-fill"
                      style={{
                        width: `${completionRate}%`
                      }}
                    />
                  </div>

                </div>
              </>
            )}

          </section>

          {/* HOSPITAL SUMMARY */}

          <section className="admin-panel">

            <div className="admin-panel-header">
              <h3>Hospital Summary</h3>
              <span>Live data</span>
            </div>

            <div className="admin-overview">

              {[
                {
                  title: "Registered Doctors",
                  description: "Available doctor accounts",
                  value: doctors.length,
                  icon: "🩺",
                  color: "#1C3040"
                },
                {
                  title: "Registered Patients",
                  description: "Patient accounts",
                  value: patients.length,
                  icon: "👥",
                  color: "#203A34"
                },
                {
                  title: "Total Appointments",
                  description: "All recorded bookings",
                  value: appointments.length,
                  icon: "📅",
                  color: "#382F1A"
                }
              ].map((item) => (
                <div
                  className="admin-overview-item"
                  key={item.title}
                >

                  <div
                    className="admin-overview-icon"
                    style={{ background: item.color }}
                  >
                    {item.icon}
                  </div>

                  <div className="admin-overview-info">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>

                  <span className="admin-overview-count">
                    {loading ? "—" : item.value}
                  </span>

                </div>
              ))}

            </div>

            {/* REFRESH BUTTON */}

            <div style={{ marginTop: 25 }}>
              <button
                className="admin-refresh"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                ↻ Refresh Dashboard
              </button>
            </div>

          </section>

        </div>

        {/* RECENT APPOINTMENTS */}

        <section className="admin-recent">

          <div className="admin-panel-header">
            <h3>Recent Appointments</h3>
            <span>Latest 6 records</span>
          </div>

          {loading ? (
            <div className="admin-empty">
              Loading appointments...
            </div>
          ) : (
            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Appointment ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {recentAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="admin-empty">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    recentAppointments.map((appointment) => {
                      const status = normalizedStatus(
                        appointment.status
                      );

                      return (
                        <tr key={appointment.id}>

                          <td>#{appointment.id}</td>

                          <td>
                            <strong>
                              {appointment.patient_name || "—"}
                            </strong>
                          </td>

                          <td>
                            {appointment.doctor_name || "—"}
                          </td>

                          <td>
                            {formatDate(appointment.date)}
                          </td>

                          <td>
                            {formatTime(appointment.time)}
                          </td>

                          <td>
                            <span
                              className={`admin-status ${status}`}
                            >
                              {status}
                            </span>
                          </td>

                        </tr>
                      );
                    })
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;
