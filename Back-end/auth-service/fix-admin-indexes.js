// fix-admin-indexes.js
// Run this script once to fix the Admin collection indexes
require("dotenv").config();
const mongoose = require("mongoose");

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const Admin = mongoose.connection.collection("admins");

    // Get current indexes
    const indexes = await Admin.indexes();
    console.log("Current indexes:", indexes);

    // Drop the problematic staffId index
    try {
      await Admin.dropIndex("staffId_1");
      console.log("✓ Dropped staffId_1 index");
    } catch (err) {
      console.log("staffId_1 index doesn't exist or already dropped");
    }

    // Drop googleId index if it exists and isn't sparse
    try {
      await Admin.dropIndex("googleId_1");
      console.log("✓ Dropped googleId_1 index");
    } catch (err) {
      console.log("googleId_1 index doesn't exist or already dropped");
    }

    // Create new sparse indexes
    await Admin.createIndex({ staffId: 1 }, { unique: true, sparse: true });
    console.log("✓ Created sparse index for staffId");

    await Admin.createIndex({ googleId: 1 }, { unique: true, sparse: true });
    console.log("✓ Created sparse index for googleId");

    await Admin.createIndex({ email: 1 }, { unique: true });
    console.log("✓ Ensured unique index for email");

    // Verify new indexes
    const newIndexes = await Admin.indexes();
    console.log("\nNew indexes:", newIndexes);

    console.log("\n✅ All indexes fixed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error fixing indexes:", err);
    process.exit(1);
  }
}

fixIndexes();