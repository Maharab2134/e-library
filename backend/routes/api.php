<?php
// ============================================================
// routes/api.php
// Central request dispatcher — maps METHOD + URI to controller
// Textora E-Library · UITS Software Engineering Lab 2026
// ============================================================

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/BookController.php';
require_once __DIR__ . '/../controllers/ReviewControlller.php';
require_once __DIR__ . '/../models/RequestModel.php';
require_once __DIR__ . '/../middleware/Auth.php';
require_once __DIR__ . '/../controllers/UserController.php';
require_once __DIR__ . '/../middleware/Response.php';

class RequestController {

    private RequestModel $requests;

    public function __construct() {
        $this->requests = new RequestModel();
    }

    public function index(): never {
        AuthMiddleware::requireAdmin();

        $page   = max(1, (int) ($_GET['page'] ?? 1));
        $status = trim($_GET['status'] ?? '');

        Response::success([
            'requests' => $this->requests->getAll($status, $page),
            'total'    => $this->requests->getPendingCount(),
        ]);
    }

    public function mine(): never {
        $user = AuthMiddleware::require();
        Response::success($this->requests->getByUser((int) $user['id']));
    }

    public function store(): never {
        $user = AuthMiddleware::require();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $title  = trim($body['book_title'] ?? $body['title'] ?? '');
        $author = trim($body['author_name'] ?? $body['author'] ?? '');
        $isbn   = trim($body['isbn'] ?? '');
        $reason = trim($body['reason'] ?? '');

        if ($title === '')  Response::error('Book title is required.');
        if ($reason === '') Response::error('Reason is required.');

        $id = $this->requests->create((int) $user['id'], $title, $author, $isbn, $reason);

        Response::created([
            'id'          => $id,
            'book_title'  => $title,
            'author_name' => $author,
            'isbn'        => $isbn,
            'reason'      => $reason,
            'status'      => 'pending',
        ], 'Request submitted successfully.');
    }

    public function update(int $id): never {
        $admin = AuthMiddleware::requireAdmin();
        $body  = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = trim($body['status'] ?? '');
        $comment = trim($body['comment'] ?? '');

        if (!in_array($status, ['approved', 'rejected'], true)) {
            Response::error('Status must be approved or rejected.');
        }

        $request = $this->requests->findById($id);
        if (!$request) Response::notFound('Request not found.');

        $this->requests->updateStatus($id, $status, (int) $admin['id'], $comment);
        Response::success(null, 'Request updated successfully.');
    }
}

class Router {

    private array $routes = [];

    /** Register a route. $pattern supports :id placeholders. */
    public function add(string $method, string $pattern, callable $handler): void {
        // Convert :id to a named capture group
        $regex = preg_replace('/:([a-zA-Z_]+)/', '(?P<$1>[0-9]+)', $pattern);
        $this->routes[] = [
            'method'  => strtoupper($method),
            'regex'   => '#^' . $regex . '$#',
            'handler' => $handler,
        ];
    }

    /** Match the current request and invoke the handler. */
    public function dispatch(string $method, string $uri): void {
        // Strip query string
        $path = parse_url($uri, PHP_URL_PATH);
        // Strip base prefix if running in a sub-folder
        $base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        if ($base && str_starts_with($path, $base)) {
            $path = substr($path, strlen($base));
        }
        $path = '/' . ltrim($path, '/');

        foreach ($this->routes as $route) {
            if ($route['method'] !== strtoupper($method)) continue;
            if (preg_match($route['regex'], $path, $matches)) {
                // Extract named int captures (e.g. id)
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                $args   = array_map('intval', $params);
                call_user_func_array($route['handler'], array_values($args));
                return;
            }
        }

        // No route matched
        Response::error('Endpoint not found.', 404);
    }
}

// ── Build the route table ────────────────────────────────────

$router = new Router();

// Instantiate controllers once
$auth    = new AuthController();
$books   = new BookController();
$reviews = new ReviewController();
$reqs    = new RequestController();
$users   = new UserController();

// Auth
$router->add('POST',   '/auth/register',            [$auth,  'register']);
$router->add('POST',   '/auth/login',               [$auth,  'login']);
$router->add('POST',   '/auth/logout',              [$auth,  'logout']);
$router->add('GET',    '/auth/me',                  [$auth,  'me']);

// Books
$router->add('GET',    '/books',                    [$books, 'index']);
$router->add('GET',    '/books/:id',                [$books, 'show']);
$router->add('POST',   '/books',                    [$books, 'store']);
$router->add('PUT',    '/books/:id',                [$books, 'update']);
$router->add('DELETE', '/books/:id',                [$books, 'destroy']);
$router->add('POST',   '/books/:id/read',           [$books, 'read']);
$router->add('POST',   '/books/:id/progress',       [$books, 'saveProgress']);

// Reviews
$router->add('GET',    '/books/:id/reviews',        [$reviews, 'index']);
$router->add('POST',   '/books/:id/reviews',        [$reviews, 'store']);
$router->add('DELETE', '/reviews/:id',              [$reviews, 'destroy']);

// Book requests
$router->add('GET',    '/requests',                 [$reqs,  'index']);
$router->add('GET',    '/requests/mine',            [$reqs,  'mine']);
$router->add('POST',   '/requests',                 [$reqs,  'store']);
$router->add('PUT',    '/requests/:id',             [$reqs,  'update']);

// Users / Admin
$router->add('GET',    '/users',                    [$users, 'index']);
$router->add('PUT',    '/users/:id/status',         [$users, 'updateStatus']);
$router->add('GET',    '/users/me/history',         [$users, 'history']);
$router->add('PUT',    '/users/me',                 [$users, 'updateMe']);
$router->add('GET',    '/admin/stats',              [$users, 'stats']);

// Dispatch
$router->dispatch(
    $_SERVER['REQUEST_METHOD'],
    $_SERVER['REQUEST_URI']
);