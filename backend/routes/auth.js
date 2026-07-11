const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
/* ================= PASSWORD VALIDATOR ================= */
const isPasswordValid = (password) => {
  const regex =
    /^[A-Z](?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return regex.test(password);
};

/* ==================== REGISTER PATIENT ==================== */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const role = "patient";

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  if (!isPasswordValid(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must start with capital letter, contain number and special character, and be at least 8 characters long"
    });
  }

  const checkQuery = "SELECT id FROM users WHERE email = ?";

  db.query(checkQuery, [email], async (err, results) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err
      });

    if (results.length > 0)
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery =
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

    db.query(
      insertQuery,
      [name, email, hashedPassword, role],
      (err, result) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "Error registering user",
            error: err
          });

        res.json({
          success: true,
          message: "Patient registered successfully",
          userId: result.insertId
        });
      }
    );
  });
});

/* ==================== LOGIN ==================== */
router.post("/login", (req, res) => {
  const { email, password, role } = req.body;
  const normalizedRole = role ? role.toLowerCase() : "patient";

  const query =
    "SELECT * FROM users WHERE email = ? AND role = ?";

  db.query(query, [email, normalizedRole], async (err, results) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err
      });

    if (results.length === 0)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or role"
      });

    const user = results[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        specialization: user.specialization || ""
      }
    });
  });
});

/* ==================== ADD DOCTOR (ADMIN ONLY) ==================== */
router.post("/add-doctor", async (req, res) => {
  const {
    adminEmail,
    doctorName,
    doctorEmail,
    doctorPassword,
    specialization
  } = req.body;

  console.log("Incoming Add Doctor Request:", req.body);

  if (!adminEmail) {
    return res.status(400).json({
      success: false,
      message: "Admin email missing"
    });
  }

  if (!doctorName || !doctorEmail || !doctorPassword || !specialization) {
    return res.status(400).json({
      success: false,
      message: "All doctor fields are required"
    });
  }

  if (!isPasswordValid(doctorPassword)) {
    return res.status(400).json({
      success: false,
      message:
        "Doctor password must start with capital letter, contain number and special character, and be at least 8 characters long"
    });
  }

  // ✅ Verify admin
  const adminQuery =
    "SELECT id FROM users WHERE email = ? AND role = 'admin'";

  db.query(adminQuery, [adminEmail], async (err, results) => {
    if (err) {
      console.log("Admin check error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err
      });
    }

    if (results.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Only admin can add doctors"
      });
    }

    // ✅ Check duplicate doctor email
    const checkDoctor =
      "SELECT id FROM users WHERE email = ?";

    db.query(checkDoctor, [doctorEmail], async (err, existing) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err
        });

      if (existing.length > 0)
        return res.status(400).json({
          success: false,
          message: "Doctor email already exists"
        });

      const hashedPassword = await bcrypt.hash(
        doctorPassword,
        10
      );

      const insertDoctor =
        "INSERT INTO users (name, email, password, role, specialization) VALUES (?, ?, ?, 'doctor', ?)";

      db.query(
        insertDoctor,
        [doctorName, doctorEmail, hashedPassword, specialization],
        (err, result) => {
          if (err)
            return res.status(500).json({
              success: false,
              message: "Error adding doctor",
              error: err
            });

          res.json({
            success: true,
            message: "Doctor added successfully",
            doctorId: result.insertId
          });
        }
      );
    });
  });
});

module.exports = router;
