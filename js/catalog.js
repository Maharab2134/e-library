/* ============================================================
   catalog.js — Book catalog state: filter, search, sort
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const Catalog = (() => {

  let _filterCat   = 'All';
  let _searchQuery = '';

  /* ── Live search (called from topbar input) ── */
  function liveSearch(value) {
    _searchQuery = value.toLowerCase();
    if (Router.currentPage() === 'catalog') Router.refresh();
  }

  /* ── Category chip filter ── */
  function setCatFilter(cat) {
    _filterCat = cat;
    Router.refresh();
  }

  /* ── Sort books array in-place ── */
  function sortBooks(value) {
    if (value === 'rating') BOOKS.sort((a, b) => b.rating - a.rating);
    else if (value === 'reads') BOOKS.sort((a, b) => b.reads - a.reads);
    else if (value === 'year')  BOOKS.sort((a, b) => b.year  - a.year);
    Router.refresh();
  }

  /* ── Open a book detail page ── */
  function openBook(id) {
    BookDetail.setBook(id);
    Router.navigate('bookdetail');
  }

  /* ── Get filtered + searched book list ── */
  function getFiltered() {
    let list = BOOKS;
    if (_filterCat !== 'All') list = list.filter(b => b.cat === _filterCat);
    if (_searchQuery) {
      list = list.filter(b =>
        b.title.toLowerCase().includes(_searchQuery)  ||
        b.author.toLowerCase().includes(_searchQuery) ||
        b.cat.toLowerCase().includes(_searchQuery)
      );
    }
    return list;
  }

  /* ── Render catalog page HTML ── */
  function render() {
    const cats     = ['All', ...new Set(BOOKS.map(b => b.cat))];
    const filtered = getFiltered();

    return `
    <div class="chip-row">
      ${cats.map(c => `<div class="chip ${_filterCat === c ? 'active' : ''}"
        onclick="Catalog.setCatFilter('${c}')">${c}</div>`).join('')}
    </div>

    <div class="catalog-toolbar">
      <input type="text" placeholder="🔍 Search books…"
        value="${_searchQuery}"
        oninput="Catalog.liveSearch(this.value)"
        style="min-width:200px;">
      <select onchange="Catalog.sortBooks(this.value)">
        <option value="default">Sort: Default</option>
        <option value="rating">Highest Rated</option>
        <option value="reads">Most Read</option>
        <option value="year">Newest First</option>
      </select>
      <span style="color:var(--text-muted);font-size:.85rem;margin-left:auto;">
        ${filtered.length} book${filtered.length !== 1 ? 's' : ''} found
      </span>
      ${Auth.isAdmin()
        ? `<button class="btn btn-accent btn-sm" onclick="Admin.openBookModal()">+ Add Book</button>`
        : ''}
    </div>

    ${filtered.length === 0
      ? `<div class="empty-state">
           <div class="icon">📭</div>
           <p>No books match your search. Try a different keyword or category.</p>
         </div>`
      : `<div class="books-grid">${filtered.map(bookCardHTML).join('')}</div>`
    }`;
  }

  /* ── Reusable book card HTML ── */
  function bookCardHTML(b) {
    return `
    <div class="book-card" onclick="Catalog.openBook(${b.id})">
      <div class="book-cover" style="background:${b.cover}20;">
        <span style="font-size:3.5rem;">${b.emoji}</span>
      </div>
      <div class="book-info">
        <div class="book-title">${b.title}</div>
        <div class="book-author">${b.author}</div>
        <div class="book-card-foot">
          <div class="book-rating"><span class="stars">★</span> ${b.rating}</div>
          <span class="tag">${b.cat}</span>
        </div>
      </div>
    </div>`;
  }

  return { liveSearch, setCatFilter, sortBooks, openBook, render, bookCardHTML };
})();