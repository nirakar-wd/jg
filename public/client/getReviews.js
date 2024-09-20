document.addEventListener("DOMContentLoaded", async () => {

  const apiUrl = window.APP_API_BACKEND_URL;

  try {
    // Fetch products
    const response = await fetch(
      `http://localhost:4000/api/comments/?page=1&pageSize=3`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const comments = await response.json();
      console.log(comments);
      const commentsContainer = document.querySelector("#reviewsContainer");

      // Clear existing products (if any)
      commentsContainer.innerHTML = "";

      // Populate the products container with the fetched products
      comments.comments.forEach((comment) => {
        const commentCard = `
        <div class="my-slider">
  <div class="testimonials-box" id="base">
                        <div class="testimonials-details">
                            <div class="client-pd">
                                <img src="img/pexels-andrea-piacquadio-774909 1.png" alt="client photo"
                                    class="client-img">

                            </div>

                            <p class="para test-para">${comment.content}
                            </p>

                            <div class="client-name text-end">
                                ${comment.rating}
                                <span class="client-cpn">XYZ</span>
                            </div>
                        </div>



                    </div>
                    </div>
              `;
        commentsContainer.innerHTML += commentCard;
      });
    } else {
      console.error("Failed to fetch products");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
