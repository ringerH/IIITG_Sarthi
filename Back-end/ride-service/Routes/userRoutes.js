// ride-service/Routes/userRoutes.js (THE REAL FIX)

const express = require("express");
const verifyAuth = require("../middleware/authMiddleware");

// We only need the models for Requests and Rides
const Request = require("../Models/Request");
const Ride = require("../Models/Ride");
const Chat = require("../Models/Chat");
const socketUtil = require("../utils/socket");

const router = express.Router();

// --- Registration and Profile Routes ---
//
// ALL REGISTRATION AND PROFILE ROUTES (GET /me, PUT /me) HAVE BEEN MOVED
// TO THE auth-service. THIS FILE ONLY HANDLES RIDE REQUESTS.
//

// --- Protected Ride Request endpoints ---

// GET requests for owner: fetch incoming join requests for the signed-in user
router.get("/requests", verifyAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ message: "Missing user id" });

    const userEmail = req.user?.email;
    const requests = await Request.find({
      $or: [{ toUserId: userId }, { toUserEmail: userEmail }],
    }).sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (err) {
    console.error("Error fetching requests:", err);
    return res.status(500).json({ message: "Error fetching requests" });
  }
});

// GET /api/user/requests/outgoing -> requests created by the signed-in user
router.get("/requests/outgoing", verifyAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ message: "Missing user id" });

    const requests = await Request.find({ requesterId: userId }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, requests });
  } catch (err) {
    console.error("Error fetching outgoing requests:", err);
    return res
      .status(500)
      .json({ message: "Error fetching outgoing requests" });
  }
});

// GET /api/user/accepted -> all accepted requests where user is owner or requester
router.get("/accepted", verifyAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId) return res.status(400).json({ message: "Missing user id" });

    const requests = await Request.find({
      status: "accepted",
      $or: [
        { toUserId: userId },
        { requesterId: userId },
        { toUserEmail: userEmail },
      ],
    }).sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (err) {
    console.error("Error fetching accepted requests:", err);
    return res
      .status(500)
      .json({ message: "Error fetching accepted requests" });
  }
});

// PATCH /api/user/requests/:id -> owner accepts or rejects a join request
router.patch("/requests/:id", verifyAuth, async (req, res) => {
  try {
    const reqId = req.params.id;
    const { status } = req.body || {};
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const requestDoc = await Request.findById(reqId);
    if (!requestDoc)
      return res.status(404).json({ message: "Request not found" });

    // Only the ride owner (toUserId) can change the status
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (
      !(requestDoc.toUserId === userId || requestDoc.toUserEmail === userEmail)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this request" });
    }

    // If accepting, ensure ride has available seats and decrement atomically
    if (status === "accepted") {
      if (!requestDoc.rideId) {
        return res
          .status(400)
          .json({ message: "Request has no ride attached" });
      }
      const updatedRide = await Ride.findOneAndUpdate(
        { _id: requestDoc.rideId, availableSeats: { $gt: 0 } },
        { $inc: { availableSeats: -1 } },
        { new: true }
      );
      if (!updatedRide) {
        return res.status(400).json({ message: "No seats available" });
      }
    }

    requestDoc.status = status;

    // When accepted, create a Chat between requester and owner (if not exists)
    if (status === "accepted") {
      try {
        const participants = [requestDoc.requesterId, requestDoc.toUserId]
          .filter(Boolean)
          .map(String);
        
        if (participants.length !== 2) {
            console.warn("Skipping chat creation: not enough participant IDs", participants);
        } else {
          let chat = await Chat.findOne({
            participants: { $all: participants, $size: 2 },
          });
          if (!chat) {
            chat = await Chat.create({ participants });
          }
          requestDoc.chatId = chat._id.toString();

          // Notify participants via Socket.IO
          try {
            const io = socketUtil.getIO();
            if (io) {
              participants.forEach((p) => {
                try {
                  io.to("user:" + p).emit("chatCreated", {
                    chatId: chat._id.toString(),
                    participants,
                  });
                } catch (e) {}
              });
            }
          } catch (emitErr) {
            console.error("Error emitting chatCreated event:", emitErr);
          }
        }
      } catch (cErr) {
        console.error("Error creating chat for accepted request:", cErr);
      }
    }

    await requestDoc.save();
    return res.json({ success: true, request: requestDoc });
  } catch (err) {
    console.error("Error updating request status:", err);
    return res.status(500).json({ message: "Error updating request" });
  }
});

module.exports = router;