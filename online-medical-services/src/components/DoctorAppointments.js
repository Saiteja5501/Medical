
import React, { useState, useEffect, useCallback, useMemo } from "react";
import API from "../api";

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Medical history form states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [savingHistory, setSavingHistory] = useState(false);
  const [savedAppointmentIds, setSavedAppointmentIds] = useState([]);

  const doctorId = sessionStorage.getItem("userId");

  /* ================= FETCH APPOINTMENTS ================= */

  const fetchAppointments = useCallback(async () => {
    if (!doctorId) {
      setLoading(false);
      setStatusMessage("Doctor ID not found. Please log in again.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await API.get(`/appointments/doctor/${doctorId}`);
      const data = response.data;

      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        setAppointments([]);
        setStatusMessage(data.message || "Unable to load appointments");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      setAppointments([]);
      setStatusMessage(
        error.response?.data?.message || "Failed to load appointments"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* ================= APPOINTMENT COUNTS ================= */

  const counts = useMemo(() => {
    const result = {
      total: appointments.length,
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0,
      missed: 0
    };

    appointments.forEach((appointment) => {
      const status = String(appointment.status || "").toLowerCase();

      if (Object.prototype.hasOwnProperty.call(result, status)) {
        result[status]++;
      }
    });

    return result;
  }, [appointments]);

  /* ================= SEARCH AND FILTER ================= */

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        String(appointment.patient_name || "").toLowerCase().includes(search) ||
        String(appointment.patient_id || "").toLowerCase().includes(search) ||
        String(appointment.problem || "").toLowerCase().includes(search);

      const status = String(appointment.status || "").toLowerCase();

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      const appointmentDate = String(appointment.date || "").slice(0, 10);
      const matchesDate =
        !dateFilter || appointmentDate === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  /* ================= UPDATE APPOINTMENT STATUS ================= */

  const updateStatus = async (id, status) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark this appointment as ${status}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);
      setStatusMessage("");

      const response = await API.put(`/appointments/${id}/status`, {
        status
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Status update failed");
      }

      setStatusMessage(`Appointment ${status} successfully`);
      setMessageType("success");

      await fetchAppointments();
    } catch (error) {
      console.error(
        "Status update error:",
        error.response?.data || error.message
      );

      setStatusMessage(
        error.response?.data?.message ||
        error.message ||
        "Status update failed"
      );
      setMessageType("error");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================= MEDICAL HISTORY FORM ================= */

  const openHistoryForm = (appointment) => {
    setSelectedAppointment(appointment);
    setDiagnosis("");
    setTreatment("");
    setNotes("");
    setStatusMessage("");
  };

  const closeHistoryForm = () => {
    if (savingHistory) return;

    setSelectedAppointment(null);
    setDiagnosis("");
    setTreatment("");
    setNotes("");
  };

  const saveMedicalHistory = async (e) => {
    e.preventDefault();

    if (!selectedAppointment) return;

    if (!diagnosis.trim() || !treatment.trim()) {
      setStatusMessage("Diagnosis and treatment are required");
      setMessageType("error");
      return;
    }

    try {
      setSavingHistory(true);
      setStatusMessage("");

      const response = await API.post("/medical-history", {
        appointmentId: selectedAppointment.id,
        diagnosis: diagnosis.trim(),
        treatment: treatment.trim(),
        notes: notes.trim()
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Unable to save medical history");
      }

      setSavedAppointmentIds((previous) => [
        ...previous,
        selectedAppointment.id
      ]);

      setStatusMessage("Medical history saved successfully");
      setMessageType("success");

      setSelectedAppointment(null);
      setDiagnosis("");
      setTreatment("");
      setNotes("");
    } catch (error) {
      console.error(
        "Medical history save error:",
        error.response?.data || error.message
      );

      setStatusMessage(
        error.response?.data?.message ||
        error.message ||
        "Unable to save medical history"
      );
      setMessageType("error");
    } finally {
      setSavingHistory(false);
    }
  };

  /* ================= FORMAT DATE AND TIME ================= */

  const formatDate = (date) => {
    if (!date) return "—";

    const value = String(date).slice(0, 10);
    const parts = value.split("-");

    if (parts.length !== 3) return value;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const formatTime = (time) => {
    if (!time) return "—";

    const [h, m] = String(time).split(":");
    const hour = parseInt(h, 10);

    if (Number.isNaN(hour)) return time;

    return `${hour % 12 || 12}:${m || "00"} ${
      hour >= 12 ? "PM" : "AM"
    }`;
  };

  /* ================= STATUS BADGE ================= */

  const getBadgeStyle = (status) => {
    const colors = {
      pending: { bg: "#3d321c", color: "#fbbf24" },
      approved: { bg: "#173b32", color: "#4ade80" },
      completed: { bg: "#153b42", color: "#4dd4c0" },
      rejected: { bg: "#40252c", color: "#fb7185" },
      missed: { bg: "#402c20", color: "#fdba74" }
    };

    const selected = colors[String(status || "").toLowerCase()] || {
      bg: "#273449",
      color: "#cbd5e1"
    };

    return {
      background: selected.bg,
      color: selected.color,
      padding: "6px 11px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "capitalize",
      display: "inline-block"
    };
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("");
  };

  return (
    <div style={page}>
      <div style={container}>

        {/* HEADER */}

        <div style={header}>
          <div>
            <div style={eyebrow}>DOCTOR PORTAL</div>
            <h2 style={title}>Patient Appointments</h2>
            <p style={subtitle}>
              Manage appointments and maintain patient medical records.
            </p>
          </div>

          <button
            onClick={fetchAppointments}
            disabled={loading}
            style={{
              ...refreshButton,
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* MESSAGE */}

        {statusMessage && (
          <div
            style={{
              ...messageBox,
              background:
                messageType === "error" ? "#40252c" : "#173b32",
              color:
                messageType === "error" ? "#fb7185" : "#4ade80"
            }}
          >
            {statusMessage}
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div style={statsGrid}>
          <StatCard label="Total Appointments" value={counts.total} color="#4dd4c0" />
          <StatCard label="Pending" value={counts.pending} color="#fbbf24" />
          <StatCard label="Approved" value={counts.approved} color="#4ade80" />
          <StatCard label="Completed" value={counts.completed} color="#4dd4c0" />
          <StatCard label="Rejected" value={counts.rejected} color="#fb7185" />
          <StatCard label="Missed" value={counts.missed} color="#fdba74" />
        </div>

        {/* APPOINTMENT TABLE */}

        <div style={card}>
          <div style={cardHeader}>
            <div>
              <h3 style={sectionTitle}>Appointment List</h3>
              <p style={sectionSubtitle}>
                Search, filter, and manage your patient appointments.
              </p>
            </div>

            <div style={countBadge}>
              Showing {filteredAppointments.length} of {appointments.length}
            </div>
          </div>

          {/* FILTERS */}

          <div style={filterGrid}>
            <div>
              <label style={filterLabel}>Search appointments</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Patient name, ID or problem..."
                style={filterInput}
              />
            </div>

            <div>
              <label style={filterLabel}>Filter by status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={filterInput}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="missed">Missed</option>
              </select>
            </div>

            <div>
              <label style={filterLabel}>Filter by date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={filterInput}
              />
            </div>

            <div style={clearFilterWrapper}>
              <button onClick={clearFilters} style={clearButton}>
                Clear Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div style={stateBox}>Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div style={stateBox}>
              <div style={emptyIcon}>📅</div>
              <h3 style={emptyTitle}>
                {appointments.length === 0
                  ? "No appointments found"
                  : "No matching appointments"}
              </h3>
              <p style={subtitle}>
                {appointments.length === 0
                  ? "New patient appointments will appear here."
                  : "Try changing your search or filters."}
              </p>
            </div>
          ) : (
            <div style={tableWrapper}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Patient</th>
                    <th style={th}>Problem</th>
                    <th style={th}>Date</th>
                    <th style={th}>Time</th>
                    <th style={th}>Status</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map((a) => {
                    const status = String(a.status || "").toLowerCase();
                    const isUpdating = updatingId === a.id;

                    return (
                      <tr key={a.id}>
                        <td style={td}>
                          <div style={patientName}>
                            {a.patient_name || "Patient"}
                          </div>
                          <div style={patientId}>
                            ID: {a.patient_id || "—"}
                          </div>
                        </td>

                        <td style={td}>{a.problem || "—"}</td>
                        <td style={td}>{formatDate(a.date)}</td>
                        <td style={td}>{formatTime(a.time)}</td>

                        <td style={td}>
                          <span style={getBadgeStyle(status)}>
                            {status || "Unknown"}
                          </span>
                        </td>

                        <td style={td}>
                          {status === "pending" && (
                            <div style={actionGroup}>
                              <button
                                disabled={isUpdating}
                                onClick={() => updateStatus(a.id, "approved")}
                                style={btnApprove}
                              >
                                {isUpdating ? "Updating..." : "Approve"}
                              </button>

                              <button
                                disabled={isUpdating}
                                onClick={() => updateStatus(a.id, "rejected")}
                                style={btnReject}
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {status === "approved" && (
                            <div style={actionGroup}>
                              <button
                                disabled={isUpdating}
                                onClick={() => updateStatus(a.id, "completed")}
                                style={btnComplete}
                              >
                                {isUpdating ? "Updating..." : "Complete"}
                              </button>

                              <button
                                disabled={isUpdating}
                                onClick={() => updateStatus(a.id, "missed")}
                                style={btnMissed}
                              >
                                Mark Missed
                              </button>
                            </div>
                          )}

                          {status === "completed" && (
                            savedAppointmentIds.includes(a.id) ? (
                              <span style={savedLabel}>
                                ✓ History Added
                              </span>
                            ) : (
                              <button
                                onClick={() => openHistoryForm(a)}
                                style={btnHistory}
                              >
                                + Add Medical History
                              </button>
                            )
                          )}

                          {(status === "rejected" || status === "missed") && (
                            <span style={mutedText}>No actions</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MEDICAL HISTORY MODAL */}

      {selectedAppointment && (
        <div style={modalOverlay}>
          <div style={modal}>
            <div style={modalHeader}>
              <div>
                <div style={eyebrow}>PATIENT MEDICAL RECORD</div>
                <h2 style={modalTitle}>Add Medical History</h2>
                <p style={modalSubtitle}>
                  Enter the details of the completed consultation.
                </p>
              </div>

              <button
                onClick={closeHistoryForm}
                disabled={savingHistory}
                style={closeButton}
              >
                ×
              </button>
            </div>

            <div style={patientInfo}>
              <div>
                <span style={infoLabel}>Patient</span>
                <strong style={infoValue}>
                  {selectedAppointment.patient_name || "Patient"}
                </strong>
              </div>

              <div>
                <span style={infoLabel}>Appointment ID</span>
                <strong style={infoValue}>
                  #{selectedAppointment.id}
                </strong>
              </div>

              <div>
                <span style={infoLabel}>Date</span>
                <strong style={infoValue}>
                  {formatDate(selectedAppointment.date)}
                </strong>
              </div>
            </div>

            <form onSubmit={saveMedicalHistory}>
              <div style={formGroup}>
                <label style={label}>
                  Diagnosis <span style={required}>*</span>
                </label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter the patient's diagnosis..."
                  required
                  rows={3}
                  style={textarea}
                />
              </div>

              <div style={formGroup}>
                <label style={label}>
                  Treatment <span style={required}>*</span>
                </label>
                <textarea
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Enter the recommended treatment..."
                  required
                  rows={3}
                  style={textarea}
                />
              </div>

              <div style={formGroup}>
                <label style={label}>Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add observations or follow-up instructions (optional)..."
                  rows={3}
                  style={textarea}
                />
              </div>

              <div style={formActions}>
                <button
                  type="button"
                  onClick={closeHistoryForm}
                  disabled={savingHistory}
                  style={cancelButton}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingHistory}
                  style={{
                    ...saveButton,
                    opacity: savingHistory ? 0.6 : 1
                  }}
                >
                  {savingHistory ? "Saving..." : "Save Medical History"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SUMMARY CARD ================= */

function StatCard({ label, value, color }) {
  return (
    <div style={statCard}>
      <div style={{ ...statIndicator, background: color }} />
      <div style={statLabel}>{label}</div>
      <div style={{ ...statValue, color }}>{value}</div>
    </div>
  );
}


/* ================= DARK HEALTHWAVE STYLES ================= */

const page = {
  minHeight: "100vh",
  width: "100%",
  boxSizing: "border-box",
  padding: "32px",
  background: "#0B0D0E",
  color: "#E8EEEE",
  fontFamily: "Arial, sans-serif"
};

const container = {
  maxWidth: "1450px",
  margin: "0 auto"
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "16px",
  marginBottom: "28px"
};

const eyebrow = {
  color: "#20DCC0",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "2px",
  marginBottom: "9px"
};

const title = {
  fontSize: "27px",
  margin: "0 0 8px",
  color: "#F1F5F5"
};

const subtitle = {
  color: "#899497",
  fontSize: "14px",
  margin: 0,
  lineHeight: 1.6
};

const refreshButton = {
  padding: "11px 18px",
  borderRadius: "8px",
  border: "1px solid #303B3B",
  background: "#181C1D",
  color: "#20DCC0",
  cursor: "pointer",
  fontWeight: "600"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))",
  gap: "15px",
  marginBottom: "25px"
};

const statCard = {
  position: "relative",
  background: "#181C1D",
  border: "1px solid #293333",
  borderRadius: "12px",
  padding: "20px",
  overflow: "hidden"
};

const statIndicator = {
  width: "30px",
  height: "4px",
  borderRadius: "5px",
  marginBottom: "14px"
};

const statLabel = {
  color: "#899497",
  fontSize: "12px",
  marginBottom: "9px"
};

const statValue = {
  fontSize: "27px",
  fontWeight: "700"
};

const card = {
  background: "#181C1D",
  border: "1px solid #293333",
  borderRadius: "14px",
  padding: "24px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.2)"
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px",
  marginBottom: "22px"
};

const sectionTitle = {
  margin: "0 0 7px",
  color: "#F1F5F5",
  fontSize: "18px"
};

const sectionSubtitle = {
  margin: 0,
  color: "#899497",
  fontSize: "13px"
};

const countBadge = {
  padding: "8px 12px",
  background: "#153A35",
  color: "#20DCC0",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600"
};

const messageBox = {
  padding: "13px 16px",
  borderRadius: "8px",
  marginBottom: "20px",
  fontSize: "14px"
};

const filterGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "15px",
  alignItems: "end",
  padding: "17px",
  background: "#101515",
  border: "1px solid #293333",
  borderRadius: "10px",
  marginBottom: "22px"
};

const filterLabel = {
  display: "block",
  color: "#899497",
  fontSize: "12px",
  marginBottom: "8px"
};

const filterInput = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  background: "#181C1D",
  border: "1px solid #354242",
  borderRadius: "7px",
  color: "#E8EEEE",
  fontSize: "13px",
  outline: "none"
};

const clearFilterWrapper = {
  display: "flex",
  alignItems: "end"
};

const clearButton = {
  width: "100%",
  padding: "11px 13px",
  background: "#252D2D",
  color: "#C2CCCC",
  border: "1px solid #3A4747",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "13px"
};

const stateBox = {
  padding: "55px 20px",
  textAlign: "center",
  color: "#899497"
};

const emptyIcon = {
  fontSize: "35px",
  marginBottom: "12px"
};

const emptyTitle = {
  color: "#E2EAEA",
  fontSize: "18px",
  margin: "0 0 8px"
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "900px"
};

const th = {
  padding: "15px 12px",
  textAlign: "left",
  color: "#899497",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  borderBottom: "1px solid #303B3B",
  whiteSpace: "nowrap"
};

const td = {
  padding: "17px 12px",
  textAlign: "left",
  color: "#C5CECE",
  fontSize: "13px",
  borderBottom: "1px solid #283232",
  verticalAlign: "middle"
};

const patientName = {
  color: "#F1F5F5",
  fontWeight: "600",
  marginBottom: "5px"
};

const patientId = {
  color: "#899497",
  fontSize: "11px"
};

const actionGroup = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px"
};

const btnApprove = {
  padding: "8px 11px",
  background: "#153A35",
  color: "#20DCC0",
  border: "1px solid #216B60",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px"
};

const btnReject = {
  padding: "8px 11px",
  background: "#40252C",
  color: "#FB7185",
  border: "1px solid #814052",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px"
};

const btnComplete = {
  padding: "8px 11px",
  background: "#153A35",
  color: "#20DCC0",
  border: "1px solid #216B60",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px"
};

const btnMissed = {
  padding: "8px 11px",
  background: "#402C20",
  color: "#FDBA74",
  border: "1px solid #80502C",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px"
};

const btnHistory = {
  padding: "9px 12px",
  background: "#153A35",
  color: "#20DCC0",
  border: "1px solid #216B60",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
  whiteSpace: "nowrap"
};

const savedLabel = {
  color: "#20DCC0",
  fontSize: "12px",
  fontWeight: "600",
  whiteSpace: "nowrap"
};

const mutedText = {
  color: "#899497",
  fontSize: "12px"
};

/* ================= MODAL STYLES ================= */

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.82)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1000,
  overflowY: "auto"
};

const modal = {
  width: "100%",
  maxWidth: "600px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#181C1D",
  border: "1px solid #354242",
  borderRadius: "16px",
  padding: "28px",
  boxSizing: "border-box",
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "15px",
  marginBottom: "22px"
};

const modalTitle = {
  color: "#F1F5F5",
  fontSize: "23px",
  margin: "0 0 7px"
};

const modalSubtitle = {
  color: "#899497",
  fontSize: "13px",
  margin: 0
};

const closeButton = {
  background: "#252D2D",
  border: "none",
  color: "#C2CCCC",
  borderRadius: "7px",
  width: "32px",
  height: "32px",
  fontSize: "23px",
  cursor: "pointer",
  lineHeight: "1"
};

const patientInfo = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "12px",
  padding: "15px",
  background: "#101515",
  border: "1px solid #303B3B",
  borderRadius: "9px",
  marginBottom: "23px"
};

const infoLabel = {
  display: "block",
  color: "#899497",
  fontSize: "11px",
  marginBottom: "6px"
};

const infoValue = {
  display: "block",
  color: "#E2EAEA",
  fontSize: "13px"
};

const formGroup = {
  marginBottom: "19px"
};

const label = {
  display: "block",
  color: "#DCE5E5",
  fontSize: "13px",
  fontWeight: "600",
  marginBottom: "9px"
};

const required = {
  color: "#FB7185"
};

const textarea = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  background: "#101515",
  border: "1px solid #354242",
  borderRadius: "8px",
  color: "#E8EEEE",
  fontSize: "13px",
  fontFamily: "Arial, sans-serif",
  lineHeight: 1.6,
  resize: "vertical",
  outline: "none"
};

const formActions = {
  display: "flex",
  justifyContent: "flex-end",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "25px"
};

const cancelButton = {
  padding: "11px 17px",
  background: "#252D2D",
  color: "#C2CCCC",
  border: "1px solid #405050",
  borderRadius: "7px",
  cursor: "pointer"
};

const saveButton = {
  padding: "11px 18px",
  background: "#20DCC0",
  color: "#071A18",
  border: "none",
  borderRadius: "7px",
  fontWeight: "700",
  cursor: "pointer"
};


export default DoctorAppointments;
