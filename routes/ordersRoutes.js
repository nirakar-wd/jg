const router = require("express").Router();
require("./param_loaders/ordersLoader").init(router);

const ordersController = require("../controllers/ordersController");
const AuthMiddleware = require("../middlewares/authMiddleware");

router.get("",
   AuthMiddleware.mustBeAuthenticated,
   ordersController.getOrders);
router.get(
  "/:order_load_ids",
  AuthMiddleware.mustBeAuthenticated,
  AuthMiddleware.userOwnsItOrIsAdmin,
  ordersController.getOrderDetails
);
router.post("", ordersController.createOrder);

module.exports = router;
