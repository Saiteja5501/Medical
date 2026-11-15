
const express = require("express");
const router = express.Router();
const db = require("../db");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

// ==========================================
// GET MEDICAL HISTORY FOR A PATIENT
// ==========================================

router.get(
  "/patient/:id",
  authenticateToken,
  authorizeRoles("patient", "admin"),
  (req, res) => {
    const patientId = Number(req.params.id);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID"
      });
    }

    if (
      req.user.role === "patient" &&
      Number(req.user.id) !== patientId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access another patient's medical history"
      });
    }

    const query = `
      SELECT
        mh.id,
        mh.appointment_id,
        mh.patient_id,
        mh.doctor_id,
        mh.diagnosis,
        mh.treatment,
        mh.notes,
        mh.created_at AS date,
        u.name AS doctor_name
      FROM medical_history mh
      LEFT JOIN users u ON mh.doctor_id = u.id
      WHERE mh.patient_id = ?
      ORDER BY mh.created_at DESC
    `;

    db.query(query, [patientId], (err, results) => {
      if (err) {
        console.error("MEDICAL HISTORY FETCH ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to retrieve medical history"
        });
      }

      return res.json({
        success: true,
        history: results
      });
    });
  }
);

// ==========================================
// ADD MEDICAL HISTORY - DOCTOR ONLY
// ==========================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("doctor"),
  (req, res) => {
    const { appointmentId, diagnosis, treatment, notes } = req.body;

    const doctorId = Number(req.user.id);
    const requestedAppointmentId = Number(appointmentId);

    if (
      !Number.isInteger(requestedAppointmentId) ||
      requestedAppointmentId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid appointment ID is required"
      });
    }

    if (
      typeof diagnosis !== "string" ||
      !diagnosis.trim() ||
      typeof treatment !== "string" ||
      !treatment.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Diagnosis and treatment are required"
      });
    }

    if (
      notes !== undefined &&
      notes !== null &&
      typeof notes !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notes"
      });
    }

    // Verify that the completed appointment belongs to this doctor.
    const appointmentQuery = `
      SELECT id, patient_id, doctor_id, status
      FROM appointments
      WHERE id = ?
        AND doctor_id = ?
        AND status = 'completed'
      LIMIT 1
    `;

    db.query(
      appointmentQuery,
      [requestedAppointmentId, doctorId],
      (err, appointments) => {
        if (err) {
          console.error("APPOINTMENT VERIFY ERROR:", err);

          return res.status(500).json({
            success: false,
            message: "Unable to verify appointment"
          });
        }

        if (appointments.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Completed appointment not found or access denied"
          });
        }

        const appointment = appointments[0];
        const patientId = appointment.patient_id;

        // Save the medical history with the verified appointment ID.
        const insertQuery = `
          INSERT INTO medical_history
          (
            appointment_id,
            patient_id,
            doctor_id,
            diagnosis,
            treatment,
            notes
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
          insertQuery,
          [
            requestedAppointmentId,
            patientId,
            doctorId,
            diagnosis.trim(),
            treatment.trim(),
            notes ? notes.trim() : null
          ],
          (insertErr, result) => {
            if (insertErr) {
              // The unique key prevents duplicate records.
              if (insertErr.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                  success: false,
                  message: "Medical history has already been added for this appointment"
                });
              }

              console.error("MEDICAL HISTORY INSERT ERROR:", insertErr);

              return res.status(500).json({
                success: false,
                message: "Unable to save medical history"
              });
            }

            return res.status(201).json({
              success: true,
              message: "Medical history saved successfully",
              recordId: result.insertId,
              appointmentId: requestedAppointmentId,
              patientId
            });
          }
        );
      }
    );
  }
);

module.exports = router;
