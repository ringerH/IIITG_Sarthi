import React, { useState, useEffect } from "react";

import axios from "axios";

import { Link } from "react-router-dom";

import RideCard from "./RideCard";

import "../styles/RideList.css"; //

import "../App.css"; // For .btn, .page-header, etc.



// NOTE: This URL is intentionally hard-coded as it points to a specific service.

const RIDES_API_URL = "http://localhost:5003/api/rides";



const RideList = () => {

  const [rides, setRides] = useState([]);

  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(true); // Add loading state, default to true



  useEffect(() => {

    const fetchRides = async () => {

      try {

        console.log("Fetching ride data from:", RIDES_API_URL);

        // REVERTED: Use the original correct URL

        const response = await axios.get(RIDES_API_URL, {

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

      } finally {

        setLoading(false); // Stop loading when done

      }

    };



    fetchRides();

  }, []); // Empty dependency array is correct, runs once on mount



  return (

    <div className="ride-list-page">

      <div className="page-header">

        <h2 className="page-title">Available Rides</h2>

        <Link to="/create-ride" className="btn btn-primary page-action">

          Create your own ride

        </Link>

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