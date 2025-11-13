import React, { useState } from "react";
import api from "../api/config";

const AdminRegister = () => {
  const [form, setForm] = useState({ fullName: "", email: "", staffId: "", role: "", password: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post("/admin", form);
      setSuccess("Admin registered successfully");
      setForm({ fullName: "", email: "", staffId: "", role: "", password: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h2>Admin Registration</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="staffId" placeholder="Staff ID" value={form.staffId} onChange={handleChange} required />
        <input name="role" placeholder="Role" value={form.role} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default AdminRegister;

