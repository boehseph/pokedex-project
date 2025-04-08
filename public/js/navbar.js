// Runs when page finishes loading
document.addEventListener('DOMContentLoaded', function() {
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fetch('/logout', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(() => {
                window.location.href = '/';
            });
        });
    }

    // Load users for dropdown (admin only)
    fetch('/api/auth-status')
    .then(response => response.json())
    .then(authStatus => {
        if (authStatus.isAdmin) {
            fetch('/api/all-users')
                .then(response => response.json())
                .then(users => {
                    const dropdownContent = document.querySelector('.admin-dropdown-content');
                    if (dropdownContent) {
                        dropdownContent.innerHTML = users
                            .map(user => `<span class="dropdown-item">${user.username}</span>`)
                            .join('');
                    }
                })
                .catch(error => console.error('Dropdown load failed:', error));
        }
    });
});