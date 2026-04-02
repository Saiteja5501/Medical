const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// ================= PASSWORD REGEX =================
const passwordRegex =
  /^[A-Z](?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{7,}$/;

// ================= FETCH ALL PATIENTS =================
router.get("/", (req, res) => {
  const query = `
    SELECT id, name, email, phone, created_at
    FROM users
    WHERE role = 'patient'
    ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: true, patients: results });
  });
});

// ================= ADD NEW PATIENT =================
router.post("/", async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must start with capital letter, be 8 characters long, include at least one number and one special character"
    });
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Phone must be 10 digits"
    });
  }

  try {
    const checkQuery = `
      SELECT id FROM users
      WHERE email = ? OR phone = ?
    `;

    db.query(checkQuery, [email, phone], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }

      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email or phone already exists"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO users (name, email, password, role, phone)
        VALUES (?, ?, ?, 'patient', ?)
      `;

      db.query(
        insertQuery,
        [name, email, hashedPassword, phone],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              success: false,
              message: "Insert failed"
            });
          }

          res.json({
            success: true,
            message: "Patient registered successfully",
            patientId: result.insertId
          });
        }
      );
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// ================= UPDATE PATIENT =================
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: "Name, email and phone are required"
    });
  }

  if (!/^[0-9]{10}$/.test(phone)) {
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

  db.query(updateQuery, [name, email, phone, id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          success: false,
          message: "Email or phone already exists"
        });
      }

      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Update failed"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    res.json({
      success: true,
      message: "Patient updated successfully"
    });
  });
});

// ================= DELETE PATIENT =================
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const deleteQuery = `
    DELETE FROM users
    WHERE id = ? AND role = 'patient'
  `;

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Delete failed"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    res.json({
      success: true,
      message: "Patient deleted successfully"
    });
  });
});

////////////////////////////////////////////////////////////
// ✅ ADD THIS (DOCTOR API - DO NOT REMOVE ANYTHING ABOVE)
////////////////////////////////////////////////////////////

// ================= FETCH ALL DOCTORS =================
router.get("/doctors", (req, res) => {
  const query = `
    SELECT id, name, email, password, IFNULL(specialization,'') AS specialization
    FROM users
    WHERE role = 'doctor'
    ORDER BY id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    res.json(results);
  });
});

module.exports = router;