const express = require("express");
const router = express.Router();
const { createRide, getRides } = require("../Controllers/rideController");
const verifyAuth = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");
const chatRoutes = require("./chatRoutes");

// POST: Create a new ride post (optional authentication to attach owner info)
// Use optionalAuth so anonymous users can still create rides; if a valid
// token is present, owner fields will be attached server-side.
router.post("/rides", optionalAuth, async (req, res) => {
  console.log("Creating rides");
  try {
    console.log("Received data for new ride:", req.body);
    await createRide(req, res);
  } catch (err) {
    console.error("Error in creating ride:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// POST: Join a ride (create a request)
router.post("/rides/:id/join", verifyAuth, async (req, res) => {
  try {
    const rideId = req.params.id;
    const RideModel = require("../Models/Ride");
    const ride = await RideModel.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    const Request = require("../Models/Request");
    const requester = req.user;

    // If ride.ownerId is missing but ownerEmail exists, try to find owner's user id
    let ownerId = ride.ownerId || null;
    if (!ownerId && ride.ownerEmail) {
      // search across user collections
      const Student = require("../Models/Students");
      const Faculty = require("../Models/Faculty");
      const Admin = require("../Models/Admin");
      const foundStudent = await Student.findOne({ email: ride.ownerEmail });
      const foundFaculty = !foundStudent
        ? await Faculty.findOne({ email: ride.ownerEmail })
        : null;
      const foundAdmin =
        !foundStudent && !foundFaculty
          ? await Admin.findOne({ email: ride.ownerEmail })
          : null;
      const owner = foundStudent || foundFaculty || foundAdmin || null;
      if (owner) ownerId = owner._id.toString();
    }

    // Prevent owner from joining their own ride
    if (
      (ride.ownerId && ride.ownerId === requester.id) ||
      (ride.ownerEmail && ride.ownerEmail === requester.email)
    ) {
      return res.status(400).json({ message: "Cannot join your own ride" });
    }

    const newReq = new Request({
      rideId: ride._id.toString(),
      rideTitle: ride.rideTitle,
      requesterId: requester.id,
      requesterName: requester.email,
      requesterEmail: requester.email,
      toUserId: ownerId,
      toUserEmail: ride.ownerEmail || null,
    });

    const saved = await newReq.save();
    return res.status(201).json({ success: true, request: saved });
  } catch (err) {
    console.error("Error creating join request:", err);
    return res.status(500).json({ message: "Error creating join request" });
  }
});

// GET: Get all ride posts
router.get("/rides", async (req, res) => {
  try {
    console.log("Fetching all rides...");
    await getRides(req, res);
  } catch (err) {
    console.error("Error fetching rides:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// Mount chat routes under /api
router.use("/", chatRoutes);

module.exports = router;
