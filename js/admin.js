/* ============================================================
   admin.js — Admin panel: books, users, requests, reports
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const Admin = (() => {
  let _activeTab = "books";
  let _editingBookId = null;

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  function render() {
    const pendingCount = REQUESTS.filter((r) => r.status === "pending").length;
    return `
    <div class="admin-tab-bar">
      ${_tab("books", `📚 Books (${BOOKS.length})`)}
      ${_tab("users", `👥 Users (${USERS.length})`)}
      ${_tab("requests", `📝 Requests (${pendingCount} pending)`)}
      ${_tab("reports", "📊 Reports")}
    </div>
    ${_renderTab()}`;
  }

  function _tab(id, label) {
    return `<div class="admin-tab ${_activeTab === id ? "active" : ""}"
      onclick="Admin.setTab('${id}')">${label}</div>`;
  }

  function setTab(tab) {
    _activeTab = tab;
    Router.refresh();
  }

  /* ── Books tab ── */
  function _renderTab() {
    switch (_activeTab) {
      case "books":
        return _booksTab();
      case "users":
        return _usersTab();
      case "requests":
        return _requestsTab();
      case "reports":
        return _reportsTab();
      default:
        return "";
    }
  }

  function _booksTab() {
    return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
      <span style="font-size:.88rem;color:var(--text-muted);">${BOOKS.length} books in catalog</span>
      <button class="btn btn-accent btn-sm" onclick="Admin.openBookModal()">+ Add Book</button>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Book</th><th>Category</th><th>Year</th>
          <th>Rating</th><th>Reads</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${BOOKS.map(
          (b) => `
        <tr>
          <td>
            <b>${b.emoji} ${b.title}</b><br>
            <span style="font-size:.77rem;color:var(--text-muted)">
              ${b.author} · ISBN: ${b.isbn}
            </span>
          </td>
          <td><span class="tag">${b.cat}</span></td>
          <td>${b.year}</td>
          <td><span class="stars">★</span> ${b.rating}</td>
          <td>${b.reads.toLocaleString()}</td>
          <td style="white-space:nowrap;">
            <button class="btn btn-outline btn-sm"
              onclick="Catalog.openBook(${b.id})">View</button>
            <button class="btn btn-outline btn-sm"
              onclick="Admin.openBookModal(${b.id})">Edit</button>
            <button class="btn btn-danger btn-sm"
              onclick="Admin.deleteBook(${b.id})">Delete</button>
          </td>
        </tr>`,
        ).join("")}
      </tbody>
    </table>`;
  }

  /* ── Users tab ── */
  function _usersTab() {
    return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th><th>Email</th><th>Role</th>
          <th>Joined</th><th>Books Read</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${USERS.map(
          (u) => `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="avatar" style="width:28px;height:28px;font-size:.65rem;">
                ${u.name.slice(0, 2).toUpperCase()}
              </div>
              <b>${u.name}</b>
            </div>
          </td>
          <td style="font-size:.83rem;color:var(--text-muted)">${u.email}</td>
          <td><span class="tag">${u.role}</span></td>
          <td style="font-size:.83rem">${u.joined}</td>
          <td style="text-align:center;">${u.reads}</td>
          <td>
            <span class="badge badge-${u.status === "active" ? "success" : "danger"}">
              ${u.status}
            </span>
          </td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="Admin.toggleUser(${u.id})">
              ${u.status === "active" ? "Deactivate" : "Activate"}
            </button>
          </td>
        </tr>`,
        ).join("")}
      </tbody>
    </table>`;
  }

  /* ── Requests tab ── */
  function _requestsTab() {
    return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Book Title</th><th>Author</th><th>Requested By</th>
          <th>Reason</th><th>Date</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${REQUESTS.map(
          (r) => `
        <tr>
          <td><b>${r.book}</b></td>
          <td style="font-size:.83rem">${r.author}</td>
          <td style="font-size:.83rem">${r.user}</td>
          <td style="font-size:.82rem;color:var(--text-muted);max-width:180px;">${r.reason}</td>
          <td style="font-size:.83rem">${r.date}</td>
          <td>
            <span class="badge badge-${r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "warning"}">
              ${r.status}
            </span>
          </td>
          <td style="white-space:nowrap;">
            ${
              r.status === "pending"
                ? `
              <button class="btn btn-success btn-sm"
                onclick="Admin.updateRequest(${r.id},'approved')">✓ Approve</button>
              <button class="btn btn-danger btn-sm"
                onclick="Admin.updateRequest(${r.id},'rejected')">✗ Reject</button>
            `
                : "—"
            }
          </td>
        </tr>`,
        ).join("")}
      </tbody>
    </table>`;
  }

  /* ── Reports tab ── */
  function _reportsTab() {
    const totalReads = BOOKS.reduce((s, b) => s + b.reads, 0);
    const totalReviews = BOOKS.reduce((s, b) => s + b.reviews.length, 0);
    const cats = [...new Set(BOOKS.map((b) => b.cat))];

    const summaryRows = [
      ["Total Books", BOOKS.length, "var(--info)"],
      ["Total Users", USERS.length, "var(--success)"],
      ["Total Reads", totalReads.toLocaleString(), "var(--accent)"],
      [
        "Approved Requests",
        REQUESTS.filter((r) => r.status === "approved").length,
        "var(--success)",
      ],
      [
        "Pending Requests",
        REQUESTS.filter((r) => r.status === "pending").length,
        "var(--warning)",
      ],
      ["Total Reviews", totalReviews, "var(--info)"],
    ];

    const activityLog = [
      ["📚 Book Added", "Introduction to Algorithms uploaded", "Today"],
      [
        "✅ Request Approved",
        "The Great Gatsby approved for Oishi J.",
        "Feb 28",
      ],
      ["👤 New User", "Ahmed Karim registered", "Feb 25"],
      ["✍️ Review Posted", "Sarija reviewed Sapiens", "Feb 20"],
      ["📝 Request Submitted", "OS Concepts requested by Ahmed K.", "Mar 8"],
      ["❌ Request Rejected", "Database System Concepts rejected", "Feb 20"],
    ];

    return `
    <div class="two-col">
      <div class="card">
        <div class="card-header"><div class="card-title">📈 Usage Summary</div></div>
        <div style="display:flex;flex-direction:column;gap:.8rem;">
          ${summaryRows
            .map(
              ([label, val, color]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;
               padding:.6rem .9rem;background:var(--surface);border-radius:8px;">
            <span style="font-size:.88rem;">${label}</span>
            <b style="color:${color};font-size:1.1rem;">${val}</b>
          </div>`,
            )
            .join("")}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">📚 Books by Category</div></div>
        ${cats
          .map((cat) => {
            const count = BOOKS.filter((b) => b.cat === cat).length;
            const pct = Math.round((count / BOOKS.length) * 100);
            return `
          <div class="report-bar-row">
            <div class="label"><span>${cat}</span><b>${count} (${pct}%)</b></div>
            <div class="report-bar-bg">
              <div class="report-bar-fill" style="width:${pct}%"></div>
            </div>
          </div>`;
          })
          .join("")}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">📋 Activity Log</div></div>
      <table class="table">
        <thead><tr><th>Event</th><th>Details</th><th>Date</th></tr></thead>
        <tbody>
          ${activityLog
            .map(
              ([ev, det, dt]) =>
                `<tr>
              <td>${ev}</td>
              <td style="font-size:.83rem;color:var(--text-muted)">${det}</td>
              <td style="font-size:.83rem">${dt}</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
  }

  /* ══════════════════════════════════════════
     BOOK CRUD
  ══════════════════════════════════════════ */
  function openBookModal(id) {
    _editingBookId = id || null;
    const b = id ? BOOKS.find((x) => x.id === id) : null;

    document.getElementById("modal-title").textContent = b
      ? "Edit Book"
      : "Add New Book";
    document.getElementById("modal-sub").textContent = b
      ? "Update book information in the catalog"
      : "Upload a new book to the Textora catalog";

    document.getElementById("m-title").value = b ? b.title : "";
    document.getElementById("m-author").value = b ? b.author : "";
    document.getElementById("m-isbn").value = b ? b.isbn : "";
    document.getElementById("m-year").value = b
      ? b.year
      : new Date().getFullYear();
    document.getElementById("m-desc").value = b ? b.desc : "";
    if (b) document.getElementById("m-cat").value = b.cat;

    UI.openModal("book-modal");
  }

  function saveBook() {
    const title = document.getElementById("m-title").value.trim();
    if (!title) {
      UI.showToast("⚠️ Book title is required.");
      return;
    }

    const payload = {
      title,
      author: document.getElementById("m-author").value.trim(),
      isbn: document.getElementById("m-isbn").value.trim(),
      category: document.getElementById("m-cat").value,
      year:
        parseInt(document.getElementById("m-year").value) ||
        new Date().getFullYear(),
      description: document.getElementById("m-desc").value.trim(),
      coverEmoji: document.getElementById("m-author").value.trim()
        ? "📘"
        : "📚",
      coverColor: "#1a1a2e",
    };

    AppData.saveBook(payload, _editingBookId)
      .then(() => {
        UI.closeModal("book-modal");
        UI.showToast(
          _editingBookId
            ? "✅ Book updated successfully!"
            : "✅ Book added to the catalog!",
        );
        Router.refresh();
      })
      .catch((error) => {
        UI.showToast(error.message || "⚠️ Unable to save book.");
      });
  }

  function deleteBook(id) {
    if (!confirm("Are you sure you want to delete this book from the catalog?"))
      return;
    AppData.deleteBook(id)
      .then(() => {
        UI.showToast("🗑️ Book deleted.");
        Router.navigate("catalog");
      })
      .catch((error) => {
        UI.showToast(error.message || "⚠️ Unable to delete book.");
      });
  }

  /* ══════════════════════════════════════════
     REQUEST MANAGEMENT
  ══════════════════════════════════════════ */
  function updateRequest(id, status) {
    AppData.updateRequest(id, status)
      .then(() => {
        UI.showToast(
          status === "approved"
            ? "✅ Request approved!"
            : "❌ Request rejected.",
        );
        Router.refresh();
      })
      .catch((error) => {
        UI.showToast(error.message || "⚠️ Unable to update request.");
      });
  }

  /* ══════════════════════════════════════════
     USER MANAGEMENT
  ══════════════════════════════════════════ */
  function toggleUser(id) {
    const u = USERS.find((x) => x.id === id);
    if (!u) return;
    const nextStatus = u.status === "active" ? "inactive" : "active";
    AppData.toggleUser(id, nextStatus)
      .then(() => {
        UI.showToast(
          `User ${nextStatus === "active" ? "activated" : "deactivated"}.`,
        );
        Router.refresh();
      })
      .catch((error) => {
        UI.showToast(error.message || "⚠️ Unable to update user.");
      });
  }

  return {
    render,
    setTab,
    openBookModal,
    saveBook,
    deleteBook,
    updateRequest,
    toggleUser,
  };
})();
