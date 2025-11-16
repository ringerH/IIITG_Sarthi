import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/config"; 

export default function Home() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const getInitialLocalUser = () => {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const [storedUser, setStoredUser] = useState(getInitialLocalUser());
  const displayName = storedUser?.fullName || storedUser?.email || null;

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
    navigate("/");
  };

  const toggleProfile = async () => {
    const willOpen = !isProfileOpen;
    setIsProfileOpen(willOpen);
    if (willOpen && !profile) {
      
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      if (!token) {
        setProfileError("Not signed in");
        return;
      }
      setLoadingProfile(true);
      setProfileError("");
      try {
        
        const res = await authApi.get("/user/me");
        if (res.data && res.data.user) {
          setProfile(res.data.user);
          
          setStoredUser((prev) => ({
            ...(prev || {}),
            ...(res.data.user || {}),
          }));
        } else {
          setProfileError("Failed to load profile");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setProfileError(
          err.response?.data?.message || err.message || "Error loading profile"
        );
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
    setProfileMessage("");
  };

  const handleProfileSave = async () => {
    if (!profile) return;
    setSavingProfile(true);
    setProfileMessage("");
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    try {
      const payload = {
        fullName: profile.fullName,
        rollNumber: profile.rollNumber,
        course: profile.course,
        department: profile.department,
      };
      
      const res = await authApi.put("/user/me", payload);
      if (res.data && res.data.user) {
        setProfile(res.data.user);
        setStoredUser(res.data.user);
        try {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } catch (e) {}
        setProfileMessage("Profile saved");
      } else {
        setProfileMessage("Failed to save");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setProfileMessage(
        err.response?.data?.message || err.message || "Error saving profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Centralized ad data — easy to edit or load from API later
  const ads = [
    {
      title: "Yuvaan - IIITG",
      subtitle: "Tech Fest Banner",
      description: "Join the biggest campus event of the year — competitions, concerts, and more!",
      img: "/banner.jpg",
      youtubeLink: "https://www.youtube.com/watch?v=HuRkfQ2vESA"
    },
    {
      title: "IIITG Lost & Found Portal",
      subtitle: "Lost and Found Banner",
      description:
        "Lost something on campus? Post or browse items here — quick and secure.",
      img: "/banner2.jpg",
      link: "https://chat.whatsapp.com/Hr0Ahu1ViB5FnYFpHYSyFG?mode=wwt",
    },
    {
      title: "Gymkhana - IIITG",
      subtitle: "Merchandise Banner",
      description:
        "Check out the students' Gymkhana",
      img: "/banner3.jpg",
      link: "https://www.iiitg.ac.in/student-gymkhana"
    },
  ];

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="header-title">Sarthi - IIITG's Community Hub</div>
          <div className="header-nav">
            {displayName ? (
              <>
                <div className="btn btn-ghost">Welcome, {displayName}</div>
                <button
                  onClick={toggleProfile}
                  className="profile-toggle"
                  aria-expanded={isProfileOpen}
                >
                  <span className="profile-avatar">
                    {(storedUser?.fullName || storedUser?.email || "")[0] ||
                      "U"}
                  </span>
                  <span style={{ fontSize: 13 }}>Profile</span>
                </button>
                <button onClick={handleSignOut} className="btn btn-outline">
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/auth?role=student" className="btn btn-ghost">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-text">
            <h1 className="hero-title">IIITG Community Hub</h1>
            <p className="hero-description">
              Your one-stop platform for carpooling and a campus marketplace.
              Connect, collaborate, and make campus life easier.
            </p>
            <div
              style={{
                marginTop: 20,
                display: "flex",
                gap: 12,
                justifyContent: "center",
              }}
            >
              <Link
                to="/rides"
                className="btn btn-primary"
                style={{ width: 160 }}
              >
                Find a Ride
              </Link>
              <Link
                to="/marketplace"
                className="btn btn-outline"
                style={{ width: 160 }}
              >
                Buy & Sell
              </Link>
            </div>
          </div>
        </section>

        <section className="cards-grid" style={{ padding: "2rem 1rem" }}>
          {ads.map((ad, index) => {
            const card = (
              <div
                key={index}
                className={`card ${
                  index % 2 === 0 ? "card-blue" : "card-purple"
                }`}
              >
                <div className="card-image-container">
                  <img src={ad.img} alt={ad.subtitle} className="card-image" />
                  <div className="card-image-overlay" />
                </div>
                <div className="card-header">
                  <div className="card-title">
                    <div>{ad.title}</div>
                  </div>
                  <div className="card-content">
                    <p className="card-description">{ad.description}</p>
                  </div>
                </div>
              </div>
            );

            // If the ad has a link, wrap the card with an anchor that opens in a new tab
            if (ad.link || ad.youtubeLink) {
              return (
                <a
                  key={`link-${index}`}
                  href={ad.link || ad.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  {card}
                </a>
              );
            }

            return card;
          })}
        </section>
      </main>

      {/* Sliding profile panel */}
      <div
        className={`profile-panel ${isProfileOpen ? "open" : ""}`}
        role="dialog"
        aria-hidden={!isProfileOpen}
      >
        <div className="panel-header">
          <div style={{ fontWeight: 700 }}>Your Profile</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => navigate("/profile")}>
              Edit
            </button>
            <button className="btn" onClick={() => setIsProfileOpen(false)}>
              Close
            </button>
          </div>
        </div>

        <div className="panel-body">
          {loadingProfile ? (
            <p>Loading...</p>
          ) : profileError ? (
            <p style={{ color: "#c33" }}>{profileError}</p>
          ) : profile ? (
            <div>
              <div className="profile-row">
                <label>Full name</label>
                <input
                  name="fullName"
                  className="form-input"
                  value={profile.fullName || ""}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="profile-row">
                <label>Email</label>
                <div className="value">{profile.email}</div>
              </div>
              <div className="profile-row">
                <label>Roll number</label>
                <input
                  name="rollNumber"
                  className="form-input"
                  value={profile.rollNumber || ""}
                  onChange={handleProfileChange}
                  placeholder="Add your roll number"
                />
              </div>
              <div className="profile-row">
                <label>Course</label>
                <input
                  name="course"
                  className="form-input"
                  value={profile.course || ""}
                  onChange={handleProfileChange}
                  placeholder="e.g. B.Tech Computer Science"
                />
              </div>
              <div className="profile-row">
                <label>Department</label>
                <input
                  name="department"
                  className="form-input"
                  value={profile.department || ""}
                  onChange={handleProfileChange}
                  placeholder="e.g. Computer Science"
                />
              </div>
              {profileMessage && (
                <div style={{ marginTop: 8 }} className="subtitle">
                  {profileMessage}
                </div>
              )}
            </div>
          ) : (
            <p>No profile data</p>
          )}
        </div>

        <div className="profile-actions">
          <button
            className="btn btn-outline"
            onClick={() => {
              setIsProfileOpen(false);
              navigate("/");
            }}
          >
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/profile")}
          >
            Open Profile Page
          </button>
        </div>
      </div>
    </div>
  );
}

