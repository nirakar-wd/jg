document.addEventListener("DOMContentLoaded", async () => {

  const apiUrl = window.APP_API_BACKEND_URL;

  const categoryId = window.location.pathname.split("/").pop();
  try {
    const response = await fetch(
      `${apiUrl}/api/categories/${categoryId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent with the request
      }
    );

    const category = await response.json();
    console.log(category);

    if (response) {
      // Populate the form fields with the fetched data
      document.getElementById("categoryName").value =
        category.category.name || "";
      document.getElementById("categoryDescription").value =
        category.category.description || "";
    }
  } catch (error) {
    console.error("Error fetching categories data:", error);
  }

  // put request for edit product
  document
    .getElementById("categoryForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent the default form submission behavior

      // Get the form field values
      const name = document.getElementById("categoryName").value;
      const description = document.getElementById("categoryDescription").value;

      const payload = {
        name: name,
        description: description,
      };

      if (categoryId) {
        try {
          // Await the fetch request to handle the response properly
          const editResponse = await fetch(
            `${apiUrl}/api/categories/${categoryId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
              credentials: "include", // Ensure cookies are sent with the request
            }
          );

          // Check the response status
          if (editResponse.ok) {
            console.log("category edited successfully");
          } else {
            const errorData = await editResponse.json();
            console.error("Error editing category:", errorData);
          }
        } catch (error) {
          console.error("Failed to edit category:", error);
        }
      }
    });
});
