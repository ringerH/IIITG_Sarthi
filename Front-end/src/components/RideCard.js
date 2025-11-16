import React, { useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes for prop validation
import "../App.css"; // Uses global styles like .btn
import api from "../api/config";

// Helper function to get auth token
const getAuthToken = () => {
  try {
    return typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  } catch (e) {
    return null;
  }
};

const RideCard = ({ ride }) => {
  // Add loading state for the join button
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    const token = getAuthToken();
    if (!token) {
      window.alert("Please sign in to join rides");
      return;
    }

    setIsLoading(true); // Set loading to true when request starts

    try {
      const res = await api.post(
        `/rides/${ride._id}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && res.data.success) {
        window.alert("Request sent to ride owner");
      } else {
        window.alert("Failed to send request");
      }
    } catch (err) {
      console.error("Join request error:", err);
      const msg =
        err.response?.data?.message || err.message || "Error sending request";
      window.alert(msg);
    } finally {
      setIsLoading(false); // Set loading to false when request finishes
    }
  };

  // Format the date for better readability
  const formattedDate = new Date(ride.rideDate).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="ride-card">
      {" "}
      {/* This class is defined in App.css and RideList.css */}
      <h3>{ride.rideTitle}</h3>
      <p>
        <strong>From:</strong> {ride.pickupLocation}
      </p>
      <p>
        <strong>To:</strong> {ride.dropoffLocation}
      </p>
      <p>
        <strong>Available Seats:</strong> {ride.availableSeats}
      </p>
      <p>
        <strong>Date:</strong> {formattedDate}
      </p>
      <p>
        <strong>Description:</strong> {ride.description}
      </p>
      
      {/* Use the .ride-card-footer class from RideList.css */}
      <div className="ride-card-footer">
        <button
          className="btn btn-secondary" // Uses .btn class from App.css
          onClick={handleJoin}
          disabled={isLoading} // Disable button when loading
        >
          {isLoading ? "Sending..." : "Join Ride"}
        </button>
      </div>
    </div>
  );
};

// Add PropTypes for robustness and to catch errors
RideCard.propTypes = {
  ride: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    rideTitle: PropTypes.string.isRequired,
    pickupLocation: PropTypes.string.isRequired,
    dropoffLocation: PropTypes.string.isRequired,
    availableSeats: PropTypes.number.isRequired,
    rideDate: PropTypes.string.isRequired, // Assumes date is passed as a string
    description: PropTypes.string,
  }).isRequired,
};

export default RideCard;