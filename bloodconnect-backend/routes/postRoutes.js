const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  createPost,
  getAllPosts,
  getUrgentPosts,
  getNearbyPosts,
  deletePost
} = require("../controllers/postController");

router.post("/", auth, upload.single("image"), createPost);
router.get("/", getAllPosts);
router.get("/urgent", getUrgentPosts);
router.get("/nearby", getNearbyPosts);
router.delete("/:id", auth, deletePost);


module.exports = router;
