
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

// ================= PASSWORD REGEX =================

const passwordRegex =
  /^[A-Z](?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

const userIdRegex = /^[1-9]\d*$/;

// ================= FETCH ALL PATIENTS =================
// Admin only

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const query = `
      SELECT id, name, email, phone, created_at
      FROM users
      WHERE role = 'patient'
      ORDER BY created_at DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Fetch patients error:", err);

        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      return res.json({
        success: true,
        patients: results
      });
    });
  }
);

// ================= ADD NEW PATIENT =================
// Admin only

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      !phone?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must start with a capital letter, contain at least 8 characters, one number and one special character"
      });
    }

    if (!/^[0-9]{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone must be 10 digits"
      });
    }

    const checkQuery = `
      SELECT id
      FROM users
      WHERE email = ? OR phone = ?
    `;

    db.query(
      checkQuery,
      [normalizedEmail, normalizedPhone],
      async (err, results) => {
        if (err) {
          console.error("Patient check error:", err);

          return res.status(500).json({
            success: false,
            message: "Database error"
          });
        }

        if (results.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Email or phone already exists"
          });
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);

          const insertQuery = `
            INSERT INTO users
              (name, email, password, role, phone)
            VALUES (?, ?, ?, 'patient', ?)
          `;

          db.query(
            insertQuery,
            [
              normalizedName,
              normalizedEmail,
              hashedPassword,
              normalizedPhone
            ],
            (insertErr, result) => {
              if (insertErr) {
                console.error("Insert patient error:", insertErr);

                if (insertErr.code === "ER_DUP_ENTRY") {
                  return res.status(400).json({
                    success: false,
                    message: "Email or phone already exists"
                  });
                }

                return res.status(500).json({
                  success: false,
                  message: "Patient registration failed"
                });
              }

              return res.status(201).json({
                success: true,
                message: "Patient registered successfully",
                patientId: result.insertId
              });
            }
          );
        } catch (hashError) {
          console.error("Password hashing error:", hashError);

          return res.status(500).json({
            success: false,
            message: "Patient registration failed"
          });
        }
      }
    );
  }
);

// ================= PATIENT PROFILE =================

// GET LOGGED-IN PATIENT PROFILE

router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("patient"),
  (req, res) => {
    const patientId = req.user.id;

    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM users
      WHERE id = ? AND role = 'patient'
    `;

    db.query(query, [patientId], (err, results) => {
      if (err) {
        console.error("Fetch patient profile error:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to fetch profile"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found"
        });
      }

      return res.json({
        success: true,
        profile: results[0]
      });
    });
  }
);

// UPDATE LOGGED-IN PATIENT PROFILE

router.put(
  "/profile",
  authenticateToken,
  authorizeRoles("patient"),
  (req, res) => {
    const patientId = req.user.id;
    const { name, email, phone } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone ? phone.trim() : "";

    if (
      normalizedPhone &&
      !/^[0-9]{10}$/.test(normalizedPhone)
    ) {
      return res.status(400).json({
        success: false,
        message: "Phone must contain exactly 10 digits"
      });
    }

    const checkQuery = `
      SELECT id
      FROM users
      WHERE (email = ? OR phone = ?)
      AND id != ?
    `;

    db.query(
      checkQuery,
      [normalizedEmail, normalizedPhone || null, patientId],
      (err, results) => {
        if (err) {
          console.error("Profile duplicate check error:", err);

          return res.status(500).json({
            success: false,
            message: "Database error"
          });
        }

        if (results.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Email or phone is already registered"
          });
        }

        const updateQuery = `
          UPDATE users
          SET name = ?, email = ?, phone = ?
          WHERE id = ? AND role = 'patient'
        `;

        db.query(
          updateQuery,
          [
            normalizedName,
            normalizedEmail,
            normalizedPhone || null,
            patientId
          ],
          (updateErr, result) => {
            if (updateErr) {
              console.error("Update patient profile error:", updateErr);

              if (updateErr.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                  success: false,
                  message: "Email or phone is already registered"
                });
              }

              return res.status(500).json({
                success: false,
                message: "Unable to update profile"
              });
            }

            if (result.affectedRows === 0) {
              return res.status(404).json({
                success: false,
                message: "Patient profile not found"
              });
            }

            return res.json({
              success: true,
              message: "Profile updated successfully"
            });
          }
        );
      }
    );
  }
);

// ================= DOCTOR PROFILE (READ ONLY) =================
// Only the logged-in doctor can view their own profile.
// Doctors cannot update their details through this endpoint.

router.get(
  "/doctor/profile",
  authenticateToken,
  authorizeRoles("doctor"),
  (req, res) => {
    const doctorId = req.user.id;

    const query = `
      SELECT
        id,
        name,
        email,
        specialization,
        created_at
      FROM users
      WHERE id = ? AND role = 'doctor'
    `;

    db.query(query, [doctorId], (err, results) => {
      if (err) {
        console.error("Fetch doctor profile error:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to fetch doctor profile"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found"
        });
      }

      return res.json({
        success: true,
        profile: results[0]
      });
    });
  }
);

// ================= UPDATE PATIENT / DOCTOR =================
// Admin only

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const { id } = req.params;
    const { name, email, phone, specialization } = req.body;

    if (!userIdRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    db.query(
      "SELECT id, role FROM users WHERE id = ?",
      [id],
      (err, results) => {
        if (err) {
          console.error("User lookup error:", err);

          return res.status(500).json({
            success: false,
            message: "Database error"
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found"
          });
        }

        const userRole = results[0].role;

        // UPDATE PATIENT

        if (userRole === "patient") {
          if (!phone?.trim()) {
            return res.status(400).json({
              success: false,
              message: "Phone is required"
            });
          }

          if (!/^[0-9]{10}$/.test(phone.trim())) {
            return res.status(400).json({
              success: false,
              message: "Phone must be 10 digits"
            });
          }

          const updateQuery = `
            UPDATE users
            SET name = ?, email = ?, phone = ?
            WHERE id = ? AND role = 'patient'
          `;

          db.query(
            updateQuery,
            [normalizedName, normalizedEmail, phone.trim(), id],
            (updateErr) => {
              if (updateErr) {
                console.error("Update patient error:", updateErr);

                if (updateErr.code === "ER_DUP_ENTRY") {
                  return res.status(400).json({
                    success: false,
                    message: "Email or phone already exists"
                  });
                }

                return res.status(500).json({
                  success: false,
                  message: "Patient update failed"
                });
              }

              return res.json({
                success: true,
                message: "Patient updated successfully"
              });
            }
          );

          return;
        }

        // UPDATE DOCTOR

        if (userRole === "doctor") {
          if (!specialization?.trim()) {
            return res.status(400).json({
              success: false,
              message: "Specialization is required"
            });
          }

          const updateQuery = `
            UPDATE users
            SET name = ?, email = ?, specialization = ?
            WHERE id = ? AND role = 'doctor'
          `;

          db.query(
            updateQuery,
            [
              normalizedName,
              normalizedEmail,
              specialization.trim(),
              id
            ],
            (updateErr) => {
              if (updateErr) {
                console.error("Update doctor error:", updateErr);

                if (updateErr.code === "ER_DUP_ENTRY") {
                  return res.status(400).json({
                    success: false,
                    message: "Email already exists"
                  });
                }

                return res.status(500).json({
                  success: false,
                  message: "Doctor update failed"
                });
              }

              return res.json({
                success: true,
                message: "Doctor updated successfully"
              });
            }
          );

          return;
        }

        return res.status(400).json({
          success: false,
          message: "This user role cannot be updated through this route"
        });
      }
    );
  }
);

// ================= DELETE PATIENT / DOCTOR =================
// Admin only

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const { id } = req.params;

    if (!userIdRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const deleteQuery = `
      DELETE FROM users
      WHERE id = ? AND role IN ('patient', 'doctor')
    `;

    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error("Delete user error:", err);

        if (
          err.code === "ER_ROW_IS_REFERENCED_2" ||
          err.code === "ER_ROW_IS_REFERENCED"
        ) {
          return res.status(409).json({
            success: false,
            message:
              "Cannot delete this user because related appointments or medical records exist"
          });
        }

        return res.status(500).json({
          success: false,
          message: "Delete failed"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Patient or doctor not found"
        });
      }

      return res.json({
        success: true,
        message: "User deleted successfully"
      });
    });
  }
);

// ================= FETCH ALL DOCTORS =================
// Authenticated patients, doctors and admins can view doctors.
// Never return password hashes.

router.get(
  "/doctors",
  authenticateToken,
  authorizeRoles("patient", "doctor", "admin"),
  (req, res) => {
    const query = `
      SELECT
        id,
        name,
        email,
        IFNULL(specialization, '') AS specialization
      FROM users
      WHERE role = 'doctor'
      ORDER BY id DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Fetch doctors error:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to fetch doctors"
        });
      }

      return res.json(results);
    });
  }
);

module.exports = router;
