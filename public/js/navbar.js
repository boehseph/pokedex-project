document.addEventListener('DOMContentLoaded', function() {
    // Only keep logout button handler
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
});