document.addEventListener("DOMContentLoaded", async () => {
  
  const apiUrl = window.APP_API_BACKEND_URL;

  const collectionId = window.location.pathname.split("/").pop();
  try {
    const response = await fetch(`${apiUrl}/api/collections/${collectionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
    });

    const category = await response.json();
    console.log(category);

    if (response) {
      // Populate the form fields with the fetched data
      document.getElementById("collectionName").value = category.collection.name || "";
      document.getElementById("collectionDescription").value =
        category.collection.description || "";
    }
  } catch (error) {
    console.error("Error fetching collections data:", error);
  }

  // put request for edit collection
  document
    .getElementById("collectionForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent the default form submission behavior

      // Get the form field values
      const name = document.getElementById("collectionName").value;
      const description = document.getElementById("collectionDescription").value;

      const payload = {
        name: name,
        description: description,
      };

      if (collectionId) {
        try {
          // Await the fetch request to handle the response properly
          const editResponse = await fetch(
            `${apiUrl}/api/collections/${collectionId}`,
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
            console.log("collection edited successfully");
          } else {
            const errorData = await editResponse.json();
            console.error("Error editing collection:", errorData);
          }
        } catch (error) {
          console.error("Failed to edit collection:", error);
        }
      }
    });
});
