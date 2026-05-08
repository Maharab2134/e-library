<?php
// ============================================================
// config/database.php
// Database connection singleton using PDO
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

class Database {

    private static ?PDO $instance = null;

    // ── Connection settings — edit these or use a .env file ──
    private static string $host   = 'localhost';
    private static string $dbName = 'textora_db';
    private static string $user   = 'pmauser';
    private static string $pass   = 'password123';          // change in production
    private static string $charset = 'utf8mb4';

    /** Return the shared PDO instance (lazy singleton). */
    public static function getInstance(): PDO {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=%s',
                self::$host,
                self::$dbName,
                self::$charset
            );
            try {
                self::$instance = new PDO($dsn, self::$user, self::$pass, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                // Never expose raw DB errors to the client
                http_response_code(500);
                echo json_encode(['error' => 'Database connection failed.']);
                exit;
            }
        }
        return self::$instance;
    }

    // Prevent direct instantiation
    private function __construct() {}
    private function __clone()     {}
}