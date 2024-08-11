document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent the default form submission

  // Get form data
  const name = document.getElementById("product-name").value;
  const sortDescription = document.getElementById("categoryDescription").value;
  const fullDescription = document.getElementById("productDescription").value;
  const tags = document.getElementById("product-tags").value;

  // Prepare the data to send
  const categoryData = {
    name,
    sortDescription,
    fullDescription,
    tags,
  };

  try {
    // Send the data to the backend
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    if (response.ok) {
      const result = await response.json();
      alert("Category created successfully!");
      // Optionally, refresh the page or update the UI to reflect the new category
    } else {
      throw new Error("Failed to create category");
    }
  } catch (error) {
    alert(error.message);
  }
});
