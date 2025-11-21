// auth-service/routes/userRoutes.js

const express = require("express");
const Student = require("../models/Students");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin");
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
    let allowedFields = [];
    
    // Define allowed fields based on role
    if (role === "faculty") {
      Model = Faculty;
      allowedFields = ["fullName", "department", "employeeId"];
    } else if (role === "admin") {
      Model = Admin;
      allowedFields = ["fullName", "role", "staffId"];
    } else {
      // Default to Student
      Model = Student;
      allowedFields = ["fullName", "rollNumber", "course", "department"];
    }

    // Filter updates to only include allowed fields
    const patch = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        patch[key] = updates[key];
      }
    });

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    console.log(`Updating ${role} profile with:`, patch);

    const updated = await Model.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true, runValidators: true }
    ).lean();
    
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    
    delete updated.password;
    return res.json({ success: true, user: updated });
  } catch (err) {
    console.error("Error updating profile:", err);
    
    // Provide more detailed error information
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        error: err.message,
        details: err.errors 
      });
    }
    
    return res.status(500).json({ 
      message: "Error updating profile", 
      error: err.message 
    });
  }
});

module.exports = router;