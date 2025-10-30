<?php
require_once 'config/db.php';

header('Content-Type: text/plain');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== Quiz Results Debug ===\n\n";
    
    // Get all results for the admin user
    $userId = 1;
    
    $query = "SELECT 
                r.id,
                r.quiz_id,
                q.title,
                r.score,
                r.total_questions,
                r.time_taken,
                r.created_at
             FROM results r
             JOIN quizzes q ON r.quiz_id = q.id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute([$userId]);
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Total results for user $userId: " . count($results) . "\n\n";
    
    foreach ($results as $result) {
        $percentage = round(($result['score'] / $result['total_questions']) * 100, 1);
        echo "Result ID: {$result['id']}\n";
        echo "Quiz: {$result['title']} (ID: {$result['quiz_id']})\n";
        echo "Score: {$result['score']}/{$result['total_questions']} ($percentage%)\n";
        echo "Time: {$result['time_taken']} seconds\n";
        echo "Created: {$result['created_at']}\n";
        echo "---\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>