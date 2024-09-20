document.addEventListener("DOMContentLoaded", async () => {
  const apiUrl = window.APP_API_BACKEND_URL;

  const id = localStorage.getItem("userId");
  try {
    // Extract the user ID from the query parameters

    //get userId from local storage

    if (id) {
      // Fetch user information using the extracted user ID
      const response = await fetch(`${apiUrl}/api/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent with the request
      });

      if (response.ok) {
        const user = await response.json();
        console.log("user", user);
        // Populate the data into the HTML
        document.getElementById("email").value = user.user.email;
        document.getElementById("phone").value = user.user.phone || "";
        document.getElementById("userPhone").value = user.user.phone || "";
        document.getElementById("username").textContent = user.user.username;
        document.getElementById("userBio").textContent = user.user.bio;
        document.getElementById("firstName").value = user.user.firstName;
        document.getElementById("lastName").value = user.user.lastName;
        document.getElementById("firstName1").value = user.user.firstName;
        document.getElementById("lastName1").value = user.user.lastName;
        document.getElementById("userBio1").value = user.user.bio;
        document.getElementById("userEmail1").value = user.user.email;
        const selectElement = document.getElementById("inputState");

        const avatarImage = document.getElementById("userAvatar");

        if (user.user.images && user.user.images.length > 0) {
          avatarImage.src = user.user.images[0].filePath;
        } else {
          console.log("no user image");
        }

        document.getElementById("userAddress").value =
          user.user.addresses[0].address || "";
        document.getElementById("userCity").value =
          user.user.addresses[0].city || "";
        document.getElementById("userState").value =
          user.user.addresses[0].state || "";
        document.getElementById("userZip").value =
          user.user.addresses[0].zipCode || "";

        selectElement.value = "Nepal";
      } else {
        console.error("Failed to fetch user information");
      }
    } else {
    }
  } catch (err) {
    console.log("failed to fetch user info");
  }

  // put request for user
  document
    .getElementById("userProfileForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent the default form submission behavior

      // Get the form field values
      const firstName = document.getElementById("firstName1").value;
      const lastName = document.getElementById("lastName1").value;
      const bio = document.getElementById("userBio1").value;
      // const email = document.getElementById("userEmail1").value;
      const password = document.getElementById("userPassword").value;
      const phone = document.getElementById("userPhone").value;
      const userImg = document.getElementById("userImg").files[0]; // File input

      // Create a FormData object to handle the form data including the file
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("bio", bio);
      formData.append("phone", phone);
      // formData.append("email", email);
      formData.append("password", password);
      if (userImg) {
        formData.append("images", userImg); // Append the image file
      }

      if (id) {
        try {
          // Await the fetch request to handle the response properly
          const editResponse = await fetch(`${apiUrl}/api/users/${id}`, {
            method: "PUT",
            body: formData, // No need for headers with FormData
            credentials: "include", // Ensure cookies are sent with the request
          });

          // Check the response status
          if (editResponse.ok) {
            console.log("User edited successfully");
            alert("Profile updated");
          } else {
            const errorData = await editResponse.json();
            console.error("Error editing user:", errorData);
          }
        } catch (error) {
          console.error("Failed to edit user:", error);
        }
      }
    });
});
