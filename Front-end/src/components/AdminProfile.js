import React, { useEffect, useState } from "react";
import axios from "axios";

const ADMIN_ROLES = [
  "Office Assistant",
  "Librarian",
  "System Administrator",
  "Lab Assistant",
  "Finance Officer",
  "Hostel Warden",
  "Maintenance Staff",
  "Placement Officer",
];

export default function AdminProfile() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    adminRole: "",
    bio: "",
    avatarUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  // Backend base URL (e.g. http://localhost:5001)
  const backend = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("authToken") || "";

  // ------------------ FETCH ADMIN PROFILE ------------------
  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);

        // FIXED PATH → must include /api/user
        const res = await axios.get(`${backend}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const u = res.data?.user || {};

        setFormData({
          fullName: u.fullName || "",
          email: u.email || "",
          phone: u.phone || "",
          adminRole: u.adminRole || "",
          bio: u.bio || "",
          avatarUrl: u.avatarUrl || "",
        });

      } catch (e) {
        console.error("Admin fetch error:", e);
        setError(
          e.response?.data?.message || e.message || "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [backend, token]);

  // ------------------ INPUT HANDLER ------------------
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------ SAVE PROFILE ------------------
  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOkMsg("");

    try {
      // FIXED PATH → must include /api/user
      const res = await axios.put(
        `${backend}/api/user/me`,
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          adminRole: formData.adminRole,
          bio: formData.bio,
          avatarUrl: formData.avatarUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data?.user || {};

      setFormData({
        fullName: updated.fullName || "",
        email: updated.email || "",
        phone: updated.phone || "",
        adminRole: updated.adminRole || "",
        bio: updated.bio || "",
        avatarUrl: updated.avatarUrl || "",
      });

      setOkMsg("Profile saved!");
    } catch (e) {
      console.error("Admin save error:", e);
      setError(
        e.response?.data?.message || e.message || "Save failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------ UI ------------------
  if (loading) return <p>Loading…</p>;

  return (
    <form onSubmit={onSave} className="profile-container">
      <h2>Admin Profile</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {okMsg && <p style={{ color: "green" }}>{okMsg}</p>}

      <label>Full Name</label>
      <input name="fullName" value={formData.fullName} onChange={onChange} required />

      <label>Email</label>
      <input name="email" type="email" value={formData.email} onChange={onChange} required />

      <label>Phone</label>
      <input name="phone" value={formData.phone} onChange={onChange} />

      <label>Role (Job Title)</label>
      <select name="adminRole" value={formData.adminRole} onChange={onChange}>
        <option value="">Select Role</option>
        {ADMIN_ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <label>Bio</label>
      <textarea name="bio" value={formData.bio} onChange={onChange} />

      <label>Avatar URL</label>
      <input name="avatarUrl" value={formData.avatarUrl} onChange={onChange} />

      <button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
