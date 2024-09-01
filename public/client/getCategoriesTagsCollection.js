document.addEventListener("DOMContentLoaded", async () => {

  // categories
  try {
    // Fetch orders from the backend
    const response = await fetch("http://localhost:4000/api/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const categories = await response.json();
      console.log(categories);
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
                  <a href="http://localhost:4000/editCategory/${category.id}">edit</a>
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
    const response = await fetch("http://localhost:4000/api/tags", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const tags = await response.json();
      console.log(tags);
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
                  <a href="http://localhost:4000/editTag/${tag.id}">edit</a>
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
    const response = await fetch("http://localhost:4000/api/collections", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const collections = await response.json();
      console.log(collections);
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
                  <a href="http://localhost:4000/editCollection/${collection.id}">edit</a>
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
