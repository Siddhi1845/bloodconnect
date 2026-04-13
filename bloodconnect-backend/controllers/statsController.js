const User = require("../models/User");

exports.getStats = async (req, res) => {
  try {
    // 1. Blood Availability (Count Donors)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const availabilityRaw = await User.aggregate([
      { 
        $match: { 
          $or: [
            { lastDonationDate: { $exists: false } },
            { lastDonationDate: null },
            { lastDonationDate: { $lt: threeMonthsAgo } }
          ]
        } 
      },
      { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
    ]);
    
    // Format like { "A+": "Available", "B+": "Critical" }
    // Threshold: >= 3 donors is "Available", else "Critical" (low threshold for demo)
    // 2. Count Pending Requests
    const Post = require("../models/Post");
    const requestsRaw = await Post.aggregate([
      { $match: { type: "request" } }, 
      { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
    ]);

    const requestCounts = {};
    requestsRaw.forEach(r => { requestCounts[r._id] = r.count; });
    
    // Format like { "A+": "Available", "B+": "Critical" }
    const availability = {};
    const groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    
    // Map raw counts to object
    const counts = {};
    availabilityRaw.forEach(g => { counts[g._id] = g.count; });

    groups.forEach(g => {
      const donorCount = counts[g] || 0;
      const requestCount = requestCounts[g] || 0;
      
      // LOGIC: Available if Donors > Requests using a small buffer
      // E.g. if 5 donors and 2 requests -> Available
      // If 2 donors and 5 requests -> Critical
      // If 0 donors -> Critical
      
      if (donorCount === 0) {
          availability[g] = "Critical";
      } else {
          availability[g] = donorCount > requestCount ? "Available" : "Critical";
      }
    });

    // 2. User Impact
    const user = await User.findById(req.user.id);
    const impact = {
      donations: user.donations || 0,
      livesSaved: (user.donations || 0) * 3
    };

    // 3. Upcoming Camps
    const Camp = require("../models/Camp");
    const upcomingCamps = await Camp.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(3);

    res.json({ availability, impact, upcomingCamps });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
