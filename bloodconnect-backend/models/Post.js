const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  bloodGroup: { type: String }, // form field
  units: { type: Number }, // form field
  urgent: { type: Boolean, default: false },
  description: { type: String }, // text content
  image: { type: String }, // stores filename

  // NEW: Donation specific fields
  type: {
    type: String,
    enum: ["request", "donation", "camp"],
    default: "request"
  },
  age: { type: Number },
  weight: { type: Number },
  hb: { type: Number },
  disease: { type: String, default: "None" },
  lastDonationDate: { type: Date },
  status: {
    type: String,
    enum: ["pending", "fulfilled"],
    default: "pending"
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: { type: [Number], required: true }
  },

  createdAt: { type: Date, default: Date.now }
});

postSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Post", postSchema);
