require("dotenv").config();
const mongoose = require("mongoose");

async function dropOldIndex() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    // List all indexes
    console.log("\n📋 Current indexes:");
    const indexes = await usersCollection.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Try to drop the old 'name_1' index
    try {
      await usersCollection.dropIndex("name_1");
      console.log("\n✅ Successfully dropped 'name_1' index");
    } catch (error) {
      if (error.code === 27) {
        console.log("\nℹ️  'name_1' index doesn't exist (this is fine)");
      } else {
        console.log("\n⚠️  Error dropping index:", error.message);
      }
    }

    // Show final indexes
    console.log("\n📋 Final indexes:");
    const finalIndexes = await usersCollection.indexes();
    finalIndexes.forEach((index) => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

dropOldIndex();
