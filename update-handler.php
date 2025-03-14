<?php
session_start();
require_once 'db-connection.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

error_log("POST data: " . print_r($_POST, true));

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents('php://input'), true);

    $userId = $data['user_id'];
    $oldPassword = $data['old_password'];
    $newPassword = $data['new_password'];
    $confirmPassword = $data['confirm_password'];

    $response = [];

    // Validate inputs
    if (empty($userId) || empty($oldPassword) || empty($newPassword) || empty($confirmPassword)) {
        $response['error'] = 'All fields are required';
        echo json_encode($response);
        exit();
    }

    if ($newPassword !== $confirmPassword) {
        $response['error'] = 'New passwords do not match';
        echo json_encode($response);
        exit();
    }

    $db = new Database();
    $conn = $db->conn;

    // Check if user exists
    $stmt = $conn->prepare("SELECT password FROM users WHERE user_id = ?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();

    if ($stmt->error) {
        error_log("Error executing SELECT query: " . $stmt->error);
        $response['error'] = 'Error checking user data';
        echo json_encode($response);
        exit();
    }

    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // Verify old password
        if (password_verify($oldPassword, $user['password'])) {
            // Hash new password
            $hashedPassword = password_hash($newPassword, PASSWORD_ARGON2ID);

            $stmt = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
            $stmt->bind_param("ss", $hashedPassword, $userId);

            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Profile updated successfully';
            } else {
                error_log("Error executing update query: " . $stmt->error);
                $response['error'] = 'Error updating profile';
            }
        } else {
            $response['error'] = 'Incorrect old password';
        }
    } else {
        $response['error'] = 'User not found';
    }

    $stmt->close();
    $db->closeConnection();

    echo json_encode($response);
    exit();
}
?>
