import React, { useEffect, useState, useRef } from "react";
import { authApi, rideApi } from "../api/config"; // Import both APIs
import "../App.css";
import { io } from "socket.io-client";

function UserProfile() {
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
        // Use authApi for profile endpoint
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
        
        // Don't let the global interceptor redirect - we'll show the error
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
    
    // Use rideApi for ride-related requests
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
      const socket = io("http://localhost:5001", { withCredentials: true });
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
      // Use authApi for profile update
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

  if (loading) {
    return (
      <div className="create-post-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="create-post-container">
        <p>{message || "No profile data"}</p>
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <h2 className="page-title">Your Profile</h2>

      {message && (
        <div style={{ marginBottom: 12 }} className="subtitle">
          {message}
        </div>
      )}

      <div className="create-post-form">
        <div>
          <label>Full name</label>
          <input
            className="form-input"
            name="fullName"
            value={user.fullName || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Email</label>
          <input className="form-input" value={user.email || ""} disabled />
        </div>

        <div>
          <label>Roll Number</label>
          <input
            className="form-input"
            name="rollNumber"
            value={user.rollNumber || ""}
            onChange={handleChange}
            placeholder="Add your roll number"
          />
        </div>

        <div>
          <label>Course</label>
          <input
            className="form-input"
            name="course"
            value={user.course || ""}
            onChange={handleChange}
            placeholder="e.g. B.Tech Computer Science"
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
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
            className="btn page-action"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Incoming Requests</h3>
        {loadingRequests ? (
          <p>Loading requests...</p>
        ) : requestsError ? (
          <p style={{ color: "red" }}>{requestsError}</p>
        ) : requests.length === 0 ? (
          <p>No requests at the moment.</p>
        ) : (
          <div>
            {requests.map((reqItem) => (
              <div
                key={reqItem._id}
                style={{
                  padding: 12,
                  border: "1px solid #eee",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {reqItem.rideTitle || "Ride request"}
                    </div>
                    <div style={{ fontSize: 13, color: "#444" }}>
                      {reqItem.requesterName} ({reqItem.requesterEmail})
                    </div>
                  </div>
                  <div>
                    <span
                      style={{ marginRight: 8, fontSize: 13, color: "#666" }}
                    >
                      Status: {reqItem.status}
                    </span>
                    {reqItem.status === "accepted" && reqItem.chatId && (
                      <a
                        href={`/chat/${reqItem.chatId}`}
                        className="btn"
                        style={{ marginLeft: 8 }}
                      >
                        💬 Chat
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  {reqItem.status === "pending" && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          handleRequestAction(reqItem._id, "accepted")
                        }
                        style={{ marginRight: 8 }}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() =>
                          handleRequestAction(reqItem._id, "rejected")
                        }
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Outgoing Requests</h3>
        {loadingOutgoing ? (
          <p>Loading outgoing requests...</p>
        ) : outgoingError ? (
          <p style={{ color: "red" }}>{outgoingError}</p>
        ) : outgoingRequests.length === 0 ? (
          <p>No outgoing requests.</p>
        ) : (
          <div>
            {outgoingRequests.map((reqItem) => (
              <div
                key={reqItem._id}
                style={{
                  padding: 12,
                  border: "1px solid #eee",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {reqItem.rideTitle || "Ride request"}
                    </div>
                    <div style={{ fontSize: 13, color: "#444" }}>
                      {reqItem.toUserEmail || "Owner"}
                    </div>
                  </div>
                  <div>
                    <span
                      style={{ marginRight: 8, fontSize: 13, color: "#666" }}
                    >
                      Status: {reqItem.status}
                    </span>
                    {reqItem.status === "accepted" && reqItem.chatId && (
                      <a
                        href={`/chat/${reqItem.chatId}`}
                        className="btn"
                        style={{ marginLeft: 8 }}
                      >
                        💬 Chat
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Accepted Rides</h3>
        {loadingAccepted ? (
          <p>Loading accepted rides...</p>
        ) : acceptedError ? (
          <p style={{ color: "red" }}>{acceptedError}</p>
        ) : acceptedRequests.length === 0 ? (
          <p>No accepted rides yet.</p>
        ) : (
          <div>
            {acceptedRequests.map((item) => {
              const isRequester =
                item.requesterId === user._id || item.requesterId === user.id;
              const otherName = isRequester
                ? item.toUserEmail || "Owner"
                : item.requesterName || "Requester";
              return (
                <div
                  key={item._id}
                  style={{
                    padding: 12,
                    border: "1px solid #eee",
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {item.rideTitle || "Ride"}
                      </div>
                      <div style={{ fontSize: 13, color: "#444" }}>
                        {isRequester
                          ? `Owner: ${otherName}`
                          : `Requester: ${otherName}`}
                      </div>
                    </div>
                    <div>
                      {item.chatId ? (
                        <a href={`/chat/${item.chatId}`} className="btn">
                          💬 Chat
                        </a>
                      ) : (
                        <span style={{ color: "#666" }}>No chat</span>
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