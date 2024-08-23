const router = require("express").Router();
// require("./param_loaders/ordersLoader").init(router);

const ordersController = require("../controllers/ordersController");
const {
  verifyToken,
  userOwnsItOrIsAdmin,
  isAdmin,
} = require("../middlewares/authMiddleware");

router.get("", verifyToken, ordersController.getOrders);

router.get(
  "/all",
  //  verifyToken,
  //  isAdmin,
  ordersController.getAllOrders
);

router.get(
  "/:orderId",
  // verifyToken,
  // userOwnsItOrIsAdmin,
  ordersController.getOrderDetails
);
router.post("", verifyToken, ordersController.createOrder);

router.post("/payment", verifyToken, ordersController.payment);

module.exports = router;
