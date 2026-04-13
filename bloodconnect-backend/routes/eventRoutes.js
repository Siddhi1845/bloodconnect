const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// Get events
router.get("/", async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
});

// Create event
router.post("/", async (req, res) => {
  const event = new Event(req.body);
  await event.save();
  res.status(201).json(event);
});

module.exports = router;
