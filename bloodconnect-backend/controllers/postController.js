const Post = require("../models/Post");

/* ===============================
   CREATE POST
================================ */
exports.createPost = async (req, res) => {
  try {
    const { 
      bloodGroup, units, urgent, description, lat, lng,
      type, age, weight, hb, disease, lastDonationDate 
    } = req.body;

    console.log("Create Post Request Body:", req.body);
    console.log("Create Post File:", req.file);

    // VALIDATION FOR DONATION
    if (type === "donation") {
      if (!age || !weight || !hb || !disease) {
        return res.status(400).json({ message: "All donor fields are required" });
      }
      
      // Strict Disease Rule
      if (disease !== "None") {
        return res.status(400).json({ message: "Sorry, you cannot donate if you have any disease." });
      }

      if (age < 18 || age > 65) return res.status(400).json({ message: "Age must be between 18 and 65" });
      if (weight < 45) return res.status(400).json({ message: "Weight must be at least 45kg" });
      if (hb < 12.5) return res.status(400).json({ message: "Hemoglobin must be at least 12.5 g/dL" });

      if (lastDonationDate) {
        const lastDate = new Date(lastDonationDate);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (lastDate > threeMonthsAgo) {
          return res.status(400).json({ message: "You must wait 3 months between donations" });
        }
      }
      
      // Update User details stats
      const User = require("../models/User");
      
      const updateData = {
        age, 
        weight, 
        hb, 
        disease,
        isDonor: true
      };
      
      if (lastDonationDate) {
        updateData.lastDonationDate = new Date(lastDonationDate);
      }

      await User.findByIdAndUpdate(req.user.id, updateData);

      // PREVIOUSLY: return res.status(200).json(...) - REMOVED to allow Post creation
    }

    const postData = {
      user: req.user.id,
      bloodGroup,
      units,
      urgent,
      description,
      type: type || "request",
      age, 
      weight, 
      hb, 
      disease,
      lastDonationDate,
      location: {
        type: "Point",
        coordinates: [Number(lng), Number(lat)]
      }
    };

    // Add image if uploaded
    if (req.file) {
      postData.image = req.file.filename;
    }

    const post = await Post.create(postData);

    // NOTIFICATION LOGIC
    if (type === "request") {
        const User = require("../models/User");
        const Notification = require("../models/Notification");
        
        // Find all other users
        const users = await User.find({ _id: { $ne: req.user.id } });
        
        // Create notifications
        const notifs = users.map(u => ({
            userId: u._id,
            message: `New Request: ${req.user.name || "Someone"} needs ${bloodGroup} blood!`
        }));
        
        if (notifs.length > 0) {
            await Notification.insertMany(notifs);
        }
    }

    const populatedPost = await post.populate(
      "user",
      "name phone bloodGroup profilePhoto city address"
    );

    res.status(201).json(populatedPost);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

/* ===============================
   GET ALL POSTS
================================ */
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name phone bloodGroup profilePhoto city address")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

/* ===============================
   GET URGENT POSTS
================================ */
exports.getUrgentPosts = async (req, res) => {
  try {
    const posts = await Post.find({ urgent: true })
      .populate("user", "name phone bloodGroup profilePhoto city address")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Urgent posts error:", err);
    res.status(500).json({ message: "Failed to fetch urgent posts" });
  }
};

/* ===============================
   GET NEARBY POSTS
================================ */
exports.getNearbyPosts = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location required" });
    }

    const posts = await Post.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: 10000 // 10 km
        }
      }
    })
      .populate("user", "name phone bloodGroup profilePhoto city address")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Nearby posts error:", err);
    res.status(500).json({ message: "Failed to fetch nearby posts" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};
