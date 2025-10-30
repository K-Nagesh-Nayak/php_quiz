<?php
require_once 'config/db.php';

header('Content-Type: text/plain');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== Cleaning Duplicate Quiz Results ===\n\n";
    
    // Find duplicate results (same user and quiz within short time)
    $query = "SELECT 
                user_id,
                quiz_id,
                COUNT(*) as duplicate_count
             FROM results 
             GROUP BY user_id, quiz_id 
             HAVING COUNT(*) > 1";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $duplicates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($duplicates)) {
        echo "No duplicates found!\n";
        exit;
    }
    
    echo "Found " . count($duplicates) . " quiz/user combinations with duplicates:\n";
    
    foreach ($duplicates as $dup) {
        echo "User {$dup['user_id']}, Quiz {$dup['quiz_id']}: {$dup['duplicate_count']} results\n";
        
        // Keep only the latest result for each user/quiz combination
        $keepQuery = "SELECT id FROM results 
                     WHERE user_id = ? AND quiz_id = ? 
                     ORDER BY created_at DESC 
                     LIMIT 1";
        $keepStmt = $db->prepare($keepQuery);
        $keepStmt->execute([$dup['user_id'], $dup['quiz_id']]);
        $keepId = $keepStmt->fetch(PDO::FETCH_ASSOC)['id'];
        
        // Delete older duplicates
        $deleteQuery = "DELETE FROM results 
                       WHERE user_id = ? AND quiz_id = ? AND id != ?";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->execute([$dup['user_id'], $dup['quiz_id'], $keepId]);
        $deletedCount = $deleteStmt->rowCount();
        
        echo "  Kept result ID: $keepId, deleted $deletedCount duplicates\n";
    }
    
    echo "\n✅ Duplicate cleanup complete!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>