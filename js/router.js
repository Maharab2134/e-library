/* ============================================================
   router.js — Client-side page router
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const Router = (() => {

  let _currentPage = 'dashboard';

  function currentPage() { return _currentPage; }

  /* ── Navigate to a named page ── */
  function navigate(page) {
    _currentPage = page;
    UI.setActiveNav(page);
    UI.setTopbarTitle(page);
    _render(page);
  }

  /* ── Internal renderer dispatcher ── */
  function _render(page) {
    const area = document.getElementById('content-area');

    switch (page) {
      case 'dashboard':  area.innerHTML = Dashboard.render();   break;
      case 'catalog':    area.innerHTML = Catalog.render();     break;
      case 'myreads':    area.innerHTML = MyReads.render();     break;
      case 'requests':   area.innerHTML = Requests.render();    break;
      case 'profile':    area.innerHTML = Profile.render();     break;
      case 'admin':      area.innerHTML = Admin.render();       break;
      case 'bookdetail': area.innerHTML = BookDetail.render();  break;
      default:
        area.innerHTML = `<div class="empty-state"><div class="icon">🗺️</div><p>Page not found.</p></div>`;
    }
  }

  /* ── Re-render the current page (after data mutations) ── */
  function refresh() { _render(_currentPage); }

  return { navigate, refresh, currentPage };
})();