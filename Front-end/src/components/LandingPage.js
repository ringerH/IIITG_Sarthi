// /src/components/LandingPage.js

import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"; // Correct relative path to src/App.css

// Updated card data for Sarthi community hub
const categories = [
  {
    role: "student",
    title: "Student",
    description: "Share rides, trade items, and find what you've lost.",
  },
  {
    role: "faculty",
    title: "Faculty",
    description: "Join the campus marketplace, share commutes, and more.",
  },
  {
    role: "staff",
    title: "Staff",
    description: "Access all community features, from rides to lost & found.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  const handleCategorySelect = (role) => {
    // Navigate to the dedicated Google auth page with role as query param
    navigate(`/auth?role=${encodeURIComponent(role)}`);
  };

  return (
    <div className="landing-page">
      <h1>Welcome to Sarthi</h1>
      <p className="landing-page-subtitle">
        Your one-stop community hub for IIITG.
        <br />
        Find rides, buy & sell items, and manage lost & found.
      </p>

      <div className="cards-container">
        {categories.map((category) => (
          <button
            key={category.role}
            className="category-card"
            onClick={() => handleCategorySelect(category.role)}
            type="button"
          >
            <h3>{category.title}</h3>
            <p>{category.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;