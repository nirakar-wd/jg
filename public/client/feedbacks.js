document.addEventListener("DOMContentLoaded", () => {
  const feedbackForm = document.getElementById("feedbackForm");

  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the form from submitting the traditional way

    // Get form data
    const message = document.getElementById(
      "exampleFormControlTextarea1"
    ).value;

    // Validate form data
    if (!message) {
      alert("Please fill in all fields.");
      return;
    }

    // Prepare the payload
    const payload = {
      content: message,
    };

    try {
      // Post the form data to the server
      const response = await fetch("http://localhost:4000/api/users/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Convert payload to JSON
      });

      // Handle the server response
      const result = await response.json();

      if (response.ok) {
        // Success
        alert("Your feedback has been sent successfully!");
        feedbackForm.reset(); // Reset the form fields
      } else {
        // Failure
        alert(result.message || "Failed to send feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while sending feedback.");
    }
  });
});
