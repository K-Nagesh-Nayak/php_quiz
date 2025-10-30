<?php
require_once __DIR__ . '/../controllers/QuizController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$quizController = new QuizController();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $payload = AuthMiddleware::authenticate();
    
    if ($_GET['action'] === 'public') {
        $quizController->getPublicQuizzes();
    } elseif ($_GET['action'] === 'user') {
        $quizController->getUserQuizzes($payload['user_id']);
    } elseif ($_GET['action'] === 'pending') {
        AuthMiddleware::requireAdmin($payload);
        $quizController->getPendingQuizzes();
    } elseif ($_GET['action'] === 'questions') {
        $quizId = $_GET['quiz_id'] ?? '';
        $quizController->getQuizQuestions($quizId);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = AuthMiddleware::authenticate();
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log("POST request to quiz with action: " . ($_GET['action'] ?? 'unknown'));
    
    if ($_GET['action'] === 'submit') {
        $quizController->submitQuiz($input, $payload['user_id']);
    } elseif ($_GET['action'] === 'update-status') {
        AuthMiddleware::requireAdmin($payload);
        $quizController->updateQuizStatus($input);
    } elseif ($_GET['action'] === 'create') {
        error_log("Creating manual quiz for user: " . $payload['user_id']);
        AuthMiddleware::requireAdmin($payload);
        $quizController->createManualQuiz($input, $payload['user_id']);
    } else {
        error_log("Unknown POST action: " . ($_GET['action'] ?? 'none'));
        sendResponse(['error' => 'Unknown action'], 400);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $payload = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($payload);
    
    $quizId = $_GET['quiz_id'] ?? '';
    $quizController->deleteQuiz($quizId);
}
?>