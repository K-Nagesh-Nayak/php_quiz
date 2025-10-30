<?php
$password = 'admin123';
$hashed_password = password_hash($password, PASSWORD_BCRYPT);
echo "Password: " . $password . "\n";
echo "Hashed: " . $hashed_password . "\n";

// Verify the hash
if (password_verify($password, $hashed_password)) {
    echo "✓ Password verification successful!\n";
} else {
    echo "✗ Password verification failed!\n";
}
?>