const Ride = require("../Models/Ride");
const Request = require("../Models/Request");

// GET: Get all ride posts with optional search, date filtering, and sorting
const getRides = async (req, res) => {
  try {
    console.log("Attempting to fetch rides from database with query:", req.query);
    const { search, startDate, endDate, sortBy, sortOrder } = req.query;

    const query = {};

    // 1. Keyword search (matches rideTitle, pickupLocation, or dropoffLocation case-insensitively)
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { rideTitle: searchRegex },
        { pickupLocation: searchRegex },
        { dropoffLocation: searchRegex },
      ];
    }

    // 2. Date filtering
    if (startDate || endDate) {
      query.rideDate = {};
      if (startDate) {
        query.rideDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.rideDate.$lte = new Date(endDate);
      }
    }

    // 3. Sorting
    // Allowed sorting fields: rideDate, distance, availableSeats, createdAt
    const validSortFields = ["rideDate", "distance", "availableSeats", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    // Default order is ascending (1) for dates/distance/seats, descending (-1) for createdAt
    let defaultOrder = 1;
    if (sortField === "createdAt") {
      defaultOrder = -1;
    }

    let order = defaultOrder;
    if (sortOrder === "asc") {
      order = 1;
    } else if (sortOrder === "desc") {
      order = -1;
    }

    const sortOption = { [sortField]: order };

    const rides = await Ride.find(query).sort(sortOption);
    console.log(`Successfully fetched ${rides.length} rides`);
    res.status(200).json(rides); // Send the rides as JSON response
  } catch (error) {
    console.error("Error in getRides:", error);
    res.status(500).json({
      message: "Error fetching rides",
      error: error.message,
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
      distance, // Optional distance field
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

    let parsedDistance = 0;
    if (distance !== undefined && distance !== null && distance !== "") {
      parsedDistance = Number(distance);
      if (isNaN(parsedDistance) || parsedDistance < 0) {
        console.log("Validation failed: Invalid distance value:", distance);
        return res.status(400).json({
          message: "Distance must be a non-negative number",
        });
      }
    }

    const newRide = new Ride({
      rideTitle,
      pickupLocation,
      dropoffLocation,
      availableSeats: seats,
      rideDate: date,
      distance: parsedDistance,
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
