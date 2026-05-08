/* ============================================================
   pages/myreads.js — My Reading page renderer
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const MyReads = (() => {

  function render() {
    const inProgress = READING_HISTORY.filter(h => h.progress < 100);
    const completed  = READING_HISTORY.filter(h => h.progress === 100);

    return `
    <div class="two-col">

      <!-- In Progress -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📖 In Progress (${inProgress.length})</div>
        </div>
        ${inProgress.length === 0
          ? `<div class="empty-state" style="padding:1.5rem;">
               <div class="icon" style="font-size:2rem;">📭</div>
               <p>Nothing in progress yet. <a onclick="Router.navigate('catalog')"
                 style="color:var(--accent);cursor:pointer;">Browse books</a></p>
             </div>`
          : inProgress.map(h => _historyItem(h)).join('')
        }
      </div>

      <!-- Completed -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">✅ Completed (${completed.length})</div>
        </div>
        ${completed.length === 0
          ? `<div class="empty-state" style="padding:1.5rem;">
               <div class="icon" style="font-size:2rem;">🏆</div>
               <p>No completed books yet. Keep reading!</p>
             </div>`
          : completed.map(h => _historyItem(h)).join('')
        }
      </div>

    </div>

    <!-- Reading Stats -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">📊 My Reading Stats</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">
        ${[
          ['Books Started',   READING_HISTORY.length, 'var(--primary)' ],
          ['Completed',       completed.length,        'var(--success)' ],
          ['In Progress',     inProgress.length,       'var(--accent)'  ],
        ].map(([label, val, color]) => `
        <div style="text-align:center;padding:1.2rem;background:var(--surface);border-radius:8px;">
          <div style="font-family:'Playfair Display',serif;font-size:2.2rem;color:${color};">${val}</div>
          <div style="font-size:.78rem;color:var(--text-muted);margin-top:4px;">${label}</div>
        </div>`).join('')}
      </div>
    </div>`;
  }

  /* ── Single history-item row ── */
  function _historyItem(h) {
    const b = BOOKS.find(x => x.id === h.bookId);
    if (!b) return '';
    return `
    <div class="history-item">
      <div class="history-cover" style="background:${b.cover}20;">${b.emoji}</div>
      <div class="history-info">
        <div class="history-title">${b.title}</div>
        <div class="history-meta">${b.author} · Last read: ${h.lastRead}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${h.progress}%"></div>
        </div>
        <div style="font-size:.72rem;color:var(--text-muted);margin-top:3px;">
          ${h.progress}% complete
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="Reader.open(${b.id})">
        ${h.progress < 100 ? 'Continue' : 'Re-read'}
      </button>
    </div>`;
  }

  return { render };
})();