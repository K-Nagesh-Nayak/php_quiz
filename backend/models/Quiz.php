<?php
require_once __DIR__ . '/../utils/helpers.php';

class Quiz {
    private $conn;
    private $table = 'quizzes';
    
    public $id;
    public $title;
    public $topic;
    public $created_by;
    public $is_public;
    public $source;
    public $status;
    public $difficulty;
    public $created_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                 SET title = :title, topic = :topic, created_by = :created_by, 
                     is_public = :is_public, source = :source, status = :status, 
                     difficulty = :difficulty";
        
        $stmt = $this->conn->prepare($query);
        
        // Debug output
        error_log("Creating quiz: " . $this->title);
        
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':topic', $this->topic);
        $stmt->bindParam(':created_by', $this->created_by);
        $stmt->bindParam(':is_public', $this->is_public, PDO::PARAM_BOOL);
        $stmt->bindParam(':source', $this->source);
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':difficulty', $this->difficulty);
        
        try {
            if ($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                error_log("Quiz created successfully with ID: " . $this->id);
                return $this->id;
            } else {
                error_log("Quiz creation failed: " . implode(", ", $stmt->errorInfo()));
                return false;
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return false;
        }
    }
    
    public function getPublicQuizzes() {
        $query = "SELECT q.*, u.name as creator_name 
                 FROM " . $this->table . " q 
                 LEFT JOIN users u ON q.created_by = u.id 
                 WHERE q.is_public = 1 AND q.status = 'published' 
                 ORDER BY q.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getUserQuizzes($userId) {
        $query = "SELECT q.*, u.name as creator_name 
                 FROM " . $this->table . " q 
                 LEFT JOIN users u ON q.created_by = u.id 
                 WHERE q.created_by = :user_id 
                 ORDER BY q.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getPendingQuizzes() {
        $query = "SELECT q.*, u.name as creator_name 
                 FROM " . $this->table . " q 
                 LEFT JOIN users u ON q.created_by = u.id 
                 WHERE q.status = 'pending' 
                 ORDER BY q.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function updateStatus($quizId, $status) {
        $query = "UPDATE " . $this->table . " 
                 SET status = :status, is_public = :is_public 
                 WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $is_public = ($status == 'published') ? 1 : 0;
        
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':is_public', $is_public, PDO::PARAM_BOOL);
        $stmt->bindParam(':id', $quizId);
        
        return $stmt->execute();
    }
    
    public function getById($id) {
        $query = "SELECT q.*, u.name as creator_name 
                 FROM " . $this->table . " q 
                 LEFT JOIN users u ON q.created_by = u.id 
                 WHERE q.id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }
    
    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
?>