document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch orders from the backend
    const response = await fetch("http://localhost:4000/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const products = await response.json();
      console.log(products);
      const productsTableBody = document.querySelector("#productsTable tbody");

      // Clear existing rows in the table body (if any)
      productsTableBody.innerHTML = "";

      // Populate the table with fetched orders
      products.rows.forEach((product) => {
        const row = document.createElement("tr");

        row.innerHTML = `
              <th scope="row">
                ${product.id}
              </th>
              <td>${product.name}</td>
              <td>${product.vendor}</td>
              <td><span>
                ${product.stock}
              </span></td>
              <td><span>
                Rs.${product.price}
              </span></td>
              <td><div>
                <button class="btn btn-primary">
                <a href="http://localhost:4000/editProduct/${product.id}">edit</a>
                </button>
                </div></td>
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
