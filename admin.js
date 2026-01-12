document.addEventListener('DOMContentLoaded', function() {
    // Load admin dashboard content
    function loadAdminDashboard() {
        // In a real app, this would fetch data from a server
        const registrations = [
            { id: 1, name: 'John Doe', email: 'john@example.com', studentId: 'S12345', clubs: ['tech', 'debate'], registeredAt: '2023-10-15' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', studentId: 'S12346', clubs: ['arts', 'music'], registeredAt: '2023-10-16' },
            { id: 3, name: 'Alex Johnson', email: 'alex@example.com', studentId: 'S12347', clubs: ['sports', 'science'], registeredAt: '2023-10-17' }
        ];
        
        const eventRegistrations = [
            { id: 1, eventId: 1, name: 'John Doe', email: 'john@example.com', studentId: 'S12345', registeredAt: '2023-10-18' },
            { id: 2, eventId: 2, name: 'Jane Smith', email: 'jane@example.com', studentId: 'S12346', registeredAt: '2023-10-19' },
            { id: 3, eventId: 1, name: 'Alex Johnson', email: 'alex@example.com', studentId: 'S12347', registeredAt: '2023-10-20' }
        ];
        
        // Render registrations table
        const registrationsTable = document.getElementById('registrations-table');
        if (registrationsTable) {
            registrations.forEach(reg => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${reg.id}</td>
                    <td>${reg.name}</td>
                    <td>${reg.email}</td>
                    <td>${reg.studentId}</td>
                    <td>${reg.clubs.map(club => getClubName(club)).join(', ')}</td>
                    <td>${new Date(reg.registeredAt).toLocaleDateString()}</td>
                    <td>
                        <button class="admin-action view" data-id="${reg.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="admin-action delete" data-id="${reg.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                registrationsTable.querySelector('tbody').appendChild(row);
            });
        }
        
        // Render event registrations table
        const eventRegistrationsTable = document.getElementById('event-registrations-table');
        if (eventRegistrationsTable) {
            eventRegistrations.forEach(reg => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${reg.id}</td>
                    <td>${getEventName(reg.eventId)}</td>
                    <td>${reg.name}</td>
                    <td>${reg.email}</td>
                    <td>${reg.studentId}</td>
                    <td>${new Date(reg.registeredAt).toLocaleDateString()}</td>
                    <td>
                        <button class="admin-action view" data-id="${reg.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="admin-action delete" data-id="${reg.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                eventRegistrationsTable.querySelector('tbody').appendChild(row);
            });
        }
        
        // Add event listeners to action buttons
        document.querySelectorAll('.admin-action.view').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                alert(`View details for registration ${id}`);
            });
        });
        
        document.querySelectorAll('.admin-action.delete').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this registration?')) {
                    alert(`Registration ${id} deleted`);
                    // In real app, would make API call to delete
                }
            });
        });
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
    // Load dashboard data only on admin dashboard page
if (document.body.classList.contains('admin-dashboard')) {
    loadAdminDashboard();
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