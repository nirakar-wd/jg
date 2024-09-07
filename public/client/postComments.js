document.addEventListener("DOMContentLoaded", () => {
  let selectedRating = 0;

  const path = window.location.pathname;
  const productId = path.split("/").pop();

  // Handle star selection
  const stars = document.querySelectorAll("#ratingStars .fa-star");
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = star.getAttribute("data-value"); // Get the star rating
      updateStarDisplay(selectedRating); // Update the star display based on selection
    });
  });

  // Function to update star appearance based on selection
  function updateStarDisplay(rating) {
    stars.forEach((star) => {
      if (star.getAttribute("data-value") <= rating) {
        star.classList.add("selected"); // Highlight the selected stars
      } else {
        star.classList.remove("selected");
      }
    });
  }

  // Handle form submission
  const form = document.getElementById("postCommentForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const commentContent = document.getElementById("commentContent").value;

    // Ensure a rating is selected
    if (selectedRating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }

    // Prepare data to send to the backend
    const formData = {
      productId: productId,
      rating: selectedRating,
      content: commentContent,
    };

    console.log(formData);

    try {
      // Send POST request to the backend
      const response = await fetch(
        `http://localhost:4000/api/products/${productId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response) {
        const result = await response.json();
        if (result.error) {
          alert(result.error);
        } else {
          alert("Comment submitted successfully!");
        }
        // Optionally, reset the form after submission
        form.reset();
        updateStarDisplay(0); // Reset star selection
      } else {
        alert("Internal error");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  });
});
