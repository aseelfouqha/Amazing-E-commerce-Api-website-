// Register functionality
document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', handleRegister);
    }
    
    // Check if user is already logged in
    if (isAuthenticated()) {
        window.location.href = 'index.html';
    }
});

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/users/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                firstName: username,
                lastName: 'User',
                age: 25
            })
        });

        const data = await response.json();

        if (data.id) {
            showNotification('Account created successfully! Please sign in.', 'success');
            
            // Clear form
            event.target.reset();
            
            // Redirect to sign in page after a short delay
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 2000);
        } else {
            showNotification('Registration failed: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}