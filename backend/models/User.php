<?php
// require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../utils/helpers.php';
class User {
    private $conn;
    private $table = 'users';
    
    public $id;
    public $name;
    public $email;
    public $password;
    public $role;
    public $created_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                 SET name = :name, email = :email, password = :password, role = :role";
        
        $stmt = $this->conn->prepare($query);
        
        $this->name = sanitizeInput($this->name);
        $this->email = sanitizeInput($this->email);
        $this->password = password_hash($this->password, PASSWORD_BCRYPT);
        
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':password', $this->password);
        $stmt->bindParam(':role', $this->role);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }
    
    public function emailExists() {
        $query = "SELECT id FROM " . $this->table . " WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }
    
    public function login() {
        $query = "SELECT id, name, email, password, role FROM " . $this->table . " 
                 WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();
        
        if ($stmt->rowCount() == 1) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Debug output (remove in production)
            error_log("Input password: " . $this->password);
            error_log("Stored hash: " . $row['password']);
            error_log("Verification result: " . (password_verify($this->password, $row['password']) ? 'true' : 'false'));
            
            if (password_verify($this->password, $row['password'])) {
                $this->id = $row['id'];
                $this->name = $row['name'];
                $this->role = $row['role'];
                return true;
            }
        }
        return false;
    }
    
    public function getById($id) {
        $query = "SELECT id, name, email, role, created_at FROM " . $this->table . " 
                 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() == 1) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }
}
?>