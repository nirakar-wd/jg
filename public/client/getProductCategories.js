document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch the categories from the backend
    const response = await fetch("http://localhost:4000/api/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const categories = await response.json();
      console.log(categories);
      const categoryList = document.querySelector(".category-list"); // Add a class to your <ul> element for easier targeting

      // Clear existing categories (if any)
      categoryList.innerHTML = "";

      // Populate the category list with data from the backend
      categories.categories.forEach((category) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `http://localhost:4000/categories/${category.id}`; // Link to the category page
        a.textContent = category.name; // Access the 'name' field of the category
        li.appendChild(a);
        categoryList.appendChild(li);
      });
    } else {
      console.error("Failed to fetch categories");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
