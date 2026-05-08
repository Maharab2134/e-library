/* ============================================================
   pages/profile.js — User profile & account settings
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const Profile = (() => {
  function render() {
    const user = Auth.currentUser();
    const completed = READING_HISTORY.filter((h) => h.progress === 100).length;
    const totalReviews = BOOKS.reduce(
      (s, b) => s + b.reviews.filter((r) => r.user === user.name).length,
      0,
    );
    const myRequests = REQUESTS.filter((r) =>
      r.user.startsWith(user.name.split(" ")[0]),
    ).length;

    /* Most-read category from reading history */
    const catCounts = {};
    READING_HISTORY.forEach((h) => {
      const b = BOOKS.find((x) => x.id === h.bookId);
      if (b) catCounts[b.cat] = (catCounts[b.cat] || 0) + 1;
    });
    const favCat =
      Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0] ||
      "N/A";

    return `
    <!-- ── Profile header ── -->
    <div class="profile-header">
      <div class="avatar-lg">${user.initials}</div>
      <div>
        <div class="profile-name">${user.name}</div>
        <div class="profile-meta">${user.role} · Member since January 2026</div>
        <div style="margin-top:8px;display:flex;gap:8px;">
          <span class="badge badge-success">Active Account</span>
          <span class="badge badge-info">${user.role}</span>
        </div>
      </div>
      <button class="btn btn-outline btn-sm" style="margin-left:auto;"
        onclick="UI.showToast('Profile photo upload coming soon!')">
        📷 Change Photo
      </button>
    </div>

    <div class="two-col">

      <!-- Account settings form -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">⚙️ Account Settings</div>
        </div>

        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="prof-name" value="${user.name}">
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="prof-email" value="${user.email || "user@textora.com"}">
        </div>
        <div class="form-group">
          <label>Account Type</label>
          <input type="text" value="${user.role}" disabled
            style="background:var(--surface);color:var(--text-muted);">
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" id="prof-pass" placeholder="Leave blank to keep current password">
        </div>
        <div class="form-group">
          <label>Confirm New Password</label>
          <input type="password" id="prof-pass2" placeholder="Repeat new password">
        </div>

        <div style="display:flex;gap:.75rem;">
          <button class="btn btn-primary btn-sm" onclick="Profile.saveSettings()">
            Save Changes
          </button>
          <button class="btn btn-outline btn-sm"
            onclick="UI.showToast('Changes discarded.')">
            Discard
          </button>
        </div>
      </div>

      <!-- Reading summary -->
      <div style="display:flex;flex-direction:column;gap:1.5rem;">

        <div class="card">
          <div class="card-header"><div class="card-title">📊 Reading Summary</div></div>
          ${[
            ["Books Started", READING_HISTORY.length, null],
            ["Completed", completed, null],
            ["Reviews Written", totalReviews, null],
            ["Requests Submitted", myRequests, null],
            ["Favourite Category", null, favCat],
          ]
            .map(
              ([label, val, badge]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;
               padding:.7rem 0;border-bottom:1px solid var(--surface2);">
            <span style="font-size:.88rem;color:var(--text-muted);">${label}</span>
            ${
              badge
                ? `<span class="badge badge-info">${badge}</span>`
                : `<b style="font-family:'Playfair Display',serif;font-size:1.2rem;">${val}</b>`
            }
          </div>`,
            )
            .join("")}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">🔔 Notifications</div></div>
          ${[
            ["Email on request status update", true],
            ["Email on new book in my category", false],
            ["Weekly reading digest", true],
          ]
            .map(
              ([label, checked], i) => `
          <div style="display:flex;justify-content:space-between;align-items:center;
               padding:.6rem 0;border-bottom:1px solid var(--surface2);">
            <span style="font-size:.88rem;">${label}</span>
            <label style="position:relative;display:inline-block;width:42px;height:22px;">
              <input type="checkbox" ${checked ? "checked" : ""}
                style="opacity:0;width:0;height:0;"
                onchange="UI.showToast('Notification preference saved.')">
              <span style="position:absolute;inset:0;background:${checked ? "var(--success)" : "var(--border)"};
                border-radius:11px;cursor:pointer;transition:.3s;"></span>
            </label>
          </div>`,
            )
            .join("")}
        </div>

      </div>
    </div>`;
  }

  /* ── Save account settings ── */
  function saveSettings() {
    const pass = document.getElementById("prof-pass").value;
    const pass2 = document.getElementById("prof-pass2").value;
    const name = document.getElementById("prof-name").value.trim();
    const email = document.getElementById("prof-email").value.trim();
    if (pass && pass !== pass2) {
      UI.showToast("⚠️ Passwords do not match.");
      return;
    }

    const payload = { name, email };
    if (pass) payload.password = pass;

    API.request("/users/me", {
      method: "PUT",
      body: payload,
      auth: true,
    })
      .then((response) => {
        const user = response?.data || {};
        if (Auth.currentUser()) {
          Auth.currentUser().name = user.name || name;
          Auth.currentUser().email = user.email || email;
          Auth.currentUser().initials =
            (Auth.currentUser().name || name)
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() || "")
              .join("") || Auth.currentUser().initials;
        }
        UI.showToast("✅ Account settings saved successfully!");
      })
      .catch((error) => {
        UI.showToast(error.message || "⚠️ Unable to save profile.");
      });
  }

  return { render, saveSettings };
})();
