const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

const upload = require("../middleware/upload");

/* GET PROFILE */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile" });
  }
});

/* UPDATE PROFILE */
router.put("/me", auth, upload.single("profilePhoto"), async (req, res) => {
  try {
    console.log("Update Profile Request Body:", req.body);
    console.log("Update Profile Req File:", req.file);
    if (req.file) console.log("Filename:", req.file.filename);

    const { name, phone, city, address } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (city) updates.city = city;

    if (address) updates.address = address;
    if (req.body.isDonor !== undefined) {
      updates.isDonor = req.body.isDonor === 'true' || req.body.isDonor === true;
    }

    if (req.file) {
      updates.profilePhoto = req.file.filename;
    } else if (req.body.deletePhoto === "true") {
      updates.profilePhoto = null;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

/* GET NEARBY DONORS */
router.get("/nearby", auth, async (req, res) => {
  try {
    // Return ALL users matching criteria (active/donors) - Ignoring location for now to show everyone
    // const { lat, lng } = req.query; 
    // Just return everyone sorted by newest
    const users = await User.find({ isDonor: true })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Nearby donors error:", err);
    res.status(500).json({ message: "Failed to fetch donors" });
  }
});

module.exports = router;
