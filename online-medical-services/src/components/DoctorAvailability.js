import React, { useState } from "react";

function DoctorAvailability() {
  // ✅ FIXED HERE
  const doctorId = Number(sessionStorage.getItem("userId"));

  const [date, setDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [slots, setSlots] = useState([]);
  const [saving, setSaving] = useState(false);

  const saveAvailability = async () => {
    setMsg("");
    setMsgType("");
    setSlots([]);

    if (!doctorId) {
      setMsg("Doctor not logged in");
      setMsgType("error");
      return;
    }

    if (!date || !fromTime || !toTime) {
      setMsg("Please fill all fields");
      setMsgType("error");
      return;
    }

    if (fromTime >= toTime) {
      setMsg("From time must be earlier than To time");
      setMsgType("error");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("http://localhost:5000/availability/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, date, fromTime, toTime })
      });

      const data = await res.json();

      if (data.success) {
        setMsg("Availability saved successfully");
        setMsgType("success");
        setSlots(data.slots || []);
        setFromTime("");
        setToTime("");
      } else {
        setMsg(data.message || "Error saving availability");
        setMsgType("error");
      }
    } catch {
      setMsg("Server error. Please try again.");
      setMsgType("error");
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (time) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div style={page}>
      <div style={card}>
        <div style={header}>
          <h2 style={title}>Doctor Availability</h2>
          <p style={subtitle}>Set your consultation schedule</p>
        </div>

        <div style={formGroup}>
          <label style={label}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={field}
          />
        </div>

        <div style={timeRow}>
          <div style={formGroup}>
            <label style={label}>From</label>
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              style={field}
            />
          </div>

          <div style={formGroup}>
            <label style={label}>To</label>
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              style={field}
            />
          </div>
        </div>

        {(date || fromTime || toTime) && (
          <div style={previewBox}>
            <p style={previewTitle}>Preview</p>
            <p style={previewText}>
              📅 {date || "—"} <br />
              ⏰{" "}
              {fromTime && toTime
                ? `${formatTime(fromTime)} → ${formatTime(toTime)}`
                : "—"}
            </p>
          </div>
        )}

        <button
          onClick={saveAvailability}
          disabled={saving}
          style={{
            ...btn,
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? "Saving..." : "Save Availability"}
        </button>

        {msg && (
          <div
            style={{
              ...msgStyle,
              background:
                msgType === "success" ? "#ecfdf5" : "#fef2f2",
              color:
                msgType === "success" ? "#065f46" : "#991b1b"
            }}
          >
            {msg}
          </div>
        )}

        {slots.length > 0 && (
          <div style={slotsBox}>
            <p style={slotsTitle}>Created Consultation Slots</p>
            <div style={slotsGrid}>
              {slots.map((s, i) => (
                <span key={i} style={slotPill}>
                  {formatTime(s)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= CLEAN PROFESSIONAL STYLES ================= */

const page = {
  minHeight: "100vh",
  background: "#eef2f7",
  padding: "40px",
  display: "flex",
  justifyContent: "center",
  fontFamily: "Inter, system-ui"
};

const card = {
  background: "#ffffff",
  width: "460px",
  borderRadius: "22px",
  padding: "34px",
  boxShadow: "0 25px 50px rgba(0,0,0,0.08)"
};

const header = {
  textAlign: "center",
  marginBottom: "22px"
};

const title = {
  fontSize: "28px",
  fontWeight: "700",
  margin: 0,
  color: "#0f172a"
};

const subtitle = {
  fontSize: "14px",
  color: "#64748b",
  marginTop: "6px"
};

const formGroup = { marginBottom: "16px" };

const label = {
  fontSize: "13px",
  fontWeight: "600",
  marginBottom: "6px",
  display: "block",
  color: "#475569"
};

const timeRow = {
  display: "flex",
  gap: "14px"
};

const field = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "14px"
};

const previewBox = {
  background: "#f8fafc",
  border: "1px dashed #cbd5e1",
  borderRadius: "14px",
  padding: "14px",
  marginBottom: "18px"
};

const previewTitle = {
  fontSize: "13px",
  fontWeight: "600",
  marginBottom: "6px",
  color: "#475569"
};

const previewText = {
  fontSize: "14px",
  color: "#0f172a",
  lineHeight: 1.6
};

const btn = {
  width: "100%",
  padding: "14px",
  background: "#0f172a",
  color: "#ffffff",
  border: "none",
  borderRadius: "14px",
  fontSize: "15px",
  fontWeight: "600"
};

const msgStyle = {
  marginTop: "16px",
  padding: "12px",
  borderRadius: "12px",
  textAlign: "center",
  fontWeight: "500",
  fontSize: "14px"
};

const slotsBox = {
  marginTop: "24px",
  background: "#f8fafc",
  padding: "18px",
  borderRadius: "16px",
  border: "1px solid #e5e7eb"
};

const slotsTitle = {
  fontWeight: "600",
  marginBottom: "12px",
  color: "#0f172a"
};

const slotsGrid = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap"
};

const slotPill = {
  padding: "6px 16px",
  borderRadius: "999px",
  background: "#e0f2fe",
  color: "#075985",
  fontSize: "13px",
  fontWeight: "600"
};

export default DoctorAvailability;
