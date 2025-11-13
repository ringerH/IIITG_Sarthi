import React, { useState } from "react";
import api from "../api/config";

const StudentRegister = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    rollNumber: "",
    course: "",
    department: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post("/students", form);
      setSuccess("Student registered successfully");
      setForm({ fullName: "", email: "", rollNumber: "", course: "", department: "", password: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h2>Student Registration</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="rollNumber" placeholder="Roll Number" value={form.rollNumber} onChange={handleChange} required />
        <input name="course" placeholder="Course" value={form.course} onChange={handleChange} />
        <input name="department" placeholder="Department" value={form.department} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default StudentRegister;

