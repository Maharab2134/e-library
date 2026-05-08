<?php
// ============================================================
// models/ReviewModel.php
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

require_once __DIR__ . '/../config/database.php';

class ReviewModel {

    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByBook(int $bookId): array {
        $stmt = $this->db->prepare(
            'SELECT r.id, r.rating, r.review_text, r.created_at,
                    u.name AS user_name
               FROM reviews r
               JOIN users u ON u.id = r.user_id
              WHERE r.book_id = ?
              ORDER BY r.created_at DESC'
        );
        $stmt->execute([$bookId]);
        return $stmt->fetchAll();
    }

    public function getByUser(int $userId): array {
        $stmt = $this->db->prepare(
            'SELECT r.id, r.rating, r.review_text, r.created_at,
                    b.title AS book_title, b.id AS book_id
               FROM reviews r
               JOIN books b ON b.id = r.book_id
              WHERE r.user_id = ?
              ORDER BY r.created_at DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function userHasReviewed(int $userId, int $bookId): bool {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) FROM reviews WHERE user_id = ? AND book_id = ?'
        );
        $stmt->execute([$userId, $bookId]);
        return (int) $stmt->fetchColumn() > 0;
    }

    public function create(int $userId, int $bookId, int $rating, string $text): int {
        $stmt = $this->db->prepare(
            'INSERT INTO reviews (user_id, book_id, rating, review_text)
             VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$userId, $bookId, $rating, $text]);
        return (int) $this->db->lastInsertId();
    }

    public function delete(int $reviewId): bool {
        return $this->db->prepare('DELETE FROM reviews WHERE id = ?')
                        ->execute([$reviewId]);
    }

    public function deleteByAdmin(int $reviewId): bool {
        // Admin can delete any review (no user_id check)
        return $this->delete($reviewId);
    }
}