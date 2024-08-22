const OrderDto = require("../dtos/responses/ordersDto");
const AppResponseDto = require("../dtos/responses/appResponseDto");
const Order = require("../models/index").Order;
const User = require("../models/index").User;
const Product = require("../models/index").Product;
const Address = require("../models/index").Address;
const sequelize = require("../models/index").sequelize;
const { Op } = require("sequelize");
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
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 5;
  const offset = (page - 1) * pageSize;

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
      offset,
      limit: pageSize,
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
      return res.json(
        OrderDto.buildPagedList(
          results[0].rows,
          page,
          pageSize,
          ordersCount,
          req.baseUrl,
          false
        )
      );
    })
    .catch((err) => {
      return res.json(AppResponseDto.buildSuccessWithMessages(err.message));
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
          attributes: ["id", "name", "slug", "price"],
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

// exports.createOrder = async (req, res, next) => {
//   const addressId = req.body.address_id;

//   let transaction;

//   try {
//     // Start a new transaction
//     transaction = await sequelize.transaction();

//     if (req.user && addressId) {
//       // Reuse existing address
//       await _createOrderReuseAddress(req, res, addressId, transaction);
//     } else {
//       // Create new address if addressId is not provided
//       await createOrderNewAddress(req, res, transaction);
//     }

//     // Commit the transaction
//     await transaction.commit();

//     // Send a success response
//     return res.status(201).json({ message: "Order created successfully" });
//   } catch (err) {
//     // Rollback the transaction if any error occurs
//     if (transaction) {
//       try {
//         await transaction.rollback();
//       } catch (rollbackError) {
//         console.error("Error rolling back transaction:", rollbackError);
//       }
//     }

//     // Log the error for debugging purposes
//     console.error("Error creating order:", err);

//     // Return a generic error response
//     return res
//       .status(500)
//       .json({ message: "An error occurred while creating the order" });
//   }
// };

// async function _createOrderReuseAddress(req, res, addressId, transaction) {
//   try {
//     // Fetch the address based on the provided addressId
//     const address = await Address.findOne({
//       where: { id: addressId },
//       attributes: [
//         "id",
//         "userId",
//         "firstName",
//         "lastName",
//         "zipCode",
//         "address",
//       ],
//       transaction,
//     });

//     // Check if the address exists
//     if (!address) {
//       throw new Error("Address not found");
//     }

//     // Verify that the address belongs to the currently authenticated user
//     if (address.userId !== req.user.id) {
//       throw new Error("You do not own this address");
//     }

//     // Create the order from the address
//     await _createOrderFromAddress(req, res, address, transaction);
//   } catch (err) {
//     // Log the error for debugging
//     console.error("Error creating order with existing address:", err);

//     // Throw the error to be caught in the calling function
//     throw err;
//   }
// }

// async function _createOrderFromAddress(req, res, address, transaction) {
//   try {
//     // Create a new order
//     const order = await Order.create(
//       {
//         userId: address.userId,
//         addressId: address.id,
//       },
//       { transaction }
//     );

//     // Retrieve cart items from the request body
//     const cartItems = req.body.cart_items;

//     console.log(cartItems);

//     // Fetch the products corresponding to the cart items
//     const products = await Product.findAll({
//       where: {
//         id: {
//           [Op.in]: cartItems.map((item) => item.id),
//         },
//       },
//       transaction,
//     });
//     console.log(products);

//     // Verify that all cart items correspond to existing products
//     if (products.length !== cartItems.length) {
//       return res.status(400).json({
//         message: "Some products in the cart no longer exist.",
//       });
//     }

//     // Create order items
//     const orderItems = await Promise.all(
//       products.map((product, index) => {
//         const cartItem = cartItems.find((item) => item.id === product.id);
//         if (!cartItem) {
//           throw new Error(`Cart item with product ID ${product.id} not found.`);
//         }
//         return OrderItem.create(
//           {
//             name: product.name,
//             slug: product.slug,
//             price: product.price,
//             quantity: cartItem.quantity,
//             userId: req.user ? req.user.id : null,
//             orderId: order.id,
//             productId: product.id,
//           },
//           { transaction }
//         );
//       })
//     );

//     // Attach additional details to the order object
//     order.order_items = orderItems;
//     order.address = address;
//     order.user = req.user;

//     // Return the order details in the response
//     return res.json(OrderDto.buildDto(order, false, true, true));
//   } catch (err) {
//     // Log the error for debugging
//     console.error("Error creating order from address:", err);

//     // Return an error response
//     return res.status(500).json({
//       message: "An error occurred while creating the order.",
//       error: err.message,
//     });
//   }
// }

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
