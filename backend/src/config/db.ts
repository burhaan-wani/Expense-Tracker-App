import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const mongoDBUri = process.env.MONGODBURI as string;
    console.log(mongoDBUri);

    const connection = await mongoose.connect(process.env.MONGODBURI as string);
    console.log("═══════════════════════════════════════");
    console.log("🎉 MongoDB Connected Successfully!");
    console.log(`📁 Database: ${connection.connection.name}`);
    console.log(`🔗 Host: ${connection.connection.host}`);
    console.log("═══════════════════════════════════════");
  } catch (error) {
    console.error("═══════════════════════════════════════");
    console.error("❌ MongoDB Connection Error:", error);
    console.error("═══════════════════════════════════════");
    console.error("Possible fixes:");
    console.error("1. Make sure MongoDB is running");
    console.error("2. Check if port 27017 is available");
    console.error("3. Verify MONGODB_URI in .env file");

    process.exit(1);
  }
};

export { connectDB };
