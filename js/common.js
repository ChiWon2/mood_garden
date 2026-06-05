const header = document.querySelector('.site-header');

// Scroll Event - Header Size Change
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    }
    else {
        header.classList.remove('scrolled');
    }
});