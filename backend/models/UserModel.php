<?php
// ============================================================
// models/UserModel.php
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';

class UserModel {

    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // ── Auth ────────────────────────────────────────────────

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([strtolower(trim($email))]);
        return $stmt->fetch() ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, role, status, created_at FROM users WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(string $name, string $email, string $password, string $role = 'student'): int {
        $stmt = $this->db->prepare(
            'INSERT INTO users (name, email, password_hash, role)
             VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([
            trim($name),
            strtolower(trim($email)),
            password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]),
            $role,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function createSession(int $userId): string {
        // Expire old sessions for this user
        $this->db->prepare('DELETE FROM sessions WHERE user_id = ?')->execute([$userId]);

        $token     = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + TOKEN_LIFETIME);

        $this->db->prepare(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
        )->execute([$userId, $token, $expiresAt]);

        return $token;
    }

    public function deleteSession(string $token): void {
        $this->db->prepare('DELETE FROM sessions WHERE token = ?')->execute([$token]);
    }

    // ── Admin: list all users ───────────────────────────────

    public function getAll(int $page = 1, int $limit = DEFAULT_PAGE_SIZE): array {
        $offset = ($page - 1) * $limit;
        $stmt   = $this->db->prepare(
            'SELECT id, name, email, role, status, created_at,
                    (SELECT COUNT(*) FROM transactions WHERE user_id = u.id) AS total_reads
               FROM users u
              ORDER BY created_at DESC
              LIMIT ? OFFSET ?'
        );
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll();
    }

    public function getTotalCount(): int {
        return (int) $this->db->query('SELECT COUNT(*) FROM users')->fetchColumn();
    }

    public function updateStatus(int $id, string $status): bool {
        $stmt = $this->db->prepare('UPDATE users SET status = ? WHERE id = ?');
        return $stmt->execute([$status, $id]);
    }

    public function update(int $id, array $fields): bool {
        $allowed = ['name', 'email'];
        $sets    = [];
        $values  = [];
        foreach ($allowed as $f) {
            if (isset($fields[$f])) {
                $sets[]   = "$f = ?";
                $values[] = $fields[$f];
            }
        }
        if (isset($fields['password']) && $fields['password'] !== '') {
            $sets[]   = 'password_hash = ?';
            $values[] = password_hash($fields['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        }
        if (empty($sets)) return false;
        $values[] = $id;
        $sql = 'UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = ?';
        return $this->db->prepare($sql)->execute($values);
    }
}