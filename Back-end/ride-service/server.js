require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rideRoutes = require("./Routes/rideRoutes");
const userRoutes = require("./Routes/userRoutes");

const app = express();
const http = require("http");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 5001; 

const DEFAULT_FRONTEND_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];
const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || DEFAULT_FRONTEND_ORIGINS[0];

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      if (
        !incomingOrigin ||
        DEFAULT_FRONTEND_ORIGINS.indexOf(incomingOrigin) !== -1 ||
        incomingOrigin === FRONTEND_ORIGIN
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS: origin not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Request Headers:", req.headers);
  next();
});

// Use ride and auth routes under /api
app.use("/api", rideRoutes);
// app.use("/api", authRoutes); // ⬅️ REMOVE THIS
app.use("/api/user", userRoutes); // ⬅️ KEEP THIS for ride requests

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Ride-Service connected to MongoDB")) // ⬅️ Renamed for clarity
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// ... all your Socket.IO logic remains exactly the same ...
// (Socket.IO code omitted for brevity)
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: DEFAULT_FRONTEND_ORIGINS, 
        methods: ["GET", "POST"], 
        credentials: true
    } 
});
const socketUtil = require("./utils/socket");
socketUtil.setIO(io);

io.on("connection", (socket) => {
    // ... all your io.on() logic here ...
    console.log("Socket connected:", socket.id);
    // ...
});


// ... all your startServer logic remains exactly the same ...
// (startServer code omitted for brevity)
const startServer = (port) => {
    server.on("error", (err) => {
        // ... all your server.on('error') logic here ...
    });
    
    server.listen(port, () => {
        console.log(`Ride-Service is running on port ${port}`); // ⬅️ Renamed for clarity
        console.log(`Allowed frontend origin: ${FRONTEND_ORIGIN}`);
    });
};

startServer(PORT);