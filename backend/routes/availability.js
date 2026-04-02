const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================= ADD AVAILABILITY (FIXED) ================= */
router.post("/add", (req, res) => {
  const { doctorId, date, fromTime, toTime } = req.body;

  if (!doctorId || !date || !fromTime || !toTime) {
    return res.json({ success: false, message: "All fields required" });
  }

  const slots = [];

  // ✅ FIX: generate slots WITHOUT Date object (timezone-safe)
  let [startHour, startMin] = fromTime.split(":").map(Number);
  let [endHour, endMin] = toTime.split(":").map(Number);

  while (
    startHour < endHour ||
    (startHour === endHour && startMin < endMin)
  ) {
    const hh = String(startHour).padStart(2, "0");
    const mm = String(startMin).padStart(2, "0");
    slots.push(`${hh}:${mm}:00`);

    // increment by 1 hour
    startHour += 1;
  }

  if (slots.length === 0) {
    return res.json({ success: false, message: "Invalid time range" });
  }

  const values = slots.map((t) => [doctorId, date, t]);

  db.query(
    `
    INSERT IGNORE INTO doctor_availability
    (doctor_id, date, time)
    VALUES ?
    `,
    [values],
    (err) => {
      if (err) {
        console.error("AVAILABILITY INSERT ERROR:", err.sqlMessage);
        return res.json({ success: false, message: "Database error" });
      }

      res.json({ success: true, slots });
    }
  );
});

/* ================= GET AVAILABLE SLOTS ================= */
router.get("/slots/:doctorId/:date", (req, res) => {
  const { doctorId, date } = req.params;

  db.query(
    `
    SELECT time
    FROM doctor_availability
    WHERE doctor_id = ?
      AND DATE(date) = DATE(?)
      AND is_booked = FALSE
    ORDER BY time
    `,
    [doctorId, date],
    (err, results) => {
      if (err) return res.json({ success: false });
      res.json({ success: true, slots: results });
    }
  );
});

module.exports = router;
