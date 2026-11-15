
const express = require("express");
const router = express.Router();
const db = require("../db");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "reports"
);

/* =========================
   MULTER CONFIGURATION
   PDF ONLY - MAX 5 MB
========================= */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype !== "application/pdf" ||
      path.extname(file.originalname).toLowerCase() !== ".pdf"
    ) {
      return cb(new Error("Only PDF files are allowed"));
    }

    cb(null, true);
  }
});

/* =========================
   GET REPORTS FOR DOCTOR
========================= */

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

    if (
      req.user.role === "doctor" &&
      Number(req.user.id) !== doctorId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own reports"
      });
    }

    const query = `
      SELECT
        id,
        patient_name,
        reportTitle,
        description,
        date,
        CASE
          WHEN pdf_path IS NOT NULL THEN 1
          ELSE 0
        END AS has_pdf
      FROM reports
      WHERE doctor_id = ?
      ORDER BY date DESC
    `;

    db.query(query, [doctorId], (err, results) => {
      if (err) {
        console.error("Doctor Reports Error:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to retrieve reports"
        });
      }

      res.json(results);
    });
  }
);

/* =========================
   GET REPORTS FOR PATIENT
========================= */

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
        message: "You can only view your own reports"
      });
    }

    const query = `
      SELECT
        id,
        doctor_name,
        reportTitle,
        description,
        date,
        CASE
          WHEN pdf_path IS NOT NULL THEN 1
          ELSE 0
        END AS has_pdf
      FROM reports
      WHERE patient_id = ?
      ORDER BY date DESC
    `;

    db.query(query, [patientId], (err, results) => {
      if (err) {
        console.error("Patient Reports Error:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to retrieve reports"
        });
      }

      res.json(results);
    });
  }
);

/* =========================
   GET ALL REPORTS (ADMIN)
========================= */

router.get(
  "/admin/all",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const query = `
      SELECT
        id,
        doctor_id,
        doctor_name,
        patient_id,
        patient_name,
        reportTitle,
        description,
        date,
        CASE
          WHEN pdf_path IS NOT NULL THEN 1
          ELSE 0
        END AS has_pdf
      FROM reports
      ORDER BY date DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Admin Reports Error:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to retrieve reports"
        });
      }

      res.json(results);
    });
  }
);

/* =========================
   ADD REPORT
   DOCTOR OR PATIENT
========================= */

router.post(
  "/",
  authenticateToken,
  authorizeRoles("doctor", "patient"),
  (req, res) => {

    upload.single("pdf")(req, res, async (uploadError) => {

      if (uploadError) {
        const statusCode =
          uploadError instanceof multer.MulterError &&
          uploadError.code === "LIMIT_FILE_SIZE"
            ? 413
            : 400;

        return res.status(statusCode).json({
          success: false,
          message: uploadError.message
        });
      }

      const {
        doctorId,
        patientId,
        reportTitle,
        description
      } = req.body;

      const parsedDoctorId =
  req.user.role === "doctor"
    ? Number(req.user.id)
    : Number(doctorId);

const parsedPatientId = Number(patientId);





      if (
        !Number.isInteger(parsedDoctorId) ||
        parsedDoctorId <= 0 ||
        !Number.isInteger(parsedPatientId) ||
        parsedPatientId <= 0 ||
        !reportTitle?.trim() ||
        !description?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid doctor, patient, title and description are required"
        });
      }

      if (reportTitle.trim().length > 255) {
        return res.status(400).json({
          success: false,
          message: "Report title cannot exceed 255 characters"
        });
      }

      // Verify PDF file content, not just its MIME type.
      if (
        req.file &&
        !req.file.buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid PDF file"
        });
      }

      // Patients can upload only for themselves.
      if (
        req.user.role === "patient" &&
        Number(req.user.id) !== parsedPatientId
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only upload your own reports"
        });
      }

      // Verify that the selected doctor and patient exist.
      const usersQuery = `
        SELECT id, name, role
        FROM users
        WHERE (id = ? AND role = 'doctor')
           OR (id = ? AND role = 'patient')
      `;

      db.query(
        usersQuery,
        [parsedDoctorId, parsedPatientId],
        async (userError, users) => {

          if (userError) {
            console.error("Report User Verification Error:", userError);

            return res.status(500).json({
              success: false,
              message: "Unable to verify report users"
            });
          }

          const doctor = users.find(
            (user) => Number(user.id) === parsedDoctorId &&
              user.role === "doctor"
          );

          const patient = users.find(
            (user) => Number(user.id) === parsedPatientId &&
              user.role === "patient"
          );

          if (!doctor || !patient) {
            return res.status(400).json({
              success: false,
              message: "Invalid doctor or patient"
            });
          }

          // Doctors can upload only for approved patients.
          if (req.user.role === "doctor") {
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
              [req.user.id, parsedPatientId],
              async (appointmentError, appointments) => {

                if (appointmentError) {
                  console.error("Report Appointment Error:", appointmentError);

                  return res.status(500).json({
                    success: false,
                    message: "Unable to verify patient appointment"
                  });
                }

                if (appointments.length === 0) {
                  return res.status(403).json({
                    success: false,
                    message: "You can only upload reports for approved patients"
                  });
                }

                await saveReport(doctor, patient, req, res);
              }
            );

          } else {
            // Patient can choose an existing doctor.
            await saveReport(doctor, patient, req, res);
          }
        }
      );
    });
  }
);

/* =========================
   SAVE REPORT HELPER
========================= */

async function saveReport(doctor, patient, req, res) {
  let pdfPath = null;
  let savedFilePath = null;

  try {
    if (req.file) {
      await fs.promises.mkdir(uploadDirectory, {
        recursive: true
      });

      const filename =
        Date.now() + "-" +
        crypto.randomBytes(12).toString("hex") +
        ".pdf";

      savedFilePath = path.join(uploadDirectory, filename);

      await fs.promises.writeFile(
        savedFilePath,
        req.file.buffer,
        { flag: "wx" }
      );

      pdfPath = `/uploads/reports/${filename}`;
    }

    const query = `
      INSERT INTO reports
      (
        doctor_id,
        doctor_name,
        patient_id,
        patient_name,
        reportTitle,
        description,
        pdf_path
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        doctor.id,
        doctor.name,
        patient.id,
        patient.name,
        req.body.reportTitle.trim(),
        req.body.description.trim(),
        pdfPath
      ],
      async (err, result) => {

        if (err) {
          console.error("Add Report DB Error:", err);

          if (savedFilePath) {
            await fs.promises.unlink(savedFilePath).catch(() => {});
          }

          return res.status(500).json({
            success: false,
            message: "Unable to save report"
          });
        }

        res.status(201).json({
          success: true,
          message: "Report added successfully",
          id: result.insertId
        });
      }
    );

  } catch (error) {
    console.error("Save Report Error:", error);

    if (savedFilePath) {
      await fs.promises.unlink(savedFilePath).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save report file"
    });
  }
}

/* =========================
   SECURE PDF DOWNLOAD
========================= */

router.get(
  "/download/:id",
  authenticateToken,
  authorizeRoles("doctor", "patient", "admin"),
  (req, res) => {

    const reportId = Number(req.params.id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID"
      });
    }

    const query = `
      SELECT id, doctor_id, patient_id, pdf_path
      FROM reports
      WHERE id = ?
    `;

    db.query(query, [reportId], (err, results) => {

      if (err) {
        console.error("Report Download DB Error:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to retrieve report"
        });
      }

      if (results.length === 0 || !results[0].pdf_path) {
        return res.status(404).json({
          success: false,
          message: "Report PDF not found"
        });
      }

      const report = results[0];

      if (
        req.user.role === "patient" &&
        Number(req.user.id) !== Number(report.patient_id)
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot access this report"
        });
      }

      if (
        req.user.role === "doctor" &&
        Number(req.user.id) !== Number(report.doctor_id)
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot access this report"
        });
      }

      const filename = path.basename(report.pdf_path);
      const filePath = path.join(uploadDirectory, filename);

      res.setHeader("Cache-Control", "private, no-store");

      res.sendFile(filePath, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      }, (sendError) => {
        if (sendError && !res.headersSent) {
          console.error("Report File Error:", sendError);

          res.status(404).json({
            success: false,
            message: "Report file not found"
          });
        }
      });
    });
  }
);

module.exports = router;
