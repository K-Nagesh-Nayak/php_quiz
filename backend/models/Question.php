<?php
require_once __DIR__ . '/../utils/helpers.php';

class Question {
    private $conn;
    private $table = 'questions';
    
    public $id;
    public $quiz_id;
    public $question_text;
    public $options;
    public $correct_answer;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                 SET quiz_id = :quiz_id, question_text = :question_text, 
                     options = :options, correct_answer = :correct_answer";
        
        $stmt = $this->conn->prepare($query);
        
        // Debug output
        error_log("Creating question for quiz: " . $this->quiz_id);
        
        $optionsJson = json_encode($this->options);
        
        $stmt->bindParam(':quiz_id', $this->quiz_id);
        $stmt->bindParam(':question_text', $this->question_text);
        $stmt->bindParam(':options', $optionsJson);
        $stmt->bindParam(':correct_answer', $this->correct_answer);
        
        try {
            $result = $stmt->execute();
            if ($result) {
                error_log("Question created successfully");
                return true;
            } else {
                error_log("Question creation failed: " . implode(", ", $stmt->errorInfo()));
                return false;
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return false;
        }
    }
    
    public function getByQuizId($quizId) {
        $query = "SELECT * FROM " . $this->table . " 
                 WHERE quiz_id = :quiz_id 
                 ORDER BY id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':quiz_id', $quizId);
        $stmt->execute();
        
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Parse JSON options
        foreach ($questions as &$question) {
            $question['options'] = json_decode($question['options'], true);
        }
        
        return $questions;
    }
    
    public function createBatch($questions, $quizId) {
        foreach ($questions as $questionData) {
            $this->quiz_id = $quizId;
            $this->question_text = $questionData['question'];
            $this->options = $questionData['options'];
            $this->correct_answer = $questionData['correct_answer'];
            $this->create();
        }
        return true;
    }
}
?>