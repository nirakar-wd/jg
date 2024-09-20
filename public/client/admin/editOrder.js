document.addEventListener("DOMContentLoaded", async function () {

  const apiUrl = window.APP_API_BACKEND_URL;

  const orderId = window.location.pathname.split("/").pop();

  try {
    // Fetch the order details from the API
    const response = await fetch(
      `${apiUrl}/api/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent with the request
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Populate the form fields with the fetched data
    document.getElementById("orderId").textContent = "Order ID: " + data.id;
    document.getElementById("trackingNumber").textContent =
      "Tracking Number: " + data.trackingNumber;
    document.getElementById("userId").textContent = "User ID: " + data.userId;
    document.getElementById("userName").textContent =
      "User Name: " + data.address.firstName + " " + data.address.lastName;
    document.getElementById("city").textContent = "City: " + data.address.city;
    document.getElementById("state").textContent =
      "State: " + data.address.state;
    document.getElementById("address").textContent =
      "Address: " + data.address.address;
    document.getElementById("country").textContent =
      "Country: " + data.address.country;
    document.getElementById("email").textContent =
      "Email: " + data.address.user.email;
    document.getElementById("phone").textContent =
      "Phone: " + data.address.user.phone;
    document.getElementById("price").textContent = "Price: Rs. " + data.total;

    // Populate order summary
    const productList = document.getElementById("productList");
    productList.innerHTML = ""; // Clear previous content, if any
    data.order_items.forEach((product) => {
      const productItem = document.createElement("div");
      productItem.innerHTML = `<span>${product.name}</span> X <span>${product.quantity}</span>`;
      productList.appendChild(productItem);
    });

    // Populate order status dropdown
    const orderStatusDropdown = document.getElementById("orderStatus");
    orderStatusDropdown.innerHTML = ""; // Clear existing options
    const statusOptions = {
      0: "processed",
      1: "delivered",
      2: "shipped",
      3: "canceled",
    };
    for (const [value, label] of Object.entries(statusOptions)) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      if (data.orderStatus === parseInt(value)) {
        option.selected = true;
      }
      orderStatusDropdown.appendChild(option);
    }
  } catch (error) {
    console.error("Error fetching order details:", error);
  }

  // Handle form submission for updating order status
  document
    .getElementById("editOrderForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent default form submission

      const newStatus = document.getElementById("orderStatus").value; // Get selected status from form

      if (orderId) {
        try {
          const updateResponse = await fetch(
            `${apiUrl}/api/orders/${orderId}`, // Update order endpoint
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ newStatus: parseInt(newStatus) }), // Send new status as part of request body
              credentials: "include", // Include cookies in the request
            }
          );

          if (updateResponse.ok) {
            const result = await updateResponse.json();
            console.log("Order updated successfully:", result);
            alert("Order status updated successfully!"); // Display success message
          } else {
            const errorData = await updateResponse.json();
            console.error("Error updating order:", errorData);
            alert("Failed to update order status.");
          }
        } catch (error) {
          console.error("Failed to update order:", error);
          alert("An error occurred while updating the order.");
        }
      }
    });
});
