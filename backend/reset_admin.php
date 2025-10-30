<?php
// Include required files
require_once 'config/db.php';
require_once 'models/User.php';

$database = new Database();
$db = $database->getConnection();

$email = 'admin@quiz.com';
$new_password = 'admin123';
$hashed_password = password_hash($new_password, PASSWORD_BCRYPT);

echo "Resetting admin password...\n";
echo "Email: " . $email . "\n";
echo "New Password: " . $new_password . "\n";
echo "Hashed Password: " . $hashed_password . "\n\n";

// Update the password in database
$query = "UPDATE users SET password = :password WHERE email = :email";
$stmt = $db->prepare($query);
$stmt->bindParam(':password', $hashed_password);
$stmt->bindParam(':email', $email);

if ($stmt->execute()) {
    echo "✓ Admin password reset successfully!\n\n";
} else {
    echo "✗ Failed to reset admin password!\n";
    exit;
}

// Test the login with the new password
echo "Testing login with new password...\n";

$test_user = new User($db);
$test_user->email = $email;
$test_user->password = $new_password;

if ($test_user->login()) {
    echo "✓ Login successful!\n";
    echo "User ID: " . $test_user->id . "\n";
    echo "Name: " . $test_user->name . "\n";
    echo "Role: " . $test_user->role . "\n";
} else {
    echo "✗ Login failed!\n";
    
    // Debug information
    echo "\nDebug information:\n";
    $query = "SELECT * FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "User found in database:\n";
        echo "Stored hash: " . $row['password'] . "\n";
        $verify_result = password_verify($new_password, $row['password']);
        echo "Password verification: " . ($verify_result ? 'SUCCESS' : 'FAILED') . "\n";
        
        if (!$verify_result) {
            echo "Possible issues:\n";
            echo "1. Password hash mismatch\n";
            echo "2. Database not updated properly\n";
            echo "3. Character encoding issues\n";
        }
    } else {
        echo "User not found in database!\n";
    }
}
?>