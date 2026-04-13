const mongoose = require("mongoose");

const bloodBankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String, required: true },
  website: { type: String },
  type: { type: String, enum: ["Private", "Government", "Red Cross"], default: "Government" },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BloodBank", bloodBankSchema);
