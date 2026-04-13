const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");

// Add comment
router.post("/", async (req, res) => {
  const comment = new Comment(req.body);
  await comment.save();
  res.status(201).json(comment);
});

// Get comments for a post
router.get("/:postId", async (req, res) => {
  const comments = await Comment.find({ postId: req.params.postId })
    .populate("userId", "name");

  res.json(comments);
});

module.exports = router;
