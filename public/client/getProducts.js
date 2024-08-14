document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch products
    const response = await fetch(`http://localhost:4000/api/products/?page=1&pageSize=8`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const products = await response.json();
      console.log(products);
      const productsContainer = document.querySelector("#productsContainer");

      // Clear existing products (if any)
      productsContainer.innerHTML = "";

      // Populate the products container with the fetched products
      products.products.forEach((product) => {
        const productCard = `
            <div class="col-12 col-sm-3">
                        <div class="categories-box">
                            <h6 class="cat-head">
                                <a href="http://localhost:4000/products/${product.id}" class="cat-link">
                                    <img src="img/Green FH front.png" alt="arc-img">
                                    <span class="title">${product.name}</span>
                                    <span class="price">${product.price}</span>
                                </a>

                            </h6>
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
