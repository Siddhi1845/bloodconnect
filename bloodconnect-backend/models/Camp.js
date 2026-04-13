const mongoose = require("mongoose");

const campSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organizer: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String },
  contact: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Camp", campSchema);
