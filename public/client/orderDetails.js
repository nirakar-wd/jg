document.addEventListener("DOMContentLoaded", async () => {
  const orderId = window.location.pathname.split("/").pop(); // Extract orderId from the URL
  const totalPriceSpan = document.getElementById("totalPrice");
  let orderTotal;

  let paymentAmount;
  let deliveryFee = 150; // Default delivery fee

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

  document
    .querySelectorAll('input[name="deliveryOptions"]')
    .forEach((radio) => {
      radio.addEventListener("change", handleOptionChange);
    });

  function handleOptionChange() {
    const selectedOption = document.querySelector(
      'input[name="deliveryOptions"]:checked'
    );
    if (selectedOption) {
      deliveryFee = parseFloat(selectedOption.value); // Update delivery fee
      updateTotalCost(); // Update total cost when delivery option changes
    }
  }

  function displayOrderSummary(order) {
    const productContainer = document.getElementById("productList");
    console.log(order);
    orderTotal = order.total;

    productContainer.innerHTML = "";

    order.order_items.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.classList.add("pro-price", "d-flex");

      const productName = document.createElement("span");
      productName.textContent = `${product.name} x ${product.quantity}`;

      const productPrice = document.createElement("span");
      productPrice.textContent = `Rs.${product.price.toFixed(2)}`;

      productElement.appendChild(productName);
      productElement.appendChild(productPrice);

      productContainer.appendChild(productElement);
    });

    // Initially update total cost
    updateTotalCost();
  }

  function updateTotalCost() {
    const totalCost = orderTotal + deliveryFee;
    totalPriceSpan.textContent = `Rs.${totalCost.toFixed(2)}`;
    paymentAmount = totalCost; // Update payment amount
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
