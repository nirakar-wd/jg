document.addEventListener("DOMContentLoaded", async () => {

  const apiUrl = window.APP_API_BACKEND_URL;

  const tagId = window.location.pathname.split("/").pop();
  try {
    const response = await fetch(
      `${apiUrl}/api/tags/${tagId}`,
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
      document.getElementById("tagName").value =
        category.tag.name || "";
      document.getElementById("tagDescription").value =
        category.tag.description || "";
    }
  } catch (error) {
    console.error("Error fetching tags data:", error);
  }

  // put request for edit product
  document
    .getElementById("tagsForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent the default form submission behavior

      // Get the form field values
      const name = document.getElementById("tagName").value;
      const description = document.getElementById("tagDescription").value;

      const payload = {
        name: name,
        description: description,
      };

      if (tagId) {
        try {
          // Await the fetch request to handle the response properly
          const editResponse = await fetch(
            `${apiUrl}/api/tags/${tagId}`,
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
            console.log("tag edited successfully");
          } else {
            const errorData = await editResponse.json();
            console.error("Error editing tag:", errorData);
          }
        } catch (error) {
          console.error("Failed to edit tag:", error);
        }
      }
    });
});
