/* ============================================================
   reader.js — In-browser book reader
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const Reader = (() => {
  let _book = null;
  let _page = 1;
  let _total = CHAPTERS.length;

  /* ── Open reader for a given book id ── */
  function open(bookId) {
    _book = BOOKS.find((b) => b.id === bookId);
    if (!_book) return;

    _page = 1;
    _total = CHAPTERS.length;

    document.getElementById("reader-book-title").textContent = _book.title;
    document.getElementById("reader").classList.add("open");

    _book.reads++; // increment read counter
    AppData.recordRead(bookId).catch(() => {});
    _renderPage();
  }

  /* ── Render the current chapter ── */
  function _renderPage() {
    const ch = CHAPTERS[_page - 1];

    document.getElementById("reader-body").innerHTML =
      ch.content + '<div style="height:3rem;"></div>';

    document.getElementById("reader-progress-text").textContent =
      `Page ${_page} of ${_total}`;

    document.getElementById("reader-footer-text").textContent = ch.title;

    const pct = Math.round((_page / _total) * 100);
    document.getElementById("reader-bar").style.width = pct + "%";

    // Scroll content back to top on page change
    document.getElementById("reader-body").scrollTop = 0;
  }

  /* ── Navigation ── */
  function next() {
    if (_page < _total) {
      _page++;
      _renderPage();
      AppData.saveProgress(_book.id, Math.round((_page / _total) * 100)).catch(
        () => {},
      );
    } else {
      AppData.saveProgress(_book.id, 100).catch(() => {});
      close();
      UI.showToast('📖 You have finished reading "' + _book.title + '"!');
    }
  }

  function prev() {
    if (_page > 1) {
      _page--;
      _renderPage();
    }
  }

  /* ── Close reader ── */
  function close() {
    document.getElementById("reader").classList.remove("open");
  }

  return { open, next, prev, close };
})();
