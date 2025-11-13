import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/config";

const CreatePost = () => {
  const navigate = useNavigate();
  const [rideTitle, setRideTitle] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [availableSeats, setAvailableSeats] = useState("");
  const [rideDate, setRideDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null); // Store error messages

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!rideTitle || !pickupLocation || !dropoffLocation || !description) {
      setError("Please fill in all required fields.");
      return;
    }

    const seats = parseInt(availableSeats, 10);
    if (!Number.isInteger(seats) || seats < 0) {
      setError("Available seats must be a non-negative integer.");
      return;
    }

    const dateObj = new Date(rideDate);
    if (!rideDate || isNaN(dateObj.valueOf())) {
      setError("Please provide a valid date/time for the ride.");
      return;
    }

    const rideData = {
      rideTitle,
      pickupLocation,
      dropoffLocation,
      availableSeats: seats,
      // send ISO string so backend receives an unambiguous date
      rideDate: dateObj.toISOString(),
      description,
    };

    console.log("Sending ride data:", rideData);

    try {
      // Use the configured axios instance which has baseURL set to
      // http://localhost:5000/api (see src/api/config.js)
  const token = typeof window !== "undefined" ? localStorage.getItem('authToken') : null;
  const response = await api.post("/rides", rideData, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      console.log("Response from backend:", response.data);
  // clear form (optional)
      setRideTitle("");
      setPickupLocation("");
      setDropoffLocation("");
      setAvailableSeats("");
      setRideDate("");
      setDescription("");
  // show success popup and redirect to Home
  // using a friendly confirmation message
  window.alert("Your ride has been created successfully!");
  navigate("/Home");
    } catch (error) {
      console.error("Error creating ride post:", error);
      if (error.response) {
        // Log the response error
        console.error("Response Error:", error.response.data);
        setError(
          error.response.data.message || "Server error creating ride post."
        );
      } else {
        setError("Error creating ride post: " + error.message);
      }
    }
  };

  return (
    <div className="create-post-container">
      <h2 className="page-title">Create a Ride Post</h2>
      {error && <p className="error-message">{error}</p>}
      <form className="create-post-form" onSubmit={handleSubmit}>
        <input
          className="form-input"
          type="text"
          placeholder="Ride Title"
          value={rideTitle}
          onChange={(e) => setRideTitle(e.target.value)}
          required
        />
        <input
          className="form-input"
          type="text"
          placeholder="Pickup Location"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          required
        />
        <input
          className="form-input"
          type="text"
          placeholder="Drop-off Location"
          value={dropoffLocation}
          onChange={(e) => setDropoffLocation(e.target.value)}
          required
        />
        <input
          className="form-input"
          type="number"
          placeholder="Available Seats"
          value={availableSeats}
          onChange={(e) => setAvailableSeats(e.target.value)}
          required
        />
        <input
          className="form-input"
          type="datetime-local"
          value={rideDate}
          onChange={(e) => setRideDate(e.target.value)}
          required
        />
        <textarea
          className="form-textarea"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Create Ride
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
