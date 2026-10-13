(() => {
  'use strict';
  // Footer behaviour shared by the Scripts app and the tool pages (/FDCalc, /FRprompt): current year, the "Legal" pop-up on narrow screens, Back to top.
  // Markup lives in each page (see index.html); styles in assets/css/site-footer.css. No dependencies.
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector('.legal-toggle'), links = document.getElementById('legal-links');
  if (toggle && links) {
    const set = open => { toggle.setAttribute('aria-expanded', String(open)); links.classList.toggle('open', open); };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  }

  const top = document.querySelector('.to-top');
  if (top) top.addEventListener('click', e => {
    e.preventDefault();
    const scroller = document.querySelector('.main-page');       // the page itself never scrolls in this shell; .main-page does
    (scroller || window).scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
})();
