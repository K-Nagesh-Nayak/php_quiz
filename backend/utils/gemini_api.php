<?php
class GeminiAPI {
    private $apiKey;
    
    public function __construct() {
        // Try multiple ways to get environment variables
        $this->apiKey = $this->getEnvVariable('GEMINI_API_KEY');
        
        if (empty($this->apiKey)) {
            throw new Exception("Gemini API key not found. Please check your .env file and make sure GEMINI_API_KEY is set.");
        }
        
        // Log that API key was found (but don't log the actual key)
        error_log("Gemini API key found, length: " . strlen($this->apiKey));
    }
    
    private function getEnvVariable($key) {
        // Try different methods to get environment variables
        $value = $_ENV[$key] ?? null;
        
        if (empty($value)) {
            $value = getenv($key);
        }
        
        if (empty($value)) {
            // Try reading from .env file directly as fallback
            $value = $this->readFromEnvFile($key);
        }
        
        return $value;
    }
    
    private function readFromEnvFile($key) {
        $envFile = __DIR__ . '/../.env';
        if (!file_exists($envFile)) {
            return null;
        }
        
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }
            
            // Parse key=value pairs
            if (strpos($line, '=') !== false) {
                list($envKey, $envValue) = explode('=', $line, 2);
                $envKey = trim($envKey);
                $envValue = trim($envValue);
                
                // Remove quotes if present
                $envValue = trim($envValue, '"\'');
                
                if ($envKey === $key) {
                    return $envValue;
                }
            }
        }
        
        return null;
    }
    
    public function generateQuiz($topic, $difficulty, $questionCount) {
        $prompt = $this->buildPrompt($topic, $difficulty, $questionCount);
        
        $data = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 2048,
            ]
        ];
        
        error_log("Sending request to Gemini API for topic: $topic");
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=" . $this->apiKey,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json'
            ],
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($curlError) {
            throw new Exception("cURL error: " . $curlError);
        }
        
        if ($httpCode !== 200) {
            $errorInfo = json_decode($response, true);
            $errorMessage = $errorInfo['error']['message'] ?? "HTTP $httpCode";
            throw new Exception("Gemini API request failed: " . $errorMessage);
        }
        
        $responseData = json_decode($response, true);
        
        if (!isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
            throw new Exception("Invalid response format from Gemini API");
        }
        
        $text = $responseData['candidates'][0]['content']['parts'][0]['text'];
        error_log("Gemini API raw response received");
        
        return $this->parseQuizResponse($text);
    }
    
    private function buildPrompt($topic, $difficulty, $questionCount) {
        return "Generate exactly {$questionCount} multiple-choice questions about {$topic} with {$difficulty} difficulty level. 
        
        IMPORTANT FORMATTING RULES:
        - Return ONLY a valid JSON array, no additional text
        - Each question must be an object with exactly these fields:
          - \"question\": \"The question text\"
          - \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"]
          - \"correct_answer\": \"The exact text of the correct option\"
        
        REQUIREMENTS:
        - Questions should be educational and accurate
        - Make options plausible but distinct
        - Ensure the correct answer is factually accurate
        - Vary the position of the correct answer randomly
        - Questions should match the difficulty level: 
          - Easy: Basic facts and definitions
          - Medium: Application and understanding
          - Hard: Analysis, synthesis, or complex concepts
        
        Example format:
        [
            {
                \"question\": \"What is the capital of France?\",
                \"options\": [\"London\", \"Berlin\", \"Paris\", \"Madrid\"],
                \"correct_answer\": \"Paris\"
            },
            {
                \"question\": \"Which planet is known as the Red Planet?\",
                \"options\": [\"Venus\", \"Mars\", \"Jupiter\", \"Saturn\"],
                \"correct_answer\": \"Mars\"
            }
        ]
        
        Now generate {$questionCount} questions about {$topic} at {$difficulty} level:";
    }
    
    private function parseQuizResponse($text) {
        // Clean the response - remove markdown code blocks if present
        $text = preg_replace('/```json|```/', '', $text);
        $text = trim($text);
        
        error_log("Parsing Gemini response");
        
        $questions = json_decode($text, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON parse error: " . json_last_error_msg());
            error_log("Problematic text: " . substr($text, 0, 500));
            throw new Exception("Failed to parse AI response as valid JSON: " . json_last_error_msg());
        }
        
        if (!is_array($questions)) {
            throw new Exception("AI response is not a valid array");
        }
        
        // Validate each question has required fields
        foreach ($questions as $index => $question) {
            if (!isset($question['question']) || !isset($question['options']) || !isset($question['correct_answer'])) {
                throw new Exception("Question " . ($index + 1) . " missing required fields");
            }
            
            if (!is_array($question['options']) || count($question['options']) !== 4) {
                throw new Exception("Question " . ($index + 1) . " must have exactly 4 options");
            }
            
            if (!in_array($question['correct_answer'], $question['options'])) {
                throw new Exception("Question " . ($index + 1) . " correct answer must match one of the options");
            }
        }
        
        error_log("Successfully parsed " . count($questions) . " questions from Gemini");
        return $questions;
    }
    
    // Test method to verify API connectivity
    public function testConnection() {
        try {
            $testQuestions = $this->generateQuiz('science', 'easy', 1);
            return [
                'success' => true,
                'message' => 'Gemini API connection successful',
                'questions_generated' => count($testQuestions)
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Gemini API connection failed: ' . $e->getMessage()
            ];
        }
    }
}
?>