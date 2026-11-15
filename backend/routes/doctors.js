
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

// ================= GET ALL DOCTORS =================
// Admin only

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
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

      return res.json({
        success: true,
        doctors: results
      });
    });
  }
);

// ================= ADD DOCTOR =================
// Admin only

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { name, email, password, specialization } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      !specialization?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must start with a capital letter, contain at least 8 characters, one number and one special character"
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedSpecialization = specialization.trim();

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        INSERT INTO users
          (name, email, password, role, specialization)
        VALUES (?, ?, ?, 'doctor', ?)
      `;

      db.query(
        query,
        [
          normalizedName,
          normalizedEmail,
          hashedPassword,
          normalizedSpecialization
        ],
        (err, result) => {
          if (err) {
            console.error("Add doctor error:", err);

            if (err.code === "ER_DUP_ENTRY") {
              return res.status(400).json({
                success: false,
                message: "Email already exists"
              });
            }

            return res.status(500).json({
              success: false,
              message: "Unable to add doctor"
            });
          }

          return res.status(201).json({
            success: true,
            message: "Doctor added successfully",
            doctorId: result.insertId
          });
        }
      );
    } catch (error) {
      console.error("Doctor password hashing error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);

// ================= UPDATE DOCTOR =================
// Admin only

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { id } = req.params;

    const {
      name,
      email,
      password,
      specialization
    } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID"
      });
    }

    if (
      !name?.trim() ||
      !email?.trim() ||
      !specialization?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and specialization are required"
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedSpecialization = specialization.trim();

    let updateQuery;
    let values;

    try {
      if (password) {
        if (!passwordRegex.test(password)) {
          return res.status(400).json({
            success: false,
            message:
              "Password must start with a capital letter, contain at least 8 characters, one number and one special character"
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        updateQuery = `
          UPDATE users
          SET name = ?,
              email = ?,
              password = ?,
              specialization = ?
          WHERE id = ? AND role = 'doctor'
        `;

        values = [
          normalizedName,
          normalizedEmail,
          hashedPassword,
          normalizedSpecialization,
          id
        ];
      } else {
        updateQuery = `
          UPDATE users
          SET name = ?,
              email = ?,
              specialization = ?
          WHERE id = ? AND role = 'doctor'
        `;

        values = [
          normalizedName,
          normalizedEmail,
          normalizedSpecialization,
          id
        ];
      }

      db.query(updateQuery, values, (err, result) => {
        if (err) {
          console.error("Update doctor error:", err);

          if (err.code === "ER_DUP_ENTRY") {
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

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Doctor not found or no changes made"
          });
        }

        return res.json({
          success: true,
          message: "Doctor updated successfully"
        });
      });
    } catch (error) {
      console.error("Doctor update error:", error);

      return res.status(500).json({
        success: false,
        message: "Doctor update failed"
      });
    }
  }
);

// ================= DELETE DOCTOR =================
// Admin only

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID"
      });
    }

    const query = `
      DELETE FROM users
      WHERE id = ? AND role = 'doctor'
    `;

    db.query(query, [id], (err, result) => {
      if (err) {
        console.error("Delete doctor error:", err);

        if (
          err.code === "ER_ROW_IS_REFERENCED_2" ||
          err.code === "ER_ROW_IS_REFERENCED"
        ) {
          return res.status(409).json({
            success: false,
            message:
              "Cannot delete this doctor because related appointments or medical records exist"
          });
        }

        return res.status(500).json({
          success: false,
          message: "Doctor deletion failed"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found"
        });
      }

      return res.json({
        success: true,
        message: "Doctor deleted successfully"
      });
    });
  }
);

module.exports = router;
