/* ============================================================
   reviews.js — Book ratings & review submission
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const Reviews = (() => {
  let _targetBook = null;
  let _selectedStars = 0;

  /* ── Open review modal for a book ── */
  function openModal(bookId) {
    _targetBook = BOOKS.find((b) => b.id === bookId);
    _selectedStars = 0;

    if (!_targetBook) return;

    document.getElementById("review-modal-book").textContent =
      "Reviewing: " + _targetBook.title;
    document.getElementById("review-text").value = "";
    _renderStars();
    UI.openModal("review-modal");
  }

  /* ── Set star rating ── */
  function setStars(n) {
    _selectedStars = n;
    _renderStars();
  }

  function _renderStars() {
    document.querySelectorAll("#modal-stars span").forEach((s, i) => {
      s.classList.toggle("active", i < _selectedStars);
    });
  }

  /* ── Submit review ── */
  function submit() {
    if (!_selectedStars) {
      UI.showToast("⚠️ Please select a star rating.");
      return;
    }
    const text = document.getElementById("review-text").value.trim();
    if (!text) {
      UI.showToast("⚠️ Please write a review.");
      return;
    }

    AppData.submitReview(_targetBook.id, {
      rating: _selectedStars,
      review_text: text,
    })
      .then(() => AppData.refreshBook(_targetBook.id))
      .then(() => {
        UI.closeModal("review-modal");
        UI.showToast("✅ Review submitted successfully!");
        Router.refresh();
      })
      .catch((error) => {
        UI.showToast(error.message || "⚠️ Unable to submit review.");
      });
  }

  return { openModal, setStars, submit };
})();
