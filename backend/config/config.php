<?php
// ============================================================
// config/config.php
// Application-wide constants and settings
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

define('APP_NAME',    'Textora E-Library');
define('APP_VERSION', '1.0.0');
define('BASE_URL',    'http://localhost'); // change in production

// Token lifetime in seconds (24 hours)
define('TOKEN_LIFETIME', 86400);

// File upload settings
define('UPLOAD_DIR',      __DIR__ . '/../public/uploads/books/');
define('UPLOAD_URL',      BASE_URL . '/public/uploads/books/');
define('MAX_FILE_SIZE',   50 * 1024 * 1024);  // 50 MB
define('ALLOWED_TYPES',   ['application/pdf', 'application/epub+zip']);

// Pagination
define('DEFAULT_PAGE_SIZE', 20);

// CORS — list of origins allowed to call the API
define('ALLOWED_ORIGINS', [
    'http://localhost',
    'http://localhost:5500',
    'http://localhost:8080',
    'http://127.0.0.1',
    'http://127.0.0.1:5500',   // VS Code Live Server
    'null',
]);