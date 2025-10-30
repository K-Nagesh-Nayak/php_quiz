<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/Result.php';
require_once __DIR__ . '/../models/Quiz.php';
require_once __DIR__ . '/../utils/helpers.php';

class AnalyticsController {
    private $db;
    private $result;
    private $quiz;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->result = new Result($this->db);
        $this->quiz = new Quiz($this->db);
    }
    
    public function getUserAnalytics($userId) {
        try {
            error_log("Fetching analytics for user: " . $userId);
            
            // Get user stats
            $stats = $this->getUserStats($userId);
            
            // Get topic performance
            $topicPerformance = $this->getUserTopicPerformance($userId);
            
            // Get recent results
            $recentResults = $this->getUserRecentResults($userId);
            
            // Get progress over time
            $progressOverTime = $this->getUserProgressOverTime($userId);
            
            // Get streak data
            $streakData = $this->getUserStreakData($userId);
            
            sendResponse([
                'stats' => $stats,
                'topic_performance' => $topicPerformance,
                'recent_results' => $recentResults,
                'progress_over_time' => $progressOverTime,
                'streak_data' => $streakData,
                'success' => true
            ]);
            
        } catch (Exception $e) {
            error_log("Analytics error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            sendResponse(['error' => 'Failed to fetch analytics data: ' . $e->getMessage()], 500);
        }
    }
    
    private function getUserStats($userId) {
        // Total distinct quizzes taken (count each quiz only once)
        $query = "SELECT COUNT(DISTINCT quiz_id) as total_quizzes_taken FROM results WHERE user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $totalQuizzes = $stmt->fetch(PDO::FETCH_ASSOC)['total_quizzes_taken'] ?? 0;
        
        // Total attempts (count all quiz attempts)
        $query = "SELECT COUNT(*) as total_attempts FROM results WHERE user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $totalAttempts = $stmt->fetch(PDO::FETCH_ASSOC)['total_attempts'] ?? 0;
        
        // Average score across all attempts
        $query = "SELECT AVG(score * 100.0 / total_questions) as average_score 
                 FROM results WHERE user_id = :user_id AND total_questions > 0";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $averageScore = round($stmt->fetch(PDO::FETCH_ASSOC)['average_score'] ?? 0, 1);
        
        // Total time spent
        $query = "SELECT SUM(time_taken) as total_time_spent FROM results WHERE user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $totalTime = $stmt->fetch(PDO::FETCH_ASSOC)['total_time_spent'] ?? 0;
        
        // Last activity
        $query = "SELECT MAX(created_at) as last_attempt FROM results WHERE user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $lastAttempt = $stmt->fetch(PDO::FETCH_ASSOC)['last_attempt'] ?? null;
        
        // Best score
        $query = "SELECT MAX(score * 100.0 / total_questions) as best_score 
                 FROM results WHERE user_id = :user_id AND total_questions > 0";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $bestScore = round($stmt->fetch(PDO::FETCH_ASSOC)['best_score'] ?? 0, 1);
        
        // Quizzes this week
        $query = "SELECT COUNT(DISTINCT quiz_id) as quizzes_this_week 
                 FROM results 
                 WHERE user_id = :user_id 
                 AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $quizzesThisWeek = $stmt->fetch(PDO::FETCH_ASSOC)['quizzes_this_week'] ?? 0;
        
        return [
            'total_quizzes_taken' => (int)$totalQuizzes,
            'total_attempts' => (int)$totalAttempts,
            'average_score' => $averageScore,
            'total_time_spent' => (int)$totalTime,
            'last_attempt' => $lastAttempt,
            'best_score' => $bestScore,
            'quizzes_this_week' => (int)$quizzesThisWeek
        ];
    }
    
    private function getUserTopicPerformance($userId) {
        $query = "SELECT 
                    q.topic,
                    COUNT(DISTINCT r.quiz_id) as unique_quizzes,
                    COUNT(r.id) as total_attempts,
                    AVG(r.score * 100.0 / r.total_questions) as avg_score,
                    MAX(r.score * 100.0 / r.total_questions) as best_score,
                    SUM(r.time_taken) as total_time
                 FROM results r
                 JOIN quizzes q ON r.quiz_id = q.id
                 WHERE r.user_id = :user_id
                 GROUP BY q.topic
                 ORDER BY avg_score DESC";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        $topicPerformance = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $topicPerformance[] = [
                'topic' => $row['topic'],
                'unique_quizzes' => (int)$row['unique_quizzes'],
                'total_attempts' => (int)$row['total_attempts'],
                'avg_score' => round($row['avg_score'] ?? 0, 1),
                'best_score' => round($row['best_score'] ?? 0, 1),
                'total_time' => (int)$row['total_time']
            ];
        }
        
        return $topicPerformance;
    }
    
    private function getUserRecentResults($userId, $limit = 10) {
        $query = "SELECT 
                    r.*,
                    q.title as quiz_title,
                    q.topic,
                    (r.score * 100.0 / r.total_questions) as percentage
                 FROM results r
                 JOIN quizzes q ON r.quiz_id = q.id
                 WHERE r.user_id = :user_id
                 ORDER BY r.created_at DESC
                 LIMIT :limit";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $recentResults = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $recentResults[] = [
                'id' => $row['id'],
                'quiz_title' => $row['quiz_title'],
                'topic' => $row['topic'],
                'score' => (int)$row['score'],
                'total_questions' => (int)$row['total_questions'],
                'percentage' => round($row['percentage'], 1),
                'time_taken' => (int)$row['time_taken'],
                'created_at' => $row['created_at']
            ];
        }
        
        return $recentResults;
    }
    
    private function getUserProgressOverTime($userId, $days = 30) {
        $query = "SELECT 
                    DATE(created_at) as attempt_date,
                    AVG(score * 100.0 / total_questions) as daily_avg_score,
                    COUNT(DISTINCT quiz_id) as daily_unique_quizzes,
                    COUNT(*) as daily_attempts
                 FROM results
                 WHERE user_id = :user_id
                 AND created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
                 GROUP BY DATE(created_at)
                 ORDER BY attempt_date";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':days', $days, PDO::PARAM_INT);
        $stmt->execute();
        
        $progressData = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $progressData[] = [
                'date' => $row['attempt_date'],
                'average_score' => round($row['daily_avg_score'] ?? 0, 1),
                'unique_quizzes' => (int)$row['daily_unique_quizzes'],
                'attempts' => (int)$row['daily_attempts']
            ];
        }
        
        return $progressData;
    }
    
    private function getUserStreakData($userId) {
        // Get all distinct dates when user took quizzes
        $query = "SELECT DISTINCT DATE(created_at) as attempt_date
                 FROM results 
                 WHERE user_id = :user_id
                 ORDER BY attempt_date DESC";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        $dates = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $dates[] = $row['attempt_date'];
        }
        
        if (empty($dates)) {
            return [
                'current_streak' => 0,
                'longest_streak' => 0,
                'total_active_days' => 0
            ];
        }
        
        // Calculate current streak (consecutive days up to today)
        $currentStreak = 0;
        $today = date('Y-m-d');
        $currentDate = $today;
        
        foreach ($dates as $date) {
            if ($date == $currentDate) {
                $currentStreak++;
                $currentDate = date('Y-m-d', strtotime($currentDate . ' -1 day'));
            } else {
                break;
            }
        }
        
        // Calculate longest streak
        $longestStreak = 1;
        $currentRun = 1;
        
        for ($i = 1; $i < count($dates); $i++) {
            $prevDate = new DateTime($dates[$i - 1]);
            $currDate = new DateTime($dates[$i]);
            $interval = $prevDate->diff($currDate);
            
            // If dates are consecutive (difference is 1 day)
            if ($interval->days == 1) {
                $currentRun++;
            } else {
                if ($currentRun > $longestStreak) {
                    $longestStreak = $currentRun;
                }
                $currentRun = 1;
            }
        }
        
        // Check the last run
        if ($currentRun > $longestStreak) {
            $longestStreak = $currentRun;
        }
        
        return [
            'current_streak' => $currentStreak,
            'longest_streak' => $longestStreak,
            'total_active_days' => count($dates)
        ];
    }
    
    // public function getAdminAnalytics() {
    //     try {
    //         // Total users count
    //         $query = "SELECT COUNT(*) as total_users FROM users WHERE role = 'user'";
    //         $stmt = $this->db->prepare($query);
    //         $stmt->execute();
    //         $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total_users'] ?? 0;
            
    //         // Active users (users who have taken at least one quiz)
    //         $query = "SELECT COUNT(DISTINCT user_id) as active_users FROM results";
    //         $stmt = $this->db->prepare($query);
    //         $stmt->execute();
    //         $activeUsers = $stmt->fetch(PDO::FETCH_ASSOC)['active_users'] ?? 0;
            
    //         // Total quizzes statistics
    //         $query = "SELECT 
    //                     COUNT(*) as total_quizzes,
    //                     SUM(CASE WHEN source = 'AI' THEN 1 ELSE 0 END) as ai_quizzes,
    //                     SUM(CASE WHEN source = 'manual' THEN 1 ELSE 0 END) as manual_quizzes,
    //                     SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_quizzes,
    //                     SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_quizzes
    //                  FROM quizzes";
    //         $stmt = $this->db->prepare($query);
    //         $stmt->execute();
    //         $quizStats = $stmt->fetch(PDO::FETCH_ASSOC);
            
    //         // Total attempts and average score
    //         $query = "SELECT 
    //                     COUNT(*) as total_attempts,
    //                     COUNT(DISTINCT quiz_id) as unique_quizzes_taken,
    //                     COUNT(DISTINCT user_id) as unique_users,
    //                     AVG(score * 100.0 / total_questions) as platform_avg_score,
    //                     SUM(time_taken) as total_time_spent
    //                  FROM results
    //                  WHERE total_questions > 0";
    //         $stmt = $this->db->prepare($query);
    //         $stmt->execute();
    //         $attemptStats = $stmt->fetch(PDO::FETCH_ASSOC);
            
    //         // Popular topics
    //         $query = "SELECT 
    //                     q.topic,
    //                     COUNT(DISTINCT r.quiz_id) as unique_quizzes,
    //                     COUNT(r.id) as attempt_count,
    //                     AVG(r.score * 100.0 / r.total_questions) as avg_score
    //                  FROM results r
    //                  JOIN quizzes q ON r.quiz_id = q.id
    //                  WHERE r.total_questions > 0
    //                  GROUP BY q.topic
    //                  ORDER BY attempt_count DESC
    //                  LIMIT 10";
    //         $stmt = $this->db->prepare($query);
    //         $stmt->execute();
            
    //         $popularTopics = [];
    //         while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    //             $popularTopics[] = [
    //                 'topic' => $row['topic'],
    //                 'unique_quizzes' => (int)$row['unique_quizzes'],
    //                 'attempt_count' => (int)$row['attempt_count'],
    //                 'avg_score' => round($row['avg_score'] ?? 0, 1)
    //             ];
    //         }
            
    //         // Recent activity (last 7 days)
    //         $query = "SELECT 
    //                     DATE(created_at) as activity_date,
    //                     COUNT(*) as daily_attempts,
    //                     COUNT(DISTINCT user_id) as daily_users,
    //                     COUNT(DISTINCT quiz_id) as daily_quizzes
    //                  FROM results
    //                  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    //                  GROUP BY DATE(created_at)
    //                  ORDER BY activity_date DESC";
    //         $stmt = $this->db->prepare($query);
    //         $stmt->execute();
            
    //         $recentActivity = [];
    //         while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    //             $recentActivity[] = [
    //                 'date' => $row['activity_date'],
    //                 'attempts' => (int)$row['daily_attempts'],
    //                 'unique_users' => (int)$row['daily_users'],
    //                 'unique_quizzes' => (int)$row['daily_quizzes']
    //             ];
    //         }
            
    //         sendResponse([
    //             'users' => [
    //                 'total_users' => (int)$totalUsers,
    //                 'active_users' => (int)$activeUsers
    //             ],
    //             'quizzes' => [
    //                 'total_quizzes' => (int)$quizStats['total_quizzes'],
    //                 'ai_quizzes' => (int)$quizStats['ai_quizzes'],
    //                 'manual_quizzes' => (int)$quizStats['manual_quizzes'],
    //                 'pending_quizzes' => (int)$quizStats['pending_quizzes'],
    //                 'published_quizzes' => (int)$quizStats['published_quizzes']
    //             ],
    //             'attempts' => [
    //                 'total_attempts' => (int)$attemptStats['total_attempts'],
    //                 'unique_quizzes_taken' => (int)$attemptStats['unique_quizzes_taken'],
    //                 'unique_users' => (int)$attemptStats['unique_users'],
    //                 'platform_avg_score' => round($attemptStats['platform_avg_score'] ?? 0, 1),
    //                 'total_time_spent' => (int)$attemptStats['total_time_spent']
    //             ],
    //             'popular_topics' => $popularTopics,
    //             'recent_activity' => $recentActivity,
    //             'success' => true
    //         ]);
            
    //     } catch (Exception $e) {
    //         error_log("Admin analytics error: " . $e->getMessage());
    //         error_log("Stack trace: " . $e->getTraceAsString());
    //         sendResponse(['error' => 'Failed to fetch admin analytics: ' . $e->getMessage()], 500);
    //     }
    // }
    public function getAdminAnalytics() {
        try {
            // Total users count
            $query = "SELECT COUNT(*) as total_users FROM users WHERE role = 'user'";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total_users'] ?? 0;
            
            // Active users (users who have taken at least one quiz in last 30 days)
            $query = "SELECT COUNT(DISTINCT user_id) as active_users 
                     FROM results 
                     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $activeUsers = $stmt->fetch(PDO::FETCH_ASSOC)['active_users'] ?? 0;
            
            // New users this week
            $query = "SELECT COUNT(*) as new_users_week 
                     FROM users 
                     WHERE role = 'user' 
                     AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $newUsersWeek = $stmt->fetch(PDO::FETCH_ASSOC)['new_users_week'] ?? 0;
            
            // Total quizzes statistics
            $query = "SELECT 
                        COUNT(*) as total_quizzes,
                        SUM(CASE WHEN source = 'AI' THEN 1 ELSE 0 END) as ai_quizzes,
                        SUM(CASE WHEN source = 'manual' THEN 1 ELSE 0 END) as manual_quizzes,
                        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_quizzes,
                        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_quizzes,
                        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_quizzes
                     FROM quizzes";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $quizStats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Total attempts and average score
            $query = "SELECT 
                        COUNT(*) as total_attempts,
                        COUNT(DISTINCT quiz_id) as unique_quizzes_taken,
                        COUNT(DISTINCT user_id) as unique_users,
                        AVG(score * 100.0 / total_questions) as platform_avg_score,
                        SUM(time_taken) as total_time_spent,
                        SUM(score) as total_correct_answers,
                        SUM(total_questions) as total_questions_answered
                     FROM results
                     WHERE total_questions > 0";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $attemptStats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Popular topics
            $query = "SELECT 
                        q.topic,
                        COUNT(DISTINCT r.quiz_id) as unique_quizzes,
                        COUNT(r.id) as attempt_count,
                        AVG(r.score * 100.0 / r.total_questions) as avg_score
                     FROM results r
                     JOIN quizzes q ON r.quiz_id = q.id
                     WHERE r.total_questions > 0
                     GROUP BY q.topic
                     ORDER BY attempt_count DESC
                     LIMIT 10";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $popularTopics = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $popularTopics[] = [
                    'topic' => $row['topic'],
                    'unique_quizzes' => (int)$row['unique_quizzes'],
                    'attempt_count' => (int)$row['attempt_count'],
                    'avg_score' => round($row['avg_score'] ?? 0, 1)
                ];
            }
            
            // Recent activity (last 7 days)
            $query = "SELECT 
                        DATE(created_at) as activity_date,
                        COUNT(*) as daily_attempts,
                        COUNT(DISTINCT user_id) as daily_users,
                        COUNT(DISTINCT quiz_id) as daily_quizzes
                     FROM results
                     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                     GROUP BY DATE(created_at)
                     ORDER BY activity_date DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $recentActivity = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $recentActivity[] = [
                    'date' => $row['activity_date'],
                    'attempts' => (int)$row['daily_attempts'],
                    'unique_users' => (int)$row['daily_users'],
                    'unique_quizzes' => (int)$row['daily_quizzes']
                ];
            }
            
            // User growth (last 30 days)
            $query = "SELECT 
                        DATE(created_at) as signup_date,
                        COUNT(*) as new_users
                     FROM users
                     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                     AND role = 'user'
                     GROUP BY DATE(created_at)
                     ORDER BY signup_date";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $userGrowth = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $userGrowth[] = [
                    'date' => $row['signup_date'],
                    'new_users' => (int)$row['new_users']
                ];
            }
            
            // Top performing users
            $query = "SELECT 
                        u.id,
                        u.name,
                        u.email,
                        COUNT(r.id) as total_attempts,
                        AVG(r.score * 100.0 / r.total_questions) as avg_score,
                        MAX(r.score * 100.0 / r.total_questions) as best_score,
                        SUM(r.time_taken) as total_time
                     FROM users u
                     LEFT JOIN results r ON u.id = r.user_id
                     WHERE u.role = 'user'
                     GROUP BY u.id, u.name, u.email
                     HAVING total_attempts > 0
                     ORDER BY avg_score DESC
                     LIMIT 10";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $topUsers = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $topUsers[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'total_attempts' => (int)$row['total_attempts'],
                    'avg_score' => round($row['avg_score'] ?? 0, 1),
                    'best_score' => round($row['best_score'] ?? 0, 1),
                    'total_time' => (int)$row['total_time']
                ];
            }
            
            sendResponse([
                'users' => [
                    'total_users' => (int)$totalUsers,
                    'active_users' => (int)$activeUsers,
                    'new_users_week' => (int)$newUsersWeek
                ],
                'quizzes' => [
                    'total_quizzes' => (int)$quizStats['total_quizzes'],
                    'ai_quizzes' => (int)$quizStats['ai_quizzes'],
                    'manual_quizzes' => (int)$quizStats['manual_quizzes'],
                    'pending_quizzes' => (int)$quizStats['pending_quizzes'],
                    'published_quizzes' => (int)$quizStats['published_quizzes'],
                    'rejected_quizzes' => (int)$quizStats['rejected_quizzes']
                ],
                'attempts' => [
                    'total_attempts' => (int)$attemptStats['total_attempts'],
                    'unique_quizzes_taken' => (int)$attemptStats['unique_quizzes_taken'],
                    'unique_users' => (int)$attemptStats['unique_users'],
                    'platform_avg_score' => round($attemptStats['platform_avg_score'] ?? 0, 1),
                    'total_time_spent' => (int)$attemptStats['total_time_spent'],
                    'total_correct_answers' => (int)$attemptStats['total_correct_answers'],
                    'total_questions_answered' => (int)$attemptStats['total_questions_answered'],
                    'accuracy_rate' => round(($attemptStats['total_correct_answers'] / $attemptStats['total_questions_answered'] * 100) ?? 0, 1)
                ],
                'popular_topics' => $popularTopics,
                'recent_activity' => $recentActivity,
                'user_growth' => $userGrowth,
                'top_users' => $topUsers,
                'success' => true
            ]);
            
        } catch (Exception $e) {
            error_log("Admin analytics error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            sendResponse(['error' => 'Failed to fetch admin analytics: ' . $e->getMessage()], 500);
        }
    }
    
    public function getAllUsers() {
        try {
            $query = "SELECT 
                        u.id,
                        u.name,
                        u.email,
                        u.role,
                        u.created_at,
                        COUNT(r.id) as total_attempts,
                        MAX(r.created_at) as last_activity,
                        AVG(r.score * 100.0 / r.total_questions) as avg_score
                     FROM users u
                     LEFT JOIN results r ON u.id = r.user_id
                     WHERE u.role = 'user'
                     GROUP BY u.id, u.name, u.email, u.role, u.created_at
                     ORDER BY u.created_at DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $users = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $users[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'role' => $row['role'],
                    'created_at' => $row['created_at'],
                    'total_attempts' => (int)$row['total_attempts'],
                    'last_activity' => $row['last_activity'],
                    'avg_score' => round($row['avg_score'] ?? 0, 1),
                    'status' => $row['last_activity'] ? 'Active' : 'Inactive'
                ];
            }
            
            sendResponse([
                'users' => $users,
                'total_count' => count($users),
                'success' => true
            ]);
            
        } catch (Exception $e) {
            error_log("Get users error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to fetch users'], 500);
        }
    }
    
    public function getUserActivity($userId) {
        try {
            // Get user basic info
            $userQuery = "SELECT id, name, email, created_at FROM users WHERE id = :user_id";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->bindParam(':user_id', $userId);
            $userStmt->execute();
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                sendResponse(['error' => 'User not found'], 404);
            }
            
            // Get user's quiz attempts
            $attemptsQuery = "SELECT 
                                r.*,
                                q.title as quiz_title,
                                q.topic,
                                (r.score * 100.0 / r.total_questions) as percentage
                             FROM results r
                             JOIN quizzes q ON r.quiz_id = q.id
                             WHERE r.user_id = :user_id
                             ORDER BY r.created_at DESC
                             LIMIT 50";
            $attemptsStmt = $this->db->prepare($attemptsQuery);
            $attemptsStmt->bindParam(':user_id', $userId);
            $attemptsStmt->execute();
            
            $attempts = [];
            while ($row = $attemptsStmt->fetch(PDO::FETCH_ASSOC)) {
                $attempts[] = [
                    'id' => $row['id'],
                    'quiz_title' => $row['quiz_title'],
                    'topic' => $row['topic'],
                    'score' => (int)$row['score'],
                    'total_questions' => (int)$row['total_questions'],
                    'percentage' => round($row['percentage'], 1),
                    'time_taken' => (int)$row['time_taken'],
                    'created_at' => $row['created_at']
                ];
            }
            
            // Get user statistics
            $statsQuery = "SELECT 
                            COUNT(*) as total_attempts,
                            COUNT(DISTINCT quiz_id) as unique_quizzes,
                            AVG(score * 100.0 / total_questions) as avg_score,
                            MAX(score * 100.0 / total_questions) as best_score,
                            SUM(time_taken) as total_time,
                            MIN(created_at) as first_activity,
                            MAX(created_at) as last_activity
                         FROM results
                         WHERE user_id = :user_id";
            $statsStmt = $this->db->prepare($statsQuery);
            $statsStmt->bindParam(':user_id', $userId);
            $statsStmt->execute();
            $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
            
            // Get topic performance
            $topicsQuery = "SELECT 
                            q.topic,
                            COUNT(r.id) as attempts,
                            AVG(r.score * 100.0 / r.total_questions) as avg_score
                         FROM results r
                         JOIN quizzes q ON r.quiz_id = q.id
                         WHERE r.user_id = :user_id
                         GROUP BY q.topic
                         ORDER BY attempts DESC";
            $topicsStmt = $this->db->prepare($topicsQuery);
            $topicsStmt->bindParam(':user_id', $userId);
            $topicsStmt->execute();
            
            $topics = [];
            while ($row = $topicsStmt->fetch(PDO::FETCH_ASSOC)) {
                $topics[] = [
                    'topic' => $row['topic'],
                    'attempts' => (int)$row['attempts'],
                    'avg_score' => round($row['avg_score'] ?? 0, 1)
                ];
            }
            
            sendResponse([
                'user' => $user,
                'stats' => [
                    'total_attempts' => (int)$stats['total_attempts'],
                    'unique_quizzes' => (int)$stats['unique_quizzes'],
                    'avg_score' => round($stats['avg_score'] ?? 0, 1),
                    'best_score' => round($stats['best_score'] ?? 0, 1),
                    'total_time' => (int)$stats['total_time'],
                    'first_activity' => $stats['first_activity'],
                    'last_activity' => $stats['last_activity']
                ],
                'attempts' => $attempts,
                'topics' => $topics,
                'success' => true
            ]);
            
        } catch (Exception $e) {
            error_log("Get user activity error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to fetch user activity'], 500);
        }
    }
}
?>