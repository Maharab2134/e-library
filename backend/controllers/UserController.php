<?php
// ============================================================
// controllers/UserController.php
// GET  /users              — admin: list all users
// PUT  /users/:id/status   — admin: activate / deactivate
// GET  /users/me/history   — user: reading history
// PUT  /users/me           — user: update own profile
// GET  /admin/stats        — admin: dashboard statistics
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

require_once __DIR__ . '/../models/UserModel.php';
require_once __DIR__ . '/../models/TransactionModel.php';
require_once __DIR__ . '/../models/RequestModel.php';
require_once __DIR__ . '/../models/BookModel.php';
require_once __DIR__ . '/../middleware/Auth.php';
require_once __DIR__ . '/../middleware/Response.php';

class UserController {

    private UserModel        $users;
    private TransactionModel $transactions;
    private RequestModel     $requests;
    private BookModel        $books;

    public function __construct() {
        $this->users        = new UserModel();
        $this->transactions = new TransactionModel();
        $this->requests     = new RequestModel();
        $this->books        = new BookModel();
    }

    // ── GET /users  (admin) ─────────────────────────────────
    public function index(): never {
        AuthMiddleware::requireAdmin();
        $page = max(1, (int)($_GET['page'] ?? 1));
        Response::success([
            'users' => $this->users->getAll($page),
            'total' => $this->users->getTotalCount(),
        ]);
    }

    // ── PUT /users/:id/status  (admin) ──────────────────────
    public function updateStatus(int $id): never {
        AuthMiddleware::requireAdmin();
        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = $body['status'] ?? '';

        if (!in_array($status, ['active','inactive'])) {
            Response::error('Status must be "active" or "inactive".');
        }

        $user = $this->users->findById($id);
        if (!$user) Response::notFound('User not found.');

        $this->users->updateStatus($id, $status);
        Response::success(null, "User account {$status}d.");
    }

    // ── GET /users/me/history  (authenticated) ──────────────
    public function history(): never {
        $user = AuthMiddleware::require();
        Response::success($this->transactions->getByUser((int)$user['id']));
    }

    // ── PUT /users/me  (authenticated) ──────────────────────
    public function updateMe(): never {
        $user = AuthMiddleware::require();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if (isset($body['password']) && strlen($body['password']) < 8) {
            Response::error('Password must be at least 8 characters.');
        }
        if (isset($body['email']) && !filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email address.');
        }

        $this->users->update((int)$user['id'], $body);
        Response::success($this->users->findById((int)$user['id']), 'Profile updated.');
    }

    // ── GET /admin/stats  (admin) ───────────────────────────
    public function stats(): never {
        AuthMiddleware::requireAdmin();

        $db = \Database::getInstance();

        $totalBooks   = (int) $db->query('SELECT COUNT(*) FROM books')->fetchColumn();
        $totalUsers   = (int) $db->query('SELECT COUNT(*) FROM users WHERE role != "admin"')->fetchColumn();
        $totalReads   = (int) $db->query('SELECT SUM(total_reads) FROM books')->fetchColumn();
        $pendingReqs  = $this->requests->getPendingCount();

        // Top 5 books by reads
        $topBooks = $db->query(
            'SELECT id, title, cover_emoji, total_reads, avg_rating
               FROM books ORDER BY total_reads DESC LIMIT 5'
        )->fetchAll();

        // Books per category
        $catBreakdown = $db->query(
            'SELECT c.name, COUNT(b.id) AS count
               FROM categories c
          LEFT JOIN books b ON b.category_id = c.id
           GROUP BY c.id, c.name
           ORDER BY count DESC'
        )->fetchAll();

        // Recent activity (last 10 log entries)
        $activity = $db->query(
            'SELECT al.action, al.details, al.created_at, u.name AS user_name
               FROM activity_log al
          LEFT JOIN users u ON u.id = al.user_id
              ORDER BY al.created_at DESC LIMIT 10'
        )->fetchAll();

        Response::success(compact(
            'totalBooks','totalUsers','totalReads','pendingReqs',
            'topBooks','catBreakdown','activity'
        ));
    }
}