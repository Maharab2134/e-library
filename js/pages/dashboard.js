/* ============================================================
   pages/dashboard.js — Dashboard page renderer
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const Dashboard = (() => {

  function render() {
    const totalReads   = BOOKS.reduce((s, b) => s + b.reads, 0);
    const pendingReqs  = REQUESTS.filter(r => r.status === 'pending').length;
    const topBooks     = [...BOOKS].sort((a, b) => b.reads - a.reads).slice(0, 5);
    const recentBooks  = BOOKS.slice(0, 6);

    return `
    <!-- ── Stat cards ── -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-value">${BOOKS.length}</div>
        <div class="stat-label">Total Books</div>
        <div class="stat-change">↑ 3 added this week</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-value">${USERS.length}</div>
        <div class="stat-label">Registered Users</div>
        <div class="stat-change">↑ 2 joined this month</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📖</div>
        <div class="stat-value">${totalReads.toLocaleString()}</div>
        <div class="stat-label">Total Reads</div>
        <div class="stat-change">↑ 12% vs last month</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-value">${pendingReqs}</div>
        <div class="stat-label">Pending Requests</div>
        ${pendingReqs > 0
          ? `<div class="stat-change" style="color:var(--warning);">Needs attention</div>`
          : `<div class="stat-change">All caught up ✓</div>`}
      </div>
    </div>

    <!-- ── Two-column section ── -->
    <div class="two-col">

      <!-- Most-read books -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📈 Most Read Books</div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Book</th><th>Category</th><th>Reads</th><th>Rating</th>
            </tr>
          </thead>
          <tbody>
            ${topBooks.map(b => `
            <tr style="cursor:pointer;" onclick="Catalog.openBook(${b.id})">
              <td>
                <b style="font-size:.85rem;">${b.emoji} ${b.title}</b><br>
                <span style="font-size:.75rem;color:var(--text-muted)">${b.author}</span>
              </td>
              <td><span class="tag">${b.cat}</span></td>
              <td>${b.reads.toLocaleString()}</td>
              <td><span class="stars">★</span> ${b.rating}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <!-- Recent requests -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📋 Recent Requests</div>
          ${Auth.isAdmin()
            ? `<button class="btn btn-outline btn-sm" onclick="Router.navigate('admin')">View All</button>`
            : ''}
        </div>
        ${REQUESTS.slice(0, 4).map(r => `
        <div style="padding:.7rem 0;border-bottom:1px solid var(--surface2);">
          <div style="font-size:.85rem;font-weight:600;">${r.book}</div>
          <div style="font-size:.77rem;color:var(--text-muted);margin:.2rem 0;">
            ${r.user} · ${r.date}
          </div>
          <span class="badge badge-${r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}">
            ${r.status}
          </span>
        </div>`).join('')}
      </div>

    </div>

    <!-- ── Recently added books ── -->
    <div class="section-header">
      <div class="section-title">🆕 Recently Added</div>
      <button class="btn btn-outline btn-sm" onclick="Router.navigate('catalog')">View All</button>
    </div>
    <div class="books-grid">
      ${recentBooks.map(Catalog.bookCardHTML).join('')}
    </div>`;
  }

  return { render };
})();