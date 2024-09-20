document.addEventListener("DOMContentLoaded", async () => {
  const apiUrl = window.APP_API_BACKEND_URL;

  try {
    // Extract the user ID from the query parameters

    //get userId from local storage
    const id = localStorage.getItem("userId");

    if (id) {
      // Fetch user information using the extracted user ID
      const response = await fetch(`${apiUrl}/api/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent with the request
      });
      const user = await response.json();

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
        const avatarImage = document.getElementById("userAvatar");

        if (user.user.images && user.user.images.length > 0) {
          avatarImage.src = user.user.images[0].filePath;
        } else {
          console.log("no user image");
        }
      } else {
        console.error("Failed to fetch user information");
      }
    } else {
      console.error("User ID is missing in the query parameters");
    }
    const usersResponse = await fetch(`${apiUrl}/api/users`, {
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

    const ordersResponse = await fetch(`${apiUrl}/api/orders/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
    });

    if (ordersResponse.ok) {
      const orders = await ordersResponse.json();
      document.getElementById("totalOrders").textContent = orders.count;
    }

    const productsResponse = await fetch(`${apiUrl}/api/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
    });

    if (productsResponse.ok) {
      const products = await productsResponse.json();

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

  // put request for admin
  const id = localStorage.getItem("userId");
  document
    .getElementById("userProfileForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent the default form submission behavior

      // Get the form field values
      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
      const bio = document.getElementById("userBio1").value;
      // const email = document.getElementById("userEmail1").value;
      const password = document.getElementById("userPassword").value;
      const userImg = document.getElementById("userImg").files[0]; // File input

      // Create a FormData object to handle the form data including the file
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("bio", bio);
      // formData.append("email", email);
      formData.append("password", password);
      if (userImg) {
        formData.append("images", userImg); // Append the image file
      }

      if (id) {
        try {
          // Await the fetch request to handle the response properly
          const editResponse = await fetch(`${apiUrl}/api/users/${id}`, {
            method: "PUT",
            body: formData, // No need for headers with FormData
            credentials: "include", // Ensure cookies are sent with the request
          });

          // Check the response status
          if (editResponse.ok) {
            console.log("User edited successfully");
            alert("User edited successfully");
          } else {
            const errorData = await editResponse.json();
            console.error("Error editing user:", errorData);
          }
        } catch (error) {
          console.error("Failed to edit user:", error);
        }
      }
    });
});
