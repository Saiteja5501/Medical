
import React, { useEffect, useState, useCallback } from "react";
import API from "../api";

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FORMATTERS ================= */

  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    return dateStr.includes("T")
      ? dateStr.split("T")[0]
      : dateStr;
  };

  const formatTime = (time) => {
    if (!time) return "";

    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);

    return `${hour % 12 || 12}:${m} ${
      hour >= 12 ? "PM" : "AM"
    }`;
  };

  const formatBookedAt = (datetime) => {
    if (!datetime) return "";

    if (datetime instanceof Date) {
      const yyyy = datetime.getFullYear();
      const mm = String(datetime.getMonth() + 1).padStart(2, "0");
      const dd = String(datetime.getDate()).padStart(2, "0");

      let hour = datetime.getHours();
      const minute = String(datetime.getMinutes()).padStart(2, "0");
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;

      return `${yyyy}-${mm}-${dd} ${hour}:${minute} ${ampm}`;
    }

    if (typeof datetime === "string") {
      const [date, time] = datetime.split(" ");

      if (!time) return date;

      const [h, m] = time.split(":");
      const hour = parseInt(h, 10);

      return `${date} ${hour % 12 || 12}:${m} ${
        hour >= 12 ? "PM" : "AM"
      }`;
    }

    return "";
  };

  /* ================= FETCH APPOINTMENTS ================= */

  const fetchAppointments = useCallback(async () => {
    setLoading(true);

    try {
      const response = await API.get("/appointments/admin/all");
      const data = response.data;

      setAppointments(
        data.success ? data.appointments : []
      );

      setMessage("");
    } catch (error) {
      console.error(
        "Fetch appointments error:",
        error.response?.data || error.message
      );

      setAppointments([]);

      setMessage(
        error.response?.data?.message ||
        "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* ================= CANCEL APPOINTMENT ================= */

  const cancelAppointment = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      const response = await API.put(
        `/appointments/${id}/cancel`
      );

      const data = response.data;

      if (data.success) {
        setMessage("Appointment cancelled successfully");
        await fetchAppointments();
      } else {
        setMessage(
          data.message || "Unable to cancel appointment"
        );
      }
    } catch (error) {
      console.error(
        "Cancel appointment error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
        "Unable to cancel appointment"
      );
    }
  };

  /* ================= FILTER + SEARCH ================= */

  const filtered = appointments.filter((a) => {
    const patientName = (a.patient_name || "").toLowerCase();
    const doctorName = (a.doctor_name || "").toLowerCase();
    const searchText = search.toLowerCase();

    return (
      (patientName.includes(searchText) ||
        doctorName.includes(searchText)) &&
      (statusFilter ? a.status === statusFilter : true)
    );
  });

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filtered.length / limit);

  const paginated = filtered.slice(
    (page - 1) * limit,
    page * limit
  );

  /* ================= RESET PAGE ON FILTER ================= */

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  /* ================= STATUS COUNTS ================= */

  const pendingCount = appointments.filter(
    (a) => a.status === "pending"
  ).length;

  const approvedCount = appointments.filter(
    (a) => a.status === "approved"
  ).length;

  const completedCount = appointments.filter(
    (a) => a.status === "completed"
  ).length;

  return (
    <div style={pageStyle}>

      {/* ================= HEADER ================= */}

      <div style={headerRow}>
        <div>
          <h2 style={titleStyle}>All Appointments</h2>
          <p style={subtitleStyle}>
            Monitor and manage patient appointments across HealthWave.
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          disabled={loading}
          style={{
            ...refreshBtn,
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* ================= SUMMARY CARDS ================= */}

      <div style={statsGrid}>
        <div style={statCard}>
          <span style={statLabel}>Total Appointments</span>
          <h3 style={statValue}>{appointments.length}</h3>
          <span style={statIcon}>📅</span>
        </div>

        <div style={statCard}>
          <span style={statLabel}>Pending</span>
          <h3 style={{ ...statValue, color: "#F5C76A" }}>
            {pendingCount}
          </h3>
          <span style={statIcon}>⏳</span>
        </div>

        <div style={statCard}>
          <span style={statLabel}>Approved</span>
          <h3 style={{ ...statValue, color: "#64DDA6" }}>
            {approvedCount}
          </h3>
          <span style={statIcon}>✓</span>
        </div>

        <div style={statCard}>
          <span style={statLabel}>Completed</span>
          <h3 style={{ ...statValue, color: "#77BDF2" }}>
            {completedCount}
          </h3>
          <span style={statIcon}>✔</span>
        </div>
      </div>

      {/* ================= MESSAGE ================= */}

      {message && (
        <div style={messageStyle}>
          {message}

          <button
            onClick={() => setMessage("")}
            style={closeMessageBtn}
          >
            ×
          </button>
        </div>
      )}

      {/* ================= SEARCH AND FILTER ================= */}

      <div style={filterCard}>
        <div style={searchWrapper}>
          <span style={searchIcon}>⌕</span>

          <input
            style={searchInput}
            placeholder="Search by patient or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          style={filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="missed">Missed</option>
        </select>
      </div>

      {/* ================= APPOINTMENTS TABLE ================= */}

      <div style={tableCard}>
        <div style={tableHeader}>
          <div>
            <h3 style={tableTitle}>Appointment Records</h3>
            <p style={tableSubtitle}>
              {filtered.length} appointment(s) found
            </p>
          </div>
        </div>

        <div style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr style={theadRow}>
                <th style={th}>Patient</th>
                <th style={th}>Doctor</th>
                <th style={th}>Date</th>
                <th style={th}>Time</th>
                <th style={th}>Booked At</th>
                <th style={th}>Status</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={empty}>
                    Loading appointments...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="7" style={empty}>
                    <div style={{ fontSize: "30px", marginBottom: "10px" }}>
                      📅
                    </div>
                    No appointments found
                  </td>
                </tr>
              ) : (
                paginated.map((a) => (
                  <tr key={a.id} style={tr}>
                    <td style={td}>
                      <div style={nameCell}>
                        <div style={avatar}>
                          {(a.patient_name || "P")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span style={personName}>
                          {a.patient_name || "—"}
                        </span>
                      </div>
                    </td>

                    <td style={td}>
                      <span style={doctorName}>
                        {a.doctor_name || "—"}
                      </span>
                    </td>

                    <td style={td}>
                      {formatDate(a.date)}
                    </td>

                    <td style={td}>
                      {formatTime(a.time)}
                    </td>

                    <td style={td}>
                      {formatBookedAt(a.booked_at)}
                    </td>

                    <td style={td}>
                      <span style={statusBadge(a.status)}>
                        {a.status}
                      </span>
                    </td>

                    <td style={td}>
                      {["pending", "approved"].includes(a.status) ? (
                        <button
                          style={cancelBtn}
                          onClick={() => cancelAppointment(a.id)}
                        >
                          Cancel
                        </button>
                      ) : (
                        <span style={noAction}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}

        <div style={pagination}>
          <span style={pageInfo}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * limit + 1}
            {" - "}
            {Math.min(page * limit, filtered.length)} of {filtered.length}
          </span>

          <div style={paginationControls}>
            <button
              style={{
                ...pageBtn,
                opacity: page === 1 ? 0.4 : 1
              }}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>

            <span style={currentPage}>
              {page} / {totalPages || 1}
            </span>

            <button
              style={{
                ...pageBtn,
                opacity:
                  page >= totalPages || totalPages === 0 ? 0.4 : 1
              }}
              disabled={page >= totalPages || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= FULL-PAGE DARK HEALTHWAVE STYLES ================= */

const pageStyle = {
  width: "100%",
  minWidth: 0,
  minHeight: "100vh",
  margin: 0,
  padding: "30px",
  background: "#0B0D0E",
  fontFamily: "Segoe UI, system-ui, sans-serif",
  color: "#E8EEEE",
  boxSizing: "border-box"
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap",
  marginBottom: "28px"
};

const titleStyle = {
  fontSize: "27px",
  fontWeight: "700",
  margin: "0 0 7px",
  color: "#E8EEEE"
};

const subtitleStyle = {
  fontSize: "14px",
  color: "#899497",
  margin: 0
};

const refreshBtn = {
  padding: "10px 17px",
  background: "#153B36",
  border: "1px solid #245B52",
  borderRadius: "8px",
  color: "#20DCC0",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "18px",
  marginBottom: "25px"
};

const statCard = {
  position: "relative",
  padding: "22px",
  background: "#181C1D",
  border: "1px solid #293333",
  borderRadius: "13px",
  overflow: "hidden"
};

const statLabel = {
  fontSize: "13px",
  color: "#899497",
  fontWeight: "500"
};

const statValue = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#20DCC0",
  margin: "12px 0 0"
};

const statIcon = {
  position: "absolute",
  right: "20px",
  top: "22px",
  fontSize: "22px",
  opacity: 0.7
};

const messageStyle = {
  padding: "13px 16px",
  marginBottom: "20px",
  borderRadius: "8px",
  background: "#142B23",
  border: "1px solid #245C45",
  color: "#64DDA6",
  fontSize: "14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const closeMessageBtn = {
  border: "none",
  background: "transparent",
  color: "#64DDA6",
  fontSize: "20px",
  cursor: "pointer"
};

const filterCard = {
  display: "flex",
  gap: "14px",
  flexWrap: "wrap",
  padding: "18px",
  background: "#181C1D",
  border: "1px solid #293333",
  borderRadius: "12px",
  marginBottom: "22px"
};

const searchWrapper = {
  flex: 1,
  minWidth: "220px",
  position: "relative"
};

const searchIcon = {
  position: "absolute",
  left: "13px",
  top: "9px",
  color: "#899497",
  fontSize: "20px"
};

const searchInput = {
  width: "100%",
  padding: "11px 12px 11px 40px",
  borderRadius: "8px",
  border: "1px solid #303B3B",
  background: "#101515",
  color: "#E8EEEE",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box"
};

const filterSelect = {
  minWidth: "160px",
  padding: "11px 14px",
  borderRadius: "8px",
  border: "1px solid #303B3B",
  background: "#101515",
  color: "#E8EEEE",
  fontSize: "13px",
  outline: "none"
};

const tableCard = {
  width: "100%",
  background: "#181C1D",
  border: "1px solid #293333",
  borderRadius: "13px",
  overflow: "hidden",
  boxSizing: "border-box"
};

const tableHeader = {
  padding: "20px 22px",
  borderBottom: "1px solid #293333"
};

const tableTitle = {
  fontSize: "17px",
  color: "#E8EEEE",
  margin: "0 0 5px",
  fontWeight: "650"
};

const tableSubtitle = {
  fontSize: "12px",
  color: "#899497",
  margin: 0
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto"
};

const table = {
  width: "100%",
  minWidth: "950px",
  borderCollapse: "collapse"
};

const theadRow = {
  background: "#202627"
};

const th = {
  padding: "15px 14px",
  fontSize: "12px",
  fontWeight: "600",
  textAlign: "left",
  color: "#AAB5B5",
  whiteSpace: "nowrap"
};

const tr = {
  borderBottom: "1px solid #293333"
};

const td = {
  padding: "15px 14px",
  fontSize: "13px",
  color: "#C9D3D3",
  whiteSpace: "nowrap"
};

const nameCell = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const avatar = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  background: "#153B36",
  color: "#20DCC0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
  fontWeight: "700"
};

const personName = {
  color: "#E8EEEE",
  fontWeight: "600"
};

const doctorName = {
  color: "#AAB5B5"
};

const empty = {
  padding: "40px 20px",
  textAlign: "center",
  fontSize: "14px",
  color: "#899497"
};

const noAction = {
  color: "#647173"
};

const cancelBtn = {
  padding: "7px 14px",
  fontSize: "12px",
  borderRadius: "7px",
  border: "1px solid #653333",
  cursor: "pointer",
  background: "#301C1C",
  color: "#FF8585",
  fontWeight: "600"
};

const pagination = {
  padding: "17px 22px",
  borderTop: "1px solid #293333",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap"
};

const pageInfo = {
  fontSize: "12px",
  color: "#899497"
};

const paginationControls = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const currentPage = {
  fontSize: "13px",
  color: "#20DCC0",
  fontWeight: "600"
};

const pageBtn = {
  padding: "8px 13px",
  borderRadius: "7px",
  border: "1px solid #303B3B",
  background: "#202627",
  color: "#C9D3D3",
  fontSize: "12px",
  cursor: "pointer"
};

const statusBadge = (s) => {
  const styles = {
    pending: {
      background: "#382F1A",
      color: "#F5C76A"
    },
    approved: {
      background: "#203A34",
      color: "#64DDA6"
    },
    completed: {
      background: "#1C3040",
      color: "#77BDF2"
    },
    rejected: {
      background: "#3B2424",
      color: "#FF8585"
    },
    missed: {
      background: "#3B2424",
      color: "#FF8585"
    }
  };

  return {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "capitalize",
    ...(
      styles[s] || {
        background: "#293333",
        color: "#AAB5B5"
      }
    )
  };
};

export default AdminAppointments;
