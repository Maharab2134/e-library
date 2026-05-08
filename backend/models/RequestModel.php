<?php
// ============================================================
// models/RequestModel.php
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

require_once __DIR__ . '/../config/database.php';

class RequestModel {

    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll(string $status = '', int $page = 1, int $limit = 20): array {
        $where  = [];
        $params = [];

        if ($status !== '') {
            $where[]  = 'r.status = ?';
            $params[] = $status;
        }

        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset   = ($page - 1) * $limit;

        $stmt = $this->db->prepare(
            "SELECT r.*, u.name AS user_name
               FROM requests r
               JOIN users u ON u.id = r.user_id
               $whereSql
              ORDER BY r.created_at DESC
              LIMIT ? OFFSET ?"
        );
        $params[] = $limit;
        $params[] = $offset;
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getByUser(int $userId): array {
        $stmt = $this->db->prepare(
            'SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM requests WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(int $userId, string $title, string $author, string $isbn, string $reason): int {
        $stmt = $this->db->prepare(
            'INSERT INTO requests (user_id, book_title, author_name, isbn, reason)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$userId, $title, $author, $isbn, $reason]);
        return (int) $this->db->lastInsertId();
    }

    public function updateStatus(int $id, string $status, int $adminId, string $comment = ''): bool {
        $stmt = $this->db->prepare(
            'UPDATE requests
                SET status = ?, admin_comment = ?, reviewed_by = ?, reviewed_at = NOW()
              WHERE id = ?'
        );
        return $stmt->execute([$status, $comment, $adminId, $id]);
    }

    public function getPendingCount(): int {
        return (int) $this->db->query(
            "SELECT COUNT(*) FROM requests WHERE status = 'pending'"
        )->fetchColumn();
    }
}