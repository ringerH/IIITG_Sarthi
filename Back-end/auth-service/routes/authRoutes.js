const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const Student = require("../Models/Students");
const Faculty = require("../Models/Faculty");
const Admin = require("../Models/Admin");

const router = express.Router();

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
  const role = (rawRole || "student").toLowerCase();

  if (!tokenId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing ID token" });
  }

  try {
    // Verify token with Google's tokeninfo endpoint
    const resp = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        tokenId
      )}`
    );

    const info = resp.data;
    console.log("Google verification successful for:", info.email);

    const expectedDomain = "iiitg.ac.in";
    if (!info.email || !info.email.endsWith("@" + expectedDomain)) {
      console.warn("Google token email domain mismatch:", info.email);
      return res
        .status(401)
        .json({ success: false, message: "Only @iiitg.ac.in emails are allowed." });
    }

    // Optional: verify audience if GOOGLE_CLIENT_ID is set in env
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

    // Try to find an existing user across all role collections first.
    // This prevents creating duplicate accounts for the same email when the
    // frontend requests a different role on sign-in.
    let user = await Student.findOne({ email });
    let detectedRole = "student";

    if (!user) {
      user = await Faculty.findOne({ email });
      if (user) detectedRole = "faculty";
    }
    if (!user) {
      user = await Admin.findOne({ email });
      if (user) detectedRole = "admin";
    }

    // If we didn't find an existing record, fall back to the requested role.
    let Model;
    if (user) {
      // Use the model that matched the existing document
      if (detectedRole === "faculty") Model = Faculty;
      else if (detectedRole === "admin") Model = Admin;
      else Model = Student;
      console.log("Found existing user in role:", detectedRole, email);
    } else {
      // No existing user, create in the requested role
      if (role === "faculty") Model = Faculty;
      else if (role === "admin") Model = Admin;
      else Model = Student;
      console.log("Creating new user (role requested):", role, email);
    }

    // If we found a user earlier, ensure 'user' variable points to the document
    if (!user) {
      user = await Model.create({ fullName, email, googleId });
    } else if (!user.googleId) {
      // Attach googleId if missing
      console.log("Updating existing user with googleId:", email);
      user.googleId = googleId;
      await user.save();
    } else {
      console.log("Existing user logged in:", email);
    }

    // Ensure role in JWT matches the actual role in the database when possible
    const finalRole = detectedRole || role;

    // Create JWT token for the frontend
    const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret";
    const payload = {
      id: user._id,
      email: user.email,
      role: finalRole,
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
