document.addEventListener("DOMContentLoaded", async () => {
  const categoryId = window.location.pathname.split("/").pop();
  try {
    const getCategory = await fetch(`http://localhost:4000/api/categories/${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
    });

    const category = await getCategory.json();
    console.log(category);

    if (category.ok) {
      // Populate the form fields with the fetched data
      document.getElementById("categoryName").value = category.name || "";
      document.getElementById("categoryDescription").value =
        category.description || "";
    }
  } catch (error) {
    console.error("Error fetching categories data:", error);
  }

  // put request for edit product
//   document
//     .getElementById("editCategoryForm")
//     .addEventListener("submit", async function (event) {
//       event.preventDefault(); // Prevent the default form submission behavior

//       // Get the form field values
//       const productName = document.getElementById("productName").value;
//       const description = document.getElementById("productDescription").value;
//       const features = document.getElementById("productFeatures").value;
//       const vendor = document.getElementById("vendor").value;
//       const price = document.getElementById("price").value;
//       const stock = document.getElementById("stock").value;
//       const discountedPrice = document.getElementById("discountedPrice").value;
//       const productImg = document.getElementById("productImg").files[0]; // File input

//       // Create a FormData object to handle the form data including the file
//       const formData = new FormData();
//       formData.append("name", productName);
//       formData.append("description", description);
//       formData.append("features", features);
//       formData.append("vendor", vendor);
//       formData.append("price", price);
//       formData.append("stock", stock);
//       formData.append("discountedPrice", discountedPrice);
//       if (productImg) {
//         formData.append("images", productImg); // Append the image file
//       }

//       if (productId) {
//         try {
//           // Await the fetch request to handle the response properly
//           const editResponse = await fetch(
//             `http://localhost:4000/api/products/${productId}`,
//             {
//               method: "PUT",
//               body: formData, // No need for headers with FormData
//               credentials: "include", // Ensure cookies are sent with the request
//             }
//           );

//           // Check the response status
//           if (editResponse.ok) {
//             console.log("product edited successfully");
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
