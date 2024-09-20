document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addCategoryForm");
  const apiUrl = window.APP_API_BACKEND_URL; // Access the API URL


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get("name");
    const description = formData.get("description");

    // Prepare the payload
    const payload = {
      name,
      description,
    };

    try {
      const response = await fetch(`${apiUrl}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle success
        alert("Category added successfully!");
        form.reset(); // Clear the form fields
      } else {
        // Handle error
        alert("Failed to add category: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the category.");
    }
  });
});
