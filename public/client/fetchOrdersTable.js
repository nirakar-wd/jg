document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch orders from the backend
    const response = await fetch("http://localhost:4000/api/orders/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const orders = await response.json();
      console.log(orders);
      const ordersTableBody = document.querySelector("#ordersTable tbody");

      // Clear existing rows in the table body (if any)
      ordersTableBody.innerHTML = "";

      // Populate the table with fetched orders
      orders.orders.forEach((order) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <th scope="row">
              <a href="#">#${order.id}</a>
            </th>
            <td>$${order.trackingNumber}</td>
            <td>${order.userId}</td>
            <td><span>
              ${order.total}
            </span></td>
            <td><span>
              ${order.orderStatus}
            </span></td>
            <td>${order.createdAt}</td>
          `;

        ordersTableBody.appendChild(row);
      });
    } else {
      console.error("Failed to fetch orders");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
