import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("\n✗ Could not connect to MongoDB.\n");

    if (err.message.includes("ECONNREFUSED") || err.name === "MongooseServerSelectionError") {
      console.error(
        "   MongoDB doesn't seem to be reachable at the MONGO_URI in your .env file.\n" +
          "   - If you're running MongoDB locally, make sure it's actually started.\n" +
          "   - If you're using MongoDB Atlas, double check the connection string and that\n" +
          "     your current IP address is allow-listed in Atlas's Network Access settings.\n"
      );
    } else if (err.message.toLowerCase().includes("auth")) {
      console.error("   Authentication failed — check the username/password in your MONGO_URI.\n");
    } else {
      console.error(`   ${err.message}\n`);
    }

    process.exit(1);
  }
};

export default connectDB;
