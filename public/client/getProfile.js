document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Extract the user ID from the query parameters

    //get userId from local storage
    const id = localStorage.getItem("userId");

    console.log("user id", id);

    if (id) {
      // Fetch user information using the extracted user ID
      const response = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent with the request
      });
      const user = await response.json();
      console.log(user);

      if (response.ok) {
        // Populate the data into the HTML
        document.getElementById("userFullName").textContent = user.user.username;
        document.getElementById("userFullName1").textContent = user.user.username;
        document.getElementById("userPhone").textContent = user.user.phone;
        document.getElementById("userEmail").textContent = user.user.email;
        document.getElementById("userAddress").textContent =
          user.user.addresses[0].address;
      } else {
        console.error("Failed to fetch user information");
      }
    } else {
      console.error("User ID is missing in the query parameters");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
