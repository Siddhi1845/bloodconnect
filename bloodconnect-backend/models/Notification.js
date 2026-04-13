const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  message: String,
  
  type: { type: String, enum: ["info", "blood_request"], default: "info" },
  metadata: {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "DonorRequest" },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // The one who sent the request
  },

  isRead: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
