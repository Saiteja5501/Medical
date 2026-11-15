
const express = require("express");
const router = express.Router();
const db = require("../db");
const sendEmail = require("../utils/sendEmail");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

// ================= GET ALL APPOINTMENTS FOR ADMIN =================

router.get(
  "/admin/all",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const query = `
      SELECT
        a.id,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS date,
        TIME_FORMAT(a.appointment_time, '%H:%i') AS time,
        a.status,
        a.reason AS problem,
        a.created_at AS booked_at,
        p.name AS patient_name,
        d.name AS doctor_name,
        a.patient_id,
        a.doctor_id
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      ORDER BY a.created_at DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("ADMIN APPOINTMENTS ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to fetch appointments"
        });
      }

      return res.json({
        success: true,
        appointments: results
      });
    });
  }
);

// ================= GET APPOINTMENTS FOR PATIENT =================

router.get(
  "/patient/:id",
  authenticateToken,
  authorizeRoles("patient", "admin"),
  (req, res) => {
    const requestedPatientId = Number(req.params.id);

    if (!Number.isInteger(requestedPatientId) || requestedPatientId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID"
      });
    }

    // Patients can only view their own appointments.
    if (
      req.user.role === "patient" &&
      requestedPatientId !== Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access another patient's appointments"
      });
    }

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

    db.query(query, [requestedPatientId], (err, results) => {
      if (err) {
        console.error("PATIENT FETCH ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to fetch patient appointments"
        });
      }

      return res.json({
        success: true,
        appointments: results
      });
    });
  }
);

// ================= GET APPOINTMENTS FOR DOCTOR =================

router.get(
  "/doctor/:id",
  authenticateToken,
  authorizeRoles("doctor", "admin"),
  (req, res) => {
    const requestedDoctorId = Number(req.params.id);

    if (!Number.isInteger(requestedDoctorId) || requestedDoctorId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID"
      });
    }

    // Doctors can only view their own appointments.
    if (
      req.user.role === "doctor" &&
      requestedDoctorId !== Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access another doctor's appointments"
      });
    }

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

    db.query(query, [requestedDoctorId], (err, results) => {
      if (err) {
        console.error("DOCTOR FETCH ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to fetch doctor appointments"
        });
      }

      return res.json({
        success: true,
        appointments: results
      });
    });
  }
);

// ================= BOOK APPOINTMENT =================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("patient"),
  (req, res) => {
    const { doctorId, date, problem } = req.body;
    let { time } = req.body;

    // Patient ID comes from the verified JWT, not the request body.
    const patientId = Number(req.user.id);
    const requestedDoctorId = Number(doctorId);

    if (
      !requestedDoctorId ||
      !date ||
      !time ||
      !Number.isInteger(requestedDoctorId) ||
      requestedDoctorId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date and time are required"
      });
    }

    if (typeof time !== "string" || typeof date !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid date or time"
      });
    }

    if (time.length === 5) {
      time = `${time}:00`;
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d:00$/.test(time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment time"
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date"
      });
    }

    const checkSlot = `
      SELECT id
      FROM doctor_availability
      WHERE doctor_id = ?
        AND date = ?
        AND time = ?
        AND is_booked = FALSE
      LIMIT 1
    `;

    db.query(
      checkSlot,
      [requestedDoctorId, date, time],
      (err, rows) => {
        if (err) {
          console.error("SLOT CHECK ERROR:", err);

          return res.status(500).json({
            success: false,
            message: "Unable to check doctor availability"
          });
        }

        if (rows.length === 0) {
          return res.status(409).json({
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

        db.query(
          lockSlot,
          [requestedDoctorId, date, time],
          (err2, result) => {
            if (err2) {
              console.error("SLOT LOCK ERROR:", err2);

              return res.status(500).json({
                success: false,
                message: "Unable to reserve appointment slot"
              });
            }

            if (result.affectedRows === 0) {
              return res.status(409).json({
                success: false,
                message: "Doctor not available"
              });
            }

            const insertQuery = `
              INSERT INTO appointments
              (patient_id, doctor_id, appointment_date,
               appointment_time, status, reason)
              VALUES (?, ?, ?, ?, 'pending', ?)
            `;

            db.query(
              insertQuery,
              [
                patientId,
                requestedDoctorId,
                date,
                time,
                problem || null
              ],
              (err3, result3) => {
                if (err3) {
                  console.error("APPOINTMENT INSERT ERROR:", err3);

                  // Release the slot if insertion fails.
                  db.query(
                    `
                    UPDATE doctor_availability
                    SET is_booked = FALSE
                    WHERE doctor_id = ?
                      AND date = ?
                      AND time = ?
                    `,
                    [requestedDoctorId, date, time],
                    (releaseErr) => {
                      if (releaseErr) {
                        console.error("SLOT RELEASE ERROR:", releaseErr);
                      }

                      return res.status(500).json({
                        success: false,
                        message: "Unable to book appointment"
                      });
                    }
                  );

                  return;
                }

                return res.status(201).json({
                  success: true,
                  message: "Appointment booked successfully",
                  appointmentId: result3.insertId
                });
              }
            );
          }
        );
      }
    );
  }
);


// ================= UPDATE APPOINTMENT STATUS =================

router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles("doctor", "admin"),
  (req, res) => {
    const appointmentId = Number(req.params.id);
    const { status } = req.body;

    const allowed = [
      "pending",
      "approved",
      "rejected",
      "completed",
      "missed"
    ];

    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID"
      });
    }

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status"
      });
    }

    let query;
    let values;

    if (req.user.role === "doctor") {
      query = `
        UPDATE appointments
        SET status = ?
        WHERE id = ? AND doctor_id = ?
      `;

      values = [status, appointmentId, req.user.id];
    } else {
      query = `
        UPDATE appointments
        SET status = ?
        WHERE id = ?
      `;

      values = [status, appointmentId];
    }

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("STATUS UPDATE ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to update appointment status"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found or access denied"
        });
      }

      // Send email only for approval or rejection.
      if (status === "approved" || status === "rejected") {
        const emailQuery = `
          SELECT
            p.name AS patient_name,
            p.email AS patient_email,
            d.name AS doctor_name,
            DATE_FORMAT(a.appointment_date, '%d-%m-%Y') AS appointment_date,
            TIME_FORMAT(a.appointment_time, '%h:%i %p') AS appointment_time
          FROM appointments a
          JOIN users p ON a.patient_id = p.id
          JOIN users d ON a.doctor_id = d.id
          WHERE a.id = ?
        `;

        db.query(emailQuery, [appointmentId], (emailErr, rows) => {
          if (emailErr) {
            console.error("APPOINTMENT EMAIL FETCH ERROR:", emailErr);
            return;
          }

          if (rows.length === 0 || !rows[0].patient_email) {
            console.error("Patient email not found for appointment");
            return;
          }

          const appointment = rows[0];

          const statusText =
            status === "approved" ? "Approved" : "Rejected";

          const subject =
            `HealthWave: Appointment ${statusText}`;

          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; color: #263238;">
              <h2 style="color: #159B88;">HealthWave</h2>

              <h3>Appointment ${statusText}</h3>

              <p>Hello ${appointment.patient_name},</p>

              <p>
                Your appointment request has been
                <strong>${statusText.toLowerCase()}</strong>.
              </p>

              <div style="background: #f3f8f7; padding: 18px; border-radius: 8px;">
                <p><strong>Doctor:</strong> ${appointment.doctor_name}</p>
                <p><strong>Date:</strong> ${appointment.appointment_date}</p>
                <p><strong>Time:</strong> ${appointment.appointment_time}</p>
                <p><strong>Status:</strong> ${statusText}</p>
              </div>

              <p>
                ${
                  status === "approved"
                    ? "Please be available at the scheduled appointment time."
                    : "Please log in to HealthWave to book another appointment if needed."
                }
              </p>

              <p>Thank you for using HealthWave.</p>

              <p style="color: #159B88; font-weight: bold;">
                HealthWave Healthcare Team
              </p>
            </div>
          `;

          sendEmail(
            appointment.patient_email,
            subject,
            html
          ).catch((emailError) => {
            console.error("APPOINTMENT EMAIL SEND ERROR:", emailError);
          });
        });
      }

      return res.json({
        success: true,
        message: "Appointment status updated successfully"
      });
    });
  }
);


// ================= CANCEL APPOINTMENT =================

router.put(
  "/:id/cancel",
  authenticateToken,
  authorizeRoles("patient", "admin"),
  (req, res) => {
    const appointmentId = Number(req.params.id);

    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID"
      });
    }

    let selectQuery;
    let selectValues;

    if (req.user.role === "patient") {
      selectQuery = `
        SELECT patient_id, doctor_id, appointment_date, appointment_time
        FROM appointments
        WHERE id = ? AND patient_id = ?
      `;

      selectValues = [appointmentId, req.user.id];
    } else {
      selectQuery = `
        SELECT patient_id, doctor_id, appointment_date, appointment_time
        FROM appointments
        WHERE id = ?
      `;

      selectValues = [appointmentId];
    }

    db.query(selectQuery, selectValues, (err, rows) => {
      if (err) {
        console.error("CANCEL FETCH ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to find appointment"
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found or access denied"
        });
      }

      const appointment = rows[0];

      db.query(
        `
        UPDATE appointments
        SET status = 'rejected'
        WHERE id = ?
          AND status IN ('pending', 'approved')
        `,
        [appointmentId],
        (err2, result) => {
          if (err2) {
            console.error("CANCEL UPDATE ERROR:", err2);

            return res.status(500).json({
              success: false,
              message: "Unable to cancel appointment"
            });
          }

          if (result.affectedRows === 0) {
            return res.status(409).json({
              success: false,
              message: "Appointment cannot be cancelled in its current status"
            });
          }

          // Release the doctor's appointment slot.
          db.query(
            `
            UPDATE doctor_availability
            SET is_booked = FALSE
            WHERE doctor_id = ?
              AND date = ?
              AND time = ?
            `,
            [
              appointment.doctor_id,
              appointment.appointment_date,
              appointment.appointment_time
            ],
            (err3) => {
              if (err3) {
                console.error("SLOT RELEASE ERROR:", err3);

                return res.status(500).json({
                  success: false,
                  message: "Appointment cancelled, but slot release failed"
                });
              }

              return res.json({
                success: true,
                message: "Appointment cancelled successfully"
              });
            }
          );
        }
      );
    });
  }
);

module.exports = router;
