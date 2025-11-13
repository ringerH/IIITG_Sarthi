const Ride = require("../Models/Ride");
const Request = require("../Models/Request");

// GET: Get all ride posts
const getRides = async (req, res) => {
  try {
    console.log("Attempting to fetch rides from database...");
    const rides = await Ride.find().sort({ createdAt: -1 });
    console.log(`Successfully fetched ${rides.length} rides`);
    res.status(200).json(rides); // Send the rides as JSON response
  } catch (error) {
    console.error("Error in getRides:", error);
    res.status(500).json({
      message: "Error fetching rides",
      error: error.message, // Send the error message if any
    });
  }
};

// CREATE: Create a new ride post
// If the user is authenticated, attach owner info from req.user
const createRide = async (req, res) => {
  try {
    console.log("Received create ride request with body:", req.body);

    const {
      rideTitle,
      pickupLocation,
      dropoffLocation,
      availableSeats,
      rideDate,
      description,
    } = req.body;

    // Validation
    if (
      !rideTitle ||
      !pickupLocation ||
      !dropoffLocation ||
      description == null
    ) {
      console.log("Validation failed: Missing required fields");
      return res.status(400).json({
        message: "Missing required fields",
        required: [
          "rideTitle",
          "pickupLocation",
          "dropoffLocation",
          "description",
        ],
      });
    }

    const seats = Number(availableSeats);
    if (!Number.isInteger(seats) || seats < 0) {
      console.log("Validation failed: Invalid seats value:", availableSeats);
      return res.status(400).json({
        message: "Available seats must be a non-negative integer",
      });
    }

    const date = new Date(rideDate);
    if (!rideDate || isNaN(date.valueOf())) {
      console.log("Validation failed: Invalid date:", rideDate);
      return res.status(400).json({
        message: "Invalid ride date format",
      });
    }

    const newRide = new Ride({
      rideTitle,
      pickupLocation,
      dropoffLocation,
      availableSeats: seats,
      rideDate: date,
      description,
      ownerId: req.user?.id || null,
      ownerRole: req.user?.role || null,
      ownerName: req.user?.email || null,
      ownerEmail: req.user?.email || null,
    });

    const savedRide = await newRide.save();
    console.log("Successfully created new ride:", savedRide);
    res.status(201).json(savedRide);
  } catch (error) {
    console.error("Error in createRide:", error);
    res.status(500).json({
      message: "Error creating ride",
      error: error.message,
    });
  }
};

module.exports = { getRides, createRide };
