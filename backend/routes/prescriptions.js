const express = require("express");
const router = express.Router();
const db = require("../db");

/* ==================== GET PRESCRIPTIONS FOR PATIENT ==================== */
router.get("/patient/:id", (req, res) => {
  const patientId = req.params.id;

  const query = `
    SELECT p.id, 
           p.medicine, 
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
      return res.status(500).json({ success: false, error: err });
    }

    res.json(results);
  });
});

/* ==================== GET PRESCRIPTIONS FOR DOCTOR ==================== */
router.get("/doctor/:id", (req, res) => {
  const doctorId = req.params.id;

  const query = `
    SELECT p.id, 
           p.medicine, 
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
      return res.status(500).json({ success: false, error: err });
    }

    res.json(results);
  });
});

/* ==================== ADD PRESCRIPTION ==================== */
router.post("/", (req, res) => {
  const { doctorId, patientId, medicine, instructions } = req.body;

  const query = `
    INSERT INTO prescriptions 
    (doctor_id, patient_id, medicine, instructions)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    query,
    [doctorId, patientId, medicine, instructions || ""],
    (err, result) => {
      if (err) {
        console.error("Add Prescription Error:", err);
        return res.status(500).json({ success: false, error: err });
      }

      res.json({
        success: true,
        message: "Prescription added successfully",
        id: result.insertId
      });
    }
  );
});

/* ==================== GET APPROVED PATIENTS FOR DOCTOR ==================== */
/* (Used in Doctor Report Dropdown) */
router.get("/doctor/:doctorId/accepted-patients", (req, res) => {
  const { doctorId } = req.params;
  const search = req.query.search || "";

  const query = `
    SELECT DISTINCT u.id, u.name, u.email
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    WHERE a.doctor_id = ?
      AND a.status = 'approved'   -- 🔥 FIXED HERE
      AND u.name LIKE ?
    ORDER BY u.name
  `;

  db.query(
    query,
    [doctorId, `%${search}%`],
    (err, results) => {
      if (err) {
        console.error("Approved Patients Error:", err);
        return res.status(500).json({
          success: false,
          error: err
        });
      }

      res.json({
        success: true,
        patients: results
      });
    }
  );
});

module.exports = router;