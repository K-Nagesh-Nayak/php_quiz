<?php
// Debug script to test analytics queries
header('Content-Type: text/plain');

echo "=== Analytics Debug ===\n\n";

try {
    require_once 'config/db.php';
    $database = new Database();
    $db = $database->getConnection();
    
    echo "✅ Database connected successfully\n\n";
    
    // Test user ID (use admin for testing)
    $userId = 1;
    
    // Test basic queries
    echo "1. Testing basic user stats...\n";
    $query = "SELECT COUNT(*) as total FROM results WHERE user_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$userId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "   Total quizzes: " . $result['total'] . "\n";
    
    echo "2. Testing topic performance...\n";
    $query = "SELECT 
                q.topic,
                COUNT(r.id) as attempts
             FROM results r
             JOIN quizzes q ON r.quiz_id = q.id
             WHERE r.user_id = ?
             GROUP BY q.topic";
    $stmt = $db->prepare($query);
    $stmt->execute([$userId]);
    $topics = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "   Topics found: " . count($topics) . "\n";
    foreach ($topics as $topic) {
        echo "   - " . $topic['topic'] . ": " . $topic['attempts'] . " attempts\n";
    }
    
    echo "3. Testing recent results...\n";
    $query = "SELECT 
                r.*,
                q.title as quiz_title
             FROM results r
             JOIN quizzes q ON r.quiz_id = q.id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC
             LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute([$userId]);
    $recent = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "   Recent results: " . count($recent) . "\n";
    
    echo "4. Testing progress over time...\n";
    $query = "SELECT 
                DATE(created_at) as attempt_date,
                COUNT(*) as daily_attempts
             FROM results
             WHERE user_id = ?
             AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY DATE(created_at)
             ORDER BY attempt_date";
    $stmt = $db->prepare($query);
    $stmt->execute([$userId]);
    $progress = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "   Progress data points: " . count($progress) . "\n";
    
    echo "\n✅ All analytics queries executed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Debug Complete ===\n";
?>