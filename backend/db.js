const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Saiteja@5501",
  database: "medical",

  // ✅ FIX TIMEZONE ISSUE
  timezone: "+05:30"   // IST
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

module.exports = db;
