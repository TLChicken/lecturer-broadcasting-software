

let currSlideIndex = 0;

// Next/previous controls
function plusSlides(n) {
    currSlideIndex += n;
    showSlides(currSlideIndex);
}

// Thumbnail image controls
function goToSlide(n) {
    currSlideIndex = n;
    showSlides(currSlideIndex);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slideshow-slide");
    let dots = document.getElementsByClassName("slideshow-dot");

    if (n >= slides.length) {
        currSlideIndex = 0;
    }
    if (n < 0) {
        currSlideIndex = slides.length - 1;
    }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" dot-active", "");
    }

    slides[currSlideIndex].style.display = "block";
    dots[currSlideIndex].className += " dot-active";
}

document.addEventListener('DOMContentLoaded', (event) => {
    showSlides(currSlideIndex);
});
