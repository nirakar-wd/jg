const express = require("express");
const router = express.Router();
const {
    verifyToken,
  } = require("../middlewares/authMiddleware");
const cartController = require("../controllers/cartController"); // Adjust the path based on your project structure

// Add to Cart
router.post("/cart", verifyToken, cartController.addToCart);

// Remove from Cart
router.delete("/cart/:id", verifyToken, cartController.removeFromCart);

router.delete('/cart/clear/:userId', cartController.clearCart);

// Get Cart Items
router.get("/cart", verifyToken, cartController.getCartItems);

module.exports = router;
