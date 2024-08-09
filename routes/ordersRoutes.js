const router = require("express").Router();
require("./param_loaders/ordersLoader").init(router);

const ordersController = require("../controllers/ordersController");
const { verifyToken, userOwnsItOrIsAdmin } = require("../middlewares/authMiddleware");

router.get("",
   verifyToken,
   ordersController.getOrders);
router.get(
  "/:order_load_ids",
  verifyToken,
  userOwnsItOrIsAdmin,
  ordersController.getOrderDetails
);
router.post("",verifyToken, ordersController.createOrder);

module.exports = router;
