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
      document.getElementById("productName").value = product.name || "";
      document.getElementById("productDescription").value =
        product.description || "";
      document.getElementById("productFeatures").value = product.features || "";
      document.getElementById("price").value = product.price || "";
      document.getElementById("vendor").value = product.vendor || "";
      document.getElementById("stock").value = product.stock || "";
      document.getElementById("discountedPrice").value = product.discountedPrice || "";

      // If there's an image associated with the product, show it
      if (product.images && product.images.length > 0) {
        const imgPreview = document.querySelector(".media-preview");
        product.images.forEach((image) => {
          const imgElement = document.createElement("img");
          imgElement.src = `${image.filePath}`; // Adjust the path as needed
          imgElement.alt = image.originalName;
          // imgElement.style.maxWidth = "50%";
          // imgElement.style.marginBottom = "10px";
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
  document
    .getElementById("editProductForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent the default form submission behavior

      // Get the form field values
      const productName = document.getElementById("productName").value;
      const description = document.getElementById("productDescription").value;
      const features = document.getElementById("productFeatures").value;
      const vendor = document.getElementById("vendor").value;
      const price = document.getElementById("price").value;
      const stock = document.getElementById("stock").value;
      const discountedPrice = document.getElementById("discountedPrice").value;
      const productImg = document.getElementById("productImg").files[0]; // File input 

      // Create a FormData object to handle the form data including the file
      const formData = new FormData();
      formData.append("name", productName);
      formData.append("description", description);
      formData.append("features", features);
      formData.append("vendor", vendor);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("discountedPrice", discountedPrice);
      if (productImg) {
        formData.append("images", productImg); // Append the image file
      }

      if (productId) {
        try {
          // Await the fetch request to handle the response properly
          const editResponse = await fetch(
            `http://localhost:4000/api/products/${productId}`,
            {
              method: "PUT",
              body: formData, // No need for headers with FormData
              credentials: "include", // Ensure cookies are sent with the request
            }
          );

          // Check the response status
          if (editResponse.ok) {
            console.log("product edited successfully");
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
