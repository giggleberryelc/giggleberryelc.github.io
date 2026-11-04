// Paste your deployed Google Apps Script Web App URL between the quotes below.
// Example: https://script.google.com/macros/s/AKfycb.../exec
const WAITLIST_ENDPOINT = "https://script.google.com/macros/s/AKfycbzGdmCOHVrJs41XTffGlWQz23548Lj4X9nY9L9tyRQzFvbxM7M8VBkN3Qcc-hI5NvybRA/exec";

const form = document.querySelector('#waitlist-form');
const submitButton = document.querySelector('#submit-button');
const message = document.querySelector('#form-message');
const configNotice = document.querySelector('#form-not-configured');
const menuToggle = document.querySelector('#menu-toggle');
const siteNav = document.querySelector('#site-nav');

document.querySelector('#year').textContent = new Date().getFullYear();

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  siteNav.classList.toggle('open', open);
});
siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  siteNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const endpointReady = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(WAITLIST_ENDPOINT);
if (endpointReady) {
  submitButton.disabled = false;
  configNotice.hidden = true;
}
const dobInput = form.elements.dob;
const maxDOB = new Date();
maxDOB.setFullYear(maxDOB.getFullYear() + 5);
dobInput.max = maxDOB.toLocaleDateString('en-CA', {timeZone: 'America/Vancouver'});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';
  message.className = 'form-message';
  if (!endpointReady) return;
  if (!form.reportValidity()) return;

  const payload = Object.fromEntries(new FormData(form).entries());
  if (payload.website) return;
  if (payload.dob > dobInput.max) {
    message.textContent = 'Date of birth cannot be more than 5 years in the future.';
    message.classList.add('error');
    return;
  }
  submitButton.disabled = true;
  submitButton.textContent = 'Sending your request…';
  try {
    // Google Apps Script web-app redirects do not expose CORS headers.
    // no-cors allows the request to be sent; an opaque response cannot verify
    // whether the backend accepted it. Confirm in the sheet during testing.
    await fetch(WAITLIST_ENDPOINT, {
      method: 'POST', mode: 'no-cors', redirect: 'follow',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify(payload)
    });
    form.reset();
    message.textContent = 'Your request has been sent. Please contact us if you do not hear from our team.';
    message.classList.add('success');
  } catch (error) {
    message.textContent = 'We could not send your request. Please try again or email giggleberryelc@gmail.com.';
    message.classList.add('error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Submit waitlist request <span aria-hidden="true">↗</span>';
  }
});


// Gentle classroom slideshow; pauses during interaction and respects reduced-motion preferences.
(() => {
  const carousel = document.querySelector('#hero-slideshow');
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll('.slide'));
  const dots = Array.from(carousel.querySelectorAll('.slide-dot'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;
  const delay = 5800;

  function showSlide(next) {
    current = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }
  function stop() { window.clearInterval(timer); timer = undefined; }
  function start() {
    stop();
    if (!reduceMotion.matches && !document.hidden) timer = window.setInterval(() => showSlide(current + 1), delay);
  }
  carousel.querySelector('#slide-prev').addEventListener('click', () => { showSlide(current - 1); start(); });
  carousel.querySelector('#slide-next').addEventListener('click', () => { showSlide(current + 1); start(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); start(); }));
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', (e) => { if (!carousel.contains(e.relatedTarget)) start(); });
  document.addEventListener('visibilitychange', start);
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', start);
  showSlide(0);
  start();
})();
