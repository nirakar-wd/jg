document.addEventListener("DOMContentLoaded", async () => {
  const orderId = window.location.pathname.split("/").pop(); // Extract orderId from the URL

  console.log(orderId);

  let paymentAmount;

  try {
    const response = await fetch(
      `http://localhost:4000/api/orders/${orderId}`,
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
    const totalPriceSpan = document.getElementById("totalPrice");
    const deliveryFeeSpan = document.getElementById("deliveryFee");

    let deliveryFee = 150.0;
    let totalCost = order.total + deliveryFee;
    productContainer.innerHTML = "";

    console.log(order);

    paymentAmount = totalCost;

    order.order_items.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.classList.add("pro-price", "d-flex");

      // Create elements for product name and price
      const productName = document.createElement("span");
      productName.textContent = `${product.name} x ${product.quantity}`;

      const productPrice = document.createElement("span");
      productPrice.textContent = `Rs.${product.price.toFixed(2)}`;

      // Append name and price to the product element
      productElement.appendChild(productName);
      productElement.appendChild(productPrice);

      // Append the product element to the container
      productContainer.appendChild(productElement);
    });

    deliveryFeeSpan.textContent = `Rs.${deliveryFee}`;
    totalPriceSpan.textContent = `Rs.${totalCost}`;
  }

  document
    .querySelector(".btn-checkout")
    .addEventListener("click", async () => {
      const paymentMethod = "Cash on delivery"; // Set payment method, adjust as necessary

      try {
        const response = await fetch(
          "http://localhost:4000/api/orders/payment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,
              paymentAmount,
              paymentMethod,
              paymentStatus: 0,
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("Payment recorded successfully:", result);
          alert("Payment recorded successfully!");
        } else {
          console.error("Failed to record payment");
          alert("Failed to record payment");
        }
      } catch (error) {
        console.error("Error during payment process:", error);
        alert("An error occurred during the payment process");
      }
    });
});
