import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/config";
import '../styles/CreatePost.css'; 

const CreatePost = () => {
  const navigate = useNavigate();
  const [rideTitle, setRideTitle] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [availableSeats, setAvailableSeats] = useState("");
  const [rideDate, setRideDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null); 

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
      rideDate: dateObj.toISOString(),
      description,
    };

    console.log("Sending ride data:", rideData);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem('authToken') : null;
      const response = await api.post("/rides", rideData, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      console.log("Response from backend:", response.data);

      setRideTitle("");
      setPickupLocation("");
      setDropoffLocation("");
      setAvailableSeats("");
      setRideDate("");
      setDescription("");

      window.alert("Your ride has been created successfully!");
      navigate("/Home");
    } catch (error) {
      console.error("Error creating ride post:", error);
      if (error.response) {
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

        <div className="form-group">
          <label htmlFor="rideTitle">Ride Title</label>
          <input
            id="rideTitle"
            className="form-input"
            type="text"
            placeholder="e.g., Trip to Airport"
            value={rideTitle}
            onChange={(e) => setRideTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="availableSeats">Available Seats</label>
          <input
            id="availableSeats"
            className="form-input"
            type="number"
            placeholder="e.g., 2"
            value={availableSeats}
            onChange={(e) => setAvailableSeats(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pickupLocation">Pickup Location</label>
          <input
            id="pickupLocation"
            className="form-input"
            type="text"
            placeholder="e.g., IIITG Campus"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dropoffLocation">Drop-off Location</label>
          <input
            id="dropoffLocation"
            className="form-input"
            type="text"
            placeholder="e.g., Guwahati Railway Station"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="rideDate">Date and Time</label>
          <input
            id="rideDate"
            className="form-input"
            type="datetime-local"
            value={rideDate}
            onChange={(e) => setRideDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="form-textarea"
            placeholder="Any additional details (e.g., luggage space, stops)"
            value={description}
            onChange={(e) => setDescription(e.target.value)} // <-- THIS IS THE FIX
            required
          />
        </div>

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