// routes/doctors.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const JWT_SECRET = "your_jwt_secret";

// Middleware to check admin role
function adminAuth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "Token invalid" });
    if (decoded.role !== "admin") return res.status(403).json({ msg: "Access denied" });
    req.user = decoded;
    next();
  });
}

//////////////////////////////////////////////////////////
// ✅ GET ALL DOCTORS (FIXED)
//////////////////////////////////////////////////////////
router.get("/", adminAuth, (req, res) => {
  db.query(
    "SELECT id, name, email, password, IFNULL(specialization,'') AS specialization FROM users WHERE role='doctor'",
    (err, results) => {
      if (err) return res.status(500).json(err);

      res.json(results);
    }
  );
});

//////////////////////////////////////////////////////////
// ✅ ADD DOCTOR (FIXED - specialization added)
//////////////////////////////////////////////////////////
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password, role, specialization) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, "doctor", specialization],
      (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({ msg: "Doctor added successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

//////////////////////////////////////////////////////////
// ✅ UPDATE DOCTOR (FIXED - specialization added)
//////////////////////////////////////////////////////////
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "UPDATE users SET name=?, email=?, password=?, specialization=? WHERE id=? AND role='doctor'",
      [name, email, hashedPassword, specialization, req.params.id],
      (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({ msg: "Doctor updated successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

//////////////////////////////////////////////////////////
// ✅ DELETE DOCTOR (UNCHANGED)
//////////////////////////////////////////////////////////
router.delete("/:id", adminAuth, (req, res) => {
  db.query(
    "DELETE FROM users WHERE id=? AND role='doctor'",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({ msg: "Doctor deleted successfully" });
    }
  );
});

module.exports = router;