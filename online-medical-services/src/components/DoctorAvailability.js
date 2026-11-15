
import React, { useState } from "react";

const DoctorAvailability = () => {
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
      setMsg("Doctor ID not found. Please login again.");
      setMsgType("error");
      return;
    }

    if (!date || !fromTime || !toTime) {
      setMsg("Please select date, start time and end time.");
      setMsgType("error");
      return;
    }

    if (fromTime >= toTime) {
      setMsg("End time must be later than start time.");
      setMsgType("error");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost:5000/availability/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctorId,
            date,
            fromTime,
            toTime,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMsg(data.message || "Availability saved successfully!");
        setMsgType("success");
        setSlots(data.slots || []);
        setFromTime("");
        setToTime("");
      } else {
        setMsg(data.message || "Unable to save availability.");
        setMsgType("error");
      }
    } catch (error) {
      setMsg("Server error. Please try again.");
      setMsgType("error");
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "";

    const [hour, minute] = time.split(":");
    let h = Number(hour);
    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12 || 12;

    return `${h}:${minute} ${ampm}`;
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#0B0D0E",
      padding: "40px 20px",
      color: "#E8EEEE",
      fontFamily: "Arial, sans-serif",
    },

    container: {
      maxWidth: "650px",
      margin: "0 auto",
    },

    header: {
      marginBottom: "28px",
    },

    title: {
      fontSize: "27px",
      fontWeight: "700",
      color: "#E8EEEE",
      margin: "0 0 9px",
    },

    subtitle: {
      color: "#899497",
      fontSize: "14px",
      lineHeight: "1.6",
      margin: 0,
    },

    card: {
      background: "#181C1D",
      border: "1px solid #293333",
      borderRadius: "18px",
      padding: "30px",
      boxShadow: "0 12px 35px rgba(0,0,0,0.18)",
    },

    sectionTitle: {
      fontSize: "17px",
      fontWeight: "600",
      color: "#E8EEEE",
      margin: "0 0 22px",
    },

    field: {
      marginBottom: "21px",
    },

    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: "600",
      color: "#AAB5B5",
      marginBottom: "9px",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "13px 14px",
      background: "#101515",
      border: "1px solid #303B3B",
      borderRadius: "9px",
      color: "#E8EEEE",
      fontSize: "14px",
      outline: "none",
      colorScheme: "dark",
    },

    timeGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    },

    preview: {
      background: "#111718",
      border: "1px solid #293333",
      borderRadius: "10px",
      padding: "16px",
      marginTop: "6px",
      marginBottom: "22px",
    },

    previewLabel: {
      color: "#899497",
      fontSize: "12px",
      marginBottom: "7px",
    },

    previewValue: {
      color: "#20DCC0",
      fontSize: "14px",
      fontWeight: "600",
    },

    button: {
      width: "100%",
      padding: "14px",
      background: "#20DCC0",
      color: "#071411",
      border: "none",
      borderRadius: "9px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: saving ? "not-allowed" : "pointer",
      opacity: saving ? 0.65 : 1,
      transition: "0.2s",
    },

    message: {
      padding: "13px 15px",
      borderRadius: "9px",
      fontSize: "13px",
      marginTop: "18px",
      lineHeight: "1.5",
    },

    slotsSection: {
      marginTop: "26px",
      paddingTop: "23px",
      borderTop: "1px solid #293333",
    },

    slotsGrid: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginTop: "15px",
    },

    slot: {
      padding: "9px 13px",
      borderRadius: "8px",
      background: "#203A34",
      border: "1px solid #31554C",
      color: "#20DCC0",
      fontSize: "13px",
      fontWeight: "600",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <h2 style={styles.title}>Manage Availability</h2>
          <p style={styles.subtitle}>
            Set your available consultation hours so patients can book
            appointments with you.
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            Add Available Time
          </h3>

          <div style={styles.field}>
            <label style={styles.label}>Select Date</label>

            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.timeGrid}>
            <div style={styles.field}>
              <label style={styles.label}>From Time</label>

              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>To Time</label>

              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {date && fromTime && toTime && fromTime < toTime && (
            <div style={styles.preview}>
              <div style={styles.previewLabel}>
                Availability Preview
              </div>

              <div style={styles.previewValue}>
                {new Date(`${date}T00:00:00`).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
                {" · "}
                {formatTime(fromTime)} – {formatTime(toTime)}
              </div>
            </div>
          )}

          <button
            onClick={saveAvailability}
            disabled={saving}
            style={styles.button}
          >
            {saving ? "Saving Availability..." : "Save Availability"}
          </button>

          {msg && (
            <div
              style={{
                ...styles.message,
                background:
                  msgType === "success" ? "#142B23" : "#301C1C",
                border:
                  msgType === "success"
                    ? "1px solid #28533F"
                    : "1px solid #633333",
                color:
                  msgType === "success" ? "#64DDA6" : "#FF8585",
              }}
            >
              {msg}
            </div>
          )}

          {slots.length > 0 && (
            <div style={styles.slotsSection}>
              <h3 style={styles.sectionTitle}>
                Generated Consultation Slots
              </h3>

              <p style={styles.subtitle}>
                Your available appointment slots for the selected date.
              </p>

              <div style={styles.slotsGrid}>
                {slots.map((slot, index) => (
                  <span key={index} style={styles.slot}>
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;
