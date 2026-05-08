<?php
// ============================================================
// controllers/BookController.php
// GET  /books            — paginated list with search/filter
// GET  /books/:id        — single book with reviews
// POST /books            — admin: create (multipart with file)
// PUT  /books/:id        — admin: update metadata
// DELETE /books/:id      — admin: delete
// POST /books/:id/read   — record a read session (auth)
// POST /books/:id/progress — save reading progress (auth)
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

require_once __DIR__ . '/../models/BookModel.php';
require_once __DIR__ . '/../models/ReviewModel.php';
require_once __DIR__ . '/../models/TransactionModel.php';
require_once __DIR__ . '/../middleware/Auth.php';
require_once __DIR__ . '/../middleware/Response.php';
require_once __DIR__ . '/../config/config.php';

class BookController {

    private BookModel        $books;
    private ReviewModel      $reviews;
    private TransactionModel $transactions;

    public function __construct() {
        $this->books        = new BookModel();
        $this->reviews      = new ReviewModel();
        $this->transactions = new TransactionModel();
    }

    // ── GET /books ──────────────────────────────────────────
    public function index(): never {
        $page   = max(1, (int) ($_GET['page']   ?? 1));
        $limit  = min(50, max(1, (int) ($_GET['limit']  ?? DEFAULT_PAGE_SIZE)));
        $search = trim($_GET['search'] ?? '');
        $catId  = (int) ($_GET['category'] ?? 0);
        $sort   = $_GET['sort'] ?? 'created_at';
        $dir    = $_GET['dir']  ?? 'DESC';

        $items = $this->books->getAll($page, $limit, $search, $catId, $sort, $dir);
        $total = $this->books->getCount($search, $catId);

        Response::success([
            'books'       => $items,
            'total'       => $total,
            'page'        => $page,
            'total_pages' => (int) ceil($total / $limit),
        ]);
    }

    // ── GET /books/:id ──────────────────────────────────────
    public function show(int $id): never {
        $book = $this->books->findById($id);
        if (!$book) Response::notFound('Book not found.');

        $book['reviews'] = $this->reviews->getByBook($id);
        Response::success($book);
    }

    // ── POST /books ─────────────────────────────────────────
    public function store(): never {
        $admin = AuthMiddleware::requireAdmin();

        // metadata comes as regular POST fields (multipart form)
        $title    = trim($_POST['title']       ?? '');
        $catId    = (int) ($_POST['category_id'] ?? 0);
        $author   = trim($_POST['author']      ?? '');

        if (!$title)  Response::error('Book title is required.');
        if (!$catId)  Response::error('Category is required.');

        $data = [
            'title'        => $title,
            'isbn'         => trim($_POST['isbn']         ?? ''),
            'description'  => trim($_POST['description']  ?? ''),
            'category_id'  => $catId,
            'year'         => (int) ($_POST['year']       ?? date('Y')),
            'cover_emoji'  => trim($_POST['cover_emoji']  ?? '📚'),
            'cover_color'  => trim($_POST['cover_color']  ?? '#1a1a2e'),
            'uploaded_by'  => $admin['id'],
        ];

        $bookId = $this->books->create($data);
        if ($author !== '') {
            $this->books->syncAuthors($bookId, $author);
        }

        // Handle optional file upload
        if (!empty($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $path = $this->handleUpload($_FILES['file'], $bookId);
            $this->books->updateFilePath($bookId, $path);
        }

        $book = $this->books->findById($bookId);
        Response::created($book, 'Book added to catalog.');
    }

    // ── PUT /books/:id ──────────────────────────────────────
    public function update(int $id): never {
        AuthMiddleware::requireAdmin();

        $book = $this->books->findById($id);
        if (!$book) Response::notFound('Book not found.');

        $body = $this->json();
        $allowed = ['title','isbn','description','category_id','year','cover_emoji','cover_color','status'];
        $data    = array_intersect_key($body, array_flip($allowed));
        $author  = trim($body['author'] ?? '');

        if (empty($data)) Response::error('No valid fields to update.');

        $this->books->update($id, $data);
        if ($author !== '') {
            $this->books->syncAuthors($id, $author);
        }
        Response::success($this->books->findById($id), 'Book updated.');
    }

    // ── DELETE /books/:id ───────────────────────────────────
    public function destroy(int $id): never {
        AuthMiddleware::requireAdmin();

        $book = $this->books->findById($id);
        if (!$book) Response::notFound('Book not found.');

        // Delete physical file if exists
        if ($book['file_path']) {
            $fullPath = UPLOAD_DIR . basename($book['file_path']);
            if (file_exists($fullPath)) unlink($fullPath);
        }

        $this->books->delete($id);
        Response::success(null, 'Book deleted from catalog.');
    }

    // ── POST /books/:id/read ─────────────────────────────────
    public function read(int $id): never {
        $user = AuthMiddleware::require();
        $book = $this->books->findById($id);
        if (!$book) Response::notFound('Book not found.');

        // Increment global read counter
        $this->books->incrementReads($id);

        // Start / update transaction at progress=0 if first time
        $this->transactions->upsert((int)$user['id'], $id, 0);

        Response::success(['file_url' => UPLOAD_URL . basename($book['file_path'] ?? '')],
                          'Reading session started.');
    }

    // ── POST /books/:id/progress ─────────────────────────────
    public function saveProgress(int $id): never {
        $user     = AuthMiddleware::require();
        $body     = $this->json();
        $progress = min(100, max(0, (int)($body['progress'] ?? 0)));

        $this->transactions->upsert((int)$user['id'], $id, $progress);
        Response::success(['progress' => $progress], 'Progress saved.');
    }

    // ── File upload helper ───────────────────────────────────
    private function handleUpload(array $file, int $bookId): string {
        if ($file['size'] > MAX_FILE_SIZE) {
            Response::error('File too large. Maximum size is 50 MB.');
        }
        $mime = mime_content_type($file['tmp_name']);
        if (!in_array($mime, ALLOWED_TYPES)) {
            Response::error('Only PDF and EPUB files are allowed.');
        }
        $ext      = $mime === 'application/pdf' ? 'pdf' : 'epub';
        $filename = "book_{$bookId}_" . bin2hex(random_bytes(6)) . ".{$ext}";
        $dest     = UPLOAD_DIR . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            Response::serverError('Failed to save uploaded file.');
        }
        return $filename;
    }

    private function json(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
}