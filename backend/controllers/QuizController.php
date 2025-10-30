<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/Quiz.php';
require_once __DIR__ . '/../models/Question.php';
require_once __DIR__ . '/../models/Result.php';
require_once __DIR__ . '/../utils/helpers.php';

class QuizController {
    private $db;
    private $quiz;
    private $question;
    private $result;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->quiz = new Quiz($this->db);
        $this->question = new Question($this->db);
        $this->result = new Result($this->db);
    }
    
    public function createManualQuiz($data, $userId) {
        error_log("createManualQuiz called with data: " . json_encode($data));
        
        $title = $data['title'] ?? '';
        $topic = $data['topic'] ?? '';
        $difficulty = $data['difficulty'] ?? 'medium';
        $questions = $data['questions'] ?? [];
        
        if (empty($title) || empty($topic) || empty($questions)) {
            error_log("Validation failed: title, topic, or questions missing");
            sendResponse(['error' => 'Title, topic, and questions are required'], 400);
        }
        
        error_log("Creating quiz: $title, topic: $topic, user: $userId");
        
        // Create quiz
        $this->quiz->title = $title;
        $this->quiz->topic = $topic;
        $this->quiz->created_by = $userId;
        $this->quiz->is_public = true;
        $this->quiz->source = 'manual';
        $this->quiz->status = 'published';
        $this->quiz->difficulty = $difficulty;
        
        $quizId = $this->quiz->create();
        
        if ($quizId) {
            error_log("Quiz created with ID: $quizId, now creating questions");
            
            $successCount = 0;
            // Create questions
            foreach ($questions as $q) {
                $this->question->quiz_id = $quizId;
                $this->question->question_text = $q['question_text'];
                $this->question->options = $q['options'];
                $this->question->correct_answer = $q['correct_answer'];
                
                if ($this->question->create()) {
                    $successCount++;
                }
            }
            
            error_log("Created $successCount out of " . count($questions) . " questions");
            
            sendResponse([
                'message' => 'Quiz created successfully',
                'quiz_id' => $quizId,
                'questions_count' => $successCount
            ]);
        } else {
            error_log("Failed to create quiz");
            sendResponse(['error' => 'Failed to create quiz'], 500);
        }
    }
    
    public function getPublicQuizzes() {
        $quizzes = $this->quiz->getPublicQuizzes();
        sendResponse(['quizzes' => $quizzes]);
    }
    
    public function getUserQuizzes($userId) {
        $quizzes = $this->quiz->getUserQuizzes($userId);
        sendResponse(['quizzes' => $quizzes]);
    }
    
    public function getPendingQuizzes() {
        $quizzes = $this->quiz->getPendingQuizzes();
        sendResponse(['quizzes' => $quizzes]);
    }
    
    public function getQuizQuestions($quizId) {
        $quiz = $this->quiz->getById($quizId);
        if (!$quiz) {
            sendResponse(['error' => 'Quiz not found'], 404);
        }
        
        $questions = $this->question->getByQuizId($quizId);
        sendResponse([
            'quiz' => $quiz,
            'questions' => $questions
        ]);
    }
    
 public function submitQuiz($data, $userId) {
    $quizId = $data['quiz_id'] ?? '';
    $answers = $data['answers'] ?? [];
    $timeTaken = $data['time_taken'] ?? 0;
    
    error_log("Submitting quiz for user $userId, quiz $quizId");
    
    if (empty($quizId) || empty($answers)) {
        sendResponse(['error' => 'Quiz ID and answers are required'], 400);
    }
    
    // Check if this user already has a recent result for this quiz (within last 5 minutes)
    $checkQuery = "SELECT id, created_at FROM results 
                  WHERE user_id = :user_id AND quiz_id = :quiz_id 
                  ORDER BY created_at DESC LIMIT 1";
    $checkStmt = $this->db->prepare($checkQuery);
    $checkStmt->bindParam(':user_id', $userId);
    $checkStmt->bindParam(':quiz_id', $quizId);
    $checkStmt->execute();
    
    $existingResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existingResult) {
        $lastSubmission = strtotime($existingResult['created_at']);
        $currentTime = time();
        $timeDiff = $currentTime - $lastSubmission;
        
        // If the last submission was less than 2 minutes ago, prevent duplicate
        if ($timeDiff < 120) { // 2 minutes
            error_log("Duplicate submission prevented: User $userId submitted quiz $quizId multiple times within $timeDiff seconds");
            sendResponse([
                'error' => 'You have already submitted this quiz recently. Please wait before submitting again.',
                'duplicate_prevention' => true,
                'last_submission' => $existingResult['created_at']
            ], 400);
        }
    }
    
    // Get quiz questions
    $questions = $this->question->getByQuizId($quizId);
    $totalQuestions = count($questions);
    $score = 0;
    
    // Calculate score
    foreach ($questions as $question) {
        $userAnswer = $answers[$question['id']] ?? '';
        if ($userAnswer === $question['correct_answer']) {
            $score++;
        }
    }
    
    error_log("Calculated score: $score/$totalQuestions for user $userId");
    
    // Save result
    $this->result->user_id = $userId;
    $this->result->quiz_id = $quizId;
    $this->result->score = $score;
    $this->result->total_questions = $totalQuestions;
    $this->result->time_taken = $timeTaken;
    
    if ($this->result->create()) {
        $resultId = $this->db->lastInsertId();
        error_log("Quiz result saved successfully with ID: $resultId");
        
        sendResponse([
            'message' => 'Quiz submitted successfully',
            'score' => $score,
            'total_questions' => $totalQuestions,
            'percentage' => round(($score / $totalQuestions) * 100, 2),
            'result_id' => $resultId,
            'first_submission' => !$existingResult
        ]);
    } else {
        error_log("Failed to save quiz result for user $userId");
        sendResponse(['error' => 'Failed to save quiz result'], 500);
    }
}
    
    public function updateQuizStatus($data) {
        $quizId = $data['quiz_id'] ?? '';
        $status = $data['status'] ?? '';
        
        if (empty($quizId) || empty($status)) {
            sendResponse(['error' => 'Quiz ID and status are required'], 400);
        }
        
        if ($this->quiz->updateStatus($quizId, $status)) {
            sendResponse(['message' => 'Quiz status updated successfully']);
        } else {
            sendResponse(['error' => 'Failed to update quiz status'], 500);
        }
    }
    
    public function deleteQuiz($quizId) {
        if ($this->quiz->delete($quizId)) {
            sendResponse(['message' => 'Quiz deleted successfully']);
        } else {
            sendResponse(['error' => 'Failed to delete quiz'], 500);
        }
    }
}
?>