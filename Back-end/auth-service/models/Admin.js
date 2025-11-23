const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		staffId: { type: String, unique: true, sparse: true },
		role: { type: String },
		password: { type: String },
		googleId: { type: String, unique: true, sparse: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
