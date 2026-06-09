const header = document.querySelector('.site-header');

// Scroll Event - Header Size Change
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else if (window.scrollY < 30) {
        header.classList.remove('scrolled');
    }
});


// header Mobile Environment Menu
const menuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

if (menuBtn && nav) {

    menuBtn.addEventListener('click', () => {

        nav.classList.toggle('open');

        menuBtn.textContent =
            nav.classList.contains('open')
            ? '✕'
            : '☰';
    });

}