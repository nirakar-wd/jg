document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const firstName = formData.get("first_name");
    const lastName = formData.get("last_name");
    const username = formData.get("username");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const password = formData.get("password");
    const passwordConfirmation = formData.get("password_confirmation");

    if (password !== passwordConfirmation) {
      alert("Passwords do not match");
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      phone,
      username,
      email,
      password,
      password_confirmation: passwordConfirmation,
    };

    try {
      const response = await fetch("http://localhost:4000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        window.location.href = 'http://127.0.0.1:5500/jg/signin.html';
      } else {
        // Display validation errors returned by the server
        const errorMessages = Object.values(
          data.errors || { message: "Registration failed" }
        ).join("\n");
        alert(errorMessages);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while registering");
    }
  });
});
