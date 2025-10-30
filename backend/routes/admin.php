<?php
require_once __DIR__ . '/../controllers/AnalyticsController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$analyticsController = new AnalyticsController();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $payload = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($payload);
        
        if ($_GET['action'] === 'users') {
            $analyticsController->getAllUsers();
        } elseif ($_GET['action'] === 'user-activity') {
            $userId = $_GET['user_id'] ?? '';
            if (empty($userId)) {
                sendResponse(['error' => 'User ID is required'], 400);
            }
            $analyticsController->getUserActivity($userId);
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
    } else {
        sendResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log("Admin route error: " . $e->getMessage());
    sendResponse(['error' => 'Internal server error'], 500);
}
?>