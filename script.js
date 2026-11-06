const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const hero = document.querySelector('.hero');
const sketch = document.querySelector('.hero-sketch');
const framedImage = document.querySelector('.intro-image');
const backToTop = document.querySelector('.back-to-top');
const replayButton = document.querySelector('.hero-replay');

function fitHouseSketch() {
  const bounds = hero.getBoundingClientRect();
  const imageAspect = 1920 / 1080;
  const heroAspect = bounds.width / bounds.height;
  if (heroAspect < imageAspect) {
    const viewWidth = 1080 * heroAspect;
    const viewLeft = (1920 - viewWidth) / 2;
    sketch.setAttribute('viewBox', `${viewLeft} -45 ${viewWidth} 1080`);
  } else {
    sketch.setAttribute('viewBox', '0 0 1900 690');
  }
}

fitHouseSketch();
window.addEventListener('resize', fitHouseSketch);

replayButton.addEventListener('click', () => {
  hero.classList.remove('is-animating');
  void hero.offsetWidth;
  requestAnimationFrame(() => hero.classList.add('is-animating'));
});

function updateBackToTop() {
  const isVisible = window.scrollY > window.innerHeight * 0.65;
  backToTop.classList.toggle('is-visible', isVisible);
  backToTop.setAttribute('aria-hidden', String(!isVisible));
  backToTop.tabIndex = isVisible ? 0 : -1;
}

updateBackToTop();
window.addEventListener('scroll', updateBackToTop, { passive: true });

const frameObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.35 });

frameObserver.observe(framedImage);

toggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));
