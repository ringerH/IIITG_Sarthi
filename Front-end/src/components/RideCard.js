import React from "react";
import "../App.css";// Import the CSS file for styling
import api from "../api/config";

// Helper to get auth token from localStorage
const getAuthToken = () => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  } catch (e) {
    return null;
  }
};

const RideCard = ({ ride }) => {
  const handleJoin = async () => {
    const token = getAuthToken();
    if (!token) {
      window.alert('Please sign in to join rides');
      return;
    }

    try {
      const res = await api.post(`/rides/${ride._id}/join`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data && res.data.success) {
        window.alert('Request sent to ride owner');
      } else {
        window.alert('Failed to send request');
      }
    } catch (err) {
      console.error('Join request error:', err);
      const msg = err.response?.data?.message || err.message || 'Error sending request';
      window.alert(msg);
    }
  };

  return (
    <div className="ride-card">
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
        <strong>Date:</strong> {new Date(ride.rideDate).toLocaleString()}
      </p>
      <p>
        <strong>Description:</strong> {ride.description}
      </p>
      <div style={{ marginTop: 12 }}>
        <button className="btn btn-secondary" onClick={handleJoin}>Join Ride</button>
      </div>
    </div>
  );
};

export default RideCard;
