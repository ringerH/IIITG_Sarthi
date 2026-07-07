import React, { useState, useEffect } from "react";

import axios from "axios";

import { Link } from "react-router-dom";

import RideCard from "./RideCard";

import "../styles/RideList.css"; //

import "../App.css"; // For .btn, .page-header, etc.



// NOTE: This URL is intentionally hard-coded as it points to a specific service.
const BASE_URL = import.meta.env.VITE_RIDE_URL || "http://localhost:5003";
const RIDES_API_URL =`${BASE_URL}/api/rides`;



const RideList = () => {
  const [rides, setRides] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchRides = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (startDate) params.startDate = startDate;
        if (sortBy) {
          params.sortBy = sortBy;
          params.sortOrder = sortOrder;
        }

        console.log("Fetching ride data from:", RIDES_API_URL, "with params:", params);

        const response = await axios.get(RIDES_API_URL, {
          params,
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Fetched rides:", response.data);
        setRides(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching rides:", error);
        const errorMessage = error.response
          ? `Server error: ${
              error.response.data.message || error.response.statusText
            }`
          : "Network error - please check if the server is running";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [search, startDate, sortBy, sortOrder]);

  return (
    <div className="ride-list-page">
      <div className="page-header">
        <h2 className="page-title">Available Rides</h2>
        <Link to="/create-ride" className="btn btn-primary page-action">
          Create your own ride
        </Link>
      </div>

      {/* Filter and Sort Panel */}
      <div className="filter-panel">
        <div className="filter-group">
          <label htmlFor="search-input" className="filter-label">Search Location/Title</label>
          <input
            id="search-input"
            className="filter-input"
            type="text"
            placeholder="Search pickup, dropoff, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="date-input" className="filter-label">Rides From Date</label>
          <input
            id="date-input"
            className="filter-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="sort-input" className="filter-label">Sort By</label>
          <select
            id="sort-input"
            className="filter-select"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy(field);
              setSortOrder(order);
            }}
          >
            <option value="createdAt-desc">Newest Created</option>
            <option value="rideDate-asc">Date (Soonest First)</option>
            <option value="distance-asc">Distance (Shortest First)</option>
            <option value="distance-desc">Distance (Longest First)</option>
            <option value="availableSeats-asc">Least Seats First</option>
            <option value="availableSeats-desc">Most Seats First</option>
          </select>
        </div>
      </div>



      {/* Show error message if there is one */}

      {error && (

        // Use the class from RideList.css instead of inline styles

        <div className="ride-list-error">{error}</div>

      )}



      {/* Show loading message */}

      {loading && (

        <div className="loading-message" style={{ margin: "20px 0" }}>

          Loading rides...

        </div>

      )}



      {/* Show rides or "no rides" message only when not loading and no error */}

      {!loading && !error && (

        <>

          {rides.length === 0 ? (

            // Use the class from RideList.css for better styling

            <div className="no-rides-message">

              <p>No rides available at the moment.</p>

            </div>

          ) : (

            <div className="ride-cards-container">

              {rides.map((ride) => (

                // Use ride._id as the key, not index

                <RideCard key={ride._id} ride={ride} />

              ))}

            </div>

          )}

        </>

      )}

    </div>

  );

};



export default RideList;