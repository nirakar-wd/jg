document.addEventListener("DOMContentLoaded", async () => {
  const orderId = window.location.pathname.split("/").pop(); // Extract orderId from the URL
  const totalPrice = document.getElementById("totalPrice");
  const orderStatus = document.getElementById("orderStatus");

  const apiUrl = window.APP_API_BACKEND_URL;


  try {
    const response = await fetch(
      `${apiUrl}/api/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      const order = await response.json();
      displayOrderSummary(order);
    } else {
      document.getElementById("orderDetails").innerHTML = "Order not found.";
    }
  } catch (error) {
    console.error("Error fetching order details:", error);
  }

  function displayOrderSummary(order) {
    const productContainer = document.getElementById("productList");
    console.log(order);

    totalPrice.textContent = `Rs.${order.total}`;
    orderStatus.textContent = order.orderStatusStr || "processing";

    productContainer.innerHTML = "";

    order.order_items.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.classList.add("pro-price", "d-flex");

      const productName = document.createElement("span");
      productName.textContent = `${product.name} x ${product.quantity}`;

      const productPrice = document.createElement("span");
      productPrice.textContent = `Rs.${product.price * product.quantity}`;

      productElement.appendChild(productName);
      productElement.appendChild(productPrice);

      productContainer.appendChild(productElement);
    });
  }

  document.querySelector(".cancel-btn").addEventListener("click", async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/orders/${orderId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(result.message); // Show success message
      } else {
        const errorData = await response.json();
        alert(`Failed to cancel order: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during the cancelling process:", error);
      alert("An error occurred during the payment process");
    }
  });
});
