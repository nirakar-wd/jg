document.addEventListener("DOMContentLoaded", () => {

  const apiUrl = window.APP_API_BACKEND_URL;

  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const username = formData.get("username");
    // const email = formData.get("email");
    const password = formData.get("password");

    const payload = {
      username,
      //   email,
      password,
    };

    try {
      const response = await fetch(`${apiUrl}/api/users/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userId", data.user.id);
        alert("login successful!");
        window.location.href = `${apiUrl}`;
      } else {
        // Display validation errors returned by the server
        const errorMessages = Object.values(
          data.full_messages || { message: "Login failed" }
        ).join("\n");
        alert(errorMessages);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while logging to the application");
    }
  });
});
