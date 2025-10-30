<?php
require_once __DIR__ . '/../controllers/AIController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$aiController = new AIController();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['action'] === 'generate') {
    $payload = AuthMiddleware::authenticate();
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Check if user is admin
    $isAdmin = ($payload['role'] === 'admin');
    $aiController->generateQuiz($input, $payload['user_id'], $isAdmin);
}
?>