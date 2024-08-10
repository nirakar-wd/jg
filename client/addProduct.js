document.addEventListener("DOMContentLoaded", async () => {
  const categoriesSelect = document.getElementById("categories");
  const tagsSelect = document.getElementById("tags");

  // Fetch categories and tags when the page loads
  try {
    // Fetch categories
    const categoriesResponse = await fetch(
      "http://localhost:4000/api/categories",
      { cache: "no-store" } // Disable caching
    );
    const categories = await categoriesResponse.json();

    console.log(categories);

    // if (categoriesResponse.ok) {
    //   categories.forEach((category) => {
    //     const option = document.createElement("option");
    //     option.value = category.id;
    //     option.textContent = category.name;
    //     categoriesSelect.appendChild(option);
    //   });
    // } else {
    //   alert("Failed to load categories");
    // }

    // Fetch tags
    const tagsResponse = await fetch("http://localhost:4000/api/tags", {
      cache: "no-store",
    });
    const tags = await tagsResponse.json();

    console.log(tags);
    // if (tagsResponse.ok) {
    //   tags.forEach((tag) => {
    //     const option = document.createElement("option");
    //     option.value = tag.id;
    //     option.textContent = tag.name;
    //     tagsSelect.appendChild(option);
    //   });
    // } else {
    //   alert("Failed to load tags");
    // }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while fetching categories or tags");
  }
});
