<?php
class Security {
    public static function cors() {
        header('Access-Control-Allow-Origin: http://localhost:3000');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
        
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            exit(0);
        }
    }
    
    public static function validateInput($data, $rules) {
        $errors = [];
        
        foreach ($rules as $field => $rule) {
            $value = $data[$field] ?? '';
            $rules = explode('|', $rule);
            
            foreach ($rules as $singleRule) {
                if ($singleRule === 'required' && empty($value)) {
                    $errors[$field] = "$field is required";
                } elseif ($singleRule === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$field] = "$field must be a valid email";
                } elseif ($singleRule === 'numeric' && !is_numeric($value)) {
                    $errors[$field] = "$field must be numeric";
                }
            }
        }
        
        return $errors;
    }
}
?>