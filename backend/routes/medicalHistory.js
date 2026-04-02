const express = require("express");
const router = express.Router();
const db = require("../db");

// Get medical history for a patient
router.get("/patient/:id", (req, res) => {
  const patientId = req.params.id;
  const query = "SELECT mh.id, mh.details AS diagnosis, mh.details, mh.created_at AS date, u.name AS doctor_name FROM medical_history mh JOIN users u ON mh.doctor_id = u.id WHERE mh.patient_id = ?";
  db.query(query, [patientId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

module.exports = router;
