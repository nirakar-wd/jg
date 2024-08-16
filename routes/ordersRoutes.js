const router = require("express").Router();
require("./param_loaders/ordersLoader").init(router);

const ordersController = require("../controllers/ordersController");
const {
  verifyToken,
  userOwnsItOrIsAdmin,
  isAdmin,
} = require("../middlewares/authMiddleware");

router.get("", verifyToken, ordersController.getOrders);

router.get("/all",
  //  verifyToken,
  //  isAdmin,
    ordersController.getAllOrders);

router.get(
  "/:order_load_ids",
  verifyToken,
  userOwnsItOrIsAdmin,
  ordersController.getOrderDetails
);
router.post("", verifyToken, ordersController.createOrder);

module.exports = router;
