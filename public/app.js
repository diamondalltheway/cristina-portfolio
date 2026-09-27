const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
function closeMenu({ restoreFocus = false } = {}) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  navigation.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  if (menuButton.getAttribute('aria-expanded') === 'true') return closeMenu();
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Close menu');
  navigation.classList.add('is-open');
  document.body.classList.add('menu-open');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
document.addEventListener('keydown', event => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') closeMenu({ restoreFocus: true });
  if (event.key === 'Tab') {
    const links = [...navigation.querySelectorAll('a')];
    if (event.shiftKey && document.activeElement === menuButton) { event.preventDefault(); links.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === links.at(-1)) { event.preventDefault(); menuButton.focus(); }
  }
});

const cards = [...document.querySelectorAll('.project-card')];
const dialog = document.querySelector('#project-dialog');
const detailImage = document.querySelector('#project-detail-image');
let currentProject = 0;
let opener;
let focusAfterClose;
function showProject(index) {
  currentProject = (index + cards.length) % cards.length;
  const card = cards[currentProject];
  document.querySelector('#project-title').textContent = card.querySelector('strong').textContent;
  detailImage.src = card.querySelector('img').getAttribute('src');
  detailImage.alt = card.querySelector('img').alt;
  document.querySelector('#project-counter').textContent = `${currentProject + 1} / ${cards.length}`;
  dialog.scrollTop = 0;
  document.querySelector('.dialog-image-wrap').scrollLeft = 0;
}
cards.forEach((card, index) => card.addEventListener('click', () => {
  opener = card;
  showProject(index);
  dialog.showModal();
  document.body.classList.add('modal-open');
}));
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.querySelector('.project-prev').addEventListener('click', () => showProject(currentProject - 1));
dialog.querySelector('.project-next').addEventListener('click', () => showProject(currentProject + 1));
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); showProject(currentProject + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showProject(currentProject - 1); }
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  (focusAfterClose || opener)?.focus({ preventScroll: true });
  focusAfterClose = undefined;
});
dialog.querySelector('.dialog-contact').addEventListener('click', () => {
  focusAfterClose = document.querySelector('#contact-heading');
  focusAfterClose.setAttribute('tabindex', '-1');
  dialog.close();
});

const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  const originalLabel = button.innerHTML;
  status.hidden = true;
  status.className = '';
  button.disabled = true;
  button.textContent = 'SENDING…';
  form.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Please try again.');
    form.hidden = true;
    status.className = 'success';
    status.textContent = 'THANK YOU! YOUR MESSAGE IS IN. ✦';
  } catch (error) {
    status.className = 'error';
    status.textContent = error instanceof TypeError ? 'Unable to submit. Check your connection and try again.' : error.message;
  } finally {
    status.hidden = false;
    button.disabled = false;
    button.innerHTML = originalLabel;
    form.removeAttribute('aria-busy');
    status.focus({ preventScroll: true });
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
