<?php
require_once 'config/db.php';
require_once 'models/User.php';

// Test database connection
$database = new Database();
$db = $database->getConnection();

// Test admin login
$user = new User($db);
$user->email = 'admin@quiz.com';
$user->password = 'admin123';

echo "Testing admin login:\n";
echo "Email: " . $user->email . "\n";
echo "Password: " . $user->password . "\n";

if ($user->login()) {
    echo "✓ Login successful!\n";
    echo "User ID: " . $user->id . "\n";
    echo "Name: " . $user->name . "\n";
    echo "Role: " . $user->role . "\n";
} else {
    echo "✗ Login failed!\n";
    
    // Check if user exists
    $query = "SELECT * FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $user->email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "User found in database:\n";
        echo "Stored hash: " . $row['password'] . "\n";
        echo "Password verify: " . (password_verify($user->password, $row['password']) ? 'true' : 'false') . "\n";
    } else {
        echo "User not found in database!\n";
    }
}
?>