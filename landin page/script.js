// FreeLaunch Hub landing page interactions
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('serviceSearch');
const serviceCards = [...document.querySelectorAll('.service-card')];
const noResults = document.getElementById('noResults');

function filterServices(value) {
  const query = value.trim().toLowerCase();
  let visible = 0;
  serviceCards.forEach(card => {
    const matches = !query || card.dataset.name.toLowerCase().includes(query) ||
      card.textContent.toLowerCase().includes(query);
    card.hidden = !matches;
    if (matches) visible++;
  });
  noResults.hidden = visible > 0;
  document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

searchForm?.addEventListener('submit', event => {
  event.preventDefault();
  filterServices(searchInput.value);
});

document.querySelectorAll('.popular a[data-category]').forEach(tag => {
  tag.addEventListener('click', () => {
    searchInput.value = tag.dataset.category;
    filterServices(tag.dataset.category);
  });
});

// Footer year updates automatically.
document.getElementById('year').textContent = new Date().getFullYear();

/*
LOGIN CONNECTION:
This landing page sends Login / Join Us / category links to login.html.
If your existing login page uses another filename or folder, update those href
values in index.html. To connect the actual authentication/database, keep your
existing login form's PHP/backend logic; do not replace it with frontend-only JS.
*/
