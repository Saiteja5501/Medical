/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

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

  const [page, setPage] = useState(1);
  const limit = 5;

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [showBell, setShowBell] = useState(false);

  // ✅ Using universal userId
  const patientId =
    propPatientId || Number(sessionStorage.getItem("userId"));

  /* ================= STATUS COLOR ================= */
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#16a34a";
      case "pending":
        return "#ca8a04";
      case "rejected":
        return "#dc2626";
      case "completed":
        return "#2563eb";
      case "missed":
        return "#b91c1c";
      default:
        return "#64748b";
    }
  };

  /* ================= FETCH APPOINTMENTS ================= */
  const fetchAppointments = useCallback(() => {
    if (!patientId) return;

    fetch(`http://localhost:5000/appointments/patient/${patientId}`)
      .then(res => res.json())
      .then(data =>
        setAppointments(data.success ? data.appointments : [])
      );
  }, [patientId]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    if (patientId) socketRef.current.emit("join", patientId);

    socketRef.current.on("appointmentUpdated", (data) => {
      fetchAppointments();
      setNotifications(prev => [
        {
          msg: data?.message || "Appointment status updated",
          time: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    });

    return () => socketRef.current.disconnect();
  }, [patientId, fetchAppointments]);

  /* ================= FETCH DOCTORS ================= */
  useEffect(() => {
    fetch("http://localhost:5000/users/doctors")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDoctors(data);
        else if (Array.isArray(data.doctors)) setDoctors(data.doctors);
        else if (data.success && Array.isArray(data.doctors))
          setDoctors(data.doctors);
        else setDoctors([]);
      })
      .catch(() => setDoctors([]));
  }, []);

  /* ================= FETCH SLOTS ================= */
  useEffect(() => {
    if (!formData.doctorId || !formData.date) {
      setSlots([]);
      return;
    }

    fetch(
      `http://localhost:5000/availability/slots/${formData.doctorId}/${formData.date}`
    )
      .then(res => res.json())
      .then(data => setSlots(data.success ? data.slots : []));
  }, [formData.doctorId, formData.date]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* ================= BOOK ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !patientId ||
      !formData.doctorId ||
      !formData.date ||
      !formData.time ||
      !formData.problem.trim()
    ) {
      setStatus("All fields required");
      return;
    }

    const res = await fetch("http://localhost:5000/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        doctorId: Number(formData.doctorId),
        date: formData.date,
        time: formData.time,
        problem: formData.problem.trim()
      })
    });

    const data = await res.json();
    setStatus(data.success ? "Appointment booked successfully" : data.message);
    setFormData({ doctorId: "", date: "", time: "", problem: "" });
    fetchAppointments();
  };

  /* ================= CANCEL ================= */
  const cancelAppointment = async (id) => {
    await fetch(`http://localhost:5000/appointments/${id}/cancel`, {
      method: "PUT"
    });
    fetchAppointments();
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div style={pageStyle}>
      <section style={card}>
        <h2 style={title}>Schedule Appointment</h2>
        {status && <p style={statusMsg}>{status}</p>}

        <form onSubmit={handleSubmit} style={form}>
          <select
            style={field}
            value={formData.doctorId}
            onChange={e =>
              setFormData({ ...formData, doctorId: e.target.value })
            }
          >
            <option value="">Select Doctor</option>
            {Array.isArray(doctors) &&
              doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
          </select>

          <input
            type="date"
            style={field}
            value={formData.date}
            onChange={e =>
              setFormData({ ...formData, date: e.target.value })
            }
          />

          <select
            style={field}
            value={formData.time}
            onChange={e =>
              setFormData({ ...formData, time: e.target.value })
            }
          >
            <option value="">Select Time</option>
            {slots.map((s, i) => (
              <option key={i} value={s.time}>
                {formatTime(s.time)}
              </option>
            ))}
          </select>

          <textarea
            style={{ ...field, height: "80px" }}
            placeholder="Describe your problem"
            value={formData.problem}
            onChange={e =>
              setFormData({ ...formData, problem: e.target.value })
            }
          />

          <button style={btn}>Book Appointment</button>
        </form>

        {/* ================= DISPLAY APPOINTMENTS ================= */}

        <div style={apptList}>
          {appointments.length === 0 ? (
            <p>No appointments found</p>
          ) : (
            appointments.map(a => (
              <div key={a.id} style={apptCard}>
                <div>
                  <p><strong>{a.doctor_name || "Doctor"}</strong></p>
                  <p style={apptSub}>Date: {a.date}</p>
                  <p style={apptSub}>Time: {formatTime(a.time)}</p>
                  <p style={{ ...apptSub, color: getStatusColor(a.status) }}>
                    Status: {a.status}
                  </p>
                </div>

                {/* Cancel only if pending */}
                {a.status === "pending" && (
                  <button
                    style={cancelBtn}
                    onClick={() => cancelAppointment(a.id)}
                  >
                    Cancel
                  </button>
                )}

                {/* Rebook if missed */}
                {a.status === "missed" && (
                  <button
                    style={rebookBtn}
                    onClick={() => {
                      setFormData({
                        doctorId: a.doctor_id,
                        date: "",
                        time: "",
                        problem: a.reason || ""
                      });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Rebook
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

/* ================= STYLES ================= */

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #e0f2fe, #f8fafc)",
  display: "flex",
  justifyContent: "center",
  padding: "60px 20px"
};

const card = {
  width: "900px",
  background: "#ffffff",
  borderRadius: "18px",
  padding: "40px",
  boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
  display: "flex",
  flexDirection: "column",
  gap: "25px"
};

const title = {
  textAlign: "center",
  fontSize: "26px",
  fontWeight: "700",
  color: "#0f172a"
};

const statusMsg = {
  textAlign: "center",
  color: "#16a34a",
  fontWeight: "500",
  background: "#ecfdf5",
  padding: "8px",
  borderRadius: "8px"
};

const form = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px"
};

const field = {
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  fontSize: "14px",
  background: "#f8fafc"
};

const btn = {
  gridColumn: "span 2",
  padding: "14px",
  background: "#0f172a",
  color: "#ffffff",
  borderRadius: "12px",
  border: "none",
  fontWeight: "600",
  cursor: "pointer"
};

const apptList = {
  marginTop: "30px",
  display: "flex",
  flexDirection: "column",
  gap: "18px"
};

const apptCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  borderRadius: "14px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc"
};

const apptSub = {
  fontSize: "13px",
  color: "#64748b",
  marginTop: "4px"
};

const cancelBtn = {
  padding: "8px 16px",
  background: "#fee2e2",
  color: "#991b1b",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer"
};

const rebookBtn = {
  padding: "8px 16px",
  background: "#dbeafe",
  color: "#1e40af",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer"
};

export default Appointments;