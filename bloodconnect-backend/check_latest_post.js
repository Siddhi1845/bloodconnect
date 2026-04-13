const mongoose = require('mongoose');
const Post = require('./models/Post');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://bloodadmin:Password%40123@blood-cluster.hpszk9x.mongodb.net/bloodconnect";

mongoose.connect(MONGO_URI)
  .then(async () => {
    const post = await Post.findOne().sort({ createdAt: -1 });
    if (post) {
      console.log("Image Field Value:", post.image);
    } else {
      console.log("No posts found");
    }
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
