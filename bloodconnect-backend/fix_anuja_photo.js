require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const fixAnuja = async () => {
  await connectDB();
  const user = await User.findOne({ name: { $regex: "Anuja", $options: "i" } });
  if (user) {
      console.log(`Found Anuja: ${user._id}. Updating photo...`);
      // Use the most recent file found in directory if we knew it, but here I'll use the one I found
      user.profilePhoto = "1769863797210-787812370.png";
      await user.save();
      console.log("Updated Anuja profile photo.");
  } else {
      console.log("User Anuja not found");
  }
  process.exit();
};

fixAnuja();
