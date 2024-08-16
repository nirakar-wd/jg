document.addEventListener("DOMContentLoaded", () => {

    
  const form = document.getElementById("categoryForm");

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
      const response = await fetch("http://localhost:4000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log(response);

      if (response.status === "200") {
        alert("Category added successfully successful!");
      } else {
        // Display validation errors returned by the server
        const errorMessages = Object.values(
          data.full_messages || { message: "post request failed" }
        ).join("\n");
        alert(errorMessages);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while posting categories");
    }
  });
});
