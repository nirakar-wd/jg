document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Extract the categoryId from the URL path
    const path = window.location.pathname;
    const categoryId = path.split("/").pop(); // Gets the last part of the path

    // Fetch products for the selected category
    const response = await fetch(
      `http://localhost:4000/api/products/by_category_id/${categoryId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const products = await response.json();
      console.log(products);
      const productsContainer = document.querySelector("#productsContainer");

      // Clear existing products (if any)
      productsContainer.innerHTML = "";

      // Populate the products container with the fetched products
      products.products.forEach((product) => {
        const productCard = `
            <div class="col-md-4">
              <div class="abox">
                <div class="kecimgbox">
                  <a href="product.html?id=${product.id}">
                    <img src="/img/Flat Front black FH.png" class="img-fluid" alt="${
          product.name
        }">
                  </a>
                </div>
                <div class="prod-desc">
                  <h4><a href="product.html?id=${product.id}">${
          product.name
        }</a></h4>
                  <div class="rating-mks">
                    ${"⭐".repeat(product.comments_count)}
                  </div>
                  <del>${product.price}</del>
                  <ins>${product.price}</ins>
                </div>
              </div>
            </div>
          `;
        productsContainer.innerHTML += productCard;
      });
    } else {
      console.error("Failed to fetch products");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
