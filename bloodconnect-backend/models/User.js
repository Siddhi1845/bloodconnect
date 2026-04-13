const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  donations: { type: Number, default: 0 },
  lastDonationDate: { type: Date },
  
  // Donor Health Details
  age: { type: Number },
  weight: { type: Number },
  hb: { type: Number },
  hb: { type: Number },
  disease: { type: String, default: "None" },
  
  address: { type: String },
  city: { type: String },

  profilePhoto: { type: String }, // stores filename
  isDonor: { type: Boolean, default: false },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },

  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
