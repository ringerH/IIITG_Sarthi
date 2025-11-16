import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RideCard from "./RideCard"; // Import the RideCard component

const RideList = () => {
  const [rides, setRides] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        console.log("Fetching ride data...");
        const response = await axios.get("http://localhost:5003/api/rides", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Fetched rides:", response.data);
        setRides(response.data);
      } catch (error) {
        console.error("Error fetching rides:", error);
        const errorMessage = error.response
          ? `Server error: ${
              error.response.data.message || error.response.statusText
            }`
          : "Network error - please check if the server is running";
        setError(errorMessage);
      }
    };

    fetchRides();
  }, []);

  if (error) {
    return (
      <div>
        <h2>Available Rides</h2>
        <p
          style={{ color: "red", padding: "10px", backgroundColor: "#ffebee" }}
        >
          {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Available Rides</h2>
        <Link to="/create-ride" className="btn btn-primary page-action">
          Create your own ride
        </Link>
      </div>
      {rides.length === 0 ? (
        <p>No rides available at the moment.</p>
      ) : (
        <div className="ride-cards-container">
          {rides.map((ride, index) => (
            <RideCard key={index} ride={ride} /> // Render RideCard for each ride
          ))}
        </div>
      )}
    </div>
  );
};

export default RideList;
