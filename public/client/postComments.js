// Extract the productId from the URL path
const path = window.location.pathname;
const productId = path.split("/").pop();

document
  .getElementById("postCommentForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get the user's rating
    const ratingElements = document.querySelectorAll(".stars i");
    let rating = 0;
    ratingElements.forEach((star, index) => {
      if (star.classList.contains("active")) {
        rating = index + 1;
      }
    });

    // Get the comment content
    const commentContent = document.getElementById("commentContent").value;

    // Validate the input (optional)
    // if (rating === 0 || commentContent.trim() === "") {
    //   alert("Please provide a rating and comment.");
    //   return;
    // }

    // Prepare the comment data
    const commentData = {
      productId: productId,
      rating: rating,
      content: commentContent,
    };

    // Send the POST request to the backend
    fetch(`http://localhost:4000/api/products/${productId}/comments`, {
      // Replace '/api/comments' with your actual API endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle success - you could update the comment list or display a success message
        console.log(data);
        alert("Comment submitted successfully!");
        // Optionally, reset the form
        document.getElementById("postCommentForm").reset();
        // Reset the stars
        ratingElements.forEach((star) => star.classList.remove("active"));
      })
      .catch((error) => {
        // Handle error
        console.error("Error posting comment:", error);
        alert("There was an error submitting your comment. Please try again.");
      });
  });

// Handle star rating click events
document.querySelectorAll(".stars a").forEach((star, index) => {
  star.addEventListener("click", function (event) {
    event.preventDefault();
    const ratingElements = document.querySelectorAll(".stars i");
    ratingElements.forEach((starElement, starIndex) => {
      if (starIndex <= index) {
        starElement.classList.add("active");
      } else {
        starElement.classList.remove("active");
      }
    });
  });
});
