document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  let addressId;

  if (!userId) {
    console.error("User ID not found in localStorage.");
    return;
  }

  try {
    // Fetch cart items from the backend
    const response = await fetch(
      `http://localhost:4000/api/cart?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const cartItems = await response.json();
      const cartItemsContainer = document.getElementById("cartItems");
      const orderSummaryContainer =
        document.getElementById("cartItemsContainer");
      const totalPriceContainer = document.getElementById("totalOrderPrice");

      let totalPrice = 0;
      let cartItemsOrder = [];

      console.log(cartItems);

      // Clear existing content
      cartItemsContainer.innerHTML = "";
      orderSummaryContainer.innerHTML = "";

      // Iterate over each cart item and create table rows
      cartItems.forEach((item) => {
        const row = document.createElement("tr");

        row.innerHTML = `
                        <th scope="row">
                            <img src="/img/Flat Back Brown TFF.png" alt="">
                        </th>
                        <td>${item.product.name}</td>
                        <td>${item.quantity}</td>
                        <td>Rs.${(
                          item.product.discounted_price * item.quantity
                        ).toFixed(2)}</td>
                        <td>
                            <a href="#" data-id="${
                              item.id
                            }" class="delete-cart-item"><i class="fa-solid fa-trash-can"></i></a>
                        </td>
                    `;

        cartItemsContainer.appendChild(row);
        addressId = item.user.addresses[0].id;
        const itemTotalPrice = item.product.discounted_price * item.quantity;

        cartItemsOrder.push({ id: item.productId, quantity: item.quantity });

        const productElement = document.createElement("div");
        productElement.classList.add("pro-price", "d-flex");

        // Create elements for product name and price
        const productName = document.createElement("span");
        productName.textContent = item.product.name;

        const productPrice = document.createElement("span");
        productPrice.textContent = `Rs.${(
          item.product.discounted_price * item.quantity
        ).toFixed(2)}`;

        // Append name and price to the product element
        productElement.appendChild(productName);
        productElement.appendChild(productPrice);

        // Append the product element to the container
        orderSummaryContainer.appendChild(productElement);
        totalPrice += itemTotalPrice;
      });

      totalPriceContainer.innerHTML = `Rs.${totalPrice}`;

      // Attach delete event listeners to each delete button
      document.querySelectorAll(".delete-cart-item").forEach((button) => {
        button.addEventListener("click", async (event) => {
          event.preventDefault();
          const cartItemId = event.currentTarget.getAttribute("data-id");

          try {
            const deleteResponse = await fetch(
              `http://localhost:4000/api/cart/${cartItemId}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (deleteResponse.ok) {
              alert("Item removed from cart.");
              location.reload(); // Refresh the page to reflect changes
            } else {
              console.error(
                "Failed to delete cart item:",
                deleteResponse.status,
                deleteResponse.statusText
              );
            }
          } catch (error) {
            console.error("Error occurred while deleting cart item:", error);
          }
        });
      });

      console.log(cartItemsOrder);

      const orderBtn = document.querySelector(".btn-checkout");
      console.log(addressId);
      orderBtn.addEventListener("click", async () => {
        try {
          // Prepare the payload for the POST request
          const payload = {
            address_id: addressId,
            cart_items: cartItemsOrder,
          };

          // Send a POST request to place the order
          const response = await fetch("http://localhost:4000/api/orders", {
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
              const clearCartResponse = await fetch(`http://localhost:4000/api/cart/clear/${userId}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (clearCartResponse.ok) {
                console.log("Cart cleared successfully.");
                // Optionally redirect the user to the homepage
                window.location.href = "http://localhost:4000/"; // Redirect to homepage
              } else {
                console.error("Failed to clear the cart.");
              }
            } catch (error) {
              console.error(
                "An error occurred while clearing the cart:",
                error
              );
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
    } else {
      console.error(
        "Failed to fetch cart items:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error("Error occurred while fetching cart items:", error);
  }
});
