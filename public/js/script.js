document.addEventListener("DOMContentLoaded", function () {
  const loader = document.getElementById("loader");
  const content = document.getElementById("content");

  // Simulate loading time (e.g., fetching data, loading images)
  setTimeout(() => {
    // Hide the loader and show the content
    loader.style.display = "none";
    content.style.display = "flex";
  }, 2000); // Adjust the time as needed
});

/* scroll menu  */

window.addEventListener("scroll", function () {
  var header = document.querySelector(".nav-top");
  header.classList.toggle("sticky", window.scrollY > 0);
});

document.addEventListener("DOMContentLoaded", function () {
  const billingAddress = document.getElementById("billingAddress");
  const shippingAddress = document.getElementById("shippingAddress");
  const sameAsBilling = document.getElementById("sameAsBilling");

  sameAsBilling.addEventListener("change", function () {
    if (this.checked) {
      shippingAddress.value = billingAddress.value;
      shippingAddress.setAttribute("readonly", true); // Optional: make the field read-only
    } else {
      shippingAddress.value = "";
      shippingAddress.removeAttribute("readonly"); // Optional: remove read-only attribute
    }
  });

  billingAddress.addEventListener("input", function () {
    if (sameAsBilling.checked) {
      shippingAddress.value = this.value;
    }
  });
});

/* scroll menu  */

window.addEventListener("scroll", function () {
  var header = document.querySelector(".nav-top");
  header.classList.toggle("sticky", window.scrollY > 0);
});

const rangeInput = document.querySelectorAll(".range-input input"),
  priceInput = document.querySelectorAll(".price-input input"),
  range = document.querySelector(".slider .progress");
let priceGap = 1000;

priceInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minPrice = parseInt(priceInput[0].value),
      maxPrice = parseInt(priceInput[1].value);

    if (maxPrice - minPrice >= priceGap && maxPrice <= rangeInput[1].max) {
      if (e.target.className === "input-min") {
        rangeInput[0].value = minPrice;
        range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
      } else {
        rangeInput[1].value = maxPrice;
        range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
      }
    }
  });
});

rangeInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minVal = parseInt(rangeInput[0].value),
      maxVal = parseInt(rangeInput[1].value);

    if (maxVal - minVal < priceGap) {
      if (e.target.className === "range-min") {
        rangeInput[0].value = maxVal - priceGap;
      } else {
        rangeInput[1].value = minVal + priceGap;
      }
    } else {
      priceInput[0].value = minVal;
      priceInput[1].value = maxVal;
      range.style.left = (minVal / rangeInput[0].max) * 100 + "%";
      range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
    }
  });
});

// JavaScript to handle the copying of values
document
  .getElementById("sameAsBilling")
  .addEventListener("change", function () {
    if (this.checked) {
      document.getElementById("shippingAddress").value =
        document.getElementById("billingAddress").value;
      document.getElementById("shippingCity").value =
        document.getElementById("billingCity").value;
      document.getElementById("inputState").value =
        document.getElementById("billingAddress").value;
    } else {
      document.getElementById("shippingAddress").value = "";
    }
  });

// Update shipping address in real-time if checkbox is checked
document
  .getElementById("billingAddress")
  .addEventListener("input", function () {
    if (document.getElementById("sameAsBilling").checked) {
      document.getElementById("shippingAddress").value = this.value;
      document.getElementById("shippingCity").value = this.value;
      document.getElementById("inputState").value = this.value;
    }
  });

// JS for number increase and decrease

function myFunction() {
  var element = document.body;
  element.classList.toggle("dark-mode");
}
