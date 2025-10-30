<?php
// Debug script to check environment variables
header('Content-Type: text/plain');

echo "=== Environment Variables Debug ===\n\n";

// Check if .env file exists
$envFile = __DIR__ . '/.env';
echo "1. .env file exists: " . (file_exists($envFile) ? 'YES' : 'NO') . "\n";

if (file_exists($envFile)) {
    echo "   .env file content:\n";
    echo file_get_contents($envFile) . "\n";
}

// Check $_ENV
echo "2. \$_ENV['GEMINI_API_KEY']: " . ($_ENV['GEMINI_API_KEY'] ?? 'NOT SET') . "\n";

// Check getenv()
echo "3. getenv('GEMINI_API_KEY'): " . (getenv('GEMINI_API_KEY') ?: 'NOT SET') . "\n";

// Check all environment variables
echo "4. All \$_ENV variables:\n";
foreach ($_ENV as $key => $value) {
    if (strpos($key, 'GEMINI') !== false || strpos($key, 'API') !== false) {
        echo "   $key = $value\n";
    }
}

// Test the Gemini API class
echo "\n5. Testing Gemini API class:\n";
try {
    require_once 'utils/gemini_api.php';
    $gemini = new GeminiAPI();
    echo "   ✅ Gemini API class initialized successfully\n";
    
    // Test connection
    $testResult = $gemini->testConnection();
    echo "   ✅ Connection test: " . $testResult['message'] . "\n";
    
} catch (Exception $e) {
    echo "   ❌ Gemini API error: " . $e->getMessage() . "\n";
}

echo "\n=== Debug Complete ===\n";
?>