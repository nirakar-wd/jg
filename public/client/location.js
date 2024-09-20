document.addEventListener("DOMContentLoaded", async () => {
  const apiUrl = window.APP_API_BACKEND_URL;

  let addressId = null;

  try {
    // Get userId from local storage
    const id = localStorage.getItem("userId");

    if (id) {
      // Fetch user information using the extracted user ID
      const response = await fetch(`${apiUrl}/api/users/${id}`, {
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
        document.getElementById("firstName").value = user.user.firstName;
        document.getElementById("lastName").value = user.user.lastName;
        document.getElementById("email").value = user.user.email;
        document.getElementById("phone").value = user.user.phone || "";

        // Check if the user has any addresses
        if (user.user.addresses && user.user.addresses.length > 0) {
          // Address exists, set addressId
          addressId = user.user.addresses[0].id;

          document.getElementById("userAddress").value =
            user.user.addresses[0].address || "";
          document.getElementById("userCity").value =
            user.user.addresses[0].city || "";
          document.getElementById("userState").value =
            user.user.addresses[0].state || "";
          document.getElementById("userZip").value =
            user.user.addresses[0].zipCode || "";

          const selectElement = document.getElementById("inputState");
          selectElement.value = "Nepal";
        } else {
          // No address found, user can add a new one
          addressId = null;
        }
      } else {
        console.error("Failed to fetch user details");
      }
    }
  } catch (err) {
    console.log("Failed to fetch user info:", err);
  }

  // Handle form submission for adding or editing address
  document
    .getElementById("editShippingDetailsForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent the default form submission behavior

      // Get the form field values
      const address = document.getElementById("userAddress").value;
      const city = document.getElementById("userCity").value;
      const state = document.getElementById("userState").value;
      const zip = document.getElementById("userZip").value;
      const selectElement = document.getElementById("inputState");
      const country = selectElement.value;

      // Create a FormData object to handle the form data
      const formData = new FormData();
      formData.append("address", address);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("zip_code", zip);
      formData.append("country", country);

      try {
        if (addressId) {
          // Edit existing address
          const editResponse = await fetch(
            `${apiUrl}/api/addresses/${addressId}`,
            {
              method: "PUT",
              body: formData, // No need for headers with FormData
              credentials: "include",
            }
          );

          if (editResponse.ok) {
            console.log("Address updated successfully");
            alert("Address updated");
          } else {
            const errorData = await editResponse.json();
            console.error("Error updating address:", errorData);
          }
        } else {
          // Add new address
          const addResponse = await fetch(`${apiUrl}/api/addresses`, {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          if (addResponse.ok) {
            console.log("Address added successfully");
          } else {
            const errorData = await addResponse.json();
            console.error("Error adding new address:", errorData);
          }
        }
      } catch (error) {
        console.error("Failed to save address:", error);
      }
    });
});
