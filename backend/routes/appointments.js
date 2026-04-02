const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================= GET APPOINTMENTS FOR PATIENT ================= */
router.get("/patient/:id", (req, res) => {
  const patientId = req.params.id;

  const query = `
    SELECT 
      a.id,
      DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS date,
      TIME_FORMAT(a.appointment_time, '%H:%i') AS time,
      a.status,
      a.reason AS problem,
      a.created_at AS booked_at,
      u.name AS doctor_name,
      a.doctor_id
    FROM appointments a
    JOIN users u ON a.doctor_id = u.id
    WHERE a.patient_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  db.query(query, [patientId], (err, results) => {
    if (err) {
      console.error("PATIENT FETCH ERROR:", err);
      return res.json({ success: false, error: err.message });
    }

    res.json({ success: true, appointments: results });
  });
});

/* ================= GET APPOINTMENTS FOR DOCTOR ================= */
router.get("/doctor/:id", (req, res) => {
  const doctorId = req.params.id;

  const query = `
    SELECT 
      a.id,
      DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS date,
      TIME_FORMAT(a.appointment_time, '%H:%i') AS time,
      a.status,
      a.reason AS problem,
      a.created_at AS booked_at,
      u.name AS patient_name,
      a.patient_id
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    WHERE a.doctor_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  db.query(query, [doctorId], (err, results) => {
    if (err) {
      console.error("DOCTOR FETCH ERROR:", err);
      return res.json({ success: false, error: err.message });
    }

    res.json({ success: true, appointments: results });
  });
});

/* ================= BOOK APPOINTMENT ================= */
router.post("/", (req, res) => {
  let { patientId, doctorId, date, time, problem } = req.body;

  if (!patientId || !doctorId || !date || !time) {
    return res.json({ success: false, message: "All fields required" });
  }

  if (time.length === 5) time = `${time}:00`;

  const checkSlot = `
    SELECT id
    FROM doctor_availability
    WHERE doctor_id = ?
      AND date = ?
      AND time = ?
      AND is_booked = FALSE
    LIMIT 1
  `;

  db.query(checkSlot, [doctorId, date, time], (err, rows) => {
    if (err) {
      console.error("SLOT CHECK ERROR:", err);
      return res.json({ success: false, error: err.message });
    }

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "Doctor not available at this time"
      });
    }

    const lockSlot = `
      UPDATE doctor_availability
      SET is_booked = TRUE
      WHERE doctor_id = ?
        AND date = ?
        AND time = ?
        AND is_booked = FALSE
    `;

    db.query(lockSlot, [doctorId, date, time], (err2, result) => {
      if (err2 || result.affectedRows === 0) {
        return res.json({
          success: false,
          message: "Doctor not available"
        });
      }

      const insertQuery = `
        INSERT INTO appointments
        (patient_id, doctor_id, appointment_date, appointment_time, status, reason)
        VALUES (?, ?, ?, ?, 'pending', ?)
      `;

      db.query(
        insertQuery,
        [patientId, doctorId, date, time, problem || null],
        (err3) => {
          if (err3) {
            db.query(
              `
              UPDATE doctor_availability
              SET is_booked = FALSE
              WHERE doctor_id = ?
                AND date = ?
                AND time = ?
              `,
              [doctorId, date, time]
            );

            return res.json({
              success: false,
              error: err3.message
            });
          }

          res.json({
            success: true,
            message: "Appointment booked successfully"
          });
        }
      );
    });
  });
});

/* ================= UPDATE STATUS ================= */
router.put("/:id/status", (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;

  const allowed = ["pending", "approved", "rejected", "completed", "missed"];

  if (!allowed.includes(status)) {
    return res.json({ success: false, message: "Invalid status" });
  }

  db.query(
    `UPDATE appointments SET status = ? WHERE id = ?`,
    [status, appointmentId],
    (err) => {
      if (err) {
        console.error("STATUS UPDATE ERROR:", err);
        return res.json({ success: false, error: err.message });
      }

      res.json({ success: true });
    }
  );
});

/* ================= CANCEL APPOINTMENT ================= */
router.put("/:id/cancel", (req, res) => {
  const appointmentId = req.params.id;

  db.query(
    `SELECT doctor_id, appointment_date, appointment_time 
     FROM appointments WHERE id = ?`,
    [appointmentId],
    (err, rows) => {
      if (err || rows.length === 0)
        return res.json({ success: false });

      const { doctor_id, appointment_date, appointment_time } = rows[0];

      db.query(
        `UPDATE appointments SET status = 'rejected' WHERE id = ?`,
        [appointmentId],
        (err2) => {
          if (err2) return res.json({ success: false });

          db.query(
            `
            UPDATE doctor_availability
            SET is_booked = FALSE
            WHERE doctor_id = ?
              AND date = ?
              AND time = ?
            `,
            [doctor_id, appointment_date, appointment_time],
            () => {
              res.json({ success: true });
            }
          );
        }
      );
    }
  );
});

module.exports = router;