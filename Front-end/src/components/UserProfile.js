import React, { useEffect, useState, useRef } from "react";
import { authApi, rideApi } from "../api/config"; // Import both APIs
import "../App.css"; //
// Import the new styles (or add them to App.css)
import "../styles/UserProfile.css"; 
import { io } from "socket.io-client";

function UserProfile() {
  // --- All your state and logic remains identical ---
  // [NO LOGIC CHANGES HERE]
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loadingOutgoing, setLoadingOutgoing] = useState(false);
  const [outgoingError, setOutgoingError] = useState("");
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [loadingAccepted, setLoadingAccepted] = useState(false);
  const [acceptedError, setAcceptedError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setMessage("");
      try {
        console.log("[UserProfile] Fetching profile with token:", token ? "present" : "missing");
        const res = await authApi.get("/user/me");
        console.log("[UserProfile] Profile response:", res.data);
        if (res.data && res.data.user) {
          setUser(res.data.user);
        } else {
          setMessage("Failed to load profile");
        }
      } catch (err) {
        console.error("[UserProfile] Error loading profile:", err);
        console.error("[UserProfile] Response status:", err.response?.status);
        console.error("[UserProfile] Response data:", err.response?.data);
        
        const errorMsg = err.response?.data?.message || err.message || "Error loading profile";
        setMessage(`Error: ${errorMsg} (Status: ${err.response?.status || 'unknown'})`);
        
        if (err.response?.status === 401) {
          setMessage("Authentication failed. Please sign in again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      setMessage("Please sign in to view profile");
      setLoading(false);
      return;
    }

    fetchProfile();
    
    const fetchRequests = async () => {
      setLoadingRequests(true);
      setRequestsError("");
      try {
        const r = await rideApi.get("/user/requests");
        if (r.data && r.data.requests) setRequests(r.data.requests);
      } catch (err) {
        console.error("Error loading requests:", err);
        setRequestsError(
          err.response?.data?.message || err.message || "Error loading requests"
        );
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRequests();
    fetchOutgoing();
    fetchAccepted();

    const pollInterval = 5000;
    const pollId = setInterval(() => {
      try {
        const currentToken =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken")
            : null;
        if (!currentToken) return;
        fetchRequests();
        fetchOutgoing();
        fetchAccepted();
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, pollInterval);

    return () => clearInterval(pollId);
  }, [token]);

  const socketRef = useRef(null);
  useEffect(() => {
    const localUser =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;
    const userId = localUser?._id || localUser?.id;
    if (!userId) return;

    try {
      const socket = io("http://localhost:5003", { withCredentials: true });
      socketRef.current = socket;

      socket.on("connect", () => {
        try {
          socket.emit("joinUser", String(userId));
        } catch (e) {}
      });

      socket.on("chatCreated", (info) => {
        try {
          refreshRequests();
          fetchAccepted();
          fetchOutgoing();
          setMessage("New chat created — lists refreshed");
        } catch (e) {
          console.error("Error refreshing after chatCreated:", e);
        }
      });

      return () => {
        try {
          socket.disconnect();
        } catch (e) {}
      };
    } catch (e) {
      console.error("Socket connect error:", e);
    }
  }, [token]);

  const fetchOutgoing = async () => {
    setLoadingOutgoing(true);
    setOutgoingError("");
    try {
      const r = await rideApi.get("/user/requests/outgoing");
      if (r.data && r.data.requests) setOutgoingRequests(r.data.requests);
    } catch (err) {
      console.error("Error loading outgoing requests:", err);
      setOutgoingError(
        err.response?.data?.message ||
          err.message ||
          "Error loading outgoing requests"
      );
    } finally {
      setLoadingOutgoing(false);
    }
  };

  const fetchAccepted = async () => {
    setLoadingAccepted(true);
    setAcceptedError("");
    try {
      const r = await rideApi.get("/user/accepted");
      if (r.data && r.data.requests) setAcceptedRequests(r.data.requests);
    } catch (err) {
      console.error("Error loading accepted requests:", err);
      setAcceptedError(
        err.response?.data?.message ||
          err.message ||
          "Error loading accepted requests"
      );
    } finally {
      setLoadingAccepted(false);
    }
  };

  const refreshRequests = async () => {
    try {
      const r = await rideApi.get("/user/requests");
      if (r.data && r.data.requests) setRequests(r.data.requests);
    } catch (err) {
      console.error("Error refreshing requests:", err);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    console.log("handleRequestAction called", {
      requestId,
      status,
      tokenPresent: !!token,
    });
    if (!token) {
      setMessage("Missing auth token. Please sign in again.");
      return;
    }
    
    try {
      const res = await rideApi.patch(`/user/requests/${requestId}`, { status });
      
      console.log("PATCH response", res.status, res.data);
      if (res.data && res.data.request) {
        await refreshRequests();
        await fetchAccepted();
        setMessage(`Request ${status}`);
      } else {
        setMessage("Failed to update request");
      }
    } catch (err) {
      console.error("Error updating request:", err);
      let userMsg = "Network or server error while updating request.";
      if (err.response) {
        userMsg =
          err.response.data?.message || `Server error: ${err.response.status}`;
        console.error("Response data:", err.response.data);
      } else if (err.request) {
        userMsg =
          "No response from server. Possible CORS, network, or server crash.";
        console.error("No response:", err.request);
      } else if (err.message) {
        userMsg = err.message;
      }
      setMessage(userMsg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((u) => ({ ...u, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        course: user.course,
        department: user.department,
      };
      const res = await authApi.put("/user/me", payload);
      if (res.data && res.data.user) {
        setUser(res.data.user);
        try {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } catch (e) {}
        setMessage("Profile updated successfully");
      } else {
        setMessage("Failed to save profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setMessage(
        err.response?.data?.message || err.message || "Error saving profile"
      );
    } finally {
      setSaving(false);
    }
  };
  // --- End of logic ---


  if (loading) {
    return (
      // Use profile-page-container for consistency
      <div className="profile-page-container">
        <div className="loading-message">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page-container">
        {/* Use error-message class from App.css */}
        <div className="error-message">{message || "No profile data"}</div>
      </div>
    );
  }

  return (
    // This container class comes from CreatePost.css
    <div className="create-post-container">
      <h2 className="page-title">Your Profile</h2>

      {/* Use dedicated classes for messages */}
      {message && (
        <div
          className={`message-banner ${
            message.startsWith("Error:") ? "error-message" : "loading-message"
          }`}
        >
          {message}
        </div>
      )}

      {/* This form class comes from CreatePost.css */}
      <div className="create-post-form">
        <div className="form-group"> {/* Use form-group wrapper */}
          <label>Full name</label>
          <input
            className="form-input"
            name="fullName"
            value={user.fullName || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input className="form-input" value={user.email || ""} disabled />
        </div>

        <div className="form-group">
          <label>Roll Number</label>
          <input
            className="form-input"
            name="rollNumber"
            value={user.rollNumber || ""}
            onChange={handleChange}
            placeholder="Add your roll number"
          />
        </div>

        <div className="form-group">
          <label>Course</label>
          <input
            className="form-input"
            name="course"
            value={user.course || ""}
            onChange={handleChange}
            placeholder="e.g. B.Tech Computer Science"
          />
        </div>

        {/* This div now uses a class instead of inline style */}
        <div className="form-group full-width">
          <label>Department</label>
          <input
            className="form-input"
            name="department"
            value={user.department || ""}
            onChange={handleChange}
            placeholder="e.g. Computer Science"
          />
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary page-action" // Use btn-primary
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {/* --- INCOMING REQUESTS --- */}
      <div className="profile-section-list">
        <h3>Incoming Requests</h3>
        {loadingRequests ? (
          <div className="loading-message">Loading requests...</div>
        ) : requestsError ? (
          <div className="error-message">{requestsError}</div>
        ) : requests.length === 0 ? (
          <p>No new requests.</p>
        ) : (
          <div className="request-list">
            {requests.map((reqItem) => (
              <div key={reqItem._id} className="request-card">
                <div className="request-card-header">
                  <div className="request-card-info">
                    <div className="request-card-title">
                      {reqItem.rideTitle || "Ride request"}
                    </div>
                    <div className="request-card-subtitle">
                      {reqItem.requesterName} ({reqItem.requesterEmail})
                    </div>
                  </div>
                  <div className="request-card-status">
                    Status: {reqItem.status}
                  </div>
                </div>
                {reqItem.status === "pending" && (
                  <div className="request-card-actions">
                    <button
                      className="btn btn-primary" //
                      onClick={() =>
                        handleRequestAction(reqItem._id, "accepted")
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-outline" //
                      onClick={() =>
                        handleRequestAction(reqItem._id, "rejected")
                      }
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- OUTGOING REQUESTS --- */}
      <div className="profile-section-list">
        <h3>Outgoing Requests</h3>
        {loadingOutgoing ? (
          <div className="loading-message">Loading outgoing requests...</div>
        ) : outgoingError ? (
          <div className="error-message">{outgoingError}</div>
        ) : outgoingRequests.length === 0 ? (
          <p>No outgoing requests.</p>
        ) : (
          <div className="request-list">
            {outgoingRequests.map((reqItem) => (
              <div key={reqItem._id} className="request-card">
                <div className="request-card-header">
                  <div className="request-card-info">
                    <div className="request-card-title">
                      {reqItem.rideTitle || "Ride request"}
                    </div>
                    <div className="request-card-subtitle">
                      To: {reqItem.toUserEmail || "Owner"}
                    </div>
                  </div>
                  <div className="request-card-status">
                    Status: {reqItem.status}
                  </div>
                </div>
                {reqItem.status === "accepted" && reqItem.chatId && (
                  <div className="request-card-actions">
                    <a
                      href={`/chat/${reqItem.chatId}`}
                      className="btn btn-ghost" //
                    >
                      💬 Chat
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- ACCEPTED RIDES --- */}
      <div className="profile-section-list">
        <h3>Accepted Rides</h3>
        {loadingAccepted ? (
          <div className="loading-message">Loading accepted rides...</div>
        ) : acceptedError ? (
          <div className="error-message">{acceptedError}</div>
        ) : acceptedRequests.length === 0 ? (
          <p>No accepted rides yet.</p>
        ) : (
          <div className="request-list">
            {acceptedRequests.map((item) => {
              const isRequester =
                item.requesterId === user._id || item.requesterId === user.id;
              const otherName = isRequester
                ? item.toUserEmail || "Owner"
                : item.requesterName || "Requester";
              return (
                <div key={item._id} className="request-card">
                  <div className="request-card-header">
                    <div className="request-card-info">
                      <div className="request-card-title">
                        {item.rideTitle || "Ride"}
                      </div>
                      <div className="request-card-subtitle">
                        {isRequester
                          ? `Owner: ${otherName}`
                          : `Requester: ${otherName}`}
                      </div>
                    </div>
                    <div className="request-card-actions">
                      {item.chatId ? (
                        <a
                          href={`/chat/${item.chatId}`}
                          className="btn btn-ghost" //
                        >
                          💬 Chat
                        </a>
                      ) : (
                        <span className="request-card-status">No chat</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;