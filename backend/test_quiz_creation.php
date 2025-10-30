<?php
require_once 'config/db.php';
require_once 'models/Quiz.php';
require_once 'models/Question.php';

// Test database connection
$database = new Database();
$db = $database->getConnection();

echo "Testing quiz creation...\n";

// Test data
$testQuiz = [
    'title' => 'Test Quiz from Script',
    'topic' => 'Testing',
    'difficulty' => 'medium',
    'questions' => [
        [
            'question_text' => 'What is 2+2?',
            'options' => ['3', '4', '5', '6'],
            'correct_answer' => '4'
        ]
    ]
];

// Create quiz
$quiz = new Quiz($db);
$quiz->title = $testQuiz['title'];
$quiz->topic = $testQuiz['topic'];
$quiz->created_by = 1; // admin user ID
$quiz->is_public = true;
$quiz->source = 'manual';
$quiz->status = 'published';
$quiz->difficulty = $testQuiz['difficulty'];

$quizId = $quiz->create();

if ($quizId) {
    echo "✓ Quiz created successfully! ID: " . $quizId . "\n";
    
    // Create questions
    $question = new Question($db);
    $successCount = 0;
    
    foreach ($testQuiz['questions'] as $q) {
        $question->quiz_id = $quizId;
        $question->question_text = $q['question_text'];
        $question->options = $q['options'];
        $question->correct_answer = $q['correct_answer'];
        
        if ($question->create()) {
            $successCount++;
        }
    }
    
    echo "✓ Created " . $successCount . " questions\n";
    
    // Verify the quiz exists
    $stmt = $db->prepare("SELECT * FROM quizzes WHERE id = ?");
    $stmt->execute([$quizId]);
    $createdQuiz = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($createdQuiz) {
        echo "✓ Quiz verified in database:\n";
        echo "  Title: " . $createdQuiz['title'] . "\n";
        echo "  Topic: " . $createdQuiz['topic'] . "\n";
        echo "  Status: " . $createdQuiz['status'] . "\n";
    }
    
    // Check questions
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM questions WHERE quiz_id = ?");
    $stmt->execute([$quizId]);
    $questionCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "✓ Found " . $questionCount . " questions for this quiz\n";
    
} else {
    echo "✗ Failed to create quiz!\n";
}
?>