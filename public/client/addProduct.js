document.addEventListener("DOMContentLoaded", async () => {
  const categoriesSelect = document.getElementById("categories");
  const tagsSelect = document.getElementById("tags");
  const collectionsSelect = document.getElementById("collections");
  const displayImageInput = document.getElementById("displayImage");

  let imageFile = null;

  // Fetch categories, tags, and collections when the page loads
  try {
    // Fetch categories
    const categoriesResponse = await fetch(
      "http://localhost:4000/api/categories",
      { cache: "no-store" }
    );
    const categories = await categoriesResponse.json();

    if (categoriesResponse.ok) {
      categories.categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categoriesSelect.appendChild(option);
      });
    } else {
      alert("Failed to load categories");
    }

    // Fetch tags
    const tagsResponse = await fetch("http://localhost:4000/api/tags", {
      cache: "no-store",
    });
    const tags = await tagsResponse.json();

    if (tagsResponse.ok) {
      tags.tags.forEach((tag) => {
        const option = document.createElement("option");
        option.value = tag.id;
        option.textContent = tag.name;
        tagsSelect.appendChild(option);
      });
    } else {
      alert("Failed to load tags");
    }

    // Fetch collections
    const collectionsResponse = await fetch(
      "http://localhost:4000/api/collections",
      {
        cache: "no-store",
      }
    );
    const collections = await collectionsResponse.json();

    if (collectionsResponse.ok) {
      collections.collections.forEach((collection) => {
        const option = document.createElement("option");
        option.value = collection.id;
        option.textContent = collection.name;
        collectionsSelect.appendChild(option);
      });
    } else {
      alert("Failed to load collections");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while fetching categories, tags, or collections");
  }

  // Handle file input change
  displayImageInput.addEventListener("change", (event) => {
    const fileInput = event.target;
    imageFile = fileInput.files[0];
  });

  // Handle form submission
  const form = document.getElementById("addProductForm");
  const currencyDropdown = document.getElementById("currencyDropdown");
  const currencyMenu = document.getElementById("currencyMenu");

  // Handle currency selection
  currencyMenu.addEventListener("click", (e) => {
    e.preventDefault();
    if (e.target.classList.contains("dropdown-item")) {
      const selectedCurrency = e.target.getAttribute("data-currency");
      currencyDropdown.textContent = selectedCurrency;
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Form validation
    const name = form.productName.value.trim();
    const description = form.productDescription.value.trim();
    const features = form.productFeatures.value.trim();
    const price = form.productPrice.value.trim();
    const stock = form.stock.value.trim();
    const vendor = form.vendor.value.trim();
    const discounted_price = form.discounted_price.value.trim();

    if (
      !name ||
      !description ||
      !features ||
      !price ||
      !stock ||
      !vendor ||
      !imageFile
    ) {
      alert("Please fill in all the required fields and upload an image.");
      return;
    }

    // Handle categories, tags, and collections
    const selectedCategories = Array.from(categoriesSelect.selectedOptions).map(
      (option) => ({
        id: option.value,
        name: option.textContent,
      })
    );

    const selectedTags = Array.from(tagsSelect.selectedOptions).map(
      (option) => ({
        id: option.value,
        name: option.textContent,
      })
    );

    const selectedCollections = Array.from(
      collectionsSelect.selectedOptions
    ).map((option) => ({
      id: option.value,
      name: option.textContent,
    }));

    // Create form data
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("features", features);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("vendor", vendor);
    formData.append("discounted_price", discounted_price);
    formData.append("image", imageFile); // Append the image file
    formData.append("categories", JSON.stringify(selectedCategories));
    formData.append("tags", JSON.stringify(selectedTags));
    formData.append("collections", JSON.stringify(selectedCollections));

    try {
      const response = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Product added successfully!");
      } else {
        alert(data.errors?.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the product");
    }
  });
});
