/**
 * Main Entry Point
 * All functionality is initialized here via modular functions.
 */
document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initTestimonialsAndSliders();
    initTabsAndModals();
    initCalendar();
    initForms();
    if (typeof initAdmin === 'function') initAdmin();
    initAnimations();
    initStudentSession();
    initFavorites();
    initBackToTop();
    initFeedbackNotification();
    initClubButtons();

    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});


function getFutureDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getCurrentMonthYear() {
    const date = new Date();
    return {
        month: date.getMonth(),
        year: date.getFullYear()
    };
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showFieldError(field, message) {
    if (!field) return;
    clearFieldError(field);
    field.classList.add('error');
    const errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    errorEl.textContent = message;
    errorEl.setAttribute('role', 'alert');
    errorEl.style.color = '#ff6b6b';
    errorEl.style.fontSize = '0.85rem';
    errorEl.style.marginTop = '0.25rem';
    errorEl.style.display = 'block';
    field.parentNode.appendChild(errorEl);
}

function clearFieldError(field) {
    if (!field) return;
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
}

function showFormSuccess(form, message) {
    if (!form) return;
    const existingMsg = form.querySelector('.form-success');
    if (existingMsg) existingMsg.remove();

    const msg = document.createElement('div');
    msg.className = 'form-success';
    msg.textContent = message;
    msg.setAttribute('role', 'status');
    msg.style.color = 'var(--success-color)';
    msg.style.marginTop = '1rem';
    form.insertBefore(msg, form.firstChild);
    setTimeout(() => msg.remove(), 3000);
}

/**
 * 1. Navigation & Scrolling Logic
 */
function initNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.nav-links');

    if (!mobileMenuToggle || !mobileMenu) return;

    let isMenuOpen = false;

    function openMenu() {
        isMenuOpen = true;
        mobileMenu.classList.add('active');
        mobileMenuToggle.classList.add('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
    }

    function closeMenu() {
        isMenuOpen = false;
        mobileMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
    }

    mobileMenuToggle.addEventListener('click', function () {
        if (isMenuOpen) closeMenu(); else openMenu();
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                if (mobileMenu.classList.contains('active')) closeMenu();
            }
        });
    });
}

function initMyHub() {
    if (!window.location.pathname.includes('my-hub.html')) return;
    const student = JSON.parse(localStorage.getItem('studentUser'));
    if (!student) {
        window.location.href = 'registration.html#student-login';
        return;
    }
    const welcomeMsg = document.getElementById('hub-welcome-msg');
    if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${student.name}!`;
}

function initTestimonialsAndSliders() {
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');

    if (testimonialSlides.length === 0) return;

    let currentSlide = 0;

    function showSlide(index) {
        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        testimonialSlides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');

        currentSlide = index;
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    setInterval(() => {
        currentSlide = (currentSlide + 1) % testimonialSlides.length;
        showSlide(currentSlide);
    }, 5000);
}

function initTabsAndModals() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0) {
        const switchTab = (tabId) => {
            const button = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
            const targetTab = document.getElementById(tabId);
            if (button && targetTab) {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                targetTab.classList.add('active');
            }
        };
        tabButtons.forEach(button => {
            button.addEventListener('click', () => switchTab(button.getAttribute('data-tab')));
        });
    }
}

function initForms() {
    const clubRegistrationForm = document.getElementById('club-registration-form');
    if (clubRegistrationForm) {
        clubRegistrationForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Club Registration Submitted!');
        });
    }

    const eventRegistrationForm = document.getElementById('event-registration-form');
    if (eventRegistrationForm) {
        eventRegistrationForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Event Registration Submitted!');
        });
    }
}

function initCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;

    const currentMonthElement = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const monthPicker = document.getElementById('month-picker');
    const yearPicker = document.getElementById('year-picker');
    const jumpToDateBtn = document.getElementById('jump-to-date');
    const todayBtn = document.getElementById('today-btn');

    // Event Modal Elements
    const eventModal = document.getElementById('event-modal');
    const eventForm = document.getElementById('event-form');
    const deleteEventButton = document.getElementById('delete-event');

    // Details & Search Elements
    const eventDetailsContainer = document.getElementById('event-details-container');
    const clubFilter = document.getElementById('event-club-filter');
    const dateFilter = document.getElementById('event-date-filter');
    const eventCards = document.querySelectorAll('.event-card');
    const eventSearch = document.getElementById('eventSearch');
    const searchBtn = document.getElementById('search-btn');

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    let selectedEvent = null;
    let searchTerm = '';

    // Sample events data - using dynamic dates for current/future events
    const defaultEvents = [
        { id: 1, name: "AI Workshop", club: "tech", date: getFutureDate(7), time: "14:00", location: "CS Building, Room 101", description: "Hands-on session on machine learning." },
        { id: 2, name: "Digital Art Masterclass", club: "arts", date: getFutureDate(14), time: "16:00", location: "Arts Center, Studio 3", description: "Learn advanced techniques." },
        { id: 3, name: "Public Speaking Workshop", club: "debate", date: getFutureDate(21), time: "15:00", location: "Humanities Building, Room 205", description: "Improve your speaking skills." },
        { id: 4, name: "Tech Talk: AI Ethics", club: "tech", date: "2025-10-15", time: "15:00", location: "Auditorium", description: "Discussion on ethical AI development." },
        { id: 5, name: "Photography Workshop", club: "arts", date: "2025-10-20", time: "14:00", location: "Media Lab", description: "Learn basic photography techniques." }
    ];

    // Load events from LocalStorage
    let events = [];
    try {
        const stored = localStorage.getItem('allEvents');
        if (stored) events = JSON.parse(stored);
        else {
            events = defaultEvents;
            localStorage.setItem('allEvents', JSON.stringify(events));
        }
    } catch (e) {
        events = defaultEvents;
    }

    // Helper: Get Club Name
    function getClubName(clubId) {
        const clubs = {
            'tech': 'Tech Society',
            'arts': 'Creative Arts',
            'debate': 'Debate Club',
            'music': 'Music Society',
            'sports': 'Sports Club',
            'science': 'Dance Club'
        };
        return clubs[clubId] || clubId;
    }

    // Helper: Format Date
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Update UI Controls
        if (currentMonthElement) currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        if (monthPicker) monthPicker.value = currentMonth;

        // Populate Year Picker if empty
        if (yearPicker && yearPicker.options.length === 0) {
            const startYear = currentYear - 5;
            const endYear = currentYear + 5;
            for (let y = startYear; y <= endYear; y++) {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                if (y === currentYear) opt.selected = true;
                yearPicker.appendChild(opt);
            }
        }
        if (yearPicker) yearPicker.value = currentYear;

        // Render Headers
        const headers = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        headers.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-header';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });

        // Calendar Logic
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            calendarGrid.appendChild(empty);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.innerHTML = `<div class="day-number">${i}</div>`;

            // Identify Today
            const today = new Date();
            if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dayEl.classList.add('today');
            }

            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            // Filter Events
            const dayEvents = events.filter(event => {
                const matchesDate = event.date === dateStr;
                const matchesSearch = searchTerm === '' ||
                    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    getClubName(event.club).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.description.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesDate && matchesSearch;
            });

            // Render Events on Day
            dayEvents.forEach(ev => {
                const evEl = document.createElement('div');
                evEl.className = `day-event ${ev.club}`;
                evEl.textContent = ev.name;
                evEl.title = ev.name; // Tooltip
                evEl.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent bubbling if necessary
                    showEventDetails(ev);
                });
                dayEl.appendChild(evEl);
            });

            // Click on day to clear selection or add event (optional)
            dayEl.addEventListener('click', () => {
                // Future: open empty modal
            });
        }
    }

    function showEventDetails(event) {
        if (!eventDetailsContainer) return;
        selectedEvent = event;

        eventDetailsContainer.innerHTML = `
            <div class="event-details">
                <div class="event-header">
                    <span class="event-club-badge ${escapeHtml(event.club)}">${escapeHtml(getClubName(event.club))}</span>
                    <button id="edit-event" class="action-button"><i class="fas fa-edit"></i> Edit</button>
                    <button id="close-details" class="action-button-small" style="margin-left:auto;"><i class="fas fa-times"></i></button>
                </div>
                <h2 class="event-title">${escapeHtml(event.name)}</h2>
                <div class="event-date-time">
                    <span><i class="far fa-calendar-alt"></i> ${escapeHtml(formatDate(event.date))}</span>
                    <span><i class="far fa-clock"></i> ${escapeHtml(event.time)}</span>
                </div>
                <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</div>
                <p class="event-description">${escapeHtml(event.description)}</p>
                <div class="event-actions">
                    <button id="register-for-event" class="action-button"><i class="fas fa-user-plus"></i> Register</button>
                    <button id="share-event" class="action-button"><i class="fas fa-share-alt"></i> Share</button>
                </div>
            </div>
        `;

        // Bind Detail Buttons
        const editBtn = document.getElementById('edit-event');
        if (editBtn) editBtn.addEventListener('click', () => openEventModal(event));

        const closeDetailsBtn = document.getElementById('close-details');
        if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', () => {
            eventDetailsContainer.innerHTML = '<div class="no-event-selected"><i class="fas fa-calendar-alt"></i><p>Select an event from the calendar to view details</p></div>';
        });

        const regBtn = document.getElementById('register-for-event');
        if (regBtn) regBtn.addEventListener('click', () => alert(`Registered for ${event.name}`));

        const shareBtn = document.getElementById('share-event');
        if (shareBtn) shareBtn.addEventListener('click', () => alert(`Share link for ${event.name} copied to clipboard!`));
    }

    function openEventModal(event = null) {
        if (!eventModal) return;
        if (event) {
            document.getElementById('modal-title').textContent = 'Edit Event';
            document.getElementById('event-name').value = event.name || '';
            document.getElementById('event-club').value = event.club || '';

            // Map our 'date' to 'event-start-date'
            const startDateInput = document.getElementById('event-start-date');
            if (startDateInput) startDateInput.value = event.date || '';

            // Map our 'time' to 'event-start-time'
            const startTimeInput = document.getElementById('event-start-time');
            if (startTimeInput) startTimeInput.value = event.time || '';

            const locInput = document.getElementById('event-location');
            if (locInput) locInput.value = event.location || '';

            const descInput = document.getElementById('event-description');
            if (descInput) descInput.value = event.description || '';

            if (deleteEventButton) deleteEventButton.style.display = 'block';
            selectedEvent = event;
        } else {
            document.getElementById('modal-title').textContent = 'Add New Event';
            eventForm.reset();
            if (deleteEventButton) deleteEventButton.style.display = 'none';
            selectedEvent = null;
        }
        eventModal.style.display = 'flex';
    }

    // --- Event Listeners ---

    // 1. Navigation
    if (prevMonthButton) prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });

    if (nextMonthButton) nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    });

    // 2. Jumpers
    if (jumpToDateBtn) jumpToDateBtn.addEventListener('click', () => {
        if (monthPicker) currentMonth = parseInt(monthPicker.value);
        if (yearPicker) currentYear = parseInt(yearPicker.value);
        renderCalendar();
    });

    if (todayBtn) todayBtn.addEventListener('click', () => {
        const now = new Date();
        currentMonth = now.getMonth();
        currentYear = now.getFullYear();
        renderCalendar();
    });

    // 3. Search
    function handleSearch() {
        const newSearchTerm = eventSearch.value.trim();
        if (newSearchTerm !== searchTerm) {
            searchTerm = newSearchTerm;
            if (searchTerm) {
                // Try to find matching event to jump to
                const match = events.find(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
                if (match) {
                    const d = new Date(match.date);
                    if (!isNaN(d.getTime())) {
                        currentMonth = d.getMonth();
                        currentYear = d.getFullYear();
                    }
                }
            }
            renderCalendar();
        }
    }

    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (eventSearch) eventSearch.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
        else handleSearch();
    });

    // 4. Modal & Form
    const closeBtn = eventModal ? eventModal.querySelector('.close-modal') : null;
    if (closeBtn) closeBtn.addEventListener('click', () => eventModal.style.display = 'none');

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target === eventModal) eventModal.style.display = 'none';
    });

    if (eventForm) {
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newEvent = {
                id: selectedEvent ? selectedEvent.id : Date.now(),
                name: document.getElementById('event-name').value,
                club: document.getElementById('event-club').value,
                date: document.getElementById('event-start-date').value,
                time: document.getElementById('event-start-time').value,
                location: document.getElementById('event-location').value,
                description: document.getElementById('event-description').value
            };

            if (selectedEvent) {
                const index = events.findIndex(e => e.id === selectedEvent.id);
                if (index !== -1) events[index] = newEvent;
            } else {
                events.push(newEvent);
            }

            localStorage.setItem('allEvents', JSON.stringify(events));
            renderCalendar();
            showEventDetails(newEvent);
            eventModal.style.display = 'none';
        });
    }

    // Delete Event
    if (deleteEventButton) {
        deleteEventButton.addEventListener('click', () => {
            if (selectedEvent && confirm('Are you sure you want to delete this event?')) {
                events = events.filter(e => e.id !== selectedEvent.id);
                localStorage.setItem('allEvents', JSON.stringify(events));
                renderCalendar();
                eventDetailsContainer.innerHTML = `<div class="no-event-selected"><i class="fas fa-calendar-alt"></i><p>Select an event from the calendar to view details</p></div>`;
                eventModal.style.display = 'none';
            }
        });
    }

    // Month Navigation
    if (prevMonthButton) {
        prevMonthButton.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            renderCalendar();
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            renderCalendar();
        });
    }

    // Jumpers
    if (jumpToDateBtn) {
        jumpToDateBtn.addEventListener('click', () => {
            if (monthPicker) currentMonth = parseInt(monthPicker.value);
            if (yearPicker) currentYear = parseInt(yearPicker.value);
            renderCalendar();
        });
    }

    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            const now = new Date();
            currentMonth = now.getMonth();
            currentYear = now.getFullYear();
            renderCalendar();
        });
    }

    // Search Functionality
    function handleSearch() {
        const newSearchTerm = eventSearch.value.trim();
        if (newSearchTerm !== searchTerm) {
            searchTerm = newSearchTerm;
            if (searchTerm) {
                // Try to find matching event to jump to
                const match = events.find(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
                if (match) {
                    const d = new Date(match.date);
                    if (!isNaN(d.getTime())) {
                        currentMonth = d.getMonth();
                        currentYear = d.getFullYear();
                    }
                }
            }
            renderCalendar();
        }
    }

    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (eventSearch) eventSearch.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
        else handleSearch();
    });

    // Initial Render
    renderCalendar();
}

/**
 * 6. Admin
 */
/* ================= ADMIN INITIALIZATION ================= */

function initAdmin() {
    /* ---------- ADMIN LOGIN ---------- */
    const adminLoginForm = document.getElementById('admin-login-form');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const usernameField = document.getElementById('admin-username');
            const passwordField = document.getElementById('admin-password');
            const username = usernameField.value.trim();
            const password = passwordField.value.trim();

            if (!username || !password) {
                alert("Username and Password required");
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: username, password })
                });

                if (!response.ok) throw new Error("Login failed");

                const data = await response.json();

                if (data.user.role !== "admin") {
                    alert("Access denied");
                    return;
                }

                localStorage.setItem('adminToken', data.token);
                window.location.href = "admin-dashboard.html";

            } catch (err) {
                console.error(err);
                alert("Login error");
            }
        });
    }

    const adminEventForm = document.getElementById('admin-event-form');
    if (adminEventForm) {
        adminEventForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('admin-event-name').value;
            alert(`Event "${name}" saved successfully!`);
            this.reset();
        });
    }

function initFavorites() { }

    const dashboard = document.getElementById('admin-dashboard');
    if (!dashboard) return;

    const token = localStorage.getItem('adminToken');

    if (!token) {
        window.location.href = "admin-login.html";
        return;
    }

    /* Sidebar Navigation */
    const sidebarLinks = document.querySelectorAll('.admin-menu a');
    const sections = document.querySelectorAll('.admin-tab-content');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', e => {

            e.preventDefault();
            const target = link.getAttribute('href').substring(1);

            document.querySelectorAll('.admin-menu li')
                .forEach(li => li.classList.remove('active'));

            link.parentElement.classList.add('active');

            sections.forEach(sec => sec.style.display = "none");

            const section = document.getElementById(target);
            if (section) section.style.display = "block";

            if (target === "dashboard" || target === "registrations") loadRegistrations();
            if (target === "clubs") loadClubMemberships();
            if (target === "feedbacks") loadFeedbacks();
        });
    });


    /* ---------- LOGOUT ---------- */
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.href = "admin-login.html";
        });
    }


    /* ---------- LOAD REGISTRATIONS ---------- */
    async function loadRegistrations() {

        try {
            const res = await fetch('http://localhost:3000/api/admin/registrations', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) return;

            const data = await res.json();

            const tbody = document.querySelector('#registrations-table tbody');
            if (!tbody) return;

            tbody.innerHTML = data.map(r => `
                <tr>
                    <td>#${r.id}</td>
                    <td>${r.name}</td>
                    <td>${r.email}</td>
                    <td>${r.clubs.join(", ")}</td>
                    <td>${new Date(r.registeredAt).toLocaleDateString()}</td>
                    <td><button class="table-action view"><i class="fas fa-eye"></i></button></td>
                </tr>
            `).join("");

        } catch (e) { console.error(e); }
    }


    /* ---------- CLUB MEMBERSHIPS ---------- */
    async function loadClubMemberships() {

        try {
            const res = await fetch('http://localhost:3000/api/admin/club-memberships', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) return;

            const data = await res.json();

            const tbody = document.querySelector('#clubs-table tbody');
            if (!tbody) return;

            tbody.innerHTML = data.map(m => `
                <tr>
                    <td>#${m.id}</td>
                    <td>${m.name}</td>
                    <td>${m.studentId}</td>
                    <td>${m.club}</td>
                    <td>${m.status}</td>
                    <td><button class="table-action edit"><i class="fas fa-edit"></i></button></td>
                </tr>
            `).join("");

        } catch (e) { console.error(e); }
    }

    /* ---------- FEEDBACK ---------- */
    async function loadFeedbacks() {
        try {
            const res = await fetch('http://localhost:3000/api/admin/feedbacks', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) return;

            const data = await res.json();

            const tbody = document.querySelector('#feedbacks-table tbody');
            if (!tbody) return;

            if (!data.length) {
                tbody.innerHTML = `<tr><td colspan="6">No feedback yet</td></tr>`;
                return;
            }

            tbody.innerHTML = data.map(f => `
                <tr>
                    <td>${new Date(f.createdAt).toLocaleDateString()}</td>
                    <td>${f.name}</td>
                    <td>${f.email || "-"}</td>
                    <td>${f.rating || "-"}</td>
                    <td>${f.message}</td>
                    <td>${f.status}</td>
                </tr>
            `).join("");

        } catch (e) { console.error(e); }
    }

}

function initAnimations() {
    const checkScrollAnimations = () => {
        const windowHeight = window.innerHeight;
        document.querySelectorAll('.timeline-item, .club-card').forEach(item => {
            if (item.getBoundingClientRect().top < windowHeight * 0.75) item.classList.add('visible');
        });
    };
    window.addEventListener('scroll', checkScrollAnimations);
}

function initStudentSession() {
    const student = JSON.parse(localStorage.getItem('studentUser'));
    if (student) {
        document.getElementById('nav-login')?.classList.add('hidden');
        document.getElementById('nav-logout')?.classList.remove('hidden');
    }
}

function initFavorites() { }

function initBackToTop() {
    const backToTopBtn = document.getElementById("backToTop");
    if (backToTopBtn) {
        window.onscroll = function () {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                backToTopBtn.style.display = "block";
            } else {
                backToTopBtn.style.display = "none";
            }
        };
        backToTopBtn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

function initFeedbackNotification() {
    // Support both the homepage form (#feedback-form) and the events page form (#event-feedback-form)
    const feedbackForm = document.getElementById('feedback-form')
        || document.getElementById('event-feedback-form');
    const successCard = document.getElementById('feedbackSuccessCard');

    if (feedbackForm && successCard) {
        feedbackForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Gather form data from whichever form is present
            const name = (document.getElementById('event-feedback-name') || document.getElementById('feedback-name') || {}).value || '';
            const email = (document.getElementById('feedback-email') || {}).value || '';
            const eventName = (document.getElementById('event-feedback-event') || {}).value || '';
            const rating = (document.getElementById('event-feedback-rating') || {}).value || '';
            const message = (document.getElementById('event-feedback-message') || document.getElementById('feedback-message') || {}).value || '';

            try {
                const res = await fetch('http://localhost:3000/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message, eventName, rating })
                });

                if (res.ok) {
                    // Close modal if present (events page)
                    const feedbackModal = document.getElementById('feedback-modal');
                    if (feedbackModal) {
                        feedbackModal.style.display = 'none';
                        feedbackModal.classList.remove('active');
                    }

                    // Show success card only on successful submission
                    successCard.classList.add('show-success');
                    feedbackForm.reset();

                    // Dismiss only when user clicks/touches the screen
                    function dismissSuccess() {
                        successCard.classList.remove('show-success');
                        document.removeEventListener('click', dismissSuccess);
                        document.removeEventListener('touchstart', dismissSuccess);
                    }
                    // Use a short delay so the submit click itself doesn't immediately dismiss
                    setTimeout(() => {
                        document.addEventListener('click', dismissSuccess);
                        document.addEventListener('touchstart', dismissSuccess);
                    }, 100);
                } else {
                    const data = await res.json().catch(() => ({}));
                    alert(data.message || 'Failed to submit feedback. Please try again.');
                }
            } catch (err) {
                console.error('Feedback submission error:', err);
                alert('Could not connect to the server. Please try again later.');
            }
        });
    }
}

function toggleChat() {
    const chat = document.getElementById("chatbot");
    if (!chat) return;

    chat.style.display = chat.style.display === "flex" ? "none" : "flex";
}

function sendMessage() {

    const input = document.getElementById("userInput");
    const chat = document.getElementById("chatBody");

    if (!input || !chat || !input.value.trim()) return;

    const user = document.createElement("div");
    user.className = "user";
    user.innerText = input.value;
    chat.appendChild(user);

    let reply = "Check Events page.";

    const text = input.value.toLowerCase();

    if (text.includes("register")) reply = "Register via Events page.";
    else if (text.includes("event")) reply = "See Events section.";
    else if (text.includes("contact")) reply = "Use Contact page.";

    const bot = document.createElement("div");
    bot.className = "bot";
    bot.innerText = reply;

    setTimeout(() => chat.appendChild(bot), 400);

    input.value = "";
}


/** FAQ & Chatbot Logic */
document.querySelectorAll(".faq-question").forEach(q => {
    q.addEventListener("click", () => {
        const ans = q.nextElementSibling;
        ans.style.display = ans.style.display === "block" ? "none" : "block";
    });
});



/* ================= CLUB BUTTONS ================= */
function initClubButtons() {
    document.querySelectorAll('.view-club-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const clubId = btn.dataset.club;
            window.location.href = `club.html?club=${clubId}`;
        });
    });
}


/* ================= PWA SUPPORT ================= */
let deferredPrompt;
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js");
    });

    window.addEventListener("beforeinstallprompt", e => {
        e.preventDefault();
        deferredPrompt = e;

        const installSection = document.getElementById("footer-install-section");
        const btn = document.getElementById("footer-install-btn");

        if (installSection) installSection.style.display = "block";

        if (btn) {
            btn.style.display = "block";
            btn.addEventListener("click", async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to the install prompt: ${outcome}`);
                    deferredPrompt = null;
                }
            });
        }
    });
}



/**
 * Export functions for testing
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml: (unsafe) => unsafe,
        getFutureDate,
        getCurrentMonthYear,
        initNavigation,
        initMyHub,
        initTestimonialsAndSliders,
        initTabsAndModals,
        initCalendar,
        initForms,
        initAnimations,
        initStudentSession,
        initBackToTop,
        initFeedbackNotification
    };
}
