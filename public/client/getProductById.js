document.addEventListener("DOMContentLoaded", async () => {
  try {
    if (productId) {
      // Fetch user information using the extracted user ID
      const response = await fetch(
        `http://localhost:4000/api/products/${productId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Ensure cookies are sent with the request
        }
      );
      const product = await response.json();
      console.log(product);

      if (response.ok) {
        // Populate the data into the HTML
        document.getElementById("productName").textContent = user.user.username;
        document.getElementById("productDescription").textContent =
          user.user.username;
        document.getElementById("price").textContent = user.user.phone;
      } else {
        console.error("Failed to fetch product information");
      }
    } else {
      console.error("product id is missing in the query parameters");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
