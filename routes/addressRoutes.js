const router = require("express").Router();
const AddressesController = require("../controllers/addressController");
const AuthMiddleware = require("../middlewares/authMiddleware");

router.get(
  "/users/addresses",
  AuthMiddleware.mustBeAuthenticated,
  AddressesController.getAddresses
);
router.post(
  "/users/addresses",
  AuthMiddleware.mustBeAuthenticated,
  AddressesController.createAddress
);

module.exports = router;
