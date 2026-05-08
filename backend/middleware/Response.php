<?php
// ============================================================
// middleware/Response.php
// Standardised JSON response helpers
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

class Response {

    public static function json(mixed $data, int $status = 200): never {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'OK', int $status = 200): never {
        self::json(['success' => true, 'message' => $message, 'data' => $data], $status);
    }

    public static function created(mixed $data = null, string $message = 'Created'): never {
        self::success($data, $message, 201);
    }

    public static function error(string $message, int $status = 400, mixed $errors = null): never {
        $body = ['success' => false, 'error' => $message];
        if ($errors !== null) $body['errors'] = $errors;
        self::json($body, $status);
    }

    public static function notFound(string $message = 'Resource not found.'): never {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = 'Unauthorized.'): never {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Forbidden.'): never {
        self::error($message, 403);
    }

    public static function serverError(string $message = 'Internal server error.'): never {
        self::error($message, 500);
    }
}