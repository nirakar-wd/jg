document.addEventListener("DOMContentLoaded", async () => {
  const categoriesSelect = document.getElementById("categories");
  const tagsSelect = document.getElementById("tags");
  const collectionsSelect = document.getElementById("collections");

  // Fetch categories and tags when the page loads
  try {
    // Fetch categories
    const categoriesResponse = await fetch(
      "http://localhost:4000/api/categories",
      { cache: "no-store" } // Disable caching
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
    alert("An error occurred while fetching categories or tags or collections");
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

    formData.append("categories", JSON.stringify(selectedCategories));
    formData.append("tags", JSON.stringify(selectedTags));
    formData.append("collections", JSON.stringify(selectedCollections));

    // Debugging FormData
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    try {
      const response = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === "200") {
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
