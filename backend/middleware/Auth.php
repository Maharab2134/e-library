<?php
// ============================================================
// middleware/Auth.php
// Token-based authentication middleware
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';

class AuthMiddleware {

    /**
     * Require a valid Bearer token.
     * Returns the user row on success; sends 401 and exits on failure.
     */
    public static function require(): array {
        $token = self::extractToken();
        if (!$token) {
            self::abort(401, 'No authentication token provided.');
        }
        $user = self::validate($token);
        if (!$user) {
            self::abort(401, 'Invalid or expired token. Please sign in again.');
        }
        if ($user['status'] !== 'active') {
            self::abort(403, 'Your account has been deactivated. Contact an administrator.');
        }
        return $user;
    }

    /**
     * Require admin role. Calls require() first, then checks role.
     */
    public static function requireAdmin(): array {
        $user = self::require();
        if ($user['role'] !== 'admin') {
            self::abort(403, 'Administrator privileges required.');
        }
        return $user;
    }

    /**
     * Non-blocking check — returns user array or null.
     */
    public static function optional(): ?array {
        $token = self::extractToken();
        if (!$token) return null;
        return self::validate($token);
    }

    // ── Private helpers ──────────────────────────────────────

    private static function extractToken(): ?string {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
            return trim($m[1]);
        }
        return null;
    }

    private static function validate(string $token): ?array {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT u.id, u.name, u.email, u.role, u.status
               FROM sessions s
               JOIN users    u ON u.id = s.user_id
              WHERE s.token      = ?
                AND s.expires_at > NOW()'
        );
        $stmt->execute([$token]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    private static function abort(int $code, string $message): never {
        http_response_code($code);
        echo json_encode(['error' => $message]);
        exit;
    }
}