const OrderDto = require("../dtos/responses/ordersDto");
const AppResponseDto = require("../dtos/responses/appResponseDto");
const Order = require("../models/index").Order;
const User = require("../models/index").User;
const Product = require("../models/index").Product;
const Address = require("../models/index").Address;
const Payment = require("../models/index").Payment;
const sequelize = require("../models/index").sequelize;
const { Op, fn, col, literal } = require("sequelize");
const OrderItem = require("../models/index").OrderItem;
const ORDER_STATUS = require("../constants").ORDER_STATUS;

exports.getAllOrders = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 5;
  const offset = (page - 1) * pageSize;

  try {
    const { count, rows: orders } = await Order.findAndCountAll({});
    res.json({
      success: true,
      count,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Error fetching orders" });
  }
};

exports.getOrders = async (req, res, next) => {
  // const page = parseInt(req.query.page) || 1;
  // const pageSize = parseInt(req.query.page_size) || 5;
  // const offset = (page - 1) * pageSize;

  return Promise.all([
    Order.findAndCountAll({
      order: [["createdAt", "DESC"]],

      include: [
        {
          model: OrderItem,
          attributes: [
            "id",
            // [sequelize.fn('count', sequelize.col('order_items.id')), 'orderItemCount']
          ],
          // group: ['order_items.orderId'],
        },
      ],

      where: { userId: req.user.id },
    }),
    Order.findAndCountAll({
      where: { userId: req.user.id },
      attributes: ["id"],
    }),
  ])
    .then(function (results) {
      const ordersCount = results[1].count;
      results[0].rows.forEach(
        (order) => (order.order_items_count = order.order_items.length)
      );

      return res.json(results[0]);
    })
    .catch((err) => {
      return res.status(400).json({ message: err.message });
    });
};

async function createOrderNewAddress(req, res, transaction) {
  const country = req.body.country;
  const city = req.body.city;
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const address = req.body.address;
  const zipCode = req.body.zip_code;

  const addr = new Address({
    country,
    city,
    firstName,
    lastName,
    address,
    zipCode,
  });

  if (req.user != null) {
    addr.userId = req.userId;
  }

  await addr
    .save({ transaction })
    .then(async (address) => {
      address.user = req.user;
      await _createOrderFromAddress(req, res, address, transaction);
    })
    .catch((err) => {
      throw err;
    });
}

exports.getOrderDetails = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    // Fetch order with associated Address, OrderItem, and User
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: Address,
          include: [{ model: User, attributes: ["id", "email", "phone"] }],
        },
        {
          model: OrderItem,
          attributes: ["id", "name", "slug", "price", "quantity"],
        },
      ],
    });

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Send the order details as JSON response
    return res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order details:", err);

    // Return generic error message to avoid exposing internal details
    return res
      .status(500)
      .json({ message: "An error occurred while retrieving order details" });
  }
};

// TODO
exports.updateOrder = (req, res, next) => {
  return res.json(AppResponseDto.buildWithErrorMessages("not implemented"));
};

exports.createOrder = async (req, res, next) => {
  const addressId = req.body.address_id;

  console.log(req.body);
  let transaction;

  try {
    // Start a new transaction
    transaction = await sequelize.transaction();

    if (req.user && addressId) {
      // Reuse existing address
      await _createOrderReuseAddress(req, res, addressId, transaction);
    } else if (!addressId) {
      // Create new address if addressId is not provided
      await createOrderNewAddress(req, res, transaction);
    }

    console.log("created ....");
    // Commit the transaction
    await transaction.commit();

    // Send a success response only once
    // return res.status(201).json({ message: "Order created successfully" });
  } catch (err) {
    // Rollback the transaction only if it hasn't been committed
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Error rolling back transaction:", rollbackError);
      }
    }

    // Log the error
    console.error("Error creating order:", err);

    // Send a generic error response only if headers have not been sent
    // Send a generic error response only if headers have not been sent
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "An error occurred while creating the order" });
    } else {
      console.error("Headers were already sent, cannot send another response.");
    }
  }
};

async function _createOrderReuseAddress(req, res, addressId, transaction) {
  try {
    // Fetch the address based on the provided addressId
    const address = await Address.findOne({
      where: { id: addressId },
      attributes: [
        "id",
        "userId",
        "firstName",
        "lastName",
        "zipCode",
        "address",
      ],
      transaction, // Use the transaction
    });

    // Check if the address exists
    if (!address) {
      throw new Error("Address not found");
    }

    // Verify that the address belongs to the currently authenticated user
    if (address.userId !== req.user.id) {
      throw new Error("You do not own this address");
    }

    // Create the order from the address
    await _createOrderFromAddress(req, res, address, transaction);
  } catch (err) {
    // Log the error
    console.error("Error creating order with existing address:", err);

    // Re-throw the error to be handled by the calling function
    throw err;
  }
}

async function _createOrderFromAddress(req, res, address, transaction) {
  try {
    const cartItems = req.body.cart_items;

    // Fetch the products corresponding to the cart items
    const products = await Product.findAll({
      where: {
        id: {
          [Op.in]: cartItems.map((item) => item.id),
        },
      },
    });

    // Verify that all cart items correspond to existing products
    if (products.length !== cartItems.length) {
      return res.status(400).json({
        message: "Some products in the cart no longer exist.",
      });
    }

    // Calculate the total order amount
    const total = products.reduce((sum, product) => {
      const cartItem = cartItems.find((item) => item.id === product.id);
      return sum + product.discountedPrice * cartItem.quantity;
    }, 0);

    // Generate tracking number
    const trackingNumber = generateTrackingNumber(); // Implement this function to generate a tracking number

    // Create the order
    const order = await Order.create(
      {
        userId: address.userId,
        addressId: address.id,
        trackingNumber,
        orderStatus: ORDER_STATUS.processed.ordinal,
        total,
      },
      { transaction }
    );

    // Create order items
    const orderItems = await Promise.all(
      products.map((product) => {
        const cartItem = cartItems.find((item) => item.id === product.id);
        return OrderItem.create(
          {
            name: product.name,
            slug: product.slug,
            price: product.discountedPrice,
            quantity: cartItem.quantity,
            userId: req.user ? req.user.id : null,
            orderId: order.id,
            productId: product.id,
          },
          { transaction }
        );
      })
    );

    // Attach additional details to the order object
    order.order_items = orderItems;
    order.address = address;
    order.user = req.user;

    // Return the order details in the response
    return res.json(OrderDto.buildDto(order, false, true, true));
  } catch (err) {
    console.error("Error creating order from address:", err);
    if (!res.headersSent) {
      return res.status(500).json({
        message: "An error occurred while creating the order.",
        error: err.message,
      });
    }
  }
}

// Example function to generate a tracking number
function generateTrackingNumber() {
  // Generate a unique tracking number (e.g., using UUID or another logic)
  return `${Math.floor(Math.random() * 1000000)}`;
}

exports.payment = async (req, res, next) => {
  const { orderId, paymentAmount, paymentMethod, paymentStatus } = req.body;

  console.log(req.body);

  try {
    // Generate a unique transaction ID
    const transactionId = `txn_${new Date().getTime()}`;

    const payment = await Payment.create({
      orderId,
      paymentAmount,
      paymentMethod,
      paymentStatus,
      transactionId,
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error("Error creating payment record:", error);
    res.status(500).json({ error: "Failed to create payment record" });
  }
};

exports.getOrdersByMonth = async (req, res) => {
  try {
    // Fetch the number of orders per month for the current year
    const ordersByMonth = await Order.findAll({
      attributes: [
        [fn('MONTH', col('created_at')), 'month'], // Extract month from the createdAt field
        [fn('COUNT', col('id')), 'orderCount'],   // Count the number of orders per month
      ],
      where: {
        createdAt: {
          [Op.gte]: literal('NOW() - INTERVAL 1 YEAR'), // Limit to the last 12 months
        },
      },
      group: ['month'],
      order: [[literal('month'), 'ASC']], // Order results by month
    });

    const result = Array(12).fill(0); // Initialize array for 12 months (Jan to Dec)

    // Map the result to the corresponding months (1-12)
    ordersByMonth.forEach(order => {
      const monthIndex = parseInt(order.dataValues.month) - 1;
      result[monthIndex] = order.dataValues.orderCount;
    });

    // Month labels for the frontend chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return res.status(200).json({ salesData: result, months: months });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching sales data", error: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  const { paymentId } = req.params;
  const { newStatus } = req.body;

  // Check if the newStatus is valid
  const validStatuses = [
    PAYMENT_STATUS.pending.ordinal,
    PAYMENT_STATUS.paid.ordinal,
    PAYMENT_STATUS.failed.ordinal,
    PAYMENT_STATUS.refunded.ordinal,
  ];

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({
      message: "Invalid payment status provided.",
    });
  }

  try {
    // Find the payment record by paymentId
    const payment = await Payment.findOne({ where: { id: paymentId } });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found.",
      });
    }

    // Update the payment status
    payment.paymentStatus = newStatus;
    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully.",
      payment,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({
      message: "Failed to update payment status.",
      error: error.message,
    });
  }
};


exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { newStatus } = req.body;

  // Validate the newStatus
  const validStatuses = [
    ORDER_STATUS.processed.ordinal,
    ORDER_STATUS.delivered.ordinal,
    ORDER_STATUS.shipped.ordinal,
  ];

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({
      message: "Invalid order status provided.",
    });
  }

  try {
    // Find the order by orderId
    const order = await Order.findOne({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    // Update the order status
    order.orderStatus = newStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      message: "Failed to update order status.",
      error: error.message,
    });
  }
};