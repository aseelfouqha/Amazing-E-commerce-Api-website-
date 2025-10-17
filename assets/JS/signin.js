// Sign in functionality
document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', handleSignIn);
    }
    
    // Check if user is already logged in
    if (isAuthenticated()) {
        window.location.href = 'index.html';
    }
});

async function handleSignIn(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    if (!username || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                // expiresInMins: 60 // optional
            })
        });

        const data = await response.json();

        if (data.token) {
            // Store authentication data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            
            showNotification('Successfully signed in!', 'success');
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showNotification('Sign in failed: ' + (data.message || 'Invalid credentials'), 'error');
        }
    } catch (error) {
        console.error('Sign in error:', error);
        showNotification('Sign in failed. Please try again.', 'error');
    }
}