const mongoose = require("mongoose");

// Define the schema for the Ride post
const rideSchema = new mongoose.Schema(
  {
    rideTitle: {
      type: String,
      required: true,
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    rideDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Owner information (attached when a user creates a ride)
    ownerId: {
      type: String,
    },
    ownerRole: {
      type: String,
    },
    ownerName: {
      type: String,
    },
    ownerEmail: {
      type: String,
    },
  },
  { timestamps: true }
); // Automatically add createdAt and updatedAt fields

// Create the model from the schema
const Ride = mongoose.model("Ride", rideSchema);

module.exports = Ride;
