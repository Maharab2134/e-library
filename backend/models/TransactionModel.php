<?php
// ============================================================
// models/TransactionModel.php
// Reading progress / history tracking
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

require_once __DIR__ . '/../config/database.php';

class TransactionModel {

    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /** Get all books a user has started reading. */
    public function getByUser(int $userId): array {
        $stmt = $this->db->prepare(
            'SELECT t.book_id, t.progress, t.started_at, t.last_read_at,
                    b.title, b.cover_emoji, b.cover_color,
                    GROUP_CONCAT(DISTINCT a.name SEPARATOR ", ") AS authors
               FROM transactions t
               JOIN books b ON b.id = t.book_id
          LEFT JOIN book_authors ba ON ba.book_id = b.id
          LEFT JOIN authors a ON a.id = ba.author_id
              WHERE t.user_id = ?
           GROUP BY t.book_id, t.progress, t.started_at, t.last_read_at,
                    b.title, b.cover_emoji, b.cover_color
              ORDER BY t.last_read_at DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    /**
     * Create or update a reading record.
     * Called when a user opens a book or saves progress.
     */
    public function upsert(int $userId, int $bookId, int $progress): void {
        $stmt = $this->db->prepare(
            'INSERT INTO transactions (user_id, book_id, progress)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE progress = ?, last_read_at = NOW()'
        );
        $stmt->execute([$userId, $bookId, $progress, $progress]);
    }

    /** How many distinct users have read a book. */
    public function getReaderCount(int $bookId): int {
        $stmt = $this->db->prepare(
            'SELECT COUNT(DISTINCT user_id) FROM transactions WHERE book_id = ?'
        );
        $stmt->execute([$bookId]);
        return (int) $stmt->fetchColumn();
    }
}