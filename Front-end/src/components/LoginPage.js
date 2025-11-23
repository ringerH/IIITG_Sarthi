import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import "../App.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const role = searchParams.get("role") || "student";
  const existingToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const existingUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
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
    if (existingToken) {
      return;
    }

    const scriptId = "google-identity-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const initializeGoogleSignIn = () => {
      if (!window.google?.accounts?.id) return;

      console.log("Initializing Google Sign-In for role:", role);

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: "320",
          text: "signin_with",
        });
      }

      window.google.accounts.id.prompt();
    };

    const checkGoogleLoaded = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogleLoaded);
        initializeGoogleSignIn();
      }
    }, 100);

    return () => {
      clearInterval(checkGoogleLoaded);
    };
  }, [role, existingToken]);

  const handleGoogleResponse = async (response) => {
    const tokenId = response?.credential;

    if (!tokenId) {
      setError("No credential received from Google");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Sending token to backend for role:", role);

      const res = await axios.post(
        `${API_BASE_URL}/api/auth/google`,
        { tokenId, role },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Backend response:", res.data);

      if (res.data && res.data.token) {
        // Store the token
        localStorage.setItem("authToken", res.data.token);

        // IMPORTANT: Ensure the user object includes the role
        if (res.data.user) {
          const userWithRole = {
            ...res.data.user,
            role: res.data.user.role // Explicitly include role
          };
          
          console.log("Storing user with role:", userWithRole);
          localStorage.setItem("user", JSON.stringify(userWithRole));
        }

        console.log("Login successful! Role:", res.data.user?.role);
        
        // Small delay to ensure localStorage is updated
        setTimeout(() => {
          navigate("/Home");
        }, 100);
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

  const displayRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Welcome to Sarthi</h2>
        <p>
          {existingToken
            ? "You are already logged in."
            : `Sign in as ${displayRole}`}
        </p>
        {!existingToken && (
          <p className="subtitle">Please sign in with your Google account</p>
        )}

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Signing in...</div>}

        <div className="google-button-container">
          {existingToken ? (
            <div className="already-signed-in">
              <p>
                Signed in as{" "}
                <strong>{parsedUser?.fullName || parsedUser?.email}</strong>
                {parsedUser?.role && ` (${parsedUser.role})`}
              </p>
              <div className="role-buttons">
                <button
                  onClick={handleContinue}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Continue to Home
                </button>
                <button
                  onClick={handleSignOut}
                  className="btn btn-ghost"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div ref={googleButtonRef}></div>
          )}
        </div>

        <div className="role-links">
          <p>Sign in as a different role:</p>
          <div className="role-buttons">
            <Link
              to="/auth?role=student"
              className={`btn btn-outline ${
                role === "student" ? "active" : ""
              }`}
            >
              Student
            </Link>
            <Link
              to="/auth?role=faculty"
              className={`btn btn-outline ${
                role === "faculty" ? "active" : ""
              }`}
            >
              Faculty
            </Link>
            <Link
              to="/auth?role=staff" 
              className={`btn btn-outline ${
                role === "staff" ? "active" : ""
              }`}
            >
              Staff
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;