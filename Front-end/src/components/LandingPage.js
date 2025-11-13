// /src/components/LandingPage.js

import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"; // use relative path to src/App.css

const LandingPage = () => {
  const navigate = useNavigate();

  const handleCategorySelect = (category) => {
    // Navigate to the dedicated Google auth page with role as query param
    navigate(`/auth?role=${encodeURIComponent(category)}`);
  };

  return (
    <div className="landing-page">
      <h1>Welcome to the Ride Sharing System</h1>
      <div className="cards-container">
        <div
          className="category-card"
          onClick={() => handleCategorySelect("student")}
        >
          <h3>Student</h3>
          <p>For students who want to share rides</p>
        </div>
        <div
          className="category-card"
          onClick={() => handleCategorySelect("faculty")}
        >
          <h3>Faculty</h3>
          <p>For faculty members to share rides</p>
        </div>
        <div
          className="category-card"
          onClick={() => handleCategorySelect("admin")}
        >
          <h3>Admin Staff</h3>
          <p>For admin staff to manage the system</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
