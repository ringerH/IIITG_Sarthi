require("dotenv").config();
const mongoose = require("mongoose");

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    // Drop the problematic index from students collection
    try {
      await db.collection("students").dropIndex("rollNumber_1");
      console.log("✅ Dropped rollNumber_1 index from students collection");
    } catch (err) {
      if (err.code === 27) {
        console.log(
          "ℹ️  Index rollNumber_1 doesn't exist (already dropped or never created)"
        );
      } else {
        console.error("Error dropping index:", err.message);
      }
    }

    // Drop googleId index if it exists
    try {
      await db.collection("students").dropIndex("googleId_1");
      console.log("✅ Dropped googleId_1 index from students collection");
    } catch (err) {
      if (err.code === 27) {
        console.log("ℹ️  Index googleId_1 doesn't exist");
      }
    }

    // Do the same for faculty if needed
    try {
      await db.collection("faculty").dropIndex("employeeId_1");
      console.log("✅ Dropped employeeId_1 index from faculty collection");
    } catch (err) {
      if (err.code === 27) {
        console.log("ℹ️  Index employeeId_1 doesn't exist");
      }
    }

    // Recreate indexes with sparse option
    console.log("\nRecreating indexes with sparse option...");

    await db
      .collection("students")
      .createIndex({ rollNumber: 1 }, { unique: true, sparse: true });
    console.log("✅ Created sparse index on students.rollNumber");

    await db
      .collection("students")
      .createIndex({ googleId: 1 }, { unique: true, sparse: true });
    console.log("✅ Created sparse index on students.googleId");

    await db
      .collection("faculty")
      .createIndex({ employeeId: 1 }, { unique: true, sparse: true });
    console.log("✅ Created sparse index on faculty.employeeId");

    console.log("\n✨ All indexes fixed successfully!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
}

fixIndexes();
