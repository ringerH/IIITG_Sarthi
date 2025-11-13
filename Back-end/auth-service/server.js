// auth-service/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes"); 
const userRoutes = require("./routes/userRoutes"); // Import userRoutes
const app = express();
const PORT = process.env.PORT || 5002; 

const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[AUTH-SERVICE] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api", authRoutes); // Mount the auth routes (/api/auth/google)
app.use("/api/user", userRoutes); // Mount the user routes (/api/user/me)

app.use((req, res) => {
  console.log(`[AUTH-SERVICE] 404: ${req.method} ${req.path}`);
  res.status(404).json({ message: "Route not found", path: req.path });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Auth-Service connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Auth-Service running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));