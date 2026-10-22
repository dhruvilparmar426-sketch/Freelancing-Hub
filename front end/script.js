// Freelancing Hub landing page: navigation, session (login once), profile chip, welcome screen.
// The marketplace itself (categories, products, search, payment) lives in market.js.

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

// Footer year updates automatically.
document.getElementById('year').textContent = new Date().getFullYear();

/*
  SESSION: the user logs in ONCE. The session is kept in localStorage
  ('freelancingHubCurrentUser'), so on every later visit the landing page shows the
  profile instead of Log In / Join Us, and login.html redirects straight back here.
  Demo storage only: use real backend authentication before going public.
*/
(function setupProfileAndWelcome() {
  let profile = null;
  try { profile = JSON.parse(localStorage.getItem('freelancingHubCurrentUser') || 'null'); } catch (_) {}
  if (profile && profile.role === 'Developer' && !location.pathname.endsWith('/developer.html')) { location.replace('developer.html'); return; }

  const actions = document.querySelector('.header-actions');
  if (profile && actions) {
    const isDev = profile.role === 'Developer';
    actions.innerHTML =
      `<button class="profile-chip" id="profileChip" type="button" aria-label="Open my profile">` +
      `<img src="${isDev ? 'developer.png' : 'user.png'}" alt=""><span>${escapeText(profile.name)}'s Profile</span></button>` +
      (isDev ? '<a class="btn btn-outline" href="developer.html">Developer Studio</a>' : '') +
      '<button class="btn btn-outline" id="signOutDemo" type="button">Sign out</button>';

    document.getElementById('profileChip')?.addEventListener('click', () => {
      if (window.flhOpenProfile) window.flhOpenProfile();
    });
    document.getElementById('signOutDemo')?.addEventListener('click', () => {
      localStorage.removeItem('freelancingHubCurrentUser');
      sessionStorage.removeItem('freelancingHubShowWelcome');
      location.href = 'index.html';
    });
  }

  const overlay = document.getElementById('welcomeOverlay');
  const show = sessionStorage.getItem('freelancingHubShowWelcome') === '1';
  window.flhWelcomeShown = false;
  if (profile && overlay && show) {
    document.getElementById('welcomeName').textContent = profile.name || 'Freelancer';
    document.getElementById('welcomeAvatar').src = profile.role === 'Developer' ? 'developer.png' : 'user.png';
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    sessionStorage.removeItem('freelancingHubShowWelcome');
    window.flhWelcomeShown = true;
  }
  document.getElementById('welcomeContinue')?.addEventListener('click', () => {
    overlay?.classList.remove('show');
    overlay?.setAttribute('aria-hidden', 'true');
    // Marketplace is browse-and-explore only; no checkout is offered in this demo.
  });

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
})();
