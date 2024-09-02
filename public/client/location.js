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

  //location put request
  document
  .getElementById("editShippingDetailsForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the form field values
    // const productName = document.getElementById("productName").value;
    // const description = document.getElementById("productDescription").value;
    // const features = document.getElementById("productFeatures").value;
    // const vendor = document.getElementById("vendor").value;
    // const price = document.getElementById("price").value;
    // const stock = document.getElementById("stock").value;
    // const discountedPrice = document.getElementById("discountedPrice").value;
    // const productImg = document.getElementById("productImg").files[0]; // File input 

    // Create a FormData object to handle the form data including the file
    // const formData = new FormData();
    // formData.append("name", productName);
    // formData.append("description", description);
    // formData.append("features", features);
    // formData.append("vendor", vendor);
    // formData.append("price", price);
    // formData.append("stock", stock);
    // formData.append("discountedPrice", discountedPrice);
    // if (productImg) {
    //   formData.append("images", productImg); // Append the image file
    // }

    // if (productId) {
    //   try {
    //     // Await the fetch request to handle the response properly
    //     const editResponse = await fetch(
    //       `http://localhost:4000/api/products/${productId}`,
    //       {
    //         method: "PUT",
    //         body: formData, // No need for headers with FormData
    //         credentials: "include", // Ensure cookies are sent with the request
    //       }
    //     );

    //     // Check the response status
    //     if (editResponse.ok) {
    //       console.log("product edited successfully");
    //     } else {
    //       const errorData = await editResponse.json();
    //       console.error("Error editing user:", errorData);
    //     }
    //   } catch (error) {
    //     console.error("Failed to edit user:", error);
    //   }
    // }
  });

});
