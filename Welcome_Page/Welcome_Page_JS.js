let lastScrollTop = 0;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", function () {
    let scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        // Scrolling down
        navbar.classList.add("hidden");
    } else {
        // Scrolling up
        navbar.classList.remove("hidden");
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Avoid negative values
});

const bubbleContainer = document.querySelector('.bubbles');

for (let i = 0; i < 25; i++) {
    const bubble = document.createElement('span');
    bubbleContainer.appendChild(bubble);
}


