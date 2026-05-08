<?php
// ============================================================
// models/BookModel.php
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';

class BookModel {

    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // ── Queries ─────────────────────────────────────────────

    public function getAll(
        int    $page     = 1,
        int    $limit    = DEFAULT_PAGE_SIZE,
        string $search   = '',
        int    $catId    = 0,
        string $sort     = 'created_at',
        string $dir      = 'DESC'
    ): array {
        $offset    = ($page - 1) * $limit;
        $where     = ['b.status = "available"'];
        $params    = [];

        if ($search !== '') {
            $where[]  = '(b.title LIKE ? OR b.description LIKE ? OR a.name LIKE ?)';
            $like     = "%{$search}%";
            $params[] = $like; $params[] = $like; $params[] = $like;
        }
        if ($catId > 0) {
            $where[]  = 'b.category_id = ?';
            $params[] = $catId;
        }

        $allowedSort = ['title','avg_rating','total_reads','year','created_at'];
        $sortCol     = in_array($sort, $allowedSort) ? $sort : 'created_at';
        $dirSql      = strtoupper($dir) === 'ASC' ? 'ASC' : 'DESC';
        $whereSql    = 'WHERE ' . implode(' AND ', $where);

        $sql = "SELECT b.id, b.title, b.isbn, b.description, b.year,
                       b.file_path, b.cover_emoji, b.cover_color,
                       b.avg_rating, b.total_reads, b.status,
                       c.name AS category,
                       GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') AS authors
                  FROM books b
                  JOIN categories c ON c.id = b.category_id
             LEFT JOIN book_authors ba ON ba.book_id = b.id
             LEFT JOIN authors a ON a.id = ba.author_id
                $whereSql
              GROUP BY b.id
              ORDER BY b.$sortCol $dirSql
                 LIMIT ? OFFSET ?";

        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getCount(string $search = '', int $catId = 0): int {
        $where  = ['b.status = "available"'];
        $params = [];

        if ($search !== '') {
            $where[]  = '(b.title LIKE ? OR b.description LIKE ?)';
            $like     = "%{$search}%";
            $params[] = $like; $params[] = $like;
        }
        if ($catId > 0) {
            $where[]  = 'b.category_id = ?';
            $params[] = $catId;
        }

        $sql  = 'SELECT COUNT(DISTINCT b.id) FROM books b WHERE ' . implode(' AND ', $where);
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare(
            "SELECT b.*, c.name AS category,
                    GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') AS authors
               FROM books b
               JOIN categories c ON c.id = b.category_id
          LEFT JOIN book_authors ba ON ba.book_id = b.id
          LEFT JOIN authors a ON a.id = ba.author_id
              WHERE b.id = ?
           GROUP BY b.id"
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    // ── Write ────────────────────────────────────────────────

    public function create(array $data): int {
        $stmt = $this->db->prepare(
            'INSERT INTO books (title, isbn, description, category_id, year,
                                file_path, cover_emoji, cover_color, uploaded_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['title'],
            $data['isbn']        ?? null,
            $data['description'] ?? null,
            $data['category_id'],
            $data['year']        ?? null,
            $data['file_path']   ?? null,
            $data['cover_emoji'] ?? '📚',
            $data['cover_color'] ?? '#1a1a2e',
            $data['uploaded_by'],
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $allowed = ['title','isbn','description','category_id','year','cover_emoji','cover_color','status'];
        $sets    = [];
        $values  = [];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $sets[]   = "$f = ?";
                $values[] = $data[$f];
            }
        }
        if (empty($sets)) return false;
        $values[] = $id;
        return $this->db->prepare(
            'UPDATE books SET ' . implode(', ', $sets) . ' WHERE id = ?'
        )->execute($values);
    }

    public function delete(int $id): bool {
        return $this->db->prepare('DELETE FROM books WHERE id = ?')->execute([$id]);
    }

    public function incrementReads(int $id): void {
        $this->db->prepare('UPDATE books SET total_reads = total_reads + 1 WHERE id = ?')
                 ->execute([$id]);
    }

    // ── File ────────────────────────────────────────────────

    public function updateFilePath(int $id, string $path): void {
        $this->db->prepare('UPDATE books SET file_path = ? WHERE id = ?')
                 ->execute([$path, $id]);
    }

    public function syncAuthors(int $bookId, string $authorNames): void {
        $names = array_values(array_filter(array_map('trim', preg_split('/[,;&]+/', $authorNames) ?: [])));

        $this->db->prepare('DELETE FROM book_authors WHERE book_id = ?')
                 ->execute([$bookId]);

        foreach ($names as $name) {
            if ($name === '') continue;

            $stmt = $this->db->prepare('SELECT id FROM authors WHERE name = ? LIMIT 1');
            $stmt->execute([$name]);
            $authorId = $stmt->fetchColumn();

            if (!$authorId) {
                $insert = $this->db->prepare('INSERT INTO authors (name) VALUES (?)');
                $insert->execute([$name]);
                $authorId = (int) $this->db->lastInsertId();
            }

            $link = $this->db->prepare('INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)');
            $link->execute([$bookId, (int) $authorId]);
        }
    }
}