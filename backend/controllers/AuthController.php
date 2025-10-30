<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/helpers.php';

class AuthController {
    private $db;
    private $user;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->user = new User($this->db);
    }
    
    public function register($data) {
        // Validate required fields
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            sendResponse(['error' => 'All fields are required'], 400);
        }
        
        $this->user->name = sanitizeInput($data['name']);
        $this->user->email = sanitizeInput($data['email']);
        $this->user->password = $data['password'];
        $this->user->role = 'user';
        
        // Validate email format
        if (!filter_var($this->user->email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(['error' => 'Invalid email format'], 400);
        }
        
        // Check if email already exists
        if ($this->user->emailExists()) {
            sendResponse(['error' => 'Email already exists'], 400);
        }
        
        // Create user
        if ($this->user->create()) {
            $userData = [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'role' => $this->user->role
            ];
            
            $token = generateJWT([
                'user_id' => $this->user->id,
                'email' => $this->user->email,
                'role' => $this->user->role
            ]);
            
            sendResponse([
                'message' => 'User registered successfully',
                'token' => $token,
                'user' => $userData
            ]);
        } else {
            sendResponse(['error' => 'Unable to register user'], 500);
        }
    }
    
    public function login($data) {
        if (empty($data['email']) || empty($data['password'])) {
            sendResponse(['error' => 'Email and password are required'], 400);
        }
        
        $this->user->email = sanitizeInput($data['email']);
        $this->user->password = $data['password'];
        
        if ($this->user->login()) {
            $token = generateJWT([
                'user_id' => $this->user->id,
                'email' => $this->user->email,
                'role' => $this->user->role
            ]);
            
            sendResponse([
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'role' => $this->user->role
                ]
            ]);
        } else {
            sendResponse(['error' => 'Invalid credentials'], 401);
        }
    }
    
    public function getProfile($userId) {
        $userData = $this->user->getById($userId);
        if ($userData) {
            sendResponse(['user' => $userData]);
        } else {
            sendResponse(['error' => 'User not found'], 404);
        }
    }
}
?>