document.addEventListener("DOMContentLoaded", async () => {

  const apiUrl = window.APP_API_BACKEND_URL;
  
  try {
    const usersResponse = await fetch(`${apiUrl}/api/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
    });

    if (usersResponse.ok) {
      const users = await usersResponse.json();
      document.getElementById("noOfUsers").textContent = users.count;
    }

    const ordersResponse = await fetch(`${apiUrl}/api/orders/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
    });

    if (ordersResponse.ok) {
      const orders = await ordersResponse.json();
      document.getElementById("noOfOrders").textContent = orders.count;
      //   document.getElementById("totalRevenue").textContent = orders.count * 1000;
    }

    const productsResponse = await fetch(
      `${apiUrl}/api/products/bestSeller`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent with the request
      }
    );

    if (productsResponse.ok) {
      const products = await productsResponse.json();
      
      const productsTableBody = document.querySelector(
        "#bestSellerProducts tbody"
      );

      // Clear existing rows in the table body (if any)
      productsTableBody.innerHTML = "";

      // Populate the table with fetched products
      products.bestSellers.forEach((product) => {
        const row = document.createElement("tr");

        row.innerHTML = `
              <td>${product.name}</td>
              <td>${product.orderCount}</td>
              <td>Rs.${product.price.toFixed(2)}</td>
            `;

        productsTableBody.appendChild(row);
      });
    } else {
      console.error("Failed to fetch products");
    }

    const revenueResponse = await fetch(
      `${apiUrl}/api/orders/revenue`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent with the request
      }
    );

    if (revenueResponse.ok) {
      const revenue = await revenueResponse.json();
      document.getElementById(
        "revCount"
      ).textContent = `Rs.${revenue.totalRevenue}`;
      document.getElementById(
        "totalRev"
      ).textContent = `Rs.${revenue.totalRevenue}`;
      document.getElementById(
        "totalRevenue"
      ).textContent = `Rs.${revenue.totalRevenue}`;
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
