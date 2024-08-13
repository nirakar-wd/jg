document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:4000/api/products"); // Adjust URL as needed
    const products = await response.json();

    if (response.ok) {
      const tableBody = document.querySelector("#productTable tbody");
      tableBody.innerHTML = ""; // Clear any existing rows

      products.forEach((product) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <th scope="row">
              <a href="#">${product.id}</a>
            </th>
            <td>$${product.price}</td>
            <td>${product.customerName}</td>
            <td><span class="${product.status}">${product.status}</span></td>
            <td><span class="${product.shippingStatus}">${
          product.shippingStatus
        }</span></td>
            <td>${new Date(product.date).toISOString().split("T")[0]}</td>
          `;

        tableBody.appendChild(row);
      });
    } else {
      console.error("Failed to fetch products");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
});
