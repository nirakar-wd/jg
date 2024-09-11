const router = require("express").Router();
// require("./param_loaders/ordersLoader").init(router);

const ordersController = require("../controllers/ordersController");
const { verifyToken, isAdmin, userOwnsItOrIsAdmin } = require("../middlewares/authMiddleware");

router.get("/sales", verifyToken, isAdmin, ordersController.getOrdersByMonth);
router.get("/revenue", verifyToken, isAdmin, ordersController.calculateRevenue);

router.get("", verifyToken, ordersController.getOrders);

router.get("/all", verifyToken, isAdmin, ordersController.getAllOrders);

router.get("/:orderId", verifyToken, userOwnsItOrIsAdmin, ordersController.getOrderDetails);
router.post("", verifyToken, ordersController.createOrder);

router.post("/payment", verifyToken, ordersController.payment);

router.put("/:orderId", verifyToken, isAdmin, ordersController.updateOrderStatus);
router.delete("/:orderId", verifyToken, userOwnsItOrIsAdmin, ordersController.cancelOrder);


module.exports = router;
