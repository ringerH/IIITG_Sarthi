const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      unique: true,
      sparse: true, // IMPORTANT: Allows multiple null values
    },
    course: {
      type: String,
    },
    department: {
      type: String,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // IMPORTANT: Allows multiple null values
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
