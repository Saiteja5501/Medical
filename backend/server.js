const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */
const medicalHistoryRoutes = require("./routes/medicalHistory");
const prescriptionRoutes = require("./routes/prescriptions");
const appointmentRoutes = require("./routes/appointments");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const reportsRoutes = require("./routes/reports");
const availabilityRoutes = require("./routes/availability");

// ✅ ADD THIS
const doctorsRoutes = require("./routes/doctors");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// ✅ ADD THIS
app.use("/doctors", doctorsRoutes);

app.use("/medical-history", medicalHistoryRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/reports", reportsRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/availability", availabilityRoutes);

/* ================= CREATE HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET.IO SETUP ================= */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

/* 🔥 IMPORTANT: Make io available globally (used in routes) */
global.io = io;

/* ================= SOCKET CONNECTION ================= */
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User joined room: user_${userId}`);
    }
  });

  socket.on("joinAdmin", () => {
    socket.join("admin_room");
    console.log("Admin joined admin_room");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* ================= START SERVER ================= */
server.listen(5000, () => {
  console.log("✅ Server running on port 5000 with Socket.io");
});