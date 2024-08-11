document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Collect the form data
    const formData = new FormData(form);
    const data = {
      firstName: formData.get("firstname"),
      lastName: formData.get("lastname"),
      bio: formData.get("userbio"),
      email: formData.get("useremail"),
      password: formData.get("userpassword"),
    };

    // If you are also uploading an image
    if (formData.get("userimg")) {
      data.profilePic = formData.get("userimg");
    }

    try {
      const response = await fetch("http://localhost:4000/api/users/:id", {
        method: "PUT", // or "POST" depending on your backend setup
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert("User updated successfully!");
      } else {
        alert("Failed to update user: " + result.message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user due to a network error.");
    }
  });
});
