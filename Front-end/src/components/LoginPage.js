import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import "../App.css";

// Get Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5002";

function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  // Get role from URL query params (default to 'student')
  const role = searchParams.get("role") || "student";
  const existingToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const existingUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const parsedUser = existingUser ? JSON.parse(existingUser) : null;

  const handleContinue = () => {
    navigate("/Home");
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
   
    window.location.reload();
  };

  useEffect(() => {
    
    const scriptId = "google-identity-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    // Initialize Google Sign-In
    const initializeGoogleSignIn = () => {
      if (!window.google?.accounts?.id) return;

      console.log("Initializing Google Sign-In for role:", role);

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      // Render the Google Sign-In button
      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: "320",
          text: "signin_with",
        });
      }

      // Enable One Tap sign-in
      window.google.accounts.id.prompt();
    };

    // Wait for Google script to load
    const checkGoogleLoaded = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogleLoaded);
        initializeGoogleSignIn();
      }
    }, 100);

    return () => {
      clearInterval(checkGoogleLoaded);
    };
  }, [role, navigate]);

  const handleGoogleResponse = async (response) => {
    const tokenId = response?.credential;

    if (!tokenId) {
      setError("No credential received from Google");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Sending token to backend...");

      const res = await axios.post(
        `${API_BASE_URL}/api/auth/google`,
        { tokenId, role },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Backend returns { token, user } on success. Accept presence of token.
      if (res.data && res.data.token) {
        // Store the JWT token
        localStorage.setItem("authToken", res.data.token);

        // Store user info if needed
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        console.log("Login successful!");

  // Redirect to Home after successful login
  navigate("/Home");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Welcome to Sarthi</h2>
        <p>Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}</p>
        <p className="subtitle">Please sign in with your Google account</p>

        {error && <div className="error-message">{error}</div>}

        {loading && <div className="loading-message">Signing in...</div>}

        <div className="google-button-container">
          {existingToken ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 8 }}>You are already signed in as <strong>{parsedUser?.fullName || parsedUser?.email}</strong></div>
              <button onClick={handleContinue} style={{ marginRight: 8, padding: '8px 12px', borderRadius: 6 }}>Continue to Home</button>
              <button onClick={handleSignOut} style={{ padding: '8px 12px', borderRadius: 6 }}>Sign out</button>
            </div>
          ) : null}
          <div ref={googleButtonRef}></div>
        </div>

        <div className="role-links">
          <p>Sign in as a different role:</p>
          <div className="role-buttons">
            <Link to="/auth?role=student" className={role === "student" ? "active" : ""}>
              Student
            </Link>
            <Link to="/auth?role=faculty" className={role === "faculty" ? "active" : ""}>
              Faculty
            </Link>
            <Link to="/auth?role=admin" className={role === "admin" ? "active" : ""}>
              Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
