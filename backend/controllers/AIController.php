<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/Quiz.php';
require_once __DIR__ . '/../models/Question.php';
require_once __DIR__ . '/../utils/gemini_api.php';
require_once __DIR__ . '/../utils/helpers.php';

class AIController {
    private $db;
    private $quiz;
    private $question;
    private $gemini;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->quiz = new Quiz($this->db);
        $this->question = new Question($this->db);
        
        $this->gemini = $this->initializeGeminiAPI();
    }
    
     private function initializeGeminiAPI() {
        try {
            // Check if the gemini_api.php file exists
            if (!file_exists(__DIR__ . '/../utils/gemini_api.php')) {
                error_log("Gemini API file not found");
                return null;
            }
            
            require_once __DIR__ . '/../utils/gemini_api.php';
            $gemini = new GeminiAPI();
            error_log("Gemini API initialized successfully");
            return $gemini;
            
        } catch (Exception $e) {
            error_log("Gemini API initialization failed: " . $e->getMessage());
            return null;
        }
    }
    public function generateQuiz($data, $userId, $isAdmin = false) {
        $topic = $data['topic'] ?? '';
        $difficulty = $data['difficulty'] ?? 'medium';
        $questionCount = intval($data['question_count'] ?? 5);
        $title = $data['title'] ?? "AI Quiz: $topic";
        
        if (empty($topic)) {
            sendResponse(['error' => 'Topic is required'], 400);
        }
        
        if ($questionCount < 1 || $questionCount > 20) {
            sendResponse(['error' => 'Question count must be between 1 and 20'], 400);
        }
        
        $useAI = ($this->gemini !== null);
        error_log("AI Generation - Using AI: " . ($useAI ? 'Yes' : 'No'));
        
        try {
            if ($useAI) {
                // Generate questions using Gemini AI
                $questions = $this->gemini->generateQuiz($topic, $difficulty, $questionCount);
                $source = 'AI';
            } else {
                // Generate realistic mock questions
                $questions = $this->generateRealisticMockQuestions($topic, $difficulty, $questionCount);
                $source = 'AI (Demo Mode)';
            }
            
            // Set quiz status based on user role
            $status = $isAdmin ? 'published' : 'pending';
            $is_public = $isAdmin ? true : false;
            
            // Create quiz record
            $this->quiz->title = $title;
            $this->quiz->topic = $topic;
            $this->quiz->created_by = $userId;
            $this->quiz->is_public = $is_public;
            $this->quiz->source = 'AI';
            $this->quiz->status = $status;
            $this->quiz->difficulty = $difficulty;
            
            $quizId = $this->quiz->create();
            
            if ($quizId) {
                // Save questions
                $successCount = 0;
                foreach ($questions as $q) {
                    $this->question->quiz_id = $quizId;
                    $this->question->question_text = $q['question'];
                    $this->question->options = $q['options'];
                    $this->question->correct_answer = $q['correct_answer'];
                    
                    if ($this->question->create()) {
                        $successCount++;
                    }
                }
                
                $message = $isAdmin 
                    ? "AI quiz generated successfully and published!" 
                    : "AI quiz generated successfully and sent for admin approval";
                
                if (!$useAI) {
                    $message .= " (Using demo mode - configure Gemini API for real AI)";
                }
                
                sendResponse([
                    'message' => $message,
                    'quiz_id' => $quizId,
                    'questions_count' => $successCount,
                    'status' => $status,
                    'requires_approval' => !$isAdmin,
                    'ai_used' => $useAI,
                    'demo_mode' => !$useAI
                ]);
            } else {
                sendResponse(['error' => 'Failed to create quiz'], 500);
            }
            
        } catch (Exception $e) {
            error_log("Quiz generation error: " . $e->getMessage());
            
            // Fall back to mock data
            try {
                error_log("Falling back to mock data");
                $questions = $this->generateRealisticMockQuestions($topic, $difficulty, $questionCount);
                
                // Create quiz with mock data
                $this->quiz->title = $title;
                $this->quiz->topic = $topic;
                $this->quiz->created_by = $userId;
                $this->quiz->is_public = $isAdmin;
                $this->quiz->source = 'AI';
                $this->quiz->status = $isAdmin ? 'published' : 'pending';
                $this->quiz->difficulty = $difficulty;
                
                $quizId = $this->quiz->create();
                
                if ($quizId) {
                    $successCount = 0;
                    foreach ($questions as $q) {
                        $this->question->quiz_id = $quizId;
                        $this->question->question_text = $q['question'];
                        $this->question->options = $q['options'];
                        $this->question->correct_answer = $q['correct_answer'];
                        
                        if ($this->question->create()) {
                            $successCount++;
                        }
                    }
                    
                    $message = $isAdmin 
                        ? "Quiz generated successfully (demo mode) and published!" 
                        : "Quiz generated successfully (demo mode) and sent for admin approval";
                    
                    sendResponse([
                        'message' => $message . " - AI service unavailable",
                        'quiz_id' => $quizId,
                        'questions_count' => $successCount,
                        'status' => $isAdmin ? 'published' : 'pending',
                        'requires_approval' => !$isAdmin,
                        'ai_used' => false,
                        'demo_mode' => true,
                        'fallback' => true
                    ]);
                } else {
                    sendResponse(['error' => 'Failed to create quiz in fallback mode'], 500);
                }
            } catch (Exception $fallbackError) {
                sendResponse(['error' => 'Quiz generation failed: ' . $e->getMessage()], 500);
            }
        }
    }
    
    private function generateRealisticMockQuestions($topic, $difficulty, $count) {
        $questions = [];
        
        // Topic-specific question templates
        $templates = $this->getQuestionTemplates($topic, $difficulty);
        
        for ($i = 1; $i <= $count; $i++) {
            $template = $templates[array_rand($templates)];
            
            $questionData = $this->fillTemplate($template, $topic, $difficulty, $i);
            
            $questions[] = [
                'question' => $questionData['question'],
                'options' => $questionData['options'],
                'correct_answer' => $questionData['correct_answer']
            ];
        }
        
        return $questions;
    }
    
    private function getQuestionTemplates($topic, $difficulty) {
        $baseTemplates = [
            // Easy templates
            [
                'question' => "What is the basic definition of {topic}?",
                'options' => [
                    "A fundamental concept in {topic}",
                    "The core principle of {topic}",
                    "The main purpose of {topic}",
                    "A basic element of {topic}"
                ],
                'correct' => 0
            ],
            [
                'question' => "Which of these is a key component of {topic}?",
                'options' => [
                    "Primary element of {topic}",
                    "Secondary feature",
                    "Optional component",
                    "Unrelated concept"
                ],
                'correct' => 0
            ],
            
            // Medium templates
            [
                'question' => "How does {topic} typically function in practice?",
                'options' => [
                    "Through systematic processes",
                    "By random chance",
                    "Without any structure",
                    "In isolated instances only"
                ],
                'correct' => 0
            ],
            [
                'question' => "What is the relationship between {topic} and its applications?",
                'options' => [
                    "{topic} provides foundation for applications",
                    "Applications define {topic}",
                    "No relationship exists",
                    "{topic} is unrelated to practical use"
                ],
                'correct' => 0
            ],
            
            // Hard templates
            [
                'question' => "What complex problem in {topic} remains challenging to solve?",
                'options' => [
                    "Advanced theoretical limitations",
                    "Basic conceptual understanding",
                    "Simple definitions",
                    "Elementary principles"
                ],
                'correct' => 0
            ],
            [
                'question' => "How does {topic} integrate with emerging technologies?",
                'options' => [
                    "Through adaptive frameworks",
                    "By remaining static",
                    "Without any integration",
                    "Through complete replacement"
                ],
                'correct' => 0
            ]
        ];
        
        // Add topic-specific templates
        $topicSpecific = $this->getTopicSpecificTemplates($topic, $difficulty);
        
        return array_merge($baseTemplates, $topicSpecific);
    }
    
    private function getTopicSpecificTemplates($topic, $difficulty) {
        $specificTemplates = [];
        
        $lowerTopic = strtolower($topic);
        
        if (strpos($lowerTopic, 'programming') !== false || strpos($lowerTopic, 'code') !== false) {
            $specificTemplates = [
                [
                    'question' => "Which programming concept is essential for {topic}?",
                    'options' => [
                        "Algorithm design",
                        "Color theory",
                        "Musical composition",
                        "Culinary arts"
                    ],
                    'correct' => 0
                ],
                [
                    'question' => "What is a common challenge in {topic} development?",
                    'options' => [
                        "Debugging complex logic",
                        "Choosing font colors",
                        "Selecting music tracks",
                        "Planning meals"
                    ],
                    'correct' => 0
                ]
            ];
        } elseif (strpos($lowerTopic, 'science') !== false) {
            $specificTemplates = [
                [
                    'question' => "What scientific method is crucial for {topic}?",
                    'options' => [
                        "Experimental validation",
                        "Artistic expression",
                        "Musical harmony",
                        "Culinary taste"
                    ],
                    'correct' => 0
                ]
            ];
        } elseif (strpos($lowerTopic, 'history') !== false) {
            $specificTemplates = [
                [
                    'question' => "Which historical period is most relevant to {topic}?",
                    'options' => [
                        "Key developmental era",
                        "Recent entertainment trends",
                        "Future predictions",
                        "Mythological stories"
                    ],
                    'correct' => 0
                ]
            ];
        }
        
        return $specificTemplates;
    }
    
    private function fillTemplate($template, $topic, $difficulty, $questionNum) {
        $question = str_replace('{topic}', $topic, $template['question']);
        $question = str_replace('{difficulty}', $difficulty, $question);
        $question = str_replace('{num}', $questionNum, $question);
        
        $options = [];
        foreach ($template['options'] as $option) {
            $options[] = str_replace('{topic}', $topic, $option);
        }
        
        $correctAnswer = $options[$template['correct']];
        
        // Shuffle options but remember correct answer
        $correctIndex = $template['correct'];
        $correctOption = $options[$correctIndex];
        
        shuffle($options);
        
        // Find new position of correct answer
        $newCorrectIndex = array_search($correctOption, $options);
        
        return [
            'question' => $question,
            'options' => $options,
            'correct_answer' => $correctOption
        ];
    }
}
?>