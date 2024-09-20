document.addEventListener("DOMContentLoaded", async () => {
  const categoriesSelect = document.getElementById("categories");
  const tagsSelect = document.getElementById("tags");
  const collectionsSelect = document.getElementById("collections");

  const apiUrl = window.APP_API_BACKEND_URL; // Access the API URL

  // Fetch categories, tags, and collections when the page loads
  try {
    // Fetch categories
    const categoriesResponse = await fetch(`${apiUrl}/api/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
    });
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
    const tagsResponse = await fetch(`${apiUrl}/api/tags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
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
    const collectionsResponse = await fetch(`${apiUrl}/api/collections`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
    });
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

    // Append the selected categories with both id and name
    const selectedCategories = Array.from(categoriesSelect.selectedOptions).map(
      (option) => ({
        name: option.textContent,
      })
    );
    formData.append("categories", JSON.stringify(selectedCategories));

    // Append the selected tags with both id and name
    const selectedTags = Array.from(tagsSelect.selectedOptions).map(
      (option) => ({
        name: option.textContent,
      })
    );
    formData.append("tags", JSON.stringify(selectedTags));

    // Append the selected collections with both id and name
    const selectedCollections = Array.from(
      collectionsSelect.selectedOptions
    ).map((option) => ({
      name: option.textContent,
    }));

    formData.append("collections", JSON.stringify(selectedCollections));

    try {
      const response = await fetch(`${apiUrl}/api/products`, {
        method: "POST",
        body: formData, // Send the FormData with all data including files
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
