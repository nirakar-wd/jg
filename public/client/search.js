document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchForm = document.getElementById("searchForm");
  const searchResults = document.getElementById("searchResults");

  // Handle search input keyup event
  searchInput.addEventListener("input", async function () {
    const query = searchInput.value.trim();

    // Check if the query is not empty
    if (query.length > 0) {
      try {
        // Fetch results from the backend
        const response = await fetch(
          `http://localhost:4000/api/products/search?q=${query}`
        );
        const results = await response.json();

        // Display search results
        displaySearchResults(results);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    } else {
      searchResults.style.display = "none"; // Hide the search results if input is empty
    }
  });

  // Function to display search results
  function displaySearchResults(results) {
    // Clear any previous results
    searchResults.innerHTML = "";

    // If there are results, display them
    if (results.length > 0) {
      results.forEach((result) => {
        const resultItem = document.createElement("div");
        resultItem.classList.add("result-item");
        resultItem.textContent = result.name; // Display the name of the result, customize as needed

        // Add a click event listener to handle what happens when a result is clicked
        resultItem.addEventListener("click", () => {
          window.location.href = `/products/${result.id}`; // Redirect to the product page
        });

        searchResults.appendChild(resultItem);
      });

      // Show the search results container
      searchResults.style.display = "block";
    } else {
      // If no results found, show a message
      searchResults.innerHTML = `<div class="result-item">No results found</div>`;
      searchResults.style.display = "block";
    }
  }

  // Handle form submission to prevent default behavior
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
  });
});
