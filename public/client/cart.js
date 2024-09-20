document.addEventListener("DOMContentLoaded", async () => {

  const apiUrl = window.APP_API_BACKEND_URL;

  const userId = localStorage.getItem("userId");

  if (!userId) {
    console.error("User ID not found in localStorage.");
    return;
  }

  try {
    // Fetch cart items from the backend
    const response = await fetch(
      `${apiUrl}/api/cart?userId=${userId}`,
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
                            <img src=${item.product.images && item.product.images.length > 0 ? item.product.images[0].filePath : "/images/products/polo.jpg"} alt="">
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
        const itemTotalPrice = item.product.discounted_price * item.quantity;

        cartItemsOrder.push({ id: item.productId, quantity: item.quantity });

        const productElement = document.createElement("div");
        productElement.classList.add("pro-price", "d-flex");

        // Create elements for product name and price
        const productName = document.createElement("span");
        productName.textContent = item.product.name + " X " + item.quantity;

        // const productQuantity = document.createElement("span");
        // productQuantity.textContent = item.product.quantity;

        const productPrice = document.createElement("span");
        productPrice.textContent = `Rs.${(
          item.product.discounted_price * item.quantity
        ).toFixed(2)}`;

        // Append name and price to the product element
        productElement.appendChild(productName);
        // productElement.appendChild(productQuantity);
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
              `${apiUrl}/api/cart/${cartItemId}`,
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
