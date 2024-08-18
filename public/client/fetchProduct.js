document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Extract the categoryId from the URL path
    const path = window.location.pathname;
    const productId = path.split("/").pop(); // Gets the last part of the path

    // Fetch products for the selected category
    const response = await fetch(
      `http://localhost:4000/api/products/by_id/${productId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const product = await response.json();
      console.log(product);
      const productsContainer = document.querySelector("#productContainer");

      // Clear existing products (if any)
      productsContainer.innerHTML = "";

      // Populate the products container with the fetched products

      const productCard = `
            <div class="row g-0">
                <div class="col-md-6">
                    <div class="product-img position-relative">
                        <img id="demo" src="/img/Flat Front black FH.png" data-zoom-image="img/Flat Front black FH.png"
                            class="img-fluid zoomed-img" />

                        <div id="gallery_demo">
                            <a href="#" data-image="/img/Flat Front black FH.png"
                                data-zoom-image="/img/Flat Front black FH.png">
                                <img id="img_01" src="/img/Flat Front black FH.png" class="img-fluid" />
                            </a>
                            <a href="#" data-image="/img/polo tshirt whitw.png"
                                data-zoom-image="/img/polo tshirt whitw.png">
                                <img id="/img_01" src="/img/polo tshirt whitw.png" class="img-fluid" />
                            </a>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">

                    <div class="product-info">
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item">
                                    <a href="index.html">Home</a>
                                </li>
                                <li class="breadcrumb-item active" aria-current="page">
                                    <a href="product.html"></a>Product
                                </li>
                                <li class="breadcrumb-item active" aria-current="page" id="productName">${product.name}</li>
                            </ol>
                        </nav>

                        <h2 class="heading-secondary text-start mt-5" id="productName">
                            ${product.name}
                        </h2>

                        <span class="small-info" id="productDescription">Lorem ipsum dolor sit amet consectetur. </span>

                        <div class="rating mt-3">
                            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i
                                class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i
                                class="fa-solid fa-star"></i>
                        </div>

                        <p class="select">select package</p>
                        <div class="product-types">
                            <ul class="d-flex position-relative">
                                <li>
                                    <input type="radio" class="input-radio" name="a">
                                    <span class="radio-label">25 pieces</span>
                                </li>
                                <li>
                                    <input type="radio" class="input-radio" name="a">
                                    <span class="radio-label">35 pieces</span>

                                </li>
                                <li>
                                    <input type="radio" class="input-radio" name="a">
                                    <span class="radio-label">45 pieces</span>
                                </li>
                                <li>
                                    <input type="radio" class="input-radio" name="a">
                                    <span class="radio-label">55 pieces</span>
                                </li>
                            </ul>

                        </div>

                        <div class="cart-price">
                            <button class="add-cart d-flex">add to cart
                                <div class="price" id="price">${product.price}</div>
                            </button>
                        </div>

                        <input id="demo1" type="text" value="1" name="demo1" class="input-touchspin">


                        <p class="pro-detail mt-5">${product.description}</p>
                    </div>

                    <div class="prod-info">
                        <h3 class="description-head" id="productDescription">
                            description
                        </h3>

                        <p class="desc-para">${product.description}</p>

                        <h3 class="description-head mt-4">
                            Size and Features
                        </h3>

                        <div class="section-content">
                            <ul style="list-style-type: none;" id="sizeAndFeatures">
                                <li>☆ Weight: 7 grams</li>
                                <li>☆ 100% Pure Wool/Felt from New Zealand</li>
                                <li>☆ Handmade and customizable</li>
                                <li>☆ Eco-Friendly</li>
                                <li>☆ Made using felt stitching technique</li>
                                <li>☆ Azo-free dyes</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            `;
      productsContainer.innerHTML += productCard;
    } else {
      console.error("Failed to fetch products");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
