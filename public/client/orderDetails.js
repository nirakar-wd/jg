document.addEventListener("DOMContentLoaded", async () => {
  const apiUrl = window.APP_API_BACKEND_URL;

  const userId = localStorage.getItem("userId");
  let addressId;
  let cartItemsOrder = [];

  if (!userId) {
    console.error("User ID not found in localStorage.");
    return;
  }

  try {
    // Fetch cart items from the backend
    const response = await fetch(`${apiUrl}/api/cart?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result);

      addressId = result[0].user.addresses[0].id || "";

      displayOrderSummary(result);
    } else {
      console.log("failed to fetch cart items");
    }

    function displayOrderSummary(order) {
      const productContainer = document.getElementById("productList");
      const totalPriceElement = document.getElementById("totalPrice");

      console.log(order);

      productContainer.innerHTML = ""; // Clear previous content

      let totalPrice = 0; // Initialize a variable to keep track of the total price

      // Iterate through the array of products (order_items)
      order.forEach((orderItem) => {
        // Extract product details from the nested product object
        const product = orderItem.product;
        const productElement = document.createElement("div");
        productElement.classList.add(
          "pro-price",
          "d-flex",
          "justify-content-between",
          "align-items-center",
          "mb-2"
        );

        cartItemsOrder.push({
          id: orderItem.productId,
          quantity: orderItem.quantity,
        });

        // Create product name and quantity element
        const productName = document.createElement("span");
        productName.textContent = `${product.name} x ${orderItem.quantity}`;

        // Create product price element
        const productPrice = document.createElement("span");
        const itemTotalPrice = product.discounted_price * orderItem.quantity;
        productPrice.textContent = `Rs.${itemTotalPrice}`;

        // Add the current item's price to the total
        totalPrice += itemTotalPrice;

        // Append the elements to the product container
        productElement.appendChild(productName);
        productElement.appendChild(productPrice);

        // Append the productElement to the productContainer
        productContainer.appendChild(productElement);
      });

      // Update the total price element with the calculated total price
      totalPriceElement.textContent = `Rs.${totalPrice}`;
    }
  } catch (err) {
    console.log("err fetching cart items");
  }

  // checkout order POST
  // console.log(addressId);
  const orderBtn = document.querySelector(".btn-checkout");
  orderBtn.addEventListener("click", async () => {
    console.log(cartItemsOrder);
    try {
      // Prepare the payload for the POST request
      const payload = {
        address_id: addressId,
        cart_items: cartItemsOrder,
      };

      // Send a POST request to place the order
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent with the request
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Order placed successfully:", result);
        alert("Order placed successfully!");
        // Clear all cart items for the user

        try {
          const clearCartResponse = await fetch(
            `${apiUrl}/api/cart/clear/${userId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (clearCartResponse.ok) {
            console.log("Cart cleared successfully.");
            // Optionally redirect the user to the homepage
            window.location.href = `${apiUrl}`; // Redirect to homepage
          } else {
            console.error("Failed to clear the cart.");
          }
        } catch (error) {
          console.error("An error occurred while clearing the cart:", error);
        }
      } else {
        console.error(
          "Failed to place order:",
          response.status,
          response.statusText
        );
        alert("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Error occurred while placing the order:", error);
      alert("An error occurred. Please try again.");
    }
  });
});
