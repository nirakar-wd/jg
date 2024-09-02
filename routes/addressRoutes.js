const router = require("express").Router();
const AddressesController = require("../controllers/addressController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/addresses", verifyToken, AddressesController.getAddresses);
router.post("/addresses", verifyToken, AddressesController.createAddress);
router.put("/addresses/:addressId", verifyToken, AddressesController.updateAddress);

module.exports = router;
