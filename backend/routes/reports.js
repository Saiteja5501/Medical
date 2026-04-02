const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");

/* =========================
   MULTER CONFIG (PDF ONLY)
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/reports");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  }
});

/* =========================
   ADD REPORT (Doctor)
========================= */
router.post("/", upload.single("pdf"), (req, res) => {
  const {
    doctorId,
    doctorName,
    patientId,
    patientName,
    reportTitle,
    description
  } = req.body;

  if (!doctorId || !patientId || !reportTitle || !description) {
    return res.status(400).json({
      success: false,
      error: "All fields are required"
    });
  }

  const pdfPath = req.file
    ? `/uploads/reports/${req.file.filename}`
    : null;

  const query = `
    INSERT INTO reports
    (doctor_id, doctor_name, patient_id, patient_name, reportTitle, description, pdf_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      doctorId,
      doctorName,
      patientId,
      patientName,
      reportTitle,
      description,
      pdfPath
    ],
    (err, result) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).json({
          success: false,
          error: err.sqlMessage
        });
      }

      res.json({
        success: true,
        message: "Report added successfully"
      });
    }
  );
});

/* =========================
   GET REPORTS FOR DOCTOR
========================= */
router.get("/doctor/:id", (req, res) => {
  const doctorId = req.params.id;

  const query = `
    SELECT 
      id,
      patient_name,
      reportTitle,
      description,
      date,
      pdf_path
    FROM reports
    WHERE doctor_id = ?
    ORDER BY date DESC
  `;

  db.query(query, [doctorId], (err, results) => {
    if (err) {
      console.error("Doctor Reports Error:", err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

/* =========================
   GET REPORTS FOR PATIENT
========================= */
router.get("/patient/:id", (req, res) => {
  const patientId = req.params.id;

  const query = `
    SELECT 
      id,
      doctor_name,
      reportTitle,
      description,
      date,
      pdf_path
    FROM reports
    WHERE patient_id = ?
    ORDER BY date DESC
  `;

  db.query(query, [patientId], (err, results) => {
    if (err) {
      console.error("Patient Reports Error:", err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

module.exports = router;