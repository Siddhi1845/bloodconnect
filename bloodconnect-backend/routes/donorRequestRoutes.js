const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { sendRequest, respondRequest, getMySentRequests, undoResponse } = require("../controllers/donorRequestController");

router.post("/send", auth, sendRequest);
router.post("/respond", auth, respondRequest);
router.post("/undo", auth, undoResponse);
router.get("/sent", auth, getMySentRequests);

module.exports = router;
