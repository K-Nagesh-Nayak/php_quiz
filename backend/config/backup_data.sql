-- Create Database
CREATE DATABASE IF NOT EXISTS quiz_platform;
USE quiz_platform;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    created_by INT,
    is_public BOOLEAN DEFAULT FALSE,
    source ENUM('AI', 'manual') DEFAULT 'manual',
    status ENUM('pending', 'published', 'rejected') DEFAULT 'pending',
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Results Table
CREATE TABLE IF NOT EXISTS results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    quiz_id INT,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    time_taken INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Insert Admin User (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@quiz.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert Sample Users (password: user123)
INSERT INTO users (name, email, password, role) VALUES 
('John Doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Jane Smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Mike Johnson', 'mike@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Sarah Wilson', 'sarah@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Insert Sample Quizzes
INSERT INTO quizzes (title, topic, created_by, is_public, source, status, difficulty) VALUES
('General Knowledge Basics', 'General Knowledge', 1, TRUE, 'manual', 'published', 'easy'),
('PHP Fundamentals', 'Programming', 1, TRUE, 'manual', 'published', 'medium'),
('JavaScript Advanced Concepts', 'Programming', 1, TRUE, 'manual', 'published', 'hard'),
('World History Quiz', 'History', 1, TRUE, 'manual', 'published', 'medium'),
('Science and Technology', 'Science', 1, TRUE, 'manual', 'published', 'medium'),
('AI Generated: Python Programming', 'Programming', 2, TRUE, 'AI', 'published', 'medium'),
('Pending AI Quiz: Machine Learning', 'Technology', 3, FALSE, 'AI', 'pending', 'hard'),
('Geography Challenge', 'Geography', 1, TRUE, 'manual', 'published', 'easy');

-- Insert Questions for General Knowledge Quiz
INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES
(1, 'What is the capital of France?', '["London", "Berlin", "Paris", "Madrid"]', 'Paris'),
(1, 'Which planet is known as the Red Planet?', '["Venus", "Mars", "Jupiter", "Saturn"]', 'Mars'),
(1, 'What is 2 + 2?', '["3", "4", "5", "6"]', '4'),
(1, 'Who painted the Mona Lisa?', '["Van Gogh", "Picasso", "Da Vinci", "Monet"]', 'Da Vinci'),
(1, 'What is the largest ocean on Earth?', '["Atlantic", "Indian", "Arctic", "Pacific"]', 'Pacific');

-- Insert Questions for PHP Fundamentals Quiz
INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES
(2, 'What does PHP stand for?', '["Personal Home Page", "PHP: Hypertext Preprocessor", "Private Home Page", "Public Home Protocol"]', 'PHP: Hypertext Preprocessor'),
(2, 'Which of the following is used to output text in PHP?', '["print", "write", "echo", "output"]', 'echo'),
(2, 'How do you create a constant in PHP?', '["constant()", "define()", "const()", "set_constant()"]', 'define()'),
(2, 'Which function is used to get the length of a string?', '["strlen()", "length()", "str_length()", "size()"]', 'strlen()'),
(2, 'What is the correct way to start a PHP session?', '["session_start()", "start_session()", "session_begin()", "begin_session()"]', 'session_start()');

-- Insert Questions for JavaScript Quiz
INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES
(3, 'What is closure in JavaScript?', '["A function that has access to variables in its outer scope", "A way to close browser windows", "A method to end JavaScript execution", "A type of variable declaration"]', 'A function that has access to variables in its outer scope'),
(3, 'Which method is used to add an element to the end of an array?', '["push()", "pop()", "shift()", "unshift()"]', 'push()'),
(3, 'What does the "this" keyword refer to in JavaScript?', '["The current function", "The global object", "The object that is executing the current function", "The parent object"]', 'The object that is executing the current function'),
(3, 'Which symbol is used for strict equality comparison?', '["==", "===", "=", "!="]', '==='),
(3, 'What is the purpose of the async keyword?', '["To define a synchronous function", "To define an asynchronous function", "To pause function execution", "To handle errors"]', 'To define an asynchronous function');

-- Insert Questions for World History Quiz
INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES
(4, 'When did World War II end?', '["1944", "1945", "1946", "1947"]', '1945'),
(4, 'Who was the first president of the United States?', '["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"]', 'George Washington'),
(4, 'Which ancient civilization built the pyramids?', '["Greeks", "Romans", "Egyptians", "Mayans"]', 'Egyptians'),
(4, 'When was the Berlin Wall demolished?', '["1987", "1988", "1989", "1990"]', '1989'),
(4, 'Who discovered America?', '["Christopher Columbus", "Vasco da Gama", "Marco Polo", "Ferdinand Magellan"]', 'Christopher Columbus');

-- Insert Questions for Science Quiz
INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES
(5, 'What is the chemical symbol for gold?', '["Go", "Gd", "Au", "Ag"]', 'Au'),
(5, 'Which gas do plants absorb from the atmosphere?', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 'Carbon Dioxide'),
(5, 'What is the hardest natural substance on Earth?', '["Gold", "Iron", "Diamond", "Platinum"]', 'Diamond'),
(5, 'How many bones are in the human body?', '["196", "206", "216", "226"]', '206'),
(5, 'What is the speed of light?', '["299,792,458 m/s", "300,000,000 m/s", "299,000,000 m/s", "301,000,000 m/s"]', '299,792,458 m/s');

-- Insert Questions for Python Quiz (AI Generated)
INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES
(6, 'How do you create a list in Python?', '["list = ()", "list = []", "list = {}", "list = <>"]', 'list = []'),
(6, 'Which keyword is used to define a function in Python?', '["function", "def", "define", "func"]', 'def'),
(6, 'What is the output of print(3 * "hi")?', '["hihihi", "3hi", "hi3", "Error"]', 'hihihi'),
(6, 'How do you start a for loop in Python?', '["for i in range:", "for i in range()", "for (i=0; i<10; i++)", "loop i in range:"]', 'for i in range()'),
(6, 'Which method is used to add an item to a list?', '["append()", "add()", "insert()", "push()"]', 'append()');

-- Insert Questions for Geography Quiz
INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES
(8, 'What is the longest river in the world?', '["Amazon", "Nile", "Yangtze", "Mississippi"]', 'Nile'),
(8, 'Which country has the largest population?', '["India", "United States", "China", "Russia"]', 'China'),
(8, 'What is the smallest continent?', '["Europe", "Australia", "Antarctica", "South America"]', 'Australia'),
(8, 'Which desert is the largest in the world?', '["Sahara", "Gobi", "Arabian", "Kalahari"]', 'Sahara'),
(8, 'What is the capital of Japan?', '["Seoul", "Beijing", "Tokyo", "Bangkok"]', 'Tokyo');

-- Insert Sample Quiz Results (Realistic data for analytics)
INSERT INTO results (user_id, quiz_id, score, total_questions, time_taken, created_at) VALUES
-- User 2 (John) activities
(2, 1, 4, 5, 180, '2024-01-15 10:30:00'),
(2, 2, 3, 5, 240, '2024-01-16 14:20:00'),
(2, 4, 5, 5, 200, '2024-01-17 16:45:00'),
(2, 1, 5, 5, 150, '2024-01-18 11:15:00'),

-- User 3 (Jane) activities
(3, 1, 3, 5, 220, '2024-01-15 09:15:00'),
(3, 3, 2, 5, 300, '2024-01-16 15:30:00'),
(3, 5, 4, 5, 280, '2024-01-17 13:45:00'),
(3, 6, 4, 5, 260, '2024-01-18 17:20:00'),
(3, 8, 5, 5, 190, '2024-01-19 10:10:00'),

-- User 4 (Mike) activities
(4, 1, 2, 5, 310, '2024-01-15 08:45:00'),
(4, 2, 4, 5, 270, '2024-01-16 12:30:00'),
(4, 4, 3, 5, 320, '2024-01-17 14:15:00'),
(4, 5, 5, 5, 230, '2024-01-18 16:50:00'),

-- User 5 (Sarah) activities
(5, 1, 5, 5, 170, '2024-01-15 11:20:00'),
(5, 3, 4, 5, 290, '2024-01-16 13:40:00'),
(5, 6, 5, 5, 210, '2024-01-17 15:25:00'),
(5, 8, 4, 5, 240, '2024-01-18 09:35:00'),

-- More recent activities for analytics
(2, 5, 4, 5, 260, '2024-01-25 14:30:00'),
(3, 2, 3, 5, 280, '2024-01-25 16:45:00'),
(4, 6, 4, 5, 220, '2024-01-26 10:15:00'),
(5, 4, 5, 5, 190, '2024-01-26 13:20:00'),
(2, 8, 3, 5, 270, '2024-01-27 11:30:00'),

-- Admin user also taking quizzes
(1, 1, 5, 5, 120, '2024-01-20 09:00:00'),
(1, 2, 4, 5, 180, '2024-01-21 10:30:00'),
(1, 3, 5, 5, 240, '2024-01-22 14:15:00');

-- Create indexes for better performance
CREATE INDEX idx_results_user_id ON results(user_id);
CREATE INDEX idx_results_quiz_id ON results(quiz_id);
CREATE INDEX idx_results_created_at ON results(created_at);
CREATE INDEX idx_quizzes_status ON quizzes(status);
CREATE INDEX idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX idx_users_email ON users(email);

-- Display summary of inserted data
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM quizzes) as total_quizzes,
    (SELECT COUNT(*) FROM questions) as total_questions,
    (SELECT COUNT(*) FROM results) as total_results;

-- Show user statistics
SELECT 
    u.name,
    u.role,
    COUNT(r.id) as quiz_attempts,
    AVG(r.score * 100.0 / r.total_questions) as avg_score,
    MAX(r.created_at) as last_activity
FROM users u
LEFT JOIN results r ON u.id = r.user_id
GROUP BY u.id, u.name, u.role
ORDER BY u.role DESC, quiz_attempts DESC;

-- Show quiz statistics
SELECT 
    q.title,
    q.topic,
    q.status,
    q.difficulty,
    COUNT(r.id) as total_attempts,
    AVG(r.score * 100.0 / r.total_questions) as avg_score
FROM quizzes q
LEFT JOIN results r ON q.id = r.quiz_id
GROUP BY q.id, q.title, q.topic, q.status, q.difficulty
ORDER BY total_attempts DESC;`