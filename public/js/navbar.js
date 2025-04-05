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

    // Check if user is admin and load users for dropdown
    fetch('/api/auth-status')
        .then(response => response.json())
        .then(authStatus => {
            if (authStatus.isAdmin) {
                loadUsersForDropdown();
            }
        })
        .catch(error => console.error('Error checking auth status:', error));
});

function loadUsersForDropdown() {
    fetch('/api/all-users')
        .then(response => response.json())
        .then(users => {
            const dropdownContent = document.querySelector('.admin-dropdown-content');
            if (dropdownContent) {
                dropdownContent.innerHTML = '';
                users.forEach(user => {
                    const userLink = document.createElement('a');
                    userLink.href = `/user-pokedex/${user.id}`;
                    userLink.textContent = user.username;
                    dropdownContent.appendChild(userLink);
                });
            }
        })
        .catch(error => console.error('Error loading users:', error));
}