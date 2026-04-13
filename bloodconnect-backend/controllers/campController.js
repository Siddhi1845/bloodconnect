const Camp = require("../models/Camp");

/* GET ALL CAMPS */
exports.getCamps = async (req, res) => {
  try {
    const camps = await Camp.find().sort({ date: 1 }); // Sort by upcoming date
    res.json(camps);
  } catch (err) {
    console.error("Error in getCamps:", err);
    res.status(500).json({ message: "Failed to fetch camps" });
  }
};

/* CREATE CAMP */
exports.createCamp = async (req, res) => {
  try {
    const newCamp = {
      ...req.body,
      createdBy: req.user.id
    };
    const camp = await Camp.create(newCamp);

    // Also create a POST for the feed
    const Post = require("../models/Post");

    // DEBUG: check if 'camp' is allowed
    console.log("Allowed Post Types:", Post.schema.path('type').enumValues);
    console.log("Attempting to create Post with type:", 'camp');

    await Post.create({
      user: req.user.id,
      type: 'camp',
      description: `🏕 CAMP ALERT: ${camp.name} is happening at ${camp.location} on ${new Date(camp.date).toLocaleDateString()}. Organized by ${camp.organizer}.`,
      location: {
        type: "Point",
        coordinates: [0, 0] // Default or use camp coords if available
      }
    });

    res.status(201).json(camp);
  } catch (err) {
    console.error("Error in createCamp:", err);
    res.status(500).json({ message: "Failed to create camp" });
  }
};

/* DELETE CAMP */
exports.deleteCamp = async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: "Camp not found" });

    // Check if user is the creator
    if (camp.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this camp" });
    }

    await camp.deleteOne();
    res.json({ message: "Camp deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete camp" });
  }
};
