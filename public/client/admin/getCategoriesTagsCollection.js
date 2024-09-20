document.addEventListener("DOMContentLoaded", async () => {

  const apiUrl = window.APP_API_BACKEND_URL; // Access the API URL

  // categories
  try {
    // Fetch orders from the backend
    const response = await fetch(`${apiUrl}/api/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const categories = await response.json();
      const categoriesTableBody = document.querySelector("#categoriesTable tbody");

      // Clear existing rows in the table body (if any)
      categoriesTableBody.innerHTML = "";

      // Populate the table with fetched orders
      categories.categories.forEach((category) => {
        const row = document.createElement("tr");

        row.innerHTML = `
                <td>${category.name}</td>
                <td>${category.description}</td>
                <td><div>
                  <button class="btn btn-primary">
                  <a href="${apiUrl}/editCategory/${category.id}">edit</a>
                  </button>
                  </div></td>
              `;

        categoriesTableBody.appendChild(row);
      });
    } else {
      console.error("Failed to fetch categories");
    }
  } catch (error) {
    console.error("Error:", error);
  }
// tags
  try {
    // Fetch tags from the backend
    const response = await fetch(`${apiUrl}/api/tags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const tags = await response.json();
      const tagsTableBody = document.querySelector("#tagsTable tbody");

      // Clear existing rows in the table body (if any)
      tagsTableBody.innerHTML = "";

      // Populate the table with fetched orders
      tags.tags.forEach((tag) => {
        const row = document.createElement("tr");

        row.innerHTML = `
                <td>${tag.name}</td>
                <td>${tag.description}</td>
                <td><div>
                  <button class="btn btn-primary">
                  <a href="${apiUrl}/editTag/${tag.id}">edit</a>
                  </button>
                  </div></td>
              `;

        tagsTableBody.appendChild(row);
      });
    } else {
      console.error("Failed to fetch tags");
    }
  } catch (error) {
    console.error("Error:", error);
  }

  // collections
  try {
    // Fetch collections from the backend
    const response = await fetch(`${apiUrl}/api/collections`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const collections = await response.json();

      const collectionsTableBody = document.querySelector("#collectionsTable tbody");

      // Clear existing rows in the table body (if any)
      collectionsTableBody.innerHTML = "";

      // Populate the table with fetched orders
      collections.collections.forEach((collection) => {
        const row = document.createElement("tr");

        row.innerHTML = `
                <td>${collection.name}</td>
                <td>${collection.description}</td>
                <td><div>
                  <button class="btn btn-primary">
                  <a href="${apiUrl}/editCollection/${collection.id}">edit</a>
                  </button>
                  </div></td>
              `;

        collectionsTableBody.appendChild(row);
      });
    } else {
      console.error("Failed to fetch collections");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
