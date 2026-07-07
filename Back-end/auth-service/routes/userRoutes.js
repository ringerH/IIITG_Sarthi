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

    // FIX: Inject the role from the token if not present in the doc (for Student/Faculty)
    // The Admin model has a 'role' field (job title), so we don't overwrite it if it exists.
    if (!user.role) {
      user.role = role;
    }

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
    
    // FIX: Inject the role here as well so the frontend state doesn't lose it on update
    if (!updated.role) {
      updated.role = role;
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

// GET /api/user/by-email?email=xxx
// Protected route to resolve user details by email
router.get("/by-email", verifyAuth, async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: "Email query parameter required" });
  }

  try {
    const student = await Student.findOne({ email }).lean();
    const faculty = !student
      ? (await Faculty.findOne({ email }).lean())
      : null;
    const admin = !student && !faculty ? await Admin.findOne({ email }).lean() : null;

    const user = student || faculty || admin;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Standardized user representation
    return res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName || user.name || "",
        role: student ? "student" : faculty ? "faculty" : "admin",
      },
    });
  } catch (err) {
    console.error("Error in by-email lookup:", err);
    return res.status(500).json({ message: "Internal server error during user lookup" });
  }
});

module.exports = router;