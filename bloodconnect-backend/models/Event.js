const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  location: String,
  date: Date,
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Event", eventSchema);
