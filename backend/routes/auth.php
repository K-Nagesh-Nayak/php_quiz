<?php
require_once __DIR__ . '/../controllers/AuthController.php';

$authController = new AuthController();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($_GET['action'] === 'register') {
        $authController->register($input);
    } elseif ($_GET['action'] === 'login') {
        $authController->login($input);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'profile') {
    require_once __DIR__ . '/../middleware/AuthMiddleware.php';
    $payload = AuthMiddleware::authenticate();
    $authController->getProfile($payload['user_id']);
}
?>