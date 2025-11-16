import React, { useState, useEffect } from "react";
import api from "../api/config";
import "../styles/profile.css";

function FacultyProfile() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    bio: "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  // Fetch faculty profile
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await api.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.user) {
          setFormData({
            fullName: res.data.user.fullName || "",
            email: res.data.user.email || "",
            phone: res.data.user.phone || "",
            department: res.data.user.department || "",
            bio: res.data.user.bio || "",
          });
        }
      } catch (err) {
        console.error("Error fetching faculty profile:", err);
        setMessage("Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await api.put("/user/me", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setMessage("Profile updated successfully ✅");
      } else {
        setMessage("Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating faculty profile:", err);
      setMessage("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading faculty profile...</p>;

  return (
    <div className="profile-container">
      <h1>Faculty Profile</h1>
      {message && <p style={{ marginBottom: 10 }}>{message}</p>}

      <form
        className="profile-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className="form-group">
          <label>Full Name*</label>
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email*</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone*</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Department*</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
          </select>
        </div>

        <div className="form-group">
          <label>About You</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us a bit about yourself..."
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

export default FacultyProfile;
