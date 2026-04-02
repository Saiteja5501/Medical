import React, { useEffect, useState } from "react";

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;
  const [message, setMessage] = useState("");

  /* ================= FORMATTERS (SAFE) ================= */

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

 const formatBookedAt = (datetime) => {
  if (!datetime) return "";

  // ✅ If MySQL returned Date object
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

  // ✅ If MySQL returned string
  if (typeof datetime === "string") {
    const [date, time] = datetime.split(" ");
    if (!time) return date;

    let [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    return `${date} ${hour % 12 || 12}:${m} ${
      hour >= 12 ? "PM" : "AM"
    }`;
  }

  return "";
};


  /* ================= FETCH ALL APPOINTMENTS ================= */
  const fetchAppointments = async () => {
    try {
      const res = await fetch("http://localhost:5000/appointments/admin/all");
      const data = await res.json();
      setAppointments(data.success ? data.appointments : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  /* ================= CANCEL APPOINTMENT ================= */
  const cancelAppointment = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirm) return;

    try {
      const res = await fetch(
        `http://localhost:5000/appointments/${id}/cancel`,
        { method: "PUT" }
      );
      const data = await res.json();

      if (data.success) {
        setMessage("Appointment cancelled successfully");
        fetchAppointments();
      } else {
        setMessage("Unable to cancel appointment");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FILTER + SEARCH ================= */
  const filtered = appointments.filter((a) =>
    (a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter ? a.status === statusFilter : true)
  );

  /* ================= PAGINATION ================= */
  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filtered.length / limit);

  return (
    <div style={pageStyle}>
      <h2 style={title}>All Appointments (Admin)</h2>

      {message && <p style={successMsg}>{message}</p>}

      {/* 🔍 SEARCH & FILTER */}
      <div style={filterRow}>
        <input
          style={searchInput}
          placeholder="Search by patient or doctor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* 📋 TABLE */}
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
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="7" style={empty}>
                  No appointments found
                </td>
              </tr>
            ) : (
              paginated.map((a) => (
                <tr key={a.id} style={tr}>
                  <td style={td}>{a.patient_name}</td>
                  <td style={td}>{a.doctor_name}</td>
                  <td style={td}>{formatDate(a.date)}</td>
                  <td style={td}>{formatTime(a.time)}</td>
                  <td style={td}>{formatBookedAt(a.booked_at)}</td>
                  <td style={{ ...td, fontWeight: 600 }}>
                    <span style={statusBadge(a.status)}>{a.status}</span>
                  </td>
                  <td style={td}>
                    {["pending", "accepted"].includes(a.status) && (
                      <button
                        style={cancelBtn}
                        onClick={() => cancelAppointment(a.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 PAGINATION */}
      <div style={pagination}>
        <button
          style={pageBtn}
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span style={pageInfo}>
          Page {page} of {totalPages || 1}
        </span>

        <button
          style={pageBtn}
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES (UNCHANGED) ================= */

const pageStyle = {
  minHeight: "100vh",
  padding: "40px",
  background: "#f9fafb",
  fontFamily: "Inter, system-ui, sans-serif"
};

const title = {
  fontSize: "26px",
  fontWeight: "600",
  marginBottom: "20px"
};

const successMsg = {
  marginBottom: "12px",
  color: "#166534",
  fontWeight: "500"
};

const filterRow = {
  display: "flex",
  gap: "14px",
  marginBottom: "18px"
};

const searchInput = {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #d1d5db"
};

const filterSelect = {
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #d1d5db"
};

const tableWrapper = {
  background: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  overflow: "hidden"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const theadRow = {
  backgroundColor: "#f1f5f9"
};

const th = {
  padding: "14px",
  fontSize: "13px",
  fontWeight: "600",
  textAlign: "left",
  color: "#334155"
};

const tr = {
  borderBottom: "1px solid #e5e7eb"
};

const td = {
  padding: "14px",
  fontSize: "13px",
  color: "#0f172a"
};

const empty = {
  padding: "20px",
  textAlign: "center",
  fontSize: "14px",
  color: "#64748b"
};

const cancelBtn = {
  padding: "6px 14px",
  fontSize: "12px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  background: "#fee2e2",
  color: "#991b1b",
  fontWeight: "500"
};

const pagination = {
  marginTop: "20px",
  display: "flex",
  justifyContent: "center",
  gap: "14px"
};

const pageBtn = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  cursor: "pointer"
};

const pageInfo = {
  fontSize: "14px",
  fontWeight: "500"
};

const statusBadge = (s) => ({
  padding: "6px 14px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "capitalize",
  background:
    s === "pending"
      ? "#fef3c7"
      : s === "accepted"
      ? "#dcfce7"
      : s === "completed"
      ? "#dbeafe"
      : "#fee2e2",
  color:
    s === "pending"
      ? "#92400e"
      : s === "accepted"
      ? "#166534"
      : s === "completed"
      ? "#1e40af"
      : "#991b1b"
});

export default AdminAppointments;
