<?php
// ============================================================
// controllers/ReviewController.php
// GET    /books/:id/reviews  — list reviews for a book
// POST   /books/:id/reviews  — submit a review (auth)
// DELETE /reviews/:id        — delete (admin or own review)
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

require_once __DIR__ . '/../models/ReviewModel.php';
require_once __DIR__ . '/../models/BookModel.php';
require_once __DIR__ . '/../middleware/Auth.php';
require_once __DIR__ . '/../middleware/Response.php';

class ReviewController {

    private ReviewModel $reviews;
    private BookModel   $books;

    public function __construct() {
        $this->reviews = new ReviewModel();
        $this->books   = new BookModel();
    }

    // ── GET /books/:id/reviews ──────────────────────────────
    public function index(int $bookId): never {
        $book = $this->books->findById($bookId);
        if (!$book) Response::notFound('Book not found.');

        Response::success($this->reviews->getByBook($bookId));
    }

    // ── POST /books/:id/reviews ─────────────────────────────
    public function store(int $bookId): never {
        $user = AuthMiddleware::require();

        $book = $this->books->findById($bookId);
        if (!$book) Response::notFound('Book not found.');

        if ($this->reviews->userHasReviewed((int)$user['id'], $bookId)) {
            Response::error('You have already submitted a review for this book.', 409);
        }

        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $rating = (int) ($body['rating'] ?? 0);
        $text   = trim($body['review_text'] ?? '');

        if ($rating < 1 || $rating > 5) Response::error('Rating must be between 1 and 5.');
        if (strlen($text) < 3)          Response::error('Review text is too short.');

        $id = $this->reviews->create((int)$user['id'], $bookId, $rating, $text);
        Response::created(['id' => $id], 'Review submitted successfully.');
    }

    // ── DELETE /reviews/:id ─────────────────────────────────
    public function destroy(int $reviewId): never {
        $user = AuthMiddleware::require();

        // Admin can delete any review; users can only delete their own
        if ($user['role'] === 'admin') {
            $this->reviews->deleteByAdmin($reviewId);
        } else {
            // Fetch review first to check ownership
            $db   = \Database::getInstance();
            $stmt = $db->prepare('SELECT user_id FROM reviews WHERE id = ?');
            $stmt->execute([$reviewId]);
            $row  = $stmt->fetch();

            if (!$row) Response::notFound('Review not found.');
            if ((int)$row['user_id'] !== (int)$user['id']) Response::forbidden();

            $this->reviews->delete($reviewId);
        }

        Response::success(null, 'Review deleted.');
    }
}