<?php
// ============================================================
// public/index.php
// Front controller — every request enters here.
// Point your web server document root at /public/
//
// Apache:  set DocumentRoot to .../textora-backend/public
// Nginx:   root .../textora-backend/public; try_files $uri /index.php;
// XAMPP:   drop the whole project inside htdocs/ and use .htaccess
//
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

declare(strict_types=1);

// ── Autoload config and core files ──────────────────────────
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/Response.php';


// ── CORS ────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
} else {
    header('Access-Control-Allow-Origin: ' . (ALLOWED_ORIGINS[0] ?? '*'));
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Pre-flight — browsers send OPTIONS before cross-origin requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Route the request ────────────────────────────────────────
try {
    require_once __DIR__ . '/../routes/api.php';
} catch (PDOException $e) {
    Response::serverError('A database error occurred. Please try again later.');
} catch (Throwable $e) {
    // Log internally, never expose stack trace to client
    error_log('[Textora] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    Response::serverError('An unexpected error occurred.');
}