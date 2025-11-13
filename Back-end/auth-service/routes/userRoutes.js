// auth-service/routes/userRoutes.js

const express = require("express");
const Student = require("../Models/Students");
const Faculty = require("../Models/Faculty");
const Admin = require("../Models/Admin");
const verifyAuth = require("../middleware/authMiddleware");

const router = express.Router();

// --- Protected profile endpoints ---
// GET /api/user/me -> return current user's profile based on role
router.get("/me", verifyAuth, async (req, res) => {
  try {
    const { id, role } = req.user || {};
    if (!id)
      return res.status(400).json({ message: "Missing user id in token" });

    let Model = Student;
    if (role === "faculty") Model = Faculty;
    else if (role === "admin") Model = Admin;

    const user = await Model.findById(id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove sensitive fields
    delete user.password;
    return res.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return res.status(500).json({ message: "Error fetching profile" });
  }
});

// PUT /api/user/me -> update allowed fields for current user
router.put("/me", verifyAuth, async (req, res) => {
  try {
    const { id, role } = req.user || {};
    if (!id)
      return res.status(400).json({ message: "Missing user id in token" });

    const updates = req.body || {};

    let Model = Student;
    if (role === "faculty") Model = Faculty;
    else if (role === "admin") Model = Admin;

    // Allowed fields per model (minimal whitelist)
    const allowed = [
      "fullName",
      "rollNumber",
      "course",
      "department",
      "employeeId",
      "staffId",
    ];
    const patch = {};
    Object.keys(updates).forEach((k) => {
      if (allowed.includes(k)) patch[k] = updates[k];
    });

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updated = await Model.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: "User not found" });
    delete updated.password;
    return res.json({ success: true, user: updated });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res
      .status(500)
      .json({ message: "Error updating profile", error: err.message });
  }
});


module.exports = router;