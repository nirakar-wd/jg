const router = require("express").Router();
// require("./param_loaders/ordersLoader").init(router);

const ordersController = require("../controllers/ordersController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

router.get("/sales", verifyToken, isAdmin, ordersController.getOrdersByMonth);

router.get("", verifyToken, ordersController.getOrders);

router.get("/all", verifyToken, isAdmin, ordersController.getAllOrders);

router.get("/:orderId", verifyToken, ordersController.getOrderDetails);
router.post("", verifyToken, ordersController.createOrder);

router.post("/payment", verifyToken, ordersController.payment);

module.exports = router;
