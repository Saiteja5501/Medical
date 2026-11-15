
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const sendEmail = require("./utils/sendEmail");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Online Medical Services API is running successfully 🚀",
    version: "1.0.0",
  });
});

/* ================= TEMPORARY EMAIL TEST ================= */
// Available only during local development.
// Sends a test email to the configured sender address.
if (process.env.NODE_ENV !== "production") {
  app.post("/test-email", async (req, res) => {
    try {
      await sendEmail(
        process.env.EMAIL_USER,
        "HealthWave Email Test",
        `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #16b8a5;">Welcome to HealthWave!</h2>
            <p>Your Gmail SMTP configuration is working successfully.</p>
            <p>You can now send automated healthcare emails.</p>
            <br/>
            <strong>HealthWave Team</strong>
          </div>
        `
      );

      res.status(200).json({
        success: true,
        message: "Test email sent successfully!"
      });
    } catch (error) {
      console.error("Test email error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to send test email."
      });
    }
  });
}

/* ================= ROUTES ================= */
const medicalHistoryRoutes = require("./routes/medicalHistory");
const prescriptionRoutes = require("./routes/prescriptions");
const appointmentRoutes = require("./routes/appointments");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const reportsRoutes = require("./routes/reports");
const availabilityRoutes = require("./routes/availability");
const doctorsRoutes = require("./routes/doctors");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/doctors", doctorsRoutes);
app.use("/medical-history", medicalHistoryRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/reports", reportsRoutes);
app.use("/availability", availabilityRoutes);

/* ================= CREATE HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET.IO SETUP ================= */
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

/* ================= GLOBAL SOCKET ================= */
global.io = io;

/* ================= SOCKET CONNECTION ================= */
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`✅ User joined room: user_${userId}`);
    }
  });

  socket.on("joinAdmin", () => {
    socket.join("admin_room");
    console.log("✅ Admin joined admin_room");
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
