require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();
connectDB();

/* ✅ CORS — MUST BE FIRST */
app.use(cors());

/* ✅ BODY PARSER */
app.use(express.json());

/* ✅ SERVE UPLOADED IMAGES */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ✅ ROUTES */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/camps", require("./routes/campRoutes"));
app.use("/api/donor-requests", require("./routes/donorRequestRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/blood-banks", require("./routes/bloodBankRoutes"));

/* ✅ SAFE FALLBACK (NO *) */
app.use((req, res) => {
  if (req.originalUrl.startsWith("/uploads")) {
    return res.status(404).send("Not Found");
  }
  res.status(404).json({ message: "Route not found" });
});

/* ✅ SERVER */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
