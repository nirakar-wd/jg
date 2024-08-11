const router = require("express").Router();
const AddressesController = require("../controllers/addressController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/addresses", verifyToken, AddressesController.getAddresses);
router.post("/addresses", verifyToken, AddressesController.createAddress);

module.exports = router;
