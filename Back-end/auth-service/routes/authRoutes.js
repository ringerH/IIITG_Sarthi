const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const Student = require("../models/Students");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin");

const router = express.Router();

// Helper function to find user across all collections
async function findUserByEmail(email) {
  let user = await Student.findOne({ email });
  if (user) return { user, role: 'student', Model: Student };
  
  user = await Faculty.findOne({ email });
  if (user) return { user, role: 'faculty', Model: Faculty };
  
  user = await Admin.findOne({ email });
  if (user) return { user, role: 'admin', Model: Admin };
  
  return null;
}

// POST /api/auth/google
// Accepts { tokenId } and optional { role }
router.post("/auth/google", async (req, res) => {
  const { tokenId, role: rawRole } = req.body || {};
  console.log(
    "Received tokenId:",
    tokenId ? "present" : "missing",
    "role:",
    rawRole
  );

  // Default to 'student' role if not provided
  const requestedRole = (rawRole || "student").toLowerCase();

  if (!tokenId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing ID token" });
  }

  try {
    
    const resp = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        tokenId
      )}`
    );

    const info = resp.data;
    console.log("Google verification successful for:", info.email);

    const expectedDomain = "iiitg.ac.in";
    const isIIITGEmail = info.email && info.email.endsWith("@" + expectedDomain);
    
    
    if (requestedRole !== "staff" && !isIIITGEmail) {
      console.warn(`Non-IIITG email attempted login as ${requestedRole}:`, info.email);
      return res.status(401).json({ 
        success: false, 
        message: "Students and Faculty must use @iiitg.ac.in email addresses." 
      });
    }
    
    console.log(`Email domain check passed for ${requestedRole}:`, info.email);

    
    const expectedAud = process.env.GOOGLE_CLIENT_ID;
    if (expectedAud && info.aud !== expectedAud) {
      console.warn("Google token audience mismatch");
      return res
        .status(401)
        .json({ success: false, message: "Token audience mismatch" });
    }

    // Check if email is verified
    const emailVerified =
      info.email_verified === true || info.email_verified === "true";
    if (!emailVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Google account email not verified" });
    }

    const email = info.email;
    const googleId = info.sub;
    const fullName = info.name || info.email;

    // Try to find an existing user across all collections
    const existingUserData = await findUserByEmail(email);
    
    let user;
    let finalRole;
    let Model;

    if (existingUserData) {
      // User already exists - use their existing role and model
      user = existingUserData.user;
      finalRole = existingUserData.role;
      Model = existingUserData.Model;
      
      console.log(`Found existing user as ${finalRole}:`, email);
      
      // Update googleId if missing
      if (!user.googleId) {
        console.log("Updating existing user with googleId:", email);
        user.googleId = googleId;
        await user.save();
      }
      
      // Warn if user is trying to login with a different role
      if (requestedRole !== finalRole) {
        console.warn(
          `User ${email} registered as ${finalRole} but trying to login as ${requestedRole}`
        );
      }
    } else {
      // No existing user - create new user in requested role collection
      if (requestedRole === "faculty") {
        Model = Faculty;
        finalRole = "faculty";
      } else if (requestedRole === "staff") {
        Model = Admin;
        finalRole = "staff";
      } else {
        Model = Student;
        finalRole = "student";
      }
      
      console.log("Creating new user (role requested):", finalRole, email);
      
      user = await Model.create({ fullName, email, googleId });
    }

    // Create JWT token for the frontend
    const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret";
    const payload = {
      id: user._id,
      email: user.email,
      role: finalRole,
      name: user.fullName
    };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });

    // Prepare user object for response (remove sensitive/internal fields)
    let userObj = user && user.toObject ? user.toObject() : user;
    if (userObj) {
      delete userObj.password;
      delete userObj.googleId;
    }

    // Send response with JWT and full user object (so frontend has saved fields)
    return res.json({
      success: true,
      token,
      user: { ...(userObj || {}), role: finalRole },
    });
  } catch (err) {
    console.error(
      "Error verifying Google token:",
      err?.response?.data || err.message || err
    );

    const status = err?.response?.status || 500;
    const message =
      err?.response?.data?.error_description ||
      err?.response?.data?.error ||
      err.message ||
      "Google token verification failed";

    return res.status(status === 200 ? 500 : status).json({
      success: false,
      message,
    });
  }
});

module.exports = router;