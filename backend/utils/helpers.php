<?php
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)));
}

function sendResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function generateJWT($payload) {
    $secret = $_ENV['JWT_SECRET'] ?? 'fallback_secret';
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode(array_merge($payload, [
        'iat' => time(),
        'exp' => time() + (60 * 60 * 24) // 24 hours
    ]));
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($token) {
    $secret = $_ENV['JWT_SECRET'] ?? 'fallback_secret';
    $parts = explode('.', $token);
    
    if (count($parts) != 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $parts;
    
    $validSignature = hash_hmac('sha256', $header . "." . $payload, $secret, true);
    $base64UrlValidSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($validSignature));
    
    if ($base64UrlValidSignature !== $signature) {
        return false;
    }
    
    $decodedPayload = json_decode(base64_decode($payload), true);
    
    // Check if token is expired
    if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
        return false;
    }
    
    return $decodedPayload;
}
?>