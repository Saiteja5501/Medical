// routes/history.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_jwt_secret";

// Auth middleware
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "Token invalid" });
    req.user = decoded;
    next();
  });
}

// Doctor: Add medical history
router.post("/", auth, (req, res) => {
  if (req.user.role !== "doctor") return res.status(403).json({ msg: "Access denied" });
  const { patient_id, details } = req.body;
  db.query(
    "INSERT INTO medical_history (patient_id, doctor_id, details) VALUES (?,?,?)",
    [patient_id, req.user.id, details],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Medical history added" });
    }
  );
});

// Patient: View own medical history
router.get("/", auth, (req, res) => {
  if (req.user.role !== "patient") return res.status(403).json({ msg: "Access denied" });

  db.query(
    "SELECT * FROM medical_history WHERE patient_id=?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

module.exports = router;
