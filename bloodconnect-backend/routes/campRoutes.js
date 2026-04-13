const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getCamps, createCamp } = require("../controllers/campController");

router.get("/", auth, getCamps);
router.post("/", auth, createCamp);
router.delete("/:id", auth, require("../controllers/campController").deleteCamp);

module.exports = router;
