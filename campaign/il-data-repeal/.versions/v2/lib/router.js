/* ============================================================
   Hash Router — SPA navigation for the campaign dashboard
   ============================================================ */

export function initRouter(routes) {
  function navigate() {
    const hash = location.hash.slice(1) || '/';
    const route = routes[hash] || routes['/'];

    // Hide all pages, show the matched one
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(route.id);
    if (page) {
      page.classList.add('active');
      if (route.onEnter) route.onEnter();
    }

    // Update nav active state
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.remove('nav-active');
      const href = a.getAttribute('href');
      if (href === `#${hash}` || (hash === '/' && href === '#/')) {
        a.classList.add('nav-active');
      }
    });

    // Scroll to top on page change
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', navigate);
  navigate(); // initial route
}
