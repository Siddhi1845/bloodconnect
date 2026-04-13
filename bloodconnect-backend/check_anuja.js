require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const checkAnuja = async () => {
  await connectDB();
  const user = await User.findOne({ name: { $regex: "Anuja", $options: "i" } });
  if (user) {
      console.log(JSON.stringify({ name: user.name, id: user._id, profilePhoto: user.profilePhoto }, null, 2));
  } else {
      console.log("User Anuja not found");
  }
  process.exit();
};

checkAnuja();
