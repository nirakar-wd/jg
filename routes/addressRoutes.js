const router = require("express").Router();
const AddressesController = require("../controllers/addressController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get(
  "/users/addresses",
  verifyToken,
  AddressesController.getAddresses
);
router.post(
  "/users/addresses",
  verifyToken,
  AddressesController.createAddress
);

module.exports = router;
