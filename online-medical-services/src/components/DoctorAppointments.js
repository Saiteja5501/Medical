import React, { useState, useEffect, useCallback } from "react";

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // ✅ FIXED HERE
  const doctorId = sessionStorage.getItem("userId");

  /* ================= FETCH ================= */

  const fetchAppointments = useCallback(async () => {
    if (!doctorId) {
      console.log("Doctor ID not found in sessionStorage");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/appointments/doctor/${doctorId}`
      );

      const data = await res.json();

      if (data.success) {
        setAppointments(data.appointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setStatusMessage("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      const res = await fetch(
        `http://localhost:5000/appointments/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        }
      );

      const data = await res.json();

      if (!data.success) throw new Error();

      setStatusMessage(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch {
      setStatusMessage("Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case "pending":
        return { background: "#fef3c7", padding: "4px 10px", borderRadius: "6px" };
      case "approved":
        return { background: "#dcfce7", padding: "4px 10px", borderRadius: "6px" };
      case "completed":
        return { background: "#dbeafe", padding: "4px 10px", borderRadius: "6px" };
      case "rejected":
        return { background: "#fee2e2", padding: "4px 10px", borderRadius: "6px" };
      case "missed":
        return { background: "#fecaca", padding: "4px 10px", borderRadius: "6px" };
      default:
        return { padding: "4px 10px" };
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={title}>Patient Appointments</h2>

        {statusMessage && <div style={statusMsg}>{statusMessage}</div>}

        {loading ? (
          <div style={stateBox}>Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div style={stateBox}>No appointments found</div>
        ) : (
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
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td style={td}>{a.patient_name}</td>
                  <td style={td}>{a.problem || "—"}</td>
                  <td style={td}>{a.date}</td>
                  <td style={td}>{formatTime(a.time)}</td>
                  <td style={td}>
                    <span style={getBadgeStyle(a.status)}>
                      {a.status}
                    </span>
                  </td>
                  <td style={td}>
                    {a.status === "pending" && (
                      <>
                        <button
                          disabled={updatingId === a.id}
                          onClick={() => updateStatus(a.id, "approved")}
                          style={btnApprove}
                        >
                          Approve
                        </button>

                        <button
                          disabled={updatingId === a.id}
                          onClick={() => updateStatus(a.id, "rejected")}
                          style={btnReject}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {a.status === "approved" && (
                      <button
                        disabled={updatingId === a.id}
                        onClick={() => updateStatus(a.id, "completed")}
                        style={btnComplete}
                      >
                        Mark Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


/* ================= STYLES ================= */

const page = {
  padding: "40px",
  background: "#f1f5f9",
  minHeight: "100vh"
};

const card = {
  background: "#ffffff",
  padding: "30px",
  borderRadius: "10px"
};

const title = {
  marginBottom: "20px"
};

const statusMsg = {
  marginBottom: "15px",
  color: "#166534"
};

const stateBox = {
  padding: "40px",
  textAlign: "center"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  borderBottom: "1px solid #ddd",
  padding: "10px"
};

const td = {
  padding: "10px",
  textAlign: "center"
};

const btnApprove = {
  margin: "5px",
  padding: "6px 12px",
  background: "green",
  color: "#fff",
  border: "none",
  cursor: "pointer"
};

const btnReject = {
  margin: "5px",
  padding: "6px 12px",
  background: "red",
  color: "#fff",
  border: "none",
  cursor: "pointer"
};

const btnComplete = {
  margin: "5px",
  padding: "6px 12px",
  background: "blue",
  color: "#fff",
  border: "none",
  cursor: "pointer"
};

export default DoctorAppointments;