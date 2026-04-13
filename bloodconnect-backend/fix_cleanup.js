const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Post = require('./models/Post');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://bloodadmin:Password%40123@blood-cluster.hpszk9x.mongodb.net/bloodconnect";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to DB. Checking for missing files...");
    
    const uploadsDir = path.join(__dirname, 'uploads');
    
    // 1. Check Posts
    const posts = await Post.find({ image: { $exists: true, $ne: null } });
    for (const p of posts) {
      if (!p.image) continue;
      const filePath = path.join(uploadsDir, p.image);
      if (!fs.existsSync(filePath)) {
        console.log(`Post ${p._id} refers to missing image: ${p.image}. Removing reference.`);
        p.image = undefined;
        await p.save();
      }
    }

    // 2. Check Users
    const users = await User.find({ profilePhoto: { $exists: true, $ne: null, $ne: "" } });
    for (const u of users) {
        if (!u.profilePhoto) continue;
        const filePath = path.join(uploadsDir, u.profilePhoto);
        if (!fs.existsSync(filePath)) {
          console.log(`User ${u.name} refers to missing photo: ${u.profilePhoto}. Removing reference.`);
          u.profilePhoto = ""; // empty string
          await u.save();
        }
    }

    console.log("Done cleaning up missing file references.");
    process.exit();
  })
  .catch(err => {
    console.error("Error", err);
    process.exit(1);
  });
