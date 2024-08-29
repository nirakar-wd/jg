const { Cart } = require("../models/index");
const { Product, User, Address } = require("../models/index");
// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, userId, quantity } = req.body;
    console.log(req.body);
    const cartItem = await Cart.create({
      productId,
      userId,
      quantity,
    });

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await Cart.destroy({
      where: { id },
    });

    if (cartItem) {
      res.status(200).json({ message: "Item removed successfully" });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Cart Items
exports.getCartItems = async (req, res) => {
  try {
    const userId = req.query.userId; // Assuming we get userId from query parameters

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: ["name", "description", "price", "discounted_price"],
        },
        {
          model: User,
          include: [
            {
              model: Address,
              attributes: ["id", "address"],
            },
          ],
        },
      ],
    });

    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove all items from Cart by userId
exports.clearCart = async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming userId is passed as a route parameter

    // Delete all cart items for the specified user
    const deletedCount = await Cart.destroy({
      where: { userId },
    });

    if (deletedCount > 0) {
      res
        .status(200)
        .json({ message: "All items removed from the cart successfully" });
    } else {
      res
        .status(404)
        .json({ message: "No items found in the cart for this user" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
