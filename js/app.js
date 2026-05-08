/* ============================================================
   app.js — Application bootstrap & global event wiring
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

(async function bootstrap() {
  /* ── Keyboard shortcuts ── */
  document.addEventListener("keydown", (e) => {
    // Escape: close any open modal or reader
    if (e.key === "Escape") {
      ["book-modal", "review-modal"].forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.classList.contains("open")) UI.closeModal(id);
      });
      const reader = document.getElementById("reader");
      if (reader && reader.classList.contains("open")) Reader.close();
    }
  });

  /* ── Prevent form submission on Enter inside modals ── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT") {
      const modal = e.target.closest(".modal");
      if (modal) e.preventDefault();
    }
  });

  /* ── Global error handler (graceful degradation) ── */
  window.addEventListener("error", (e) => {
    console.error("[Textora Error]", e.message);
  });

  await AppData.init();
  const sessionUser = await Auth.restoreSession();
  if (!sessionUser) {
    UI.showPage("page-login");
  }

  console.log(
    "%c📚 Textora E-Library",
    "color:#c8a96e;font-size:1.2rem;font-weight:bold;",
  );
  console.log(
    "%cUITS · Software Engineering Lab 2026",
    "color:#6b6860;font-size:.85rem;",
  );
  console.log("App initialised. Sign in to begin.");
})();
