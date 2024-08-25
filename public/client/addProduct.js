document.addEventListener("DOMContentLoaded", async () => {
  const categoriesSelect = document.getElementById("categories");
  const tagsSelect = document.getElementById("tags");
  const collectionsSelect = document.getElementById("collections");
  const uploadBtn = document.getElementById("uploadBtn");
  const iconImageUpload = document.getElementById("iconImageUpload");
  const displayImage = document.getElementById("displayImage");

  uploadBtn.addEventListener("click", () => {
    displayImage.click();
  });

  iconImageUpload.addEventListener("click", () => {
    displayImage.click();
  });

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

    const formData = new FormData(form);
    const name = formData.get("productName");
    const description = formData.get("productDescription");
    const features = formData.get("productFeatures");
    const price = formData.get("productPrice");
    const stock = formData.get("stock");
    const vendor = formData.get("vendor");
    const discounted_price = formData.get("discounted_price");

    if (
      !name ||
      !description ||
      !features ||
      !price ||
      !stock ||
      !vendor ||
      !discounted_price
    ) {
      alert("Please fill in all the required fields and upload an image.");
      return;
    }

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

    const payload = {
      name: name,
      description: description,
      features: features,
      price: price,
      stock: stock,
      vendor: vendor,
      discounted_price: discounted_price,
      categories: selectedCategories,
      tags: selectedTags,
      collections: selectedCollections,
    };

    try {
      const response = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Convert payload to JSON
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        // Check if the response status is ok (200-299)
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
