const mongoose = require("mongoose");

const donorRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The Donor
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected"], 
    default: "pending" 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DonorRequest", donorRequestSchema);
