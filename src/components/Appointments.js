
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Appointments({ patientId: propPatientId }) {
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: "",
    problem: ""
  });

  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [showBell, setShowBell] = useState(false);

  const patientId =
    propPatientId || Number(sessionStorage.getItem("userId"));

  const formatTime = (time) => {
    if (!time) return "";

    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);

    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const formatDate = (date) => {
    if (!date) return "";

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusStyle = (value) => {
    const colors = {
      approved: { color: "#20DCC0", background: "#16342E" },
      pending: { color: "#E9BD61", background: "#382E1B" },
      rejected: { color: "#F08080", background: "#3A2224" },
      completed: { color: "#8CAEFF", background: "#202D45" },
      missed: { color: "#F08080", background: "#3A2224" },
      cancelled: { color: "#A0A9AA", background: "#292F30" }
    };

    return colors[(value || "").toLowerCase()] || {
      color: "#A0A9AA",
      background: "#292F30"
    };
  };

  /* FETCH APPOINTMENTS */

  const fetchAppointments = useCallback(async () => {
    if (!patientId) return;

    try {
      const response = await API.get(
        `/appointments/patient/${patientId}`
      );

      const data = response.data;
      setAppointments(data.success ? data.appointments : []);
    } catch (error) {
      console.error(
        "Error fetching appointments:",
        error.response?.data || error.message
      );
      setAppointments([]);
    }
  }, [patientId]);

  /* SOCKET CONNECTION */

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    if (patientId) {
      socketRef.current.emit("join", patientId);
    }

    socketRef.current.on("appointmentUpdated", (data) => {
      fetchAppointments();

      setNotifications((prev) => [
        {
          msg: data?.message || "Appointment status updated",
          time: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [patientId, fetchAppointments]);

  /* FETCH DOCTORS */

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await API.get("/users/doctors");
        const data = response.data;

        if (Array.isArray(data)) {
          setDoctors(data);
        } else if (Array.isArray(data.doctors)) {
          setDoctors(data.doctors);
        } else {
          setDoctors([]);
        }
      } catch (error) {
        console.error(
          "Error fetching doctors:",
          error.response?.data || error.message
        );
        setDoctors([]);
      }
    };

    fetchDoctors();
  }, []);

  /* FETCH AVAILABLE SLOTS */

  useEffect(() => {
    if (!formData.doctorId || !formData.date) {
      setSlots([]);
      return;
    }

    fetch(
      `http://localhost:5000/availability/slots/${formData.doctorId}/${formData.date}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.success ? data.slots : []);
      })
      .catch((error) => {
        console.error("Error fetching slots:", error);
        setSlots([]);
      });
  }, [formData.doctorId, formData.date]);

  /* LOAD APPOINTMENTS */

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* BOOK APPOINTMENT */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !patientId ||
      !formData.doctorId ||
      !formData.date ||
      !formData.time ||
      !formData.problem.trim()
    ) {
      setStatus("Please complete all fields before booking.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const response = await API.post("/appointments", {
        doctorId: Number(formData.doctorId),
        date: formData.date,
        time: formData.time,
        problem: formData.problem.trim()
      });

      const data = response.data;

      if (data.success) {
        setStatus("Appointment booked successfully!");

        setFormData({
          doctorId: "",
          date: "",
          time: "",
          problem: ""
        });

        setSlots([]);
        await fetchAppointments();
      } else {
        setStatus(data.message || "Unable to book appointment.");
      }
    } catch (error) {
      console.error(
        "Error booking appointment:",
        error.response?.data || error.message
      );

      setStatus(
        error.response?.data?.message ||
        "Unable to book appointment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* CANCEL APPOINTMENT */

  const cancelAppointment = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      const response = await API.put(`/appointments/${id}/cancel`);
      const data = response.data;

      setStatus(data.message || "Appointment cancellation processed.");

      if (data.success) {
        await fetchAppointments();
      }
    } catch (error) {
      console.error(
        "Error cancelling appointment:",
        error.response?.data || error.message
      );

      setStatus(
        error.response?.data?.message ||
        "Unable to cancel appointment."
      );
    }
  };

  /* FILTER APPOINTMENTS */

  const filteredAppointments = appointments.filter((appointment) => {
    const doctorName = (
      appointment.doctor_name || "Doctor"
    ).toLowerCase();

    const matchesSearch = doctorName.includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (appointment.status || "").toLowerCase() === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>PATIENT WORKSPACE</div>
          <h1 style={styles.title}>Appointments</h1>
          <p style={styles.subtitle}>
            Schedule consultations and manage your doctor visits.
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <button
            style={styles.notificationButton}
            onClick={() => setShowBell(!showBell)}
          >
            ♧
            {notifications.length > 0 && (
              <span style={styles.notificationCount}>
                {notifications.length}
              </span>
            )}
          </button>

          {showBell && (
            <div style={styles.notificationPanel}>
              <h3 style={styles.notificationHeading}>Notifications</h3>

              {notifications.length === 0 ? (
                <p style={styles.emptyText}>No new notifications</p>
              ) : (
                notifications.map((item, index) => (
                  <div key={index} style={styles.notificationItem}>
                    <p style={styles.notificationMessage}>{item.msg}</p>
                    <span style={styles.notificationTime}>{item.time}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* STATUS MESSAGE */}

      {status && (
        <div style={styles.statusMessage}>
          <span>{status}</span>
          <button
            onClick={() => setStatus("")}
            style={styles.closeStatus}
          >
            ×
          </button>
        </div>
      )}

      {/* BOOKING FORM */}

      <section style={styles.bookingCard}>
        <div style={styles.cardHeading}>
          <div>
            <h2 style={styles.sectionTitle}>Book an Appointment</h2>
            <p style={styles.sectionSubtitle}>
              Choose your doctor and preferred consultation time.
            </p>
          </div>

          <span style={styles.bookingIcon}>＋</span>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Select Doctor</label>
            <select
              style={styles.field}
              value={formData.doctorId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  doctorId: e.target.value,
                  time: ""
                })
              }
            >
              <option value="">Choose a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                  {doctor.specialization
                    ? ` - ${doctor.specialization}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Appointment Date</label>
            <input
              type="date"
              style={styles.field}
              min={new Date().toISOString().split("T")[0]}
              value={formData.date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  date: e.target.value,
                  time: ""
                })
              }
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Available Time</label>
            <select
              style={styles.field}
              value={formData.time}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  time: e.target.value
                })
              }
              disabled={!formData.doctorId || !formData.date}
            >
              <option value="">Select available time</option>
              {slots.map((slot, index) => (
                <option key={index} value={slot.time}>
                  {formatTime(slot.time)}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Reason for Visit</label>
            <textarea
              style={styles.textarea}
              placeholder="Briefly describe your health concern..."
              value={formData.problem}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  problem: e.target.value
                })
              }
            />
          </div>

          <div style={styles.formFooter}>
            <span style={styles.formHint}>
              Please verify your details before booking.
            </span>

            <button
              type="submit"
              style={{
                ...styles.bookButton,
                opacity: loading ? 0.6 : 1
              }}
              disabled={loading}
            >
              {loading ? "Booking..." : "Confirm Appointment"}
              <span>→</span>
            </button>
          </div>
        </form>
      </section>

      {/* APPOINTMENT HISTORY */}

      <section style={styles.historySection}>
        <div style={styles.historyHeading}>
          <div>
            <h2 style={styles.sectionTitle}>My Appointments</h2>
            <p style={styles.sectionSubtitle}>
              View and track your consultation history.
            </p>
          </div>

          <span style={styles.appointmentCount}>
            {filteredAppointments.length} appointments
          </span>
        </div>

        {/* SEARCH AND FILTER */}

        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Search by doctor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>
        </div>

        {/* APPOINTMENT CARDS */}

        <div style={styles.appointmentList}>
          {filteredAppointments.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>▣</div>
              <h3 style={styles.emptyTitle}>No appointments found</h3>
              <p style={styles.emptyText}>
                Your appointments will appear here once available.
              </p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => {
              const statusStyle = getStatusStyle(appointment.status);

              return (
                <div key={appointment.id} style={styles.appointmentCard}>
                  <div style={styles.doctorInfo}>
                    <div style={styles.doctorAvatar}>
                      ✚
                    </div>

                    <div>
                      <h3 style={styles.doctorName}>
                        {appointment.doctor_name || "Doctor"}
                      </h3>

                      <p style={styles.doctorSub}>
                        Doctor consultation
                      </p>
                    </div>
                  </div>

                  <div style={styles.appointmentDetails}>
                    <div>
                      <span style={styles.detailLabel}>DATE</span>
                      <span style={styles.detailValue}>
                        {formatDate(appointment.date)}
                      </span>
                    </div>

                    <div>
                      <span style={styles.detailLabel}>TIME</span>
                      <span style={styles.detailValue}>
                        {formatTime(appointment.time)}
                      </span>
                    </div>

                    <div>
                      <span style={styles.detailLabel}>STATUS</span>
                      <span
                        style={{
                          ...styles.statusBadge,
                          color: statusStyle.color,
                          background: statusStyle.background
                        }}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>

                  <div style={styles.appointmentActions}>
                    {appointment.status === "pending" && (
                      <button
                        style={styles.cancelButton}
                        onClick={() => cancelAppointment(appointment.id)}
                      >
                        Cancel
                      </button>
                    )}

                    {appointment.status === "missed" && (
                      <button
                        style={styles.rebookButton}
                        onClick={() => {
                          setFormData({
                            doctorId: appointment.doctor_id,
                            date: "",
                            time: "",
                            problem: appointment.reason || ""
                          });

                          window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                          });
                        }}
                      >
                        Rebook
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================
   INLINE STYLES - MEDUX INSPIRED
========================================= */

const styles = {
  page: {
    minHeight: "calc(100vh - 76px)",
    background: "#0B0D0E",
    color: "#F3F4F6",
    padding: "32px",
    boxSizing: "border-box",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px"
  },

  eyebrow: {
    color: "#20DCC0",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.8px",
    marginBottom: "9px"
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 0 9px"
  },

  subtitle: {
    color: "#899497",
    fontSize: "13px",
    margin: 0
  },

  notificationButton: {
    position: "relative",
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    border: "1px solid #303738",
    background: "#181D1E",
    color: "#20DCC0",
    fontSize: "20px",
    cursor: "pointer"
  },

  notificationCount: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "#20DCC0",
    color: "#071411",
    borderRadius: "50%",
    minWidth: "17px",
    height: "17px",
    fontSize: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  notificationPanel: {
    position: "absolute",
    right: 0,
    top: "48px",
    width: "260px",
    maxWidth: "80vw",
    background: "#181D1E",
    border: "1px solid #303738",
    borderRadius: "9px",
    padding: "15px",
    zIndex: 10,
    boxShadow: "0 12px 30px rgba(0,0,0,0.4)"
  },

  notificationHeading: {
    fontSize: "14px",
    margin: "0 0 12px"
  },

  notificationItem: {
    padding: "10px 0",
    borderTop: "1px solid #303738"
  },

  notificationMessage: {
    fontSize: "12px",
    margin: "0 0 5px"
  },

  notificationTime: {
    color: "#899497",
    fontSize: "10px"
  },

  statusMessage: {
    background: "#17332D",
    border: "1px solid #245D4F",
    color: "#20DCC0",
    padding: "13px 16px",
    borderRadius: "8px",
    fontSize: "12px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  closeStatus: {
    background: "transparent",
    border: "none",
    color: "#20DCC0",
    fontSize: "19px",
    cursor: "pointer"
  },

  bookingCard: {
    background: "#171B1C",
    border: "1px solid #2A3031",
    borderRadius: "11px",
    padding: "25px",
    marginBottom: "32px"
  },

  cardHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },

  sectionTitle: {
    fontSize: "17px",
    fontWeight: "700",
    margin: "0 0 8px"
  },

  sectionSubtitle: {
    color: "#899497",
    fontSize: "12px",
    margin: 0
  },

  bookingIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "9px",
    background: "#203A34",
    color: "#20DCC0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px"
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
    gap: "20px"
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "9px"
  },

  label: {
    color: "#AAB5B5",
    fontSize: "11px",
    fontWeight: "600"
  },

  field: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    borderRadius: "7px",
    border: "1px solid #343D3E",
    background: "#101515",
    color: "#E8EEEE",
    fontSize: "12px",
    outline: "none"
  },

  textarea: {
    width: "100%",
    minHeight: "44px",
    boxSizing: "border-box",
    padding: "13px",
    borderRadius: "7px",
    border: "1px solid #343D3E",
    background: "#101515",
    color: "#E8EEEE",
    fontSize: "12px",
    resize: "vertical",
    outline: "none"
  },

  formFooter: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginTop: "5px"
  },

  formHint: {
    color: "#778285",
    fontSize: "11px"
  },

  bookButton: {
    padding: "13px 19px",
    background: "#20DCC0",
    color: "#071411",
    border: "none",
    borderRadius: "7px",
    fontWeight: "700",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    cursor: "pointer"
  },

  historySection: {
    background: "#171B1C",
    border: "1px solid #2A3031",
    borderRadius: "11px",
    padding: "25px"
  },

  historyHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "22px"
  },

  appointmentCount: {
    color: "#20DCC0",
    fontSize: "11px"
  },

  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px"
  },

  searchInput: {
    flex: "1 1 220px",
    minWidth: 0,
    padding: "12px 14px",
    border: "1px solid #343D3E",
    borderRadius: "7px",
    background: "#101515",
    color: "#F3F4F6",
    fontSize: "12px",
    outline: "none"
  },

  filterSelect: {
    padding: "12px",
    border: "1px solid #343D3E",
    borderRadius: "7px",
    background: "#101515",
    color: "#D6DEDE",
    fontSize: "12px"
  },

  appointmentList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  appointmentCard: {
    background: "#101515",
    border: "1px solid #293132",
    borderRadius: "9px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "18px"
  },

  doctorInfo: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    minWidth: "150px"
  },

  doctorAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "9px",
    background: "#203A34",
    color: "#20DCC0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px"
  },

  doctorName: {
    fontSize: "13px",
    fontWeight: "700",
    margin: "0 0 5px"
  },

  doctorSub: {
    color: "#778285",
    fontSize: "10px",
    margin: 0
  },

  appointmentDetails: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "25px"
  },

  detailLabel: {
    display: "block",
    color: "#778285",
    fontSize: "9px",
    letterSpacing: "1px",
    marginBottom: "7px"
  },

  detailValue: {
    display: "block",
    color: "#DCE3E3",
    fontSize: "11px",
    fontWeight: "600"
  },

  statusBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "5px",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "capitalize"
  },

  appointmentActions: {
    display: "flex",
    gap: "9px"
  },

  cancelButton: {
    padding: "9px 14px",
    background: "#382225",
    color: "#F08080",
    border: "1px solid #633438",
    borderRadius: "6px",
    fontSize: "11px",
    cursor: "pointer"
  },

  rebookButton: {
    padding: "9px 14px",
    background: "#173B35",
    color: "#20DCC0",
    border: "1px solid #286C60",
    borderRadius: "6px",
    fontSize: "11px",
    cursor: "pointer"
  },

  emptyState: {
    padding: "45px 15px",
    textAlign: "center",
    border: "1px dashed #343D3E",
    borderRadius: "9px"
  },

  emptyIcon: {
    fontSize: "32px",
    color: "#20DCC0",
    marginBottom: "12px"
  },

  emptyTitle: {
    fontSize: "14px",
    margin: "0 0 8px"
  },

  emptyText: {
    color: "#899497",
    fontSize: "11px",
    margin: 0
  }
};

export default Appointments;
