/* ============================================================
   pages/bookdetail.js — Book detail page renderer
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const BookDetail = (() => {

  let _currentBookId = null;

  function setBook(id) { _currentBookId = id; }

  function render() {
    const b = BOOKS.find(x => x.id === _currentBookId);
    if (!b) return `<div class="empty-state"><div class="icon">📭</div><p>Book not found.</p></div>`;

    const starsHtml = n =>
      '★'.repeat(n) + '<span style="color:var(--border);">' + '★'.repeat(5 - n) + '</span>';

    return `
    <button class="btn btn-outline btn-sm" onclick="Router.navigate('catalog')"
      style="margin-bottom:1.5rem;">← Back to Catalog</button>

    <!-- ── Hero section ── -->
    <div class="book-detail-hero">
      <div class="book-cover-lg" style="background:${b.cover}25;font-size:4.5rem;">${b.emoji}</div>

      <div class="book-detail-info">
        <h1>${b.title}</h1>
        <div class="author">by ${b.author}</div>

        <div class="book-meta-row">
          <div class="book-meta-item"><span>Category:</span> <b>${b.cat}</b></div>
          <div class="book-meta-item"><span>ISBN:</span> <b>${b.isbn}</b></div>
          <div class="book-meta-item"><span>Year:</span> <b>${b.year}</b></div>
          <div class="book-meta-item"><span>Reads:</span> <b>${b.reads.toLocaleString()}</b></div>
        </div>

        <div class="book-meta-row">
          <div class="book-meta-item" style="font-size:1.1rem;">
            <span class="stars">${starsHtml(Math.round(b.rating))}</span>
            <b>${b.rating}</b>
            <span style="color:var(--text-muted);font-size:.85rem;">
              (${b.reviews.length} review${b.reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        </div>

        <div class="book-desc">${b.desc}</div>

        <div class="book-actions">
          <button class="btn btn-primary" onclick="Reader.open(${b.id})">📖 Read Now</button>

          ${!Auth.isAdmin()
            ? `<button class="btn btn-accent" onclick="Reviews.openModal(${b.id})">✍ Write Review</button>`
            : ''}

          ${Auth.isAdmin() ? `
            <button class="btn btn-outline btn-sm" onclick="Admin.openBookModal(${b.id})">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="Admin.deleteBook(${b.id})">🗑 Delete</button>
          ` : ''}

          <button class="btn btn-outline btn-sm" onclick="Router.navigate('requests')">
            📝 Request Similar
          </button>
        </div>
      </div>
    </div>

    <!-- ── Reviews + Stats ── -->
    <div class="two-col">

      <!-- Reviews -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">💬 Reviews (${b.reviews.length})</div>
          ${!Auth.isAdmin()
            ? `<button class="btn btn-accent btn-sm" onclick="Reviews.openModal(${b.id})">+ Add Review</button>`
            : ''}
        </div>

        ${b.reviews.length === 0
          ? `<div class="empty-state" style="padding:1.5rem;">
               <div class="icon" style="font-size:2rem;">💬</div>
               <p>No reviews yet. Be the first to review this book!</p>
             </div>`
          : b.reviews.map(r => `
            <div class="review-card">
              <div class="review-header">
                <div class="avatar" style="width:30px;height:30px;font-size:.7rem;">
                  ${r.user.slice(0, 2).toUpperCase()}
                </div>
                <div class="review-name">${r.user}</div>
                <div class="review-date">${r.date}</div>
                <div style="color:var(--accent);">${starsHtml(r.rating)}</div>
              </div>
              <div class="review-text">${r.text}</div>
            </div>`).join('')
        }
      </div>

      <!-- Stats -->
      <div class="card">
        <div class="card-header"><div class="card-title">📊 Book Stats</div></div>
        <div style="display:flex;flex-direction:column;gap:1.2rem;">

          <div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:4px;">Average Rating</div>
            <div style="font-size:2rem;font-family:'Playfair Display',serif;color:var(--accent);">
              ⭐ ${b.rating}
            </div>
          </div>

          <div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:4px;">Total Reads</div>
            <div style="font-size:1.5rem;font-weight:600;">${b.reads.toLocaleString()}</div>
          </div>

          <div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:4px;">Availability</div>
            <span class="badge badge-success">✓ Available for Reading</span>
          </div>

          <div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:4px;">Format</div>
            <span class="tag">PDF / EPUB</span>
          </div>

          <div style="margin-top:.5rem;">
            <button class="btn btn-primary btn-full" onclick="Reader.open(${b.id})">
              📖 Start Reading
            </button>
          </div>
        </div>
      </div>

    </div>`;
  }

  return { setBook, render };
})();