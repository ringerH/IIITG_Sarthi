import React, { useState } from "react";
import api from "../api/config";

const FacultyRegister = () => {
  const [form, setForm] = useState({ fullName: "", email: "", employeeId: "", department: "", password: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post("/faculty", form);
      setSuccess("Faculty registered successfully");
      setForm({ fullName: "", email: "", employeeId: "", department: "", password: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h2>Faculty Registration</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="employeeId" placeholder="Employee ID" value={form.employeeId} onChange={handleChange} required />
        <input name="department" placeholder="Department" value={form.department} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default FacultyRegister;

