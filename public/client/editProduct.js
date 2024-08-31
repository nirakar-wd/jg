document.addEventListener("DOMContentLoaded", async () => {
  const productId = window.location.pathname.split("/").pop();
  try {
    const getProductDetails = await fetch(
      `http://localhost:4000/api/products/by_id/${productId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent with the request
      }
    );

    const product = await getProductDetails.json();
    console.log(product);

    if (getProductDetails.ok) {
      // Populate the form fields with the fetched data
      document.getElementById("product-name").value = product.name || "";
      document.getElementById("productDescription").value =
        product.description || "";
      document.getElementById("productFeatures").value = product.features || "";
      document.getElementById("price").value = product.price || "";
      document.getElementById("vendor").value = product.vendor || "";
      document.getElementById("stock").value = product.stock || "";
      document.getElementById("discount").value = product.discountedPrice || "";

      // If there's an image associated with the product, show it
      if (product.images && product.images.length > 0) {
        const imgPreview = document.querySelector(".media-preview");
        product.images.forEach((image) => {
          const imgElement = document.createElement("img");
          imgElement.src = `${image.filePath}`; // Adjust the path as needed
          imgElement.alt = image.originalName;
          imgElement.style.maxWidth = "100%";
          imgElement.style.marginBottom = "10px";
          imgPreview.appendChild(imgElement);
        });
      }
    } else {
      console.error("Failed to fetch product data:", product.message);
    }
  } catch (error) {
    console.error("Error fetching product data:", error);
  }
  // put request for edit product
//   document
//     .getElementById("userProfileForm")
//     .addEventListener("submit", async function (event) {
//       event.preventDefault(); // Prevent the default form submission behavior

//       // Get the form field values
//       const firstName = document.getElementById("firstName1").value;
//       const lastName = document.getElementById("lastName1").value;
//       const bio = document.getElementById("userBio1").value;
//       // const email = document.getElementById("userEmail1").value;
//       const password = document.getElementById("userPassword").value;
//       const phone = document.getElementById("userPhone").value;
//       const userImg = document.getElementById("userImg").files[0]; // File input

//       // Create a FormData object to handle the form data including the file
//       const formData = new FormData();
//       formData.append("firstName", firstName);
//       formData.append("lastName", lastName);
//       formData.append("bio", bio);
//       formData.append("phone", phone);
//       // formData.append("email", email);
//       formData.append("password", password);
//       if (userImg) {
//         formData.append("images", userImg); // Append the image file
//       }

//       if (id) {
//         try {
//           // Await the fetch request to handle the response properly
//           const editResponse = await fetch(
//             `http://localhost:4000/api/users/${id}`,
//             {
//               method: "PUT",
//               body: formData, // No need for headers with FormData
//               credentials: "include", // Ensure cookies are sent with the request
//             }
//           );

//           // Check the response status
//           if (editResponse.ok) {
//             console.log("User edited successfully");
//           } else {
//             const errorData = await editResponse.json();
//             console.error("Error editing user:", errorData);
//           }
//         } catch (error) {
//           console.error("Failed to edit user:", error);
//         }
//       }
//     });
});
