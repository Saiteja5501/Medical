
const express = require("express");
const router = express.Router();

const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

// ================= DATABASE QUERY HELPER =================

const query = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// ================= VALIDATORS =================

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isPasswordValid = (password) => {
  const regex =
    /^[A-Z](?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  return typeof password === "string" && regex.test(password);
};

// ================= REGISTER PATIENT =================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPhone = phone?.trim();

    if (!normalizedName || !normalizedEmail || !password || !normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    if (!/^[0-9]{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly 10 digits"
      });
    }

    if (!isPasswordValid(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must start with a capital letter, contain a number and special character, and be at least 8 characters long"
      });
    }

    const existingUsers = await query(
      "SELECT id FROM users WHERE email = ? OR phone = ?",
      [normalizedEmail, normalizedPhone]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users
       (name, email, password, role, phone)
       VALUES (?, ?, ?, 'patient', ?)`,
      [
        normalizedName,
        normalizedEmail,
        hashedPassword,
        normalizedPhone
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      userId: result.insertId
    });

  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
});

// ================= LOGIN =================

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedRole = role ? role.toLowerCase() : "patient";

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const allowedRoles = ["patient", "doctor", "admin"];

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error"
      });
    }

    const results = await query(
      `SELECT id, name, email, password, role, specialization
       FROM users
       WHERE email = ? AND role = ?`,
      [normalizedEmail, normalizedRole]
    );

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or role"
      });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        specialization: user.specialization || ""
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete login"
    });
  }
});

// ================= FORGOT PASSWORD =================

router.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    // Search all account roles, not just patients.
    const users = await query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    // Avoid revealing whether an email is registered.
    if (users.length === 0) {
      return res.json({
        success: true,
        message: "If the account exists, an OTP will be sent."
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Remove previous OTP/reset records for this email.
    await query(
      "DELETE FROM password_reset_otps WHERE email = ?",
      [email]
    );

    // Save a new OTP with a 5-minute expiry.
    await query(
      `INSERT INTO password_reset_otps
       (email, otp_hash, expires_at, attempts, verified)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 0, FALSE)`,
      [email, otpHash]
    );

    try {
      await sendEmail(
        email,
        "HealthWave Password Reset OTP",
        `
          <div style="font-family:Arial,sans-serif;padding:20px;">
            <h2>HealthWave Password Reset</h2>
            <p>Your password reset OTP is:</p>

            <h1 style="letter-spacing:8px;color:#16a085;">
              ${otp}
            </h1>

            <p>This OTP expires in 5 minutes.</p>
            <p>You have a maximum of 5 verification attempts.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `
      );

    } catch (emailError) {
      console.error("OTP email error:", emailError);

      await query(
        "DELETE FROM password_reset_otps WHERE email = ?",
        [email]
      );

      return res.status(500).json({
        success: false,
        message: "Unable to send OTP email. Please try again."
      });
    }

    return res.json({
      success: true,
      message: "If the account exists, an OTP will be sent."
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request"
    });
  }
});

// ================= VERIFY RESET OTP =================

router.post("/verify-reset-otp", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();

    if (!email || !isValidEmail(email) || !/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Valid email and 6-digit OTP are required"
      });
    }

    const results = await query(
      `SELECT id, otp_hash, attempts
       FROM password_reset_otps
       WHERE email = ?
       AND expires_at > NOW()
       AND verified = FALSE
       ORDER BY id DESC
       LIMIT 1`,
      [email]
    );

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired. Request a new OTP."
      });
    }

    const record = results[0];

    if (record.attempts >= 5) {
      await query(
        "DELETE FROM password_reset_otps WHERE id = ?",
        [record.id]
      );

      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new OTP."
      });
    }

    const isMatch = await bcrypt.compare(otp, record.otp_hash);

    if (!isMatch) {
      await query(
        "UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = ?",
        [record.id]
      );

      return res.status(400).json({
        success: false,
        message: "Incorrect OTP"
      });
    }

    // Generate a cryptographically secure, single-use reset token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA-256 hash of the token.
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await query(
      `UPDATE password_reset_otps
       SET verified = TRUE,
           reset_token_hash = ?,
           reset_token_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
       WHERE id = ?`,
      [resetTokenHash, record.id]
    );

    return res.json({
      success: true,
      message: "OTP verified successfully",
      resetToken
    });

  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP"
    });
  }
});

// ================= RESET PASSWORD =================

router.post("/reset-password", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { newPassword, resetToken } = req.body;

    if (!email || !isValidEmail(email) || !newPassword || !resetToken) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token and new password are required"
      });
    }

    if (!isPasswordValid(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must start with a capital letter, contain a number and special character, and be at least 8 characters long"
      });
    }

    if (
      typeof resetToken !== "string" ||
      !/^[a-f0-9]{64}$/i.test(resetToken)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const records = await query(
      `SELECT id
       FROM password_reset_otps
       WHERE email = ?
       AND verified = TRUE
       AND reset_token_hash = ?
       AND reset_token_expires_at > NOW()
       ORDER BY id DESC
       LIMIT 1`,
      [email, resetTokenHash]
    );

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or expired. Verify your OTP again."
      });
    }

    const record = records[0];

    // Consume the token before changing the password.
    // It cannot be reused after this update succeeds.
    const consumed = await query(
      `UPDATE password_reset_otps
       SET reset_token_hash = NULL,
           reset_token_expires_at = NULL
       WHERE id = ?
       AND reset_token_hash = ?
       AND reset_token_expires_at > NOW()`,
      [record.id, resetTokenHash]
    );

    if (consumed.affectedRows !== 1) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or has already been used"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateResult = await query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );

    if (updateResult.affectedRows !== 1) {
      return res.status(404).json({
        success: false,
        message: "Unable to find the account"
      });
    }

    // Remove the reset record after successful password change.
    await query(
      "DELETE FROM password_reset_otps WHERE email = ?",
      [email]
    );

    return res.json({
      success: true,
      message: "Password reset successfully. Please login."
    });

  } catch (error) {
    console.error("Password reset error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password"
    });
  }
});

// ================= ADD DOCTOR (ADMIN ONLY) =================

router.post(
  "/add-doctor",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const {
        doctorName,
        doctorEmail,
        doctorPassword,
        specialization
      } = req.body;

      const normalizedName = doctorName?.trim();
      const normalizedEmail = doctorEmail?.trim().toLowerCase();
      const normalizedSpecialization = specialization?.trim();

      if (
        !normalizedName ||
        !normalizedEmail ||
        !doctorPassword ||
        !normalizedSpecialization
      ) {
        return res.status(400).json({
          success: false,
          message: "All doctor fields are required"
        });
      }

      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid doctor email"
        });
      }

      if (!isPasswordValid(doctorPassword)) {
        return res.status(400).json({
          success: false,
          message:
            "Doctor password must start with a capital letter, contain a number and special character, and be at least 8 characters long"
        });
      }

      const existingUsers = await query(
        "SELECT id FROM users WHERE email = ?",
        [normalizedEmail]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Doctor email already exists"
        });
      }

      const hashedPassword = await bcrypt.hash(doctorPassword, 10);

      const result = await query(
        `INSERT INTO users
         (name, email, password, role, specialization)
         VALUES (?, ?, ?, 'doctor', ?)`,
        [
          normalizedName,
          normalizedEmail,
          hashedPassword,
          normalizedSpecialization
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Doctor added successfully",
        doctorId: result.insertId
      });

    } catch (error) {
      console.error("Add doctor error:", error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "Doctor email already exists"
        });
      }

      return res.status(500).json({
        success: false,
        message: "Unable to add doctor"
      });
    }
  }
);

module.exports = router;
