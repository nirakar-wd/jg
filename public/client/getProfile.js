document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Extract the user ID from the query parameters

    //get userId from local storage
    const id = localStorage.getItem("userId");

    if (id) {
      // Fetch user information using the extracted user ID
      const response = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent with the request
      });
      const user = await response.json();
      console.log(user);

      if (response.ok) {
        // Populate the data into the HTML
        document.getElementById("userFullName").textContent =
          user.user.username;
        document.getElementById("userBio").textContent = user.user.bio;
        document.getElementById("userDescription").textContent = user.user.bio;
        document.getElementById("userFullName1").textContent =
          user.user.username;
        document.getElementById("userPhone").textContent =
          user.user.phone || "980000111";
        document.getElementById("userEmail").textContent = user.user.email;
        document.getElementById("userAddress").textContent =
          user.user.addresses[0].address || "";
        document.getElementById("firstName").value = user.user.firstName;
        document.getElementById("lastName").value = user.user.lastName;
        document.getElementById("userBio1").value = user.user.bio;
        document.getElementById("userEmail1").value = user.user.email;
      } else {
        console.error("Failed to fetch user information");
      }
    } else {
      console.error("User ID is missing in the query parameters");
    }
    const usersResponse = await fetch(`http://localhost:4000/api/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
    });

    if (usersResponse.ok) {
      const users = await usersResponse.json();
      document.getElementById("totalCustomers").textContent = users.count;
      document.getElementById("totalUsers").textContent = users.count;
    }

    const ordersResponse = await fetch(`http://localhost:4000/api/orders/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
    });

    if (ordersResponse.ok) {
      const orders = await ordersResponse.json();
      document.getElementById("totalOrders").textContent = orders.count;
      document.getElementById("totalRev").textContent = orders.count * 1000;
      document.getElementById("totalRevenue").textContent = orders.count * 1000;
    }

    const productsResponse = await fetch(
      `http://localhost:4000/api/products/?page=1&pageSize=8`,
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
      console.log(products);
      const productsTableBody = document.querySelector(
        "#productsAdminTable tbody"
      );

      // Clear existing rows in the table body (if any)
      productsTableBody.innerHTML = "";

      // Populate the table with fetched products
      products.products.forEach((product) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${product.name}</td>
          <td>Rs.${product.price}</td>
          <td><span class="badge bg-primary">${product.stock} Pcs</span></td>
          <td>Rs.${(product.price * product.stock).toFixed(2)}</td>
        `;

        productsTableBody.appendChild(row);
      });
    } else {
      console.error("Failed to fetch products");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
