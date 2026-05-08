/* ============================================================
   data.js — Application data store (mock / seed data)
   Replace fetch() calls here to connect to a real backend.
   Textora E-Library · UITS Software Engineering Lab 2026
   ============================================================ */

const API =
  window.API ||
  (() => {
    const BASE_URL = (
      window.TEXTORA_API_BASE_URL || window.location.origin
    ).replace(/\/$/, "");

    function getToken() {
      return localStorage.getItem("textora_token") || "";
    }

    function setToken(token) {
      if (token) localStorage.setItem("textora_token", token);
      else localStorage.removeItem("textora_token");
    }

    async function request(path, options = {}) {
      const {
        method = "GET",
        body,
        auth = true,
        formData = false,
        headers = {},
      } = options;

      const requestHeaders = { ...headers };
      if (auth) {
        const token = getToken();
        if (token) requestHeaders.Authorization = `Bearer ${token}`;
      }
      if (!formData && body !== undefined && body !== null) {
        requestHeaders["Content-Type"] = "application/json";
      }

      const response = await fetch(`${BASE_URL}${path}`, {
        method,
        credentials: "include",
        headers: requestHeaders,
        body:
          body === undefined || body === null
            ? undefined
            : formData
              ? body
              : JSON.stringify(body),
      });

      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }
      }

      if (!response.ok) {
        const message =
          data?.error ||
          data?.message ||
          `Request failed with status ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.payload = data;
        throw error;
      }

      return data;
    }

    return { BASE_URL, request, getToken, setToken };
  })();

/* ── Books ── */
let BOOKS = [
  {
    id: 1,
    title: "Introduction to Algorithms",
    author: "Cormen, Leiserson",
    cat: "Technology",
    isbn: "978-0262033848",
    year: 2022,
    rating: 4.8,
    reads: 1240,
    cover: "#1a1a2e",
    emoji: "🖥️",
    status: "available",
    desc: "A comprehensive introduction to algorithms used by universities worldwide. Covers sorting, searching, graph algorithms, and complexity theory.",
    reviews: [
      {
        user: "Riya",
        rating: 5,
        text: "Absolutely essential for CS students. Dense but rewarding.",
        date: "Feb 12",
      },
      {
        user: "Oishi",
        rating: 4,
        text: "Great depth, though some sections are very mathematical.",
        date: "Jan 30",
      },
    ],
  },
  {
    id: 2,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cat: "Literature",
    isbn: "978-0141439518",
    year: 1813,
    rating: 4.9,
    reads: 3200,
    cover: "#8b4513",
    emoji: "📖",
    status: "available",
    desc: "Jane Austen's beloved novel exploring love, class, and society in Regency-era England through the witty Elizabeth Bennet.",
    reviews: [
      {
        user: "Sarija",
        rating: 5,
        text: "Timeless. Austen's wit is unmatched.",
        date: "Mar 1",
      },
    ],
  },
  {
    id: 3,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    cat: "Science",
    isbn: "978-0553380163",
    year: 1988,
    rating: 4.7,
    reads: 2800,
    cover: "#0a3d62",
    emoji: "🌌",
    status: "available",
    desc: "Hawking's landmark work explains cosmology — black holes, the Big Bang, and the nature of time — for general readers.",
    reviews: [
      {
        user: "Riya",
        rating: 5,
        text: "Mind-bending. Must-read for science lovers.",
        date: "Feb 5",
      },
    ],
  },
  {
    id: 4,
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    cat: "Mathematics",
    isbn: "978-1285741550",
    year: 2020,
    rating: 4.5,
    reads: 980,
    cover: "#145a32",
    emoji: "∫",
    status: "available",
    desc: "The gold standard calculus textbook covering limits, derivatives, integrals, and series with clear explanations.",
    reviews: [],
  },
  {
    id: 5,
    title: "The Art of War",
    author: "Sun Tzu",
    cat: "History",
    isbn: "978-1599869773",
    year: 500,
    rating: 4.6,
    reads: 4100,
    cover: "#7b241c",
    emoji: "⚔️",
    status: "available",
    desc: "Ancient Chinese military treatise that has influenced Eastern and Western thinking on strategy and conflict.",
    reviews: [
      {
        user: "Oishi",
        rating: 4,
        text: "Surprisingly relevant to modern life and business.",
        date: "Jan 15",
      },
    ],
  },
  {
    id: 6,
    title: "Clean Code",
    author: "Robert C. Martin",
    cat: "Technology",
    isbn: "978-0132350884",
    year: 2008,
    rating: 4.6,
    reads: 1560,
    cover: "#154360",
    emoji: "⚙️",
    status: "available",
    desc: "A handbook of agile software craftsmanship. Teaches practical techniques for writing readable, maintainable code.",
    reviews: [],
  },
  {
    id: 7,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    cat: "History",
    isbn: "978-0062316097",
    year: 2011,
    rating: 4.8,
    reads: 5200,
    cover: "#4a235a",
    emoji: "🧠",
    status: "available",
    desc: "A brief history of humankind — from the Stone Age to the modern era, examining how Homo sapiens came to dominate Earth.",
    reviews: [
      {
        user: "Sarija",
        rating: 5,
        text: "Completely changed how I see human history.",
        date: "Feb 20",
      },
    ],
  },
  {
    id: 8,
    title: "The Elements of Style",
    author: "Strunk & White",
    cat: "Literature",
    isbn: "978-0205309023",
    year: 1959,
    rating: 4.4,
    reads: 720,
    cover: "#784212",
    emoji: "✍️",
    status: "available",
    desc: "The classic guide to English writing style, grammar, and usage. Essential for every writer.",
    reviews: [],
  },
  {
    id: 9,
    title: "Discrete Mathematics",
    author: "Kenneth Rosen",
    cat: "Mathematics",
    isbn: "978-0073383095",
    year: 2018,
    rating: 4.3,
    reads: 640,
    cover: "#1a5276",
    emoji: "∑",
    status: "available",
    desc: "Covers graph theory, logic, number theory, and combinatorics. A staple for computer science students.",
    reviews: [],
  },
  {
    id: 10,
    title: "Physics for Scientists",
    author: "Serway & Jewett",
    cat: "Science",
    isbn: "978-1337553292",
    year: 2019,
    rating: 4.4,
    reads: 870,
    cover: "#212f3c",
    emoji: "⚡",
    status: "available",
    desc: "Comprehensive introductory physics text covering mechanics, electromagnetism, thermodynamics, and modern physics.",
    reviews: [],
  },
  {
    id: 11,
    title: "Digital Arts Compendium",
    author: "Adobe Creative",
    cat: "Arts",
    isbn: "978-0134491820",
    year: 2021,
    rating: 4.2,
    reads: 450,
    cover: "#6c2d8a",
    emoji: "🎨",
    status: "available",
    desc: "A complete guide to digital illustration, photography, and design fundamentals for aspiring digital artists.",
    reviews: [],
  },
  {
    id: 12,
    title: "Engineering Mechanics",
    author: "Hibbeler R.C.",
    cat: "Engineering",
    isbn: "978-0133915426",
    year: 2016,
    rating: 4.5,
    reads: 910,
    cover: "#1e4d2b",
    emoji: "🔧",
    status: "available",
    desc: "The most widely used engineering mechanics textbook. Covers statics, dynamics, and structural analysis.",
    reviews: [],
  },
];

/* ── Book requests ── */
let REQUESTS = [
  {
    id: 1,
    user: "Riya S.",
    book: "Artificial Intelligence: A Modern Approach",
    author: "Russell & Norvig",
    reason: "Needed for AI course project",
    status: "pending",
    date: "Mar 10",
  },
  {
    id: 2,
    user: "Oishi J.",
    book: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    reason: "Literature assignment",
    status: "approved",
    date: "Feb 28",
  },
  {
    id: 3,
    user: "Ahmed K.",
    book: "Operating System Concepts",
    author: "Silberschatz",
    reason: "OS lab reference",
    status: "pending",
    date: "Mar 8",
  },
  {
    id: 4,
    user: "Fatema N.",
    book: "Database System Concepts",
    author: "Korth, Sudarshan",
    reason: "Database course",
    status: "rejected",
    date: "Feb 20",
  },
];

/* ── Registered users ── */
let USERS = [
  {
    id: 1,
    name: "Sumaiya Alam Riya",
    email: "riya@textora.com",
    role: "Student",
    joined: "Jan 2026",
    reads: 18,
    status: "active",
  },
  {
    id: 2,
    name: "Sarija Him",
    email: "sarija@textora.com",
    role: "Student",
    joined: "Jan 2026",
    reads: 12,
    status: "active",
  },
  {
    id: 3,
    name: "Jannatul Oishi",
    email: "oishi@textora.com",
    role: "Teacher",
    joined: "Dec 2025",
    reads: 34,
    status: "active",
  },
  {
    id: 4,
    name: "Ahmed Karim",
    email: "ahmed@textora.com",
    role: "Student",
    joined: "Feb 2026",
    reads: 7,
    status: "active",
  },
  {
    id: 5,
    name: "Fatema Noor",
    email: "fatema@textora.com",
    role: "Student",
    joined: "Feb 2026",
    reads: 3,
    status: "inactive",
  },
];

/* ── Current user's reading history ── */
let READING_HISTORY = [
  { bookId: 3, progress: 75, lastRead: "Today" },
  { bookId: 7, progress: 100, lastRead: "Feb 28" },
  { bookId: 1, progress: 42, lastRead: "Feb 20" },
  { bookId: 2, progress: 100, lastRead: "Jan 15" },
];

/* ── Reader chapter content ── */
let CHAPTERS = [
  {
    title: "Chapter 1: Introduction",
    content: `<h2>Chapter 1: Introduction</h2>
    <p>Welcome to this remarkable journey through knowledge. This text has been carefully curated and digitised
    for the Textora E-Library platform, allowing readers across the institution to access it from any device.</p>
    <p>The study of this subject requires patience, dedication, and an open mind. Throughout the following pages,
    we will explore concepts that have shaped human understanding and continue to influence modern thought.</p>
    <p>This chapter establishes the foundational vocabulary and context necessary for deeper engagement with later
    sections. Readers are encouraged to take notes and revisit difficult passages.</p>
    <p>The author's approach is systematic yet accessible, building from first principles to complex applications.
    By the end of this chapter you should have a solid grounding in the core themes of the work.</p>`,
  },
  {
    title: "Chapter 2: Core Concepts",
    content: `<h2>Chapter 2: Core Concepts</h2>
    <p>Having established the introductory framework, we now turn to the core concepts that form the backbone
    of this discipline. These ideas have been refined over decades of research and practical application.</p>
    <p>The first key concept involves understanding the relationship between <em>structure</em> and
    <em>function</em>. In any complex system, the way components are organised determines how the whole behaves.</p>
    <p>Second, we examine the role of <em>iteration</em>: how repeated processes, each building on the last,
    lead to exponential improvement. This pattern appears throughout nature, technology, and human organisation.</p>
    <p>Third, <em>abstraction</em> — the ability to work with simplified representations of complex realities —
    enables us to reason about problems that would otherwise be intractable.</p>`,
  },
  {
    title: "Chapter 3: Methods & Applications",
    content: `<h2>Chapter 3: Methods &amp; Applications</h2>
    <p>Theory becomes powerful only when applied. In this chapter we bridge the conceptual world of Chapter 2
    with real-world problems and the methods used to solve them.</p>
    <h3>3.1 Analytical Decomposition</h3>
    <p>Breaking a complex problem into smaller, manageable sub-problems. Each sub-problem is solved independently,
    and the solutions are composed into a final answer.</p>
    <h3>Case Study 3.1</h3>
    <p>A university library digitisation project used these exact techniques to catalogue over 50,000 physical
    books into a searchable database within six months, achieving 99.7 % accuracy.</p>
    <h3>3.2 Empirical Evaluation</h3>
    <p>Testing hypotheses against real data. No theoretical model, however elegant, can substitute for evidence
    gathered from the world.</p>`,
  },
  {
    title: "Chapter 4: Advanced Topics",
    content: `<h2>Chapter 4: Advanced Topics</h2>
    <p>The advanced material in this chapter is intended for readers who have thoroughly absorbed the preceding
    three chapters. If concepts feel unfamiliar, a review is recommended before proceeding.</p>
    <p>We begin with <em>emergent complexity</em> — how simple rules followed by many independent agents give rise
    to sophisticated global patterns. Familiar examples include traffic flow, market behaviour, and language.</p>
    <p>Next we examine <em>feedback loops</em>, both positive and negative. Negative feedback stabilises systems;
    positive feedback amplifies small changes and can lead to runaway growth or collapse.</p>
    <p>Understanding these dynamics equips practitioners to design more robust systems and anticipate failure
    modes before they occur.</p>`,
  },
  {
    title: "Chapter 5: Conclusion",
    content: `<h2>Chapter 5: Conclusion &amp; Further Reading</h2>
    <p>We have covered substantial ground in this text. From foundational definitions to advanced dynamics,
    the journey has illustrated both the depth and the breadth of this subject.</p>
    <p>The most important insight to carry forward: knowledge is not a static possession but a living practice.
    Every concept learned opens new questions; every answer reveals new horizons of inquiry.</p>
    <p>The author recommends exploring companion texts that expand on the themes introduced here. Your Textora
    account tracks your reading history — revisit this book any time from <em>My Reading</em>.</p>
    <p>Thank you for reading. The Textora team hopes this digital library continues to serve your academic and
    personal growth for years to come.</p>`,
  },
];

const AppData = (() => {
  let _sessionUser = null;
  let _initialised = false;
  let _initialisePromise = null;

  const CATEGORY_TO_ID = {
    Science: 1,
    Technology: 2,
    Literature: 3,
    History: 4,
    Mathematics: 5,
    Arts: 6,
    Engineering: 7,
  };

  function _titleCase(value) {
    return String(value || "")
      .replace(/[_-]+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function _formatDate(value) {
    if (!value) return "Today";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function _formatJoined(value) {
    if (!value) return "Jan 2026";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }

  function _normalizeBook(book) {
    const reviews = Array.isArray(book.reviews)
      ? book.reviews.map((review) => ({
          user: review.user_name || review.user || "Reader",
          rating: Number(review.rating || 0),
          text: review.review_text || review.text || "",
          date: _formatDate(review.created_at || review.date),
        }))
      : [];

    return {
      id: Number(book.id),
      title: book.title || "Untitled",
      author:
        book.authors || book.author || book.author_name || "Unknown author",
      cat: book.category || book.cat || "Uncategorized",
      isbn: book.isbn || "",
      year: Number(book.year || new Date().getFullYear()),
      rating: Number(book.avg_rating ?? book.rating ?? 0),
      reads: Number(book.total_reads ?? book.reads ?? 0),
      cover: book.cover_color || book.cover || "#1a1a2e",
      emoji: book.cover_emoji || book.emoji || "📚",
      status: book.status || "available",
      desc: book.description || book.desc || "",
      reviews,
    };
  }

  function _normalizeRequest(request) {
    return {
      id: Number(request.id),
      user: request.user_name || request.user || "Member",
      book: request.book_title || request.book || "",
      author: request.author_name || request.author || "",
      reason: request.reason || "",
      status: request.status || "pending",
      date: _formatDate(request.created_at || request.date),
    };
  }

  function _normalizeUser(user) {
    return {
      id: Number(user.id),
      name: user.name || "Unnamed user",
      email: user.email || "",
      role: _titleCase(user.role || "student"),
      joined: _formatJoined(user.created_at || user.joined),
      reads: Number(user.total_reads ?? user.reads ?? 0),
      status: user.status || "active",
    };
  }

  function _normalizeHistory(entry) {
    return {
      bookId: Number(entry.book_id || entry.bookId),
      progress: Number(entry.progress || 0),
      lastRead: _formatDate(
        entry.last_read_at || entry.started_at || entry.lastRead,
      ),
    };
  }

  function _copyArray(target, source) {
    target.splice(0, target.length, ...source);
  }

  async function _loadBooks() {
    const response = await API.request("/books?limit=100&page=1", {
      auth: false,
    });
    const books = Array.isArray(response?.data?.books)
      ? response.data.books.map(_normalizeBook)
      : [];
    if (books.length) _copyArray(BOOKS, books);
  }

  async function _loadRequestsForUser() {
    const response = await API.request("/requests/mine");
    const requests = Array.isArray(response?.data)
      ? response.data.map(_normalizeRequest)
      : [];
    if (requests.length) _copyArray(REQUESTS, requests);
    else REQUESTS.length = 0;
  }

  async function _loadRequestsForAdmin() {
    const response = await API.request("/requests");
    const requests = Array.isArray(response?.data?.requests)
      ? response.data.requests.map(_normalizeRequest)
      : [];
    _copyArray(REQUESTS, requests);
  }

  async function _loadUsers() {
    const response = await API.request("/users");
    const users = Array.isArray(response?.data?.users)
      ? response.data.users.map(_normalizeUser)
      : [];
    _copyArray(USERS, users);
  }

  async function _loadHistory() {
    const response = await API.request("/users/me/history");
    const history = Array.isArray(response?.data)
      ? response.data.map(_normalizeHistory)
      : [];
    _copyArray(READING_HISTORY, history);
  }

  async function init() {
    if (_initialisePromise) return _initialisePromise;

    _initialisePromise = (async () => {
      try {
        await _loadBooks();
      } catch (error) {
        console.warn("Falling back to bundled book seed data.", error);
      }
      _initialised = true;
      return true;
    })();

    return _initialisePromise;
  }

  async function syncAuthenticatedData(user) {
    _sessionUser = user || _sessionUser;
    if (!_initialised) await init();

    if (!_sessionUser) return;

    try {
      if (String(_sessionUser.role).toLowerCase() === "admin") {
        await Promise.all([_loadRequestsForAdmin(), _loadUsers()]);
      } else {
        await Promise.all([_loadRequestsForUser(), _loadHistory()]);
      }
    } catch (error) {
      console.warn("Falling back to bundled dashboard data.", error);
    }
  }

  async function bootstrapSession() {
    if (!API.getToken()) return null;
    try {
      const response = await API.request("/auth/me");
      const user = response?.data || null;
      if (user) {
        _sessionUser = _normalizeUser({
          ...user,
          reads: 0,
          joined: user.created_at,
        });
        _sessionUser.role = _titleCase(user.role);
      }
      return user;
    } catch (error) {
      API.setToken("");
      return null;
    }
  }

  async function refreshBook(bookId) {
    try {
      const response = await API.request(`/books/${bookId}`, { auth: false });
      const book = _normalizeBook(response?.data || {});
      const index = BOOKS.findIndex((item) => item.id === book.id);
      if (index > -1) BOOKS.splice(index, 1, book);
      else BOOKS.unshift(book);
      return book;
    } catch (error) {
      return null;
    }
  }

  async function refreshCurrentRequests() {
    if (!_sessionUser) return;
    if (String(_sessionUser.role).toLowerCase() === "admin")
      await _loadRequestsForAdmin();
    else await _loadRequestsForUser();
  }

  async function refreshCurrentHistory() {
    await _loadHistory();
  }

  async function refreshUsers() {
    if (String(_sessionUser?.role).toLowerCase() !== "admin") return;
    await _loadUsers();
  }

  async function recordRead(bookId) {
    await API.request(`/books/${bookId}/read`, {
      method: "POST",
      body: {},
      auth: true,
    });
    await refreshBook(bookId);
    await refreshCurrentHistory().catch(() => {});
  }

  async function saveProgress(bookId, progress) {
    await API.request(`/books/${bookId}/progress`, {
      method: "POST",
      body: { progress },
      auth: true,
    });
    await refreshCurrentHistory().catch(() => {});
  }

  async function submitReview(bookId, payload) {
    await API.request(`/books/${bookId}/reviews`, {
      method: "POST",
      body: payload,
      auth: true,
    });
    await refreshBook(bookId);
  }

  async function submitRequest(payload) {
    const response = await API.request("/requests", {
      method: "POST",
      body: payload,
      auth: true,
    });
    await refreshCurrentRequests();
    return response?.data || null;
  }

  async function updateRequest(requestId, status, comment = "") {
    await API.request(`/requests/${requestId}`, {
      method: "PUT",
      body: { status, comment },
      auth: true,
    });
    await refreshCurrentRequests();
  }

  async function toggleUser(userId, status) {
    await API.request(`/users/${userId}/status`, {
      method: "PUT",
      body: { status },
      auth: true,
    });
    await refreshUsers();
  }

  async function saveBook(payload, editingId = null) {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("author", payload.author || "");
    formData.append("isbn", payload.isbn || "");
    formData.append("description", payload.description || "");
    formData.append(
      "category_id",
      String(CATEGORY_TO_ID[payload.category] || 0),
    );
    formData.append("year", String(payload.year || new Date().getFullYear()));
    formData.append("cover_emoji", payload.coverEmoji || "📚");
    formData.append("cover_color", payload.coverColor || "#1a1a2e");

    if (!editingId) {
      await API.request("/books", {
        method: "POST",
        body: formData,
        auth: true,
        formData: true,
      });
    } else {
      await API.request(`/books/${editingId}`, {
        method: "PUT",
        body: {
          title: payload.title,
          author: payload.author || "",
          isbn: payload.isbn || "",
          description: payload.description || "",
          category_id: CATEGORY_TO_ID[payload.category] || 0,
          year: payload.year || new Date().getFullYear(),
          cover_emoji: payload.coverEmoji || "📚",
          cover_color: payload.coverColor || "#1a1a2e",
        },
        auth: true,
      });
    }

    await _loadBooks();
  }

  async function deleteBook(bookId) {
    await API.request(`/books/${bookId}`, { method: "DELETE", auth: true });
    await _loadBooks();
  }

  return {
    init,
    syncAuthenticatedData,
    bootstrapSession,
    refreshBook,
    refreshCurrentRequests,
    refreshCurrentHistory,
    refreshUsers,
    recordRead,
    saveProgress,
    submitReview,
    submitRequest,
    updateRequest,
    toggleUser,
    saveBook,
    deleteBook,
    setSessionUser(user) {
      _sessionUser = user;
    },
    getSessionUser() {
      return _sessionUser;
    },
  };
})();

window.AppData = AppData;
