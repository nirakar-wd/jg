const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController"); // Adjust the path based on your project structure

// Add to Cart
router.post("/cart", cartController.addToCart);

// Remove from Cart
router.delete("/cart/:id", cartController.removeFromCart);

// Get Cart Items
router.get("/cart", cartController.getCartItems);

module.exports = router;
