document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Extract the user ID from the query parameters

    //get userId from local storage
    const id = localStorage.getItem("userId");

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
      console.log("user", user);

      if (response.ok) {
        // Populate the data into the HTML
        document.getElementById("firstName").value = user.user.firstName;
        document.getElementById("lastName").value = user.user.lastName;
        document.getElementById("email").value = user.user.email;
        document.getElementById("phone").value = user.user.phone || "";
        const selectElement = document.getElementById("inputState");

        document.getElementById("userAddress").value =
          user.user.addresses[0].address || "";
        document.getElementById("userCity").value =
          user.user.addresses[0].city || "";
        document.getElementById("userState").value =
          user.user.addresses[0].state || "";
        document.getElementById("userZip").value =
          user.user.addresses[0].zipCode || "";
        const selectElement1 = document.getElementById("inputState1");

        document.getElementById("userAddress1").value =
          user.user.addresses[0].address || "";
        document.getElementById("userCity1").value =
          user.user.addresses[0].city || "";
        document.getElementById("userState1").value =
          user.user.addresses[0].state || "";
        document.getElementById("userZip1").value =
          user.user.addresses[0].zipCode || "";

        selectElement.value = "Nepal";
        selectElement1.value = "Nepal";
      } else {
        console.error("Failed to fetch user information");
      }
    } else {
    }
  } catch (err) {
    console.log("failed to fetch user info");
  }
});