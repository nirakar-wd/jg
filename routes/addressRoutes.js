const router = require("express").Router();
const AddressesController = require("../controllers/addressController");
const upload = require("../helpers/upload").upload;
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/addresses", verifyToken, AddressesController.getAddresses);
router.post("/addresses", verifyToken, upload.none(),  AddressesController.createAddress);
router.put("/addresses/:addressId", verifyToken, upload.none(), AddressesController.updateAddress);

module.exports = router;
