const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		employeeId: { type: String, unique: true },
		department: { type: String },
		password: { type: String },
		googleId: { type: String },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Faculty", facultySchema);
