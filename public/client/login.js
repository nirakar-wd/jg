document.addEventListener("DOMContentLoaded", () => {
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
      const response = await fetch("http://localhost:4000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // Ensure cookies are sent with the request
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        localStorage.setItem("userId", data.user.id);
        alert("login successful!");
        // window.location.href = "http://localhost:4000/contacts";
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
