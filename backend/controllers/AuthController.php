<?php
// ============================================================
// controllers/AuthController.php
// Handles: POST /auth/register  POST /auth/login  POST /auth/logout
//          GET  /auth/me
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

require_once __DIR__ . '/../models/UserModel.php';
require_once __DIR__ . '/../middleware/Auth.php';
require_once __DIR__ . '/../middleware/Response.php';

class AuthController {

    private UserModel $users;

    public function __construct() {
        $this->users = new UserModel();
    }

    // ── POST /auth/register ─────────────────────────────────
    public function register(): never {
        $body = $this->json();

        $name     = trim($body['name']     ?? '');
        $email    = trim($body['email']    ?? '');
        $password = trim($body['password'] ?? '');
        $role     = in_array($body['role'] ?? '', ['student','teacher','reader'])
                    ? $body['role'] : 'student';

        // Validation
        $errors = [];
        if (strlen($name) < 2)        $errors['name']     = 'Name must be at least 2 characters.';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Invalid email address.';
        if (strlen($password) < 8)    $errors['password'] = 'Password must be at least 8 characters.';

        if ($errors) Response::error('Validation failed.', 422, $errors);

        if ($this->users->findByEmail($email)) {
            Response::error('An account with this email already exists.', 409);
        }

        $id    = $this->users->create($name, $email, $password, $role);
        $token = $this->users->createSession($id);
        $user  = $this->users->findById($id);

        Response::created([
            'token' => $token,
            'user'  => $this->sanitize($user),
        ], 'Account created successfully.');
    }

    // ── POST /auth/login ────────────────────────────────────
    public function login(): never {
        $body  = $this->json();
        $email = trim($body['email']    ?? '');
        $pass  = trim($body['password'] ?? '');

        if (!$email || !$pass) {
            Response::error('Email and password are required.');
        }

        $user = $this->users->findByEmail($email);

        if (!$user || !password_verify($pass, $user['password_hash'])) {
            Response::error('Invalid email or password.', 401);
        }
        if ($user['status'] !== 'active') {
            Response::error('Your account has been deactivated.', 403);
        }

        $token = $this->users->createSession((int) $user['id']);

        Response::success([
            'token' => $token,
            'user'  => $this->sanitize($user),
        ], 'Login successful.');
    }

    // ── POST /auth/logout ───────────────────────────────────
    public function logout(): never {
        $user = AuthMiddleware::require();
        // Extract token from header to delete it
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        preg_match('/^Bearer\s+(.+)$/i', $header, $m);
        if (!empty($m[1])) {
            $this->users->deleteSession($m[1]);
        }
        Response::success(null, 'Logged out successfully.');
    }

    // ── GET /auth/me ────────────────────────────────────────
    public function me(): never {
        $user = AuthMiddleware::require();
        Response::success($this->sanitize($user));
    }

    // ── Helpers ─────────────────────────────────────────────

    private function json(): array {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    private function sanitize(array $user): array {
        unset($user['password_hash']);
        return $user;
    }
}