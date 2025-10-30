<?php
require_once __DIR__ . '/../controllers/AnalyticsController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

try {
    $analyticsController = new AnalyticsController();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $payload = AuthMiddleware::authenticate();
        
        if ($_GET['action'] === 'user') {
            $analyticsController->getUserAnalytics($payload['user_id']);
        } elseif ($_GET['action'] === 'admin') {
            AuthMiddleware::requireAdmin($payload);
            $analyticsController->getAdminAnalytics();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
    } else {
        sendResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log("Route error: " . $e->getMessage());
    sendResponse(['error' => 'Internal server error'], 500);
}
?>