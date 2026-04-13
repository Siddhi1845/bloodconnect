const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Get notifications for user
router.get("/:userId", async (req, res) => {
  const notifications = await Notification.find({
    userId: req.params.userId
  });

  res.json(notifications);
});

// Create a notification (Internal or Manual)
router.post("/", async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ message: "userId and message required" });
    }
    
    const notif = await Notification.create({ userId, message });
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ message: "Failed to create notification" });
  }
});

// Mark all notifications as read for a user
router.put("/read-all/:userId", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

// Delete a notification (Undo/Cleanup)
router.delete("/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete" });
  }
});

module.exports = router;
