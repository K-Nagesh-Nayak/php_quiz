<?php
// Enable CORS and set headers
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Load environment variables and autoloader
require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Route the request
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove base path if exists
$basePath = '/api';
if (strpos($requestUri, $basePath) === 0) {
    $requestUri = substr($requestUri, strlen($basePath));
}

// Parse the route
$path = parse_url($requestUri, PHP_URL_PATH);
$queryString = parse_url($requestUri, PHP_URL_QUERY);
parse_str($queryString, $queryParams);

// Set GET parameters for route handling
$_GET = array_merge($_GET, $queryParams);

// Route mapping
$routes = [
    '/auth' => 'routes/auth.php',
    '/quiz' => 'routes/quiz.php',
    '/ai' => 'routes/ai.php',
    '/analytics' => 'routes/analytics.php',
    '/admin' => 'routes/admin.php' 
];

if (isset($routes[$path])) {
    require_once __DIR__ . '/' . $routes[$path];
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}
?>