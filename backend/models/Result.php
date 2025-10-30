<?php
require_once __DIR__ . '/../utils/helpers.php';
class Result {
    private $conn;
    private $table = 'results';
    
    public $id;
    public $user_id;
    public $quiz_id;
    public $score;
    public $total_questions;
    public $time_taken;
    public $created_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                 SET user_id = :user_id, quiz_id = :quiz_id, score = :score, 
                     total_questions = :total_questions, time_taken = :time_taken";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':quiz_id', $this->quiz_id);
        $stmt->bindParam(':score', $this->score);
        $stmt->bindParam(':total_questions', $this->total_questions);
        $stmt->bindParam(':time_taken', $this->time_taken);
        
        return $stmt->execute();
    }
    
    public function getUserResults($userId) {
        $query = "SELECT r.*, q.title as quiz_title, q.topic 
                 FROM " . $this->table . " r 
                 JOIN quizzes q ON r.quiz_id = q.id 
                 WHERE r.user_id = :user_id 
                 ORDER BY r.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getUserStats($userId) {
        $query = "SELECT 
                    COUNT(*) as total_quizzes_taken,
                    AVG(score) as average_score,
                    SUM(time_taken) as total_time_spent,
                    MAX(created_at) as last_attempt
                 FROM " . $this->table . " 
                 WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getTopicPerformance($userId) {
        $query = "SELECT 
                    q.topic,
                    COUNT(*) as attempts,
                    AVG(r.score) as avg_score,
                    MAX(r.score) as best_score
                 FROM " . $this->table . " r 
                 JOIN quizzes q ON r.quiz_id = q.id 
                 WHERE r.user_id = :user_id 
                 GROUP BY q.topic 
                 ORDER BY avg_score DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>