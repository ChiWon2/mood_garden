const header = document.querySelector('.site-header');

if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    }
    else {
      header.classList.remove('scrolled');
    }
  });
}

const menuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuBtn.textContent = isOpen ? '✕' : '☰';
  });
}
