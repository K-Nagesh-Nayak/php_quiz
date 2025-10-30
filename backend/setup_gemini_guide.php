<?php
require_once 'config/db.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Gemini API Setup Guide</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .step { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; }
        code { background: #2d2d2d; color: #f8f8f2; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🔧 Gemini API Setup Guide</h1>
    
    <div class="step">
        <h3>Step 1: Get Your Gemini API Key</h3>
        <ol>
            <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></li>
            <li>Sign in with your Google account</li>
            <li>Click "Create API Key"</li>
            <li>Copy the generated API key</li>
        </ol>
    </div>
    
    <div class="step">
        <h3>Step 2: Update Your .env File</h3>
        <p>Open <code>backend/.env</code> and add your API key:</p>
        <code>GEMINI_API_KEY=your_actual_api_key_here</code>
    </div>
    
    <div class="step">
        <h3>Step 3: Test the Setup</h3>
        <p>Current status:</p>
        <?php
        $apiKey = $_ENV['GEMINI_API_KEY'] ?? '';
        
        if (empty($apiKey)) {
            echo '<div class="error">❌ Gemini API key not found in .env file</div>';
        } else {
            echo '<div class="success">✅ Gemini API key found: ' . substr($apiKey, 0, 10) . '...</div>';
            
            // Test the API
            try {
                require_once 'utils/gemini_api.php';
                $gemini = new GeminiAPI();
                echo '<div class="success">✅ Gemini API initialized successfully!</div>';
            } catch (Exception $e) {
                echo '<div class="error">❌ Gemini API error: ' . $e->getMessage() . '</div>';
            }
        }
        ?>
    </div>
    
    <div class="step">
        <h3>Step 4: Restart Your Server</h3>
        <p>Restart your PHP development server for changes to take effect:</p>
        <code>php -S localhost:8000</code>
    </div>
</body>
</html>