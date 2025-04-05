document.addEventListener('DOMContentLoaded', function() {
    // Check admin login state
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isLoggedIn && !window.location.pathname.includes('admin-login.html')) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Mobile sidebar toggle
    const hamburger = document.querySelector('.nav-hamburger');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Logout functionality
    const logoutButton = document.getElementById('admin-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'admin-login.html';
        });
    }
    
    // Table row actions
    document.querySelectorAll('.table-action.view').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const id = row.querySelector('td:first-child').textContent;
            alert(`View details for registration ${id}`);
        });
    });
    
    document.querySelectorAll('.table-action.edit').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const id = row.querySelector('td:first-child').textContent;
            alert(`Edit registration ${id}`);
        });
    });
    
    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.querySelector('span').textContent;
            alert(`${action} action triggered`);
        });
    });
    
    // Responsive table
    function handleTableResponsive() {
        const tables = document.querySelectorAll('.admin-table');
        tables.forEach(table => {
            const ths = table.querySelectorAll('th');
            const tds = table.querySelectorAll('td');
            
            tds.forEach((td, i) => {
                const th = ths[i % ths.length];
                td.setAttribute('data-label', th.textContent);
            });
        });
    }
    
    if (window.innerWidth < 768) {
        handleTableResponsive();
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth < 768) {
            handleTableResponsive();
        }
    });
});