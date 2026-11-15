
const express = require("express");
const router = express.Router();
const db = require("../db");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

/* ==================== GET PATIENT PRESCRIPTIONS ==================== */
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

    if (req.user.role === "patient" && Number(req.user.id) !== patientId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own prescriptions"
      });
    }

    const query = `
      SELECT
        p.id,
        p.medicines AS medicine,
        p.instructions,
        p.created_at AS date,
        u.name AS doctor_name
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id
      WHERE p.patient_id = ?
      ORDER BY p.created_at DESC
    `;

    db.query(query, [patientId], (err, results) => {
      if (err) {
        console.error("Patient Prescription Error:", err);
        return res.status(500).json({
          success: false,
          message: "Unable to retrieve prescriptions"
        });
      }

      res.json(results);
    });
  }
);

/* ==================== GET DOCTOR PRESCRIPTIONS ==================== */
router.get(
  "/doctor/:id",
  authenticateToken,
  authorizeRoles("doctor", "admin"),
  (req, res) => {
    const doctorId = Number(req.params.id);

    if (!Number.isInteger(doctorId) || doctorId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID"
      });
    }

    if (req.user.role === "doctor" && Number(req.user.id) !== doctorId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own prescriptions"
      });
    }

    const query = `
      SELECT
        p.id,
        p.medicines AS medicine,
        p.instructions,
        p.created_at AS date,
        u.name AS patient_name,
        u.id AS patient_id
      FROM prescriptions p
      JOIN users u ON p.patient_id = u.id
      WHERE p.doctor_id = ?
      ORDER BY p.created_at DESC
    `;

    db.query(query, [doctorId], (err, results) => {
      if (err) {
        console.error("Doctor Prescription Error:", err);
        return res.status(500).json({
          success: false,
          message: "Unable to retrieve prescriptions"
        });
      }

      res.json(results);
    });
  }
);

/* ==================== GET ALL PRESCRIPTIONS (ADMIN) ==================== */
router.get(
  "/admin/all",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const query = `
      SELECT
        p.id,
        p.doctor_id,
        p.patient_id,
        p.medicines AS medicine,
        p.instructions,
        p.created_at AS date,
        d.name AS doctor_name,
        pt.name AS patient_name
      FROM prescriptions p
      JOIN users d ON p.doctor_id = d.id
      JOIN users pt ON p.patient_id = pt.id
      ORDER BY p.created_at DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Admin Prescription Error:", err);
        return res.status(500).json({
          success: false,
          message: "Unable to retrieve prescriptions"
        });
      }

      res.json(results);
    });
  }
);

/* ==================== ADD PRESCRIPTION (DOCTOR) ==================== */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("doctor"),
  (req, res) => {
    const doctorId = req.user.id;
    const { patientId, medicine, instructions } = req.body;

    const parsedPatientId = Number(patientId);

    if (
      !Number.isInteger(parsedPatientId) ||
      parsedPatientId <= 0 ||
      typeof medicine !== "string" ||
      !medicine.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid patient and medicine details are required"
      });
    }

    const appointmentQuery = `
      SELECT id
      FROM appointments
      WHERE doctor_id = ?
        AND patient_id = ?
        AND status = 'approved'
      LIMIT 1
    `;

    db.query(
      appointmentQuery,
      [doctorId, parsedPatientId],
      (appointmentErr, appointments) => {
        if (appointmentErr) {
          console.error("Appointment Verification Error:", appointmentErr);
          return res.status(500).json({
            success: false,
            message: "Unable to verify patient appointment"
          });
        }

        if (appointments.length === 0) {
          return res.status(403).json({
            success: false,
            message: "Prescription can only be created for an approved patient"
          });
        }

        const insertQuery = `
          INSERT INTO prescriptions
          (doctor_id, patient_id, medicines, instructions)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          insertQuery,
          [
            doctorId,
            parsedPatientId,
            medicine.trim(),
            typeof instructions === "string" ? instructions.trim() : ""
          ],
          (err, result) => {
            if (err) {
              console.error("Add Prescription Error:", err);
              return res.status(500).json({
                success: false,
                message: "Unable to add prescription"
              });
            }

            res.status(201).json({
              success: true,
              message: "Prescription added successfully",
              id: result.insertId
            });
          }
        );
      }
    );
  }
);

/* ==================== UPDATE PRESCRIPTION (ADMIN) ==================== */
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const prescriptionId = Number(req.params.id);
    const { medicine, instructions } = req.body;

    if (
      !Number.isInteger(prescriptionId) ||
      prescriptionId <= 0 ||
      typeof medicine !== "string" ||
      !medicine.trim() ||
      typeof instructions !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid prescription ID, medicine and instructions are required"
      });
    }

    const query = `
      UPDATE prescriptions
      SET medicines = ?, instructions = ?
      WHERE id = ?
    `;

    db.query(
      query,
      [medicine.trim(), instructions.trim(), prescriptionId],
      (err, result) => {
        if (err) {
          console.error("Update Prescription Error:", err);
          return res.status(500).json({
            success: false,
            message: "Unable to update prescription"
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Prescription not found"
          });
        }

        res.json({
          success: true,
          message: "Prescription updated successfully"
        });
      }
    );
  }
);

/* ==================== ACCEPTED PATIENTS FOR DOCTOR ==================== */
router.get(
  "/doctor/:doctorId/accepted-patients",
  authenticateToken,
  authorizeRoles("doctor", "admin"),
  (req, res) => {
    const doctorId = Number(req.params.doctorId);
    const search = req.query.search || "";

    if (!Number.isInteger(doctorId) || doctorId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID"
      });
    }

    if (req.user.role === "doctor" && Number(req.user.id) !== doctorId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own accepted patients"
      });
    }

    const query = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.email
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      WHERE a.doctor_id = ?
        AND a.status = 'approved'
        AND u.name LIKE ?
      ORDER BY u.name
    `;

    db.query(query, [doctorId, `%${search}%`], (err, results) => {
      if (err) {
        console.error("Approved Patients Error:", err);
        return res.status(500).json({
          success: false,
          message: "Unable to retrieve accepted patients"
        });
      }

      res.json({
        success: true,
        patients: results
      });
    });
  }
);

module.exports = router;
