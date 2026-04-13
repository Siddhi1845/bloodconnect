const mongoose = require("mongoose");

const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB Atlas Connected");
      return; // Success
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB Error (Attempt ${retries}/${MAX_RETRIES}):`, error.message);
      if (retries === MAX_RETRIES) {
          console.error("🚨 Failed to connect to MongoDB after multiple attempts. Exiting.");
          process.exit(1);
      }
      // Wait 5 seconds before retrying
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

module.exports = connectDB;
