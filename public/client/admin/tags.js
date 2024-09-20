document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tagsForm");
  const apiUrl = window.APP_API_BACKEND_URL;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get("name");
    const description = formData.get("description");

    const payload = {
      name,
      description,
    };

    try {
      const response = await fetch(`${apiUrl}/api/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === "200") {
        alert("tag added successfully");
      } else {
        // Display validation errors returned by the server
        const errorMessages = Object.values(
          data.full_messages || { message: "post request failed" }
        ).join("\n");
        alert(errorMessages);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while posting tags");
    }
  });
});
