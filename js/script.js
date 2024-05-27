/* scroll menu  */

window.addEventListener("scroll", function () {
    var header = document.querySelector(".nav-top");
    header.classList.toggle("sticky", window.scrollY > 0);
});


