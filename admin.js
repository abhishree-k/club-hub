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
    
    // Modal functionality
    const modal = document.getElementById('edit-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.btn-cancel');
    const editForm = document.getElementById('edit-form');
    let currentRow = null;

    function openModal() {
        if (modal) modal.classList.add('active');
    }

    function closeModalFunc() {
        if (modal) modal.classList.remove('active');
        currentRow = null;
    }

    if (closeModal) closeModal.addEventListener('click', closeModalFunc);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModalFunc);

    window.addEventListener('click', function(e) {
        if (e.target === modal) closeModalFunc();
    });

    // Edit functionality
    document.querySelectorAll('.table-action.edit').forEach(button => {
        button.addEventListener('click', function() {
            currentRow = this.closest('tr');
            const cells = currentRow.querySelectorAll('td');
            
            // Populate form
            document.getElementById('edit-row-id').value = cells[0].textContent;
            document.getElementById('edit-name').value = cells[1].textContent;
            document.getElementById('edit-email').value = cells[2].textContent;
            document.getElementById('edit-clubs').value = cells[3].textContent;
            document.getElementById('edit-date').value = cells[4].textContent;

            openModal();
        });
    });

    // Save functionality
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (currentRow) {
                const cells = currentRow.querySelectorAll('td');
                
                // Update table with new values
                cells[1].textContent = document.getElementById('edit-name').value;
                cells[2].textContent = document.getElementById('edit-email').value;
                cells[3].textContent = document.getElementById('edit-clubs').value;
                cells[4].textContent = document.getElementById('edit-date').value;
                
                // Visual feedback
                currentRow.style.backgroundColor = 'rgba(0, 184, 148, 0.1)';
                setTimeout(() => {
                    currentRow.style.backgroundColor = '';
                }, 1000);

                closeModalFunc();
            }
        });
    }

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