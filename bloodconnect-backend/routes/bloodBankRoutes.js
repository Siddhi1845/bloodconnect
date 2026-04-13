const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { addBloodBank, getBloodBanks } = require("../controllers/bloodBankController");

router.post("/", auth, addBloodBank);
router.get("/", auth, getBloodBanks);
router.delete("/:id", auth, require("../controllers/bloodBankController").deleteBloodBank);

module.exports = router;
