let currentPage = 1;
let totalPages = 1;
let currentCategoryId = null;

// Function to generate stars based on the rating
function generateStars(rating) {
  let starsHtml = "";
  const maxStars = 5;

  if (rating === 0) {
    for (let i = 1; i <= maxStars; i++) {
      starsHtml += `<span><i class="fa-regular fa-star"></i></span>`;
    }
    return starsHtml;
  }

  for (let i = 1; i <= maxStars; i++) {
    if (i <= Math.floor(rating)) {
      starsHtml += `<span><i class="fa fa-star"></i></span>`;
    } else if (i === Math.floor(rating) + 1 && rating % 1 !== 0) {
      starsHtml += `<span><i class="fa fa-star-half-o"></i></span>`;
    } else {
      starsHtml += `<span><i class="fa fa-star-o"></i></span>`;
    }
  }

  return starsHtml;
}

document.addEventListener("DOMContentLoaded", async () => {

  const apiUrl = window.APP_API_BACKEND_URL;

  try {
    const response = await fetch("http://localhost:4000/api/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const categories = await response.json();
      const categoryList = document.querySelector(".category-list");

      categoryList.innerHTML = "";

      categories.categories.forEach((category) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.dataset.categoryId = category.id;
        a.textContent = category.name;
        li.appendChild(a);
        categoryList.appendChild(li);
      });

      categoryList.addEventListener("click", async (event) => {
        if (event.target.tagName === "A") {
          event.preventDefault();

          currentCategoryId = event.target.dataset.categoryId;
          currentPage = 1; // Reset page number to 1
          await fetchProductsByCategory(currentCategoryId, currentPage);
        }
      });
    } else {
      console.error("Failed to fetch categories");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

// Function to fetch products by category and page
async function fetchProductsByCategory(categoryId, page) {
  try {
    const response = await fetch(
      `http://localhost:4000/api/products/by_category_id/${categoryId}?page=${page}&pageSize=9`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      displayCategoryProducts(data.products);
      updatePaginationControls(data.page_meta);
    } else {
      console.error("Failed to fetch products");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Function to display products
function displayCategoryProducts(products) {
  const productContainer = document.getElementById("productContainer");
  productContainer.innerHTML = "";

  products.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.classList.add("col-md-4");

    const averageRating = product.averageRating || 0;
    productElement.innerHTML = `
                <div class="abox">
                    <div class="kecimgbox">
                        <a href="http://localhost:4000/products/${
                          product.id
                        }"><img src="${
      product.image_urls && product.image_urls.length > 0
        ? product.image_urls[0]
        : "/images/products/polo.jpg"
    }" alt="prod images"></a>
                    </div>
                    <div class="prod-desc">
                        <h4><a href="product.html">${product.name}</a></h4>
                        <div class="rating-mks">${generateStars(
                          averageRating
                        )}</div>
                        <ins>${product.price}</ins>
                    </div>
                </div>
            `;
    productContainer.appendChild(productElement);
  });
}

// Function to update pagination controls
function updatePaginationControls(pageMeta) {
  const paginationList = document.getElementById("paginationList");
  paginationList.innerHTML = "";

  totalPages = pageMeta.number_of_pages;

  // Create "Prev" button
  const prevButton = document.createElement("li");
  prevButton.classList.add("pagination__group");
  prevButton.innerHTML = `<a href="#0" class="pagination__item pagination__control pagination__control_prev">prev</a>`;
  prevButton.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchProductsByCategory(currentCategoryId, currentPage);
    }
  };
  paginationList.appendChild(prevButton);

  // Add page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.classList.add("pagination__group");

    if (i === pageMeta.current_page_number) {
      pageItem.innerHTML = `<span class="pagination__item pagination__item_active">${i}</span>`;
    } else {
      pageItem.innerHTML = `<a href="#0" class="pagination__item">${i}</a>`;
      pageItem.onclick = () => {
        currentPage = i;
        fetchProductsByCategory(currentCategoryId, currentPage);
      };
    }

    paginationList.appendChild(pageItem);
  }

  // Create "Next" button
  const nextButton = document.createElement("li");
  nextButton.classList.add("pagination__group");
  nextButton.innerHTML = `<a href="#0" class="pagination__item pagination__control pagination__control_next">next</a>`;
  nextButton.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchProductsByCategory(currentCategoryId, currentPage);
    }
  };
  paginationList.appendChild(nextButton);
}

// Initial fetch for products
fetchProductsByCategory(currentCategoryId, currentPage);
