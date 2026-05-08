/* ============================================================
   pages/requests.js — Book Request page renderer & logic
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const Requests = (() => {
  function render() {
    /* Admin sees the full admin panel instead */
    if (Auth.isAdmin()) return Admin.render();

    const myRequests = REQUESTS.slice(0, 4);

    return `
    <div class="two-col">

      <!-- Request form -->
      <div class="req-form">
        <h2>📝 Request a Book</h2>
        <p>Can't find a book in the catalog? Submit a request and our admin team will
           review it and add it if available.</p>

        <div class="form-group">
          <label>Book Title *</label>
          <input type="text" id="req-title" placeholder="Enter the exact title of the book">
        </div>
        <div class="form-group">
          <label>Author Name</label>
          <input type="text" id="req-author" placeholder="Author's full name">
        </div>
        <div class="form-group">
          <label>ISBN (optional)</label>
          <input type="text" id="req-isbn" placeholder="e.g. 978-0000000000">
        </div>
        <div class="form-group">
          <label>Reason for Request *</label>
          <textarea id="req-reason" rows="4"
            placeholder="Why do you need this book? (course reference, research, personal interest…)"></textarea>
        </div>

        <button class="btn btn-primary" onclick="Requests.submit()">Submit Request</button>
      </div>

      <!-- My request history -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📋 My Requests</div>
        </div>

        ${
          myRequests.length === 0
            ? `<div class="empty-state" style="padding:1.5rem;">
               <div class="icon" style="font-size:2rem;">📭</div>
               <p>You haven't submitted any requests yet.</p>
             </div>`
            : myRequests
                .map(
                  (r) => `
            <div style="padding:.8rem 0;border-bottom:1px solid var(--surface2);">
              <div style="font-size:.85rem;font-weight:600;">${r.book}</div>
              <div style="font-size:.77rem;color:var(--text-muted);margin:.25rem 0;">
                by ${r.author} · Submitted ${r.date}
              </div>
              <span class="badge badge-${r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "warning"}">
                ${r.status.charAt(0).toUpperCase() + r.status.slice(1)}
              </span>
            </div>`,
                )
                .join("")
        }

        <div style="margin-top:1rem;font-size:.8rem;color:var(--text-muted);">
          ℹ️ Requests are typically reviewed within 3–5 business days.
        </div>
      </div>

    </div>`;
  }

  /* ── Submit a new request ── */
  function submit() {
    const title = document.getElementById("req-title").value.trim();
    const author = document.getElementById("req-author").value.trim();
    const isbn = document.getElementById("req-isbn").value.trim();
    const reason = document.getElementById("req-reason").value.trim();

    if (!title) {
      UI.showToast("⚠️ Please enter the book title.");
      return;
    }
    if (!reason) {
      UI.showToast("⚠️ Please provide a reason for your request.");
      return;
    }

    AppData.submitRequest({
      book_title: title,
      author_name: author,
      isbn,
      reason,
    })
      .then(() => {
        UI.showToast(
          "✅ Request submitted! The admin team will review it shortly.",
        );
        Router.refresh();
      })
      .catch((error) => {
        UI.showToast(error.message || "⚠️ Unable to submit request.");
      });
  }

  return { render, submit };
})();
