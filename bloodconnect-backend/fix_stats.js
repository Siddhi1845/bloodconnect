const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

const fixAnuja = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected");
    
    // Fuzzy search for Anuja
    const user = await User.findOne({ name: { $regex: "Anuja", $options: "i" } });
    if (user) {
        console.log("Found:", user.name, "Current:", user.donations);
        user.donations += 1; // Increment manually to reflect the action she just took
        await user.save();
        console.log("Updated to:", user.donations);
    } else {
        console.log("User Anuja not found");
    }
    process.exit();
  } catch (err) {
      console.error(err);
      process.exit(1);
  }
};

fixAnuja();
