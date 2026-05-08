/* ============================================================
   ui.js — UI utilities: toast, modals, page switching
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const UI = (() => {

  /* ── Page switching (auth screens) ── */
  function showPage(id) {
    document.querySelectorAll('.full-page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  /* ── Toast notification ── */
  let _toastTimer = null;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ── Modal open / close ── */
  function openModal(id) {
    document.getElementById(id).classList.add('open');
  }
  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
  }

  /* ── Click-outside-to-close for modals ── */
  document.addEventListener('click', e => {
    ['book-modal', 'review-modal'].forEach(id => {
      const el = document.getElementById(id);
      if (el && e.target === el) closeModal(id);
    });
  });

  /* ── Sidebar builder ── */
  const USER_NAV = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard'    },
    { id: 'catalog',   icon: '📚', label: 'Book Catalog' },
    { id: 'myreads',   icon: '📖', label: 'My Reading'   },
    { id: 'requests',  icon: '📝', label: 'Request a Book' },
    { id: 'profile',   icon: '👤', label: 'My Profile'   },
  ];
  const ADMIN_NAV = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard'    },
    { id: 'catalog',   icon: '📚', label: 'Book Catalog' },
    { id: 'admin',     icon: '⚙️',  label: 'Admin Panel'  },
    { id: 'profile',   icon: '👤', label: 'Profile'      },
  ];

  function buildSidebar(isAdmin) {
    const nav = isAdmin ? ADMIN_NAV : USER_NAV;
    document.getElementById('sidebar-nav').innerHTML =
      '<div class="nav-section-label">Navigation</div>' +
      nav.map(n =>
        `<div class="nav-item" id="nav-${n.id}" onclick="Router.navigate('${n.id}')">
           <span class="nav-icon">${n.icon}</span>${n.label}
         </div>`
      ).join('');
  }

  function setActiveNav(page) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const el = document.getElementById('nav-' + page);
    if (el) el.classList.add('active');
  }

  /* ── Update topbar title ── */
  const PAGE_TITLES = {
    dashboard:  'Dashboard',
    catalog:    'Book Catalog',
    myreads:    'My Reading',
    requests:   'Request a Book',
    profile:    'My Profile',
    admin:      'Admin Panel',
    bookdetail: 'Book Details',
  };
  function setTopbarTitle(page) {
    document.getElementById('topbar-title').textContent = PAGE_TITLES[page] || page;
  }

  /* ── Public API ── */
  return { showPage, showToast, openModal, closeModal, buildSidebar, setActiveNav, setTopbarTitle };
})();