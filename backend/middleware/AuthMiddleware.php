<?php
require_once __DIR__ . '/../utils/helpers.php';

class AuthMiddleware {
    public static function authenticate() {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? '';
        $token = str_replace('Bearer ', '', $token);
        
        if (empty($token)) {
            sendResponse(['error' => 'Authentication token required'], 401);
        }
        
        $payload = verifyJWT($token);
        if (!$payload) {
            sendResponse(['error' => 'Invalid or expired token'], 401);
        }
        
        return $payload;
    }
    
    public static function requireAdmin($payload) {
        if ($payload['role'] !== 'admin') {
            sendResponse(['error' => 'Admin access required'], 403);
        }
    }
}
?>