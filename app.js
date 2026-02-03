/**
 * Main Entry Point
 * All functionality is initialized here via modular functions.
 */
// Initialize global events data
document.addEventListener('DOMContentLoaded', function () {
    // --- RBAC & AUTH SYSTEM START ---
    const ROLES = {
        ADMIN: 'admin',
        LEADER: 'leader',
        STUDENT: 'student'
    };

    const PERMISSIONS = {
        admin: ['*'],
        leader: [
            'events:view', 'event:details:view', 'registrations:view:own', 'registrations:create:own', 'registrations:cancel:own', 'certificates:view:own', 'feedback:submit', 'profile:update:own',
            'events:create', 'events:edit', 'events:delete', 'members:view', 'members:manage', 'attendance:view', 'attendance:export', 'announcements:send', 'club:update', 'club:analytics:view'
        ],
        student: [
            'events:view', 'event:details:view', 'registrations:view:own', 'registrations:create:own', 'registrations:cancel:own', 'certificates:view:own', 'feedback:submit', 'profile:update:own'
        ]
    };

    window.AuthService = {
        login: function (username, password) {
            // Admin Master Login
            if (username === 'admin' && password === 'admin@123') {
                const user = { username, role: ROLES.ADMIN, name: 'Super Admin' };
                this.setCurrentUser(user);
                return { success: true, user };
            }
            // Check dynamic users store (admin/leader)
            try {
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const found = users.find(u => u.username === username && u.password === password);
                if (found && (found.role === ROLES.ADMIN || found.role === ROLES.LEADER)) {
                    const user = { username: found.username, role: found.role, name: found.name || found.username, club: found.club };
                    this.setCurrentUser(user);
                    return { success: true, user };
                }
            } catch (e) { }
            // Leader: leader_tech / admin@123
            if (username.startsWith('leader_')) {
                const club = username.split('_')[1];
                if (password === 'admin@123') {
                    const user = { username, role: ROLES.LEADER, club: club, name: `${club.charAt(0).toUpperCase() + club.slice(1)} Leader` };
                    this.setCurrentUser(user);
                    return { success: true, user };
                }
            }
            return { success: false, message: 'Invalid credentials' };
        },
        logout: function () {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminUsername');
            window.location.replace('index.html'); // Redirect to home with replace
        },
        setCurrentUser: function (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            if (user.role !== ROLES.STUDENT) {
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('currentAdminUser', user.username);
            }
            localStorage.setItem('loginTime', Date.now().toString());
            this.logActivity(`User ${user.username} logged in`);
        },
        getCurrentUser: function () {
            return JSON.parse(localStorage.getItem('currentUser'));
        },
        can: function (permission) {
            const user = this.getCurrentUser();
            if (!user) return false;
            if (user.role === ROLES.ADMIN) return true;
            const list = PERMISSIONS[user.role] || [];
            if (list.includes('*')) return true;
            return list.includes(permission);
        },
        logActivity: function (action) {
            const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
            logs.unshift({ timestamp: new Date().toISOString(), action });
            localStorage.setItem('activityLogs', JSON.stringify(logs.slice(0, 50))); // Keep last 50
        },
        guardRoute: function () {
            const fullPath = window.location.pathname;
            const fileName = fullPath.split('/').pop() || 'index.html';
            const user = this.getCurrentUser();

            // Session Timeout (30 mins)
            const loginTime = localStorage.getItem('loginTime');
            if (user && loginTime && (Date.now() - parseInt(loginTime) > 30 * 60 * 1000)) {
                alert('Session expired. Please login again.');
                this.logout();
                return false;
            }

            // Admin Dashboard Protection
            if (fileName === 'admin-dashboard.html') {
                if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.LEADER)) {
                    window.location.replace('admin-login.html');
                    return false;
                }

                // UI Customization based on Role
                this.customizeDashboard(user);
            }

            // Admin Login Page
            if (fileName === 'admin-login.html' && user && (user.role === ROLES.ADMIN || user.role === ROLES.LEADER)) {
                window.location.replace('admin-dashboard.html');
                return false;
            }

            // Student-only My Hub
            if (fileName === 'my-hub.html') {
                const student = JSON.parse(localStorage.getItem('studentUser'));
                if (!student) {
                    window.location.replace('registration.html#student-login');
                    return false;
                }
            }
            return true;
        },
        customizeDashboard: function (user) {
            // Hide elements not for valid role
            if (user.role === ROLES.LEADER) {
                // Hide Settings, maybe Reports if sensitive
                const settingsLink = document.querySelector('a[href="#settings"]');
                if (settingsLink) settingsLink.parentElement.style.display = 'none';

                // Update Profile Info
                const profileName = document.querySelector('.profile-info h3');
                const profileRole = document.querySelector('.profile-info p');
                if (profileName) profileName.textContent = user.name;
                if (profileRole) profileRole.textContent = `Club Leader - ${user.club.toUpperCase()}`;
            } else if (user.role === ROLES.ADMIN) {
                const profileName = document.querySelector('.profile-info h3');
                const profileRole = document.querySelector('.profile-info p');
                if (profileName) profileName.textContent = user.name || user.username || 'Admin';
                if (profileRole) profileRole.textContent = 'Administrator';
            }
        }
    };

    // Run Guard
    window.AuthService.guardRoute();
    // --- RBAC & AUTH SYSTEM END ---

    // Initialize global events data
    // Note: Using January 2026 dates (current date context) for easier testing
    window.events = [
        { id: 1, name: "AI Workshop Series", club: "tech", startDate: "2026-01-20", endDate: "2026-01-20", startTime: "14:00", endTime: "17:00", location: "CS Building, Room 101", description: "Hands-on session on machine learning fundamentals and applications." },
        { id: 2, name: "Digital Art Masterclass", club: "arts", startDate: "2026-01-22", endDate: "2026-01-22", startTime: "16:00", endTime: "18:00", location: "Arts Center, Studio 3", description: "Learn advanced techniques in digital painting and illustration." },
        { id: 3, name: "Public Speaking Workshop", club: "debate", startDate: "2026-01-24", endDate: "2026-01-24", startTime: "15:00", endTime: "17:00", location: "Humanities Building, Room 205", description: "Improve your public speaking and presentation skills." },
        { id: 4, name: "Multi-Day Conference", club: "tech", startDate: "2026-02-01", endDate: "2026-02-03", startTime: "09:00", endTime: "17:00", location: "Main Auditorium", description: "Tech conference spanning multiple days." },
        { id: 5, name: "Tech Seminar", club: "tech", startDate: "2026-01-20", endDate: "2026-01-20", startTime: "15:00", endTime: "17:00", location: "CS Building, Room 102", description: "Advanced tech topics discussion." },
        { id: 6, name: "Music Jam Session", club: "music", startDate: "2026-01-20", endDate: "2026-01-20", startTime: "15:00", endTime: "17:00", location: "Music Hall, Studio A", description: "Live jam session with fellow musicians." },
        { id: 7, name: "Web Development Bootcamp", club: "tech", startDate: "2026-01-25", endDate: "2026-01-25", startTime: "13:30", endTime: "15:30", location: "Lab Building, Room 305", description: "Intensive web development training." },
        { id: 8, name: "Creative Writing Workshop", club: "arts", startDate: "2026-01-22", endDate: "2026-01-22", startTime: "17:00", endTime: "19:00", location: "Library Hall, Room 201", description: "Explore creative writing techniques and storytelling." },
        { id: 9, name: "Debate Championship", club: "debate", startDate: "2026-01-28", endDate: "2026-01-28", startTime: "10:00", endTime: "15:00", location: "Auditorium, Main Hall", description: "Inter-club debate competition with prizes." }
    ];

    initNavigation();
    initTestimonialsAndSliders();
    initTabsAndModals();
    initCalendar();
    initForms();
    initAdmin();
    initAnimations();
    initStudentSession();
    initClubButtons();
    initClubDetails();
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});

/**
 * Date Helper Functions
 */
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

/**
 * HTML Sanitization
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Form Error Handling Helpers
 */
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

function clearFormErrors(form) {
    if (!form) return;
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.form-success').forEach(el => el.remove());
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

    function toggleMenu() {
        if (isMenuOpen) closeMenu(); else openMenu();
    }

    mobileMenuToggle.addEventListener('click', toggleMenu);

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
                if (isMenuOpen) closeMenu();
            }
        });
    });
}

/**
 * My Hub Logic
 */
async function initMyHub() {
    const token = localStorage.getItem('studentToken');
    if (!token && window.location.pathname.includes('my-hub.html')) {
        window.location.href = 'registration.html#student-login';
        return;
    }
    if (!token) return;

    const welcomeMsg = document.getElementById('hub-welcome-msg');
    const clubsList = document.getElementById('joined-clubs-list');
    const eventsList = document.getElementById('registered-events-list');

    try {
        const res = await fetch('http://localhost:3000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            const { user, registrations, memberships } = data;

            if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${user.firstName}!`;

            if (clubsList) {
                if (memberships.length === 0) {
                    clubsList.innerHTML = '<div class="no-data"><p>You haven\'t joined any clubs yet.</p><a href="registration.html" class="action-button" style="display:inline-block; margin-top:1rem;">Discover Clubs</a></div>';
                } else {
                    clubsList.innerHTML = '';
                    memberships.forEach(m => {
                        const clubName = m.clubId.charAt(0).toUpperCase() + m.clubId.slice(1);
                        const item = document.createElement('div');
                        item.classList.add('hub-item');
                        item.innerHTML = `
                            <div class="hub-item-info">
                                <h4>${clubName} Club</h4>
                                <p><span class="status-badge ${m.status.toLowerCase()}">${m.status}</span></p>
                            </div>
                        `;
                        clubsList.appendChild(item);
                    });
                }
            }

            if (eventsList) {
                if (registrations.length === 0) {
                    eventsList.innerHTML = '<div class="no-data"><p>You haven\'t registered for any events yet.</p><a href="events.html" class="action-button" style="display:inline-block; margin-top:1rem;">View Events</a></div>';
                } else {
                    eventsList.innerHTML = '';
                    registrations.forEach(reg => {
                        const item = document.createElement('div');
                        item.classList.add('hub-item');
                        item.innerHTML = `
                            <div class="hub-item-info">
                                <h4>${reg.eventName}</h4>
                                <p><i class="far fa-calendar-alt"></i> ${new Date(reg.eventDate).toLocaleDateString()} | <i class="far fa-clock"></i> ${reg.eventTime || 'TBA'}</p>
                            </div>
                        `;
                        eventsList.appendChild(item);
                    });
                }
            }
        } else {
            eventsList.innerHTML = '';
            // Sort by start date
            registeredEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            registeredEvents.forEach(event => {
                const item = document.createElement('div');
                item.classList.add('hub-item');
                // Format date properly
                const startDate = new Date(event.startDate);
                const endDate = new Date(event.endDate || event.startDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const isPast = endDate < today;

                const formattedDate = startDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                item.innerHTML = `
                    <div class="hub-item-info">
                        <h4>${event.name}</h4>
                        <p><i class="far fa-calendar-alt"></i> ${formattedDate} | <i class="far fa-clock"></i> ${event.startTime} - ${event.endTime}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${event.location || 'TBA'}</p>
                    </div>
                    <div class="hub-item-actions">
                        ${isPast
                        ? `<button class="action-button small certificate-btn" data-id="${event.id}"><i class="fas fa-certificate"></i> Certificate</button>
                               <button class="action-button small feedback-btn" data-id="${event.id}"><i class="fas fa-comment"></i> Feedback</button>`
                        : `<button class="cancel-button small cancel-reg-btn" data-id="${event.id}"><i class="fas fa-times"></i> Cancel</button>`
                    }
                    </div>
                `;
                eventsList.appendChild(item);
            });

            // Bind Actions
            eventsList.querySelectorAll('.cancel-reg-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    if (confirm('Are you sure you want to cancel this registration?')) {
                        const updated = registeredEvents.filter(e => e.id !== id);
                        localStorage.setItem(`events_${student.id}`, JSON.stringify(updated));
                        initMyHub();
                        alert('Registration cancelled.');
                    }
                });
            });

            eventsList.querySelectorAll('.certificate-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    alert('Generating your E-Certificate... Check your downloads in a moment.');
                    // In a real app, this would trigger a PDF download
                });
            });

            eventsList.querySelectorAll('.feedback-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const feedback = prompt('Please share your thoughts on this event:');
                    if (feedback) {
                        alert('Thank you for your feedback! It has been submitted to the organizers.');
                        window.AuthService.logActivity(`Feedback submitted for event ${btn.dataset.id}`);
                    }
                });
            });
        }
    } catch (err) {
        console.error("Failed to fetch user data:", err);
    }
}

/**
 * 2. Testimonials & Image Sliders
 */
function initTestimonialsAndSliders() {
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    if (testimonialSlides.length > 0) {
        let currentSlide = 0;
        function showSlide(index) {
            testimonialSlides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            testimonialSlides[index].classList.add('active');
            dots[index].classList.add('active');
            currentSlide = index;
        }
        dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
        setInterval(() => {
            currentSlide = (currentSlide + 1) % testimonialSlides.length;
            showSlide(currentSlide);
        }, 5000);
    }
}

/**
 * 3. Tabs & Modals
 */
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
            button.addEventListener('click', () => {
                switchTab(button.getAttribute('data-tab'));
            });
        });

        const checkHash = () => {
            const hash = window.location.hash.substring(1);
            if (hash) switchTab(hash);
        };
        checkHash();
        window.addEventListener('hashchange', checkHash);
    }

    // Modal Logic
    const modal = document.getElementById('event-modal');
    const closeModal = document.querySelector('.close-modal');
    if (modal) {
        if (closeModal) closeModal.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
}

/**
 * 4. Forms
 */
function initForms() {
    // 1. Student Login
    const studentLoginForm = document.getElementById('student-login-form');
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const loginBtn = this.querySelector('button[type="submit"]');
            const originalText = loginBtn.textContent;
            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('studentToken', data.token);
                    localStorage.setItem('studentUser', JSON.stringify(data.user));
                    window.location.href = 'my-hub.html';
                } else {
                    const msg = document.getElementById('login-message');
                    if (msg) msg.textContent = data.message || 'Login failed';
                }
            } catch (error) {
                console.error('Login error:', error);
                const msg = document.getElementById('login-message');
                if (msg) msg.textContent = 'Network error during login';
            } finally {
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            }
        });
    }

    // 2. Club Registration
    const clubRegistrationForm = document.getElementById('club-registration-form');
    if (clubRegistrationForm) {
        clubRegistrationForm.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', function () { clearFieldError(this); });
        });

        clubRegistrationForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            clearFormErrors(this);

            const firstName = document.getElementById('club-first-name');
            const lastName = document.getElementById('club-last-name');
            const email = document.getElementById('club-email');
            const studentId = document.getElementById('club-student-id');
            const major = document.getElementById('club-major');
            const year = document.getElementById('club-year');

            let isValid = true;
            if (!firstName.value.trim()) { showFieldError(firstName, 'First name is required'); isValid = false; }
            if (!lastName.value.trim()) { showFieldError(lastName, 'Last name is required'); isValid = false; }
            if (!email.value.trim()) { showFieldError(email, 'Email is required'); isValid = false; }
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { showFieldError(email, 'Please enter a valid email address'); isValid = false; }
            if (!studentId.value.trim()) { showFieldError(studentId, 'Student ID is required'); isValid = false; }
            if (!major.value.trim()) { showFieldError(major, 'Major is required'); isValid = false; }
            if (!year.value) { showFieldError(year, 'Please select your year of study'); isValid = false; }

            const selectedClubs = Array.from(this.querySelectorAll('input[name="clubs[]"]:checked')).map(cb => cb.value);
            if (selectedClubs.length === 0) {
                alert("Please select at least one club.");
                isValid = false;
            }

            if (!isValid) return;

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName: firstName.value,
                        lastName: lastName.value,
                        email: email.value,
                        password: 'password123',
                        studentId: studentId.value,
                        major: major.value,
                        year: year.value,
                        clubs: selectedClubs
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    const successMsg = document.getElementById('club-success-message');
                    const successText = document.getElementById('club-success-text');
                    if (successMsg && successText) {
                        successText.textContent = 'Registration successful! You can now login.';
                        successMsg.classList.remove('hidden');
                    }
                    this.reset();
                    setTimeout(() => { window.location.hash = 'student-login'; }, 2000);
                } else {
                    alert(data.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('An error occurred. Please try again.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // 3. Event Registration
    const eventRegistrationForm = document.getElementById('event-registration-form');
    if (eventRegistrationForm) {
        eventRegistrationForm.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', function () { clearFieldError(this); });
        });

        eventRegistrationForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            clearFormErrors(this);

            const eventNameElement = document.getElementById('selected-event-name');
            const eventName = eventNameElement ? eventNameElement.textContent : '';
            const firstName = document.getElementById('event-first-name');
            const lastName = document.getElementById('event-last-name');
            const email = document.getElementById('event-email');
            const studentId = document.getElementById('event-student-id');

            let isValid = true;
            if (!firstName.value.trim()) { showFieldError(firstName, 'First name is required'); isValid = false; }
            if (!lastName.value.trim()) { showFieldError(lastName, 'Last name is required'); isValid = false; }
            if (!email.value.trim()) { showFieldError(email, 'Email is required'); isValid = false; }
            if (!studentId.value.trim()) { showFieldError(studentId, 'Student ID is required'); isValid = false; }

            if (!isValid) return;

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            try {
                // Get Event ID
                const eventsRes = await fetch('http://localhost:3000/api/events');
                if (!eventsRes.ok) throw new Error('Failed to fetch events');
                const events = await eventsRes.json();
                const event = events.find(e => e.name === eventName);

                if (!event) {
                    alert('Event not found. Please try again.');
                    return;
                }

                const token = localStorage.getItem('studentToken');
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const regRes = await fetch(`http://localhost:3000/api/events/${event.id}/register`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        firstName: firstName.value,
                        lastName: lastName.value,
                        email: email.value,
                        studentId: studentId.value
                    })
                });

                const regData = await regRes.json();
                if (regRes.ok) {
                    showFormSuccess(this, 'Event registration submitted successfully!');
                    setTimeout(() => {
                        this.reset();
                        const container = document.getElementById('event-registration-form-container');
                        if (container) container.classList.add('hidden');
                    }, 2000);
                } else {
                    throw new Error(regData.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Event Registration Error:', error);
                alert(error.message);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // 4. Certificate Request
    const certificateForm = document.getElementById('certificate-form');
    if (certificateForm) {
        certificateForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const studentId = document.getElementById('certificate-student-id').value;
            const eventId = document.getElementById('certificate-event').value;
            const fileField = document.getElementById('certificate-file');

            if (fileField.files.length > 0) {
                showFormSuccess(this, `Certificate request for student ${studentId} for event ${eventId} uploaded successfully!`);
                setTimeout(() => this.reset(), 3000);
            } else {
                alert("Please upload a file");
            }
        });
    }
    // 5. Feedback Form
    // 5. Feedback Form
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        console.log('General feedback form initialized');
        feedbackForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const name = document.getElementById('feedback-name').value;
            const email = document.getElementById('feedback-email').value;
            const message = document.getElementById('feedback-message').value;
            const responseDiv = document.getElementById('feedback-response');

            try {
                const res = await fetch('http://localhost:3000/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                if (res.ok) {
                    responseDiv.textContent = 'Feedback sent successfully!';
                    responseDiv.style.color = 'var(--success-color, green)';
                    this.reset();
                    setTimeout(() => {
                        responseDiv.textContent = '';
                    }, 5000);
                } else {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to send feedback');
                }
            } catch (err) {
                console.error(err);
                if (responseDiv) {
                    responseDiv.textContent = 'Error: ' + err.message;
                    responseDiv.style.color = 'var(--danger-color, red)';
                } else {
                    alert('Error: ' + err.message);
                }
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // 6. Event Feedback Form (Modal)
    const eventFeedbackForm = document.getElementById('event-feedback-form');
    if (eventFeedbackForm) {
        console.log('Event feedback form initialized');
        eventFeedbackForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const name = document.getElementById('event-feedback-name').value;
            const eventName = document.getElementById('event-feedback-event').value;
            const rating = document.getElementById('event-feedback-rating').value;
            const message = document.getElementById('event-feedback-message').value;
            const responseDiv = document.getElementById('event-feedback-response');

            try {
                const res = await fetch('http://localhost:3000/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, eventName, rating, message })
                });

                if (res.ok) {
                    responseDiv.textContent = 'Feedback sent successfully!';
                    responseDiv.style.color = '#4ade80'; // Success green
                    this.reset();
                    setTimeout(() => {
                        responseDiv.textContent = '';
                        const modal = document.getElementById('feedback-modal');
                        if (modal) modal.style.display = 'none';
                    }, 2000);
                } else {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to send feedback');
                }
            } catch (err) {
                console.error(err);
                if (responseDiv) {
                    responseDiv.textContent = 'Error: ' + err.message;
                    responseDiv.style.color = '#f87171'; // Danger red
                } else {
                    alert('Error: ' + err.message);
                }
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

/**
 * 5. Calendar System
 */
function initCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;

    const currentMonthElement = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const eventModal = document.getElementById('event-modal');

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Mock Events for Calendar Display
    const events = [
        { id: 1, name: "AI Workshop", club: "tech", date: getFutureDate(7), time: "14:00", description: "Hands-on session." },
        { id: 2, name: "Digital Art", club: "arts", date: getFutureDate(14), time: "16:00", description: "Art Masterclass." },
        { id: 3, name: "Debate", club: "debate", date: getFutureDate(21), time: "15:00", description: "Public Speaking." }
    ];

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (currentMonthElement) currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            calendarGrid.appendChild(empty);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.innerHTML = `<div class="day-number">${i}</div>`;

            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);

            dayEvents.forEach(ev => {
                const evEl = document.createElement('div');
                evEl.className = `day-event ${ev.club}`;
                evEl.textContent = ev.name;
                dayEl.appendChild(evEl);
            });

            dayEventsData.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.classList.add('day-event', event.club);

                // Check for conflicts
                const student = JSON.parse(localStorage.getItem('studentUser'));
                if (student) {
                    const registeredEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];
                    const conflictEvent = registeredEvents.find(regEvent => {
                        const type = getConflictType(regEvent, event);
                        return type !== 'none';
                    });

                    if (conflictEvent) {
                        const conflictType = getConflictType(conflictEvent, event);
                        if (conflictType === 'direct') {
                            eventElement.classList.add('conflict');
                        } else if (conflictType === 'near') {
                            eventElement.classList.add('near-conflict');
                        }
                    }
                }

                eventElement.textContent = event.name;
                eventElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEventDetails(event);
                });
                dayEvents.appendChild(eventElement);
            });

            dayElement.appendChild(dayEvents);

            // Click day to add event
            dayElement.addEventListener('click', function (e) {
                if (e.target === this || e.target.classList.contains('day-number')) {
                    const currentUser = window.AuthService.getCurrentUser();
                    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'leader')) {
                        alert('Only Admins and Club Leaders can create events.');
                        return;
                    }
                    openEventModal(null, dateStr);
                }
            });

            calendarGrid.appendChild(dayElement);
        }
    }

    if (prevMonthButton) prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });

        const currentUser = window.AuthService.getCurrentUser();
        const canEdit = !!currentUser && (
            currentUser.role === 'admin' || (currentUser.role === 'leader' && currentUser.club === event.club)
        );

        eventDetailsContainer.innerHTML = `
            <div class="event-details">
                <div class="event-header">
                    <span class="event-club-badge ${event.club}">${getClubName(event.club)}</span>
                    ${canEdit ? '<button id="edit-event" class="action-button"><i class="fas fa-edit"></i> Edit</button>' : ''}
                </div>
                <h2 class="event-title">${event.name}</h2>
                <div class="event-date-time">
                    <span><i class="far fa-calendar-alt"></i> ${formatDate(event.startDate, event.endDate)}</span>
                    <span><i class="far fa-clock"></i> ${event.startTime} - ${event.endTime}</span>
                </div>
                <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                <p class="event-description">${event.description}</p>
                <div class="event-actions">
                    <button id="register-for-event" class="action-button"><i class="fas fa-user-plus"></i> Register</button>
                    <button id="share-event" class="action-button"><i class="fas fa-share-alt"></i> Share</button>
                </div>
            </div>
        `;

        // Bind dynamic buttons
        const editBtn = document.getElementById('edit-event');
        if (editBtn) editBtn.addEventListener('click', () => openEventModal(event));
        document.getElementById('register-for-event').addEventListener('click', () => registerForEvent(event));
        document.getElementById('share-event').addEventListener('click', () => alert(`Share link for ${event.name} copied to clipboard!`));
    }

    function openEventModal(event = null, date = null) {
        if (!eventModal) return;
        const currentUser = window.AuthService.getCurrentUser();
        // Permission checks
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'leader')) {
            alert('You are not authorized to manage events.');
            return;
        }

        if (event) {
            if (currentUser.role === 'leader' && event.club !== currentUser.club) {
                alert('Leaders can only manage events of their own club.');
                return;
            }
            document.getElementById('modal-title').textContent = 'Edit Event';
            document.getElementById('event-name').value = event.name;
            document.getElementById('event-club').value = event.club;
            document.getElementById('event-start-date').value = event.startDate;
            document.getElementById('event-end-date').value = event.endDate;
            document.getElementById('event-start-time').value = event.startTime;
            document.getElementById('event-end-time').value = event.endTime;
            document.getElementById('event-location').value = event.location;
            document.getElementById('event-description').value = event.description;
            if (deleteEventButton) deleteEventButton.style.display = 'block';
            selectedEvent = event;
        } else {
            document.getElementById('modal-title').textContent = 'Add New Event';
            eventForm.reset();
            if (date) {
                document.getElementById('event-start-date').value = date;
                document.getElementById('event-end-date').value = date;
            }
            if (deleteEventButton) deleteEventButton.style.display = 'none';
            selectedEvent = null;
            // Leader scoping: lock club selector
            const clubSelect = document.getElementById('event-club');
            if (currentUser.role === 'leader' && clubSelect) {
                clubSelect.value = currentUser.club;
                clubSelect.disabled = true;
            } else if (clubSelect) {
                clubSelect.disabled = false;
            }
        }
        eventModal.style.display = 'flex';
    }

    // Event Form Submit
    if (eventForm) {
        eventForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const eventData = {
                name: document.getElementById('event-name').value,
                club: document.getElementById('event-club').value,
                startDate: document.getElementById('event-start-date').value,
                endDate: document.getElementById('event-end-date').value,
                startTime: document.getElementById('event-start-time').value,
                endTime: document.getElementById('event-end-time').value,
                location: document.getElementById('event-location').value,
                description: document.getElementById('event-description').value
            };
            const currentUser = window.AuthService.getCurrentUser();
            if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'leader')) {
                alert('You are not authorized to save events.');
                return;
            }
            if (currentUser.role === 'leader' && eventData.club !== currentUser.club) {
                alert('Leaders can only manage events of their own club.');
                return;
            }
            if (selectedEvent) {
                Object.assign(selectedEvent, eventData);
                window.AuthService.logActivity(`Event updated: ${selectedEvent.name} (${selectedEvent.club})`);
            } else {
                eventData.id = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
                events.push(eventData);
                selectedEvent = eventData;
                window.AuthService.logActivity(`Event created: ${selectedEvent.name} (${selectedEvent.club})`);
            }
            renderCalendar();
            showEventDetails(selectedEvent);
            eventModal.style.display = 'none';
        });
    }

    // Delete Event
    if (deleteEventButton) {
        deleteEventButton.addEventListener('click', function () {
            if (selectedEvent && confirm('Are you sure you want to delete this event?')) {
                const currentUser = window.AuthService.getCurrentUser();
                if (!currentUser || (currentUser.role !== 'admin' && !(currentUser.role === 'leader' && currentUser.club === selectedEvent.club))) {
                    alert('You are not authorized to delete this event.');
                    return;
                }
                events = events.filter(e => e.id !== selectedEvent.id);
                window.AuthService.logActivity(`Event deleted: ${selectedEvent.name} (${selectedEvent.club})`);
                renderCalendar();
                eventDetailsContainer.innerHTML = `<div class="no-event-selected"><i class="fas fa-calendar-alt"></i><p>Select an event from the calendar to view details</p></div>`;
                eventModal.style.display = 'none';
            }
        });
    }

    // Month Navigation
    if (prevMonthButton) {
        prevMonthButton.addEventListener('click', function () {
            currentMonth--;
            if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            renderCalendar();
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener('click', function () {
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            renderCalendar();
        });
    }

    // Date Picker Jump Functionality
    const monthPicker = document.getElementById('month-picker');
    const yearPicker = document.getElementById('year-picker');
    const jumpToDateBtn = document.getElementById('jump-to-date');
    const todayBtn = document.getElementById('today-btn');

    // Populate year dropdown dynamically
    if (yearPicker) {
        const currentYear = new Date().getFullYear();
        const startYear = 2020; // Start from 2020
        const endYear = currentYear + 5; // Go 5 years into the future

        for (let year = startYear; year <= endYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true;
            }
            yearPicker.appendChild(option);
        }
    }

    if (monthPicker && yearPicker && jumpToDateBtn) {
        jumpToDateBtn.addEventListener('click', function () {
            currentMonth = parseInt(monthPicker.value);
            currentYear = parseInt(yearPicker.value);
            renderCalendar();
        });
    }

    if (todayBtn) {
        todayBtn.addEventListener('click', function () {
            const today = new Date();
            currentMonth = today.getMonth();
            currentYear = today.getFullYear();

            // Update pickers to reflect today
            if (monthPicker) monthPicker.value = currentMonth;
            if (yearPicker) yearPicker.value = currentYear;

            renderCalendar();
        });
    }

    // Update pickers when month/year changes
    if (monthPicker && yearPicker) {
        window.updateDatePickers = function () {
            monthPicker.value = currentMonth;
            yearPicker.value = currentYear;
        };
    }

    // Filters (Club/Date)
    function filterEvents() {
        if (!clubFilter || !dateFilter) return;
        const clubValue = clubFilter.value;
        const dateValue = dateFilter.value;
        const today = new Date();

        // Date math for week/month filters
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - today.getDay());
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);

        eventCards.forEach(card => {
            const cardClub = card.getAttribute('data-club');
            const cardDateStr = card.getAttribute('data-date');
            const cardDate = new Date(cardDateStr);

            let clubMatch = clubValue === 'all' || cardClub === clubValue;
            let dateMatch = true;

            if (dateValue !== 'all') {
                if (dateValue === 'this-week') dateMatch = cardDate >= currentWeekStart && cardDate <= currentWeekEnd;
                else if (dateValue === 'this-month') dateMatch = cardDate >= currentMonthStart && cardDate <= currentMonthEnd;
                else if (dateValue === 'next-month') dateMatch = cardDate >= nextMonthStart && cardDate <= nextMonthEnd;
            }

            card.style.display = (clubMatch && dateMatch) ? 'block' : 'none';
        });
    }

    if (clubFilter && dateFilter) {
        clubFilter.addEventListener('change', filterEvents);
        dateFilter.addEventListener('change', filterEvents);
    }

    // Initialize View
    renderCalendar();
}

/**
 * 6. Admin
 */
function initAdmin() {
    // 1. Admin Login
    const adminLoginForm = document.getElementById('admin-login-form');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('admin-password');
    const toggleConfirmPassword = document.querySelector('.toggle-confirm-password');
    const confirmPasswordInput = document.getElementById('admin-confirm-password');
    const confirmPasswordGroup = document.getElementById('confirm-password-group');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const toggleModeLink = document.getElementById('toggle-mode');
    const loginButton = document.querySelector('.login-button');
    const footerText = document.getElementById('footer-text');
    const forgotWrapper = document.getElementById('forgot-password-wrapper'); // <div> with Forgot password link

    let isLoginMode = true;

    function toggleMode(login) {
        isLoginMode = login;

        // Safety check: if essential container missing, stop UI updates but state is set
        if (!confirmPasswordGroup) return;

        if (login) {
            // LOGIN MODE
            confirmPasswordGroup.style.display = 'none';
            if (loginButton) loginButton.textContent = 'Login';
            if (tabLogin) tabLogin.classList.add('active');
            if (tabSignup) tabSignup.classList.remove('active');
            if (footerText) footerText.textContent = "Don't have an account?";
            if (toggleModeLink) toggleModeLink.textContent = "Sign Up";
            if (forgotWrapper) forgotWrapper.style.display = 'block';
        } else {
            // SIGNUP MODE
            confirmPasswordGroup.style.display = 'block';
            if (loginButton) loginButton.textContent = 'Create Account';
            if (tabSignup) tabSignup.classList.add('active');
            if (tabLogin) tabLogin.classList.remove('active');
            if (footerText) footerText.textContent = "Already have an account?";
            if (toggleModeLink) toggleModeLink.textContent = "Login";
            if (forgotWrapper) forgotWrapper.style.display = 'none';
        }
    }

    // Set initial mode (login)
    if (confirmPasswordGroup) toggleMode(true);

    if (tabLogin && tabSignup) {
        tabLogin.addEventListener('click', () => toggleMode(true));
        tabSignup.addEventListener('click', () => toggleMode(false));
    }

    if (toggleModeLink) {
        toggleModeLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMode(!isLoginMode);
        });
    }

    // Password Toggle
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {

            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';

            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    // Password Toggle for confirm password field
    if (toggleConfirmPassword && confirmPasswordInput) {
        toggleConfirmPassword.addEventListener('click', function () {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    // Login / Signup Submission

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: username, password })
                });

            if (isLoginMode) {
                // LOGIN LOGIC
                // Check stored custom admins first, then hardcoded default
                const result = window.AuthService.login(username, password);

                if (result.success) {
                    if (rememberMe) {
                        localStorage.setItem('adminRemembered', 'true');
                        localStorage.setItem('adminUsername', username);
                    } else {
                        alert('Access Denied: You are not an admin.');
                    }

                    localStorage.setItem('adminLoggedIn', 'true');
                    localStorage.setItem('currentAdminUser', username);

                    if (loginButton) {
                        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Logging in...</span>';
                        loginButton.disabled = true;
                    }
                    // Immediate redirect instead of timeout to reduce "flicker/fluctuation"
                    window.location.replace('admin-dashboard.html');
                } else {
                    alert('Login failed');
                }
            } else {
                // SIGN UP LOGIC
                const confirmPass = confirmPasswordInput.value;
                if (password !== confirmPass) {
                    alert('Passwords do not match!');
                    return;
                }

                // Check if user exists (unified users store)
                const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
                if (username === 'admin' || existingUsers.some(u => u.username === username)) {
                    alert('Username already exists. Please choose another.');
                    return;
                }

                // Create new user
                existingUsers.push({ username, password, role: 'admin' });
                localStorage.setItem('users', JSON.stringify(existingUsers));

                toggleMode(true);
            }
        });
    }

    function checkAdminCredentials(u, p) {
        // 1. Super Admin (Generic)
        if (u === 'admin' && p === 'admin@123') return { success: true, role: 'admin' };

        // 2. Club Leader (Pattern)
        // Format: Username "leader_tech", Password "tech@123"
        if (u.startsWith('leader_')) {
            const club = u.split('_')[1]; // e.g., "tech"
            if (club && p === `${club}@123`) {
                return { success: true, role: 'leader', club: club };
            }
        }

        // 3. Local Storage
        const admins = JSON.parse(localStorage.getItem('adminUsers')) || [];
        const found = admins.find(user => user.username === u && user.password === p);
        if (found) return { success: true, role: 'admin' };

        return { success: false };
    }

    // 6b. Admin Dashboard Logic
    const adminDashboard = document.getElementById('admin-dashboard');
    if (adminDashboard) {
        // Redundant check removed. guardRoute handles this globally.
        // const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        // if (!isLoggedIn) { ... }
        if (true) {
            // Init Sidebar Navigation
            const sidebarLinks = document.querySelectorAll('.admin-menu a');
            const sections = document.querySelectorAll('.admin-tab-content');

        // Sidebar Navigation
        const sidebarLinks = document.querySelectorAll('.admin-menu a');
        const sections = document.querySelectorAll('.admin-tab-content');

        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);

                // Update Active Link
                document.querySelectorAll('.admin-menu li').forEach(li => li.classList.remove('active'));
                link.parentElement.classList.add('active');

                        if (targetId === 'dashboard') {
                            // setTimeout(initAnalytics, 100); // Removed: we use initDashboardCharts now
                        }

                // Load Data based on section
                if (targetId === 'dashboard' || targetId === 'registrations') loadRegistrations();
                if (targetId === 'clubs') loadClubMemberships();
                if (targetId === 'feedbacks') loadFeedbacks();
            });
        });

        // Logout
        document.getElementById('admin-logout').addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
        });

        // Initial Load
        loadRegistrations();

        async function loadRegistrations() {
            try {
                const res = await fetch('http://localhost:3000/api/admin/registrations', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const tbody = document.querySelector('#registrations-table tbody');
                    if (tbody) {
                        tbody.innerHTML = data.map(reg => `
                            <tr>
                                <td>#${reg.id}</td>
                                <td>${reg.name}</td>
                                <td>${reg.email}</td>
                                <td>${reg.clubs.join(', ')}</td>
                                <td>${new Date(reg.registeredAt).toLocaleDateString()}</td>
                                <td><button class="table-action view"><i class="fas fa-eye"></i></button></td>
                            </tr>
                        `).join('');
                    }
                }
            } catch (err) { console.error(err); }
        }

        async function loadClubMemberships() {
            try {
                const res = await fetch('http://localhost:3000/api/admin/club-memberships', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const tbody = document.querySelector('#clubs-table tbody');
                    if (tbody) {
                        tbody.innerHTML = data.map(m => `
                            <tr>
                                <td>#${m.id}</td>
                                <td>${m.name}</td>
                                <td>${m.studentId}</td>
                                <td>${m.club}</td>
                                <td><span class="status-badge ${m.status.toLowerCase()}">${m.status}</span></td>
                                <td><button class="table-action edit"><i class="fas fa-edit"></i></button></td>
                            </tr>
                        `).join('');
                    }
                }
            } catch (err) { console.error(err); }
        }

            loadAdminDashboard();
            initClubManagement();
            initUserManagement();
            // initAnalytics(); // upstream had it, but we have initDashboardCharts inside loadAdminDashboard now which uses Chart.js
            // If upstream's initAnalytics is distinct and needed, we can keep it, but it seems redundant with our charts.
            // Let's comment it out to rely on our new chart system, or check if it exists.
            if (typeof initAnalytics === 'function') initAnalytics();
            const logoutButton = document.getElementById('admin-logout');
            if (logoutButton) {
                logoutButton.addEventListener('click', function () {
                    // Update: use AuthService.logout() for consistency
                    window.AuthService.logout();
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log('Admin feedback data:', data);
                    const tbody = document.querySelector('#feedbacks-table tbody');
                    if (tbody) {
                        if (data.length === 0) {
                            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No feedback received yet.</td></tr>';
                        } else {
                            tbody.innerHTML = data.map(f => `
                                <tr>
                                    <td>${new Date(f.createdAt).toLocaleDateString()}</td>
                                    <td>${f.name}</td>
                                    <td>
                                        ${f.email ? `<div><i class="fas fa-envelope"></i> ${f.email}</div>` : ''}
                                        ${f.eventName ? `<div><i class="fas fa-calendar-day"></i> ${f.eventName}</div>` : ''}
                                    </td>
                                    <td>${f.rating || '-'}</td>
                                    <td>${f.message}</td>
                                    <td>${f.status}</td>
                                </tr>
                            `).join('');
                        }
                    }
                }
            } catch (err) { console.error(err); }
        }
    }

    // Admin Event Management Form
    const adminEventForm = document.getElementById('admin-event-form');
    if (adminEventForm) {
        adminEventForm.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', function () {
                clearFieldError(this);
            });
        });

        adminEventForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('admin-event-name').value;
            alert(`Event "${name}" saved successfully!`);
            this.reset();
        });
    }


    function loadAdminDashboard() {
        const currentUser = window.AuthService.getCurrentUser();
        const isLeader = currentUser && currentUser.role === 'leader';
        const userClub = isLeader ? currentUser.club : null;

        // Helper
        const getClubName = (id) => {
            const map = { 'tech': 'Tech Society', 'arts': 'Creative Arts', 'debate': 'Debate Club', 'music': 'Music Society', 'sports': 'Sports Club', 'science': 'Dance club- ABCD' };
            return map[id] || id;
        };


        // Render Student Registrations
        const registrationsTable = document.getElementById('registrations-table');
        if (registrationsTable) {
            registrationsTable.querySelector('tbody').innerHTML = ''; // Clear existing rows
            const registrations = [
                { id: 1, name: 'John Doe', email: 'john@example.com', studentId: 'S12345', clubs: ['tech', 'debate'], registeredAt: '2023-10-15' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', studentId: 'S12346', clubs: ['arts', 'music'], registeredAt: '2023-10-16' },
                { id: 3, name: 'Alex Johnson', email: 'alex@example.com', studentId: 'S1003', clubs: ['sports'], registeredAt: '2023-11-14' }
            ];

            // Filter for Leader
            const filteredRegs = isLeader
                ? registrations.filter(r => r.clubs.includes(userClub))
                : registrations;

            filteredRegs.forEach(reg => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${reg.id}</td><td>${reg.name}</td><td>${reg.email}</td><td>${reg.studentId}</td>
                    <td>${reg.clubs.map(c => getClubName(c)).join(', ')}</td>
                    <td>${new Date(reg.registeredAt).toLocaleDateString()}</td>
                    <td><button class="admin-action view" data-id="${reg.id}"><i class="fas fa-eye"></i></button>
                        ${!isLeader ? `<button class="admin-action delete" data-id="${reg.id}"><i class="fas fa-trash"></i></button>` : ''}</td>
                `;
                registrationsTable.querySelector('tbody').appendChild(row);
            });
        }

        // Render Event Registrations
        // Mock data usually comes from localStorage but here it is hardcoded in original. 
        // Initialize Charts
        initDashboardCharts(isLeader, userClub);
    }
}

function initDashboardCharts(isLeader, userClub) {
    // 1. Event Participation Chart (Loaded)
    const ctx1 = document.getElementById('eventParticipationChart')?.getContext('2d');
    if (ctx1) {
        // Destroy existing if any (simple cheat: replace canvas to prevent overlay issues or just assume fresh load)
        // For simplicity in this vanilla JS, we'll create a new Chart each time or let Chart.js handle it.
        // Ideally we track instances, but this is a quick fix.

        const data = isLeader
            ? [15, 25, 40, 10] // Mock data for specific club events
            : [65, 59, 80, 81, 56, 55]; // Mock data for all

        const labels = isLeader
            ? ['Workshop', 'Meetup', 'Hackathon', 'Webinar']
            : ['Tech', 'Arts', 'Debate', 'Music', 'Sports', 'Dance'];

        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '# of Participants',
                    data: data,
                    backgroundColor: 'rgba(253, 121, 168, 0.5)',
                    borderColor: 'rgba(253, 121, 168, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: 'white' } } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } },
                    x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } }
                }
            }
        });
    }

    // 2. Active Clubs Overview (Pie Chart)
    const ctx2 = document.getElementById('activeClubsChart')?.getContext('2d');
    if (ctx2 && !isLeader) {
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Tech', 'Arts', 'Sports', 'Music', 'Debate'],
                datasets: [{
                    data: [12, 19, 3, 5, 2],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: 'white' } } }
            }
        });
    } else if (ctx2 && isLeader) {
        // For leader, maybe show member status distribution
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Pending', 'Inactive'],
                datasets: [{
                    data: [85, 10, 5],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: 'white' } },
                    title: { display: true, text: 'Member Status', color: 'white' }
                }
            }
        });
    }

    // 3. Monthly Engagement (Line Chart)
    const ctx3 = document.getElementById('monthlyEngagementChart')?.getContext('2d');
    if (ctx3) {
        new Chart(ctx3, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Engagement Level',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: 'white' } } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } },
                    x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } }
                }
            }
        });
    }
}

/**
 * 7. Animations
 */
function initAnimations() {
    // Scroll animations
    const checkScroll = () => {
        document.querySelectorAll('.timeline-item, .club-card').forEach(item => {
            if (item.getBoundingClientRect().top < window.innerHeight * 0.75) item.classList.add('visible');
        });
    };
    window.addEventListener('scroll', checkScroll);
    checkScroll();
}

/**
 * Session Helpers
 */
function initStudentSession() {
    const logoutBtn = document.getElementById('student-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('studentToken');
            localStorage.removeItem('studentUser');
            const cu = window.AuthService.getCurrentUser();
            if (cu && cu.role === 'student') {
                localStorage.removeItem('currentUser');
            }
            updateUIForStudent();
            window.location.href = 'index.html';
        });
    }
    updateUIForStudent();
}

// Ensure student login sets currentUser role for unified RBAC
(function attachStudentLoginHook() {
    const studentLoginForm = document.getElementById('student-login-form');
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', function () {
            const name = document.getElementById('login-student-name')?.value;
            const id = document.getElementById('login-student-id')?.value;
            if (name && id) {
                const stuUser = { username: id, role: 'student', name };
                window.AuthService.setCurrentUser(stuUser);
            }
        });
    }
})();

function updateUIForStudent() {
    const token = localStorage.getItem('studentToken');
    const navMyHub = document.getElementById('nav-my-hub');
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');

    if (token) {
        if (navMyHub) navMyHub.classList.remove('hidden');
        if (navLogin) navLogin.classList.add('hidden');
        if (navLogout) navLogout.classList.remove('hidden');
    } else {
        if (navMyHub) navMyHub.classList.add('hidden');
        if (navLogin) navLogin.classList.remove('hidden');
        if (navLogout) navLogout.classList.add('hidden');
    }
}

function initClubButtons() {
    document.querySelectorAll('.view-club-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const clubId = this.getAttribute('data-club');
            window.location.href = `club.html?club=${clubId}`;
        });
    });
}

function initClubDetails() {
    if (window.location.pathname.includes('club.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const clubId = urlParams.get('club');
        if (clubId) {
            // Load club details logic
            document.title = `${clubId.charAt(0).toUpperCase() + clubId.slice(1)} Club - details`;
        }
    }
}

function updateEnrollmentStatus() {
    const student = JSON.parse(localStorage.getItem('studentUser'));
    if (!student) return;

    const joinedClubs = JSON.parse(localStorage.getItem(`clubs_${student.id}`)) || [];
    const registeredEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];

    // Update Club Cards
    document.querySelectorAll('.club-card').forEach(card => {
        const clubId = card.getAttribute('data-club');
        if (joinedClubs.includes(clubId)) {
            let statusBadge = card.querySelector('.enrolled-status');
            if (!statusBadge) {
                statusBadge = document.createElement('div');
                statusBadge.classList.add('enrolled-status');
                statusBadge.style.color = 'var(--success-color)';
                statusBadge.style.fontWeight = 'bold';
                statusBadge.style.marginTop = '1rem';
                statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Joined';
                card.appendChild(statusBadge);
            }
        }
    });

    // Update Event Cards
    document.querySelectorAll('.event-card').forEach(card => {
        const eventTitle = card.querySelector('.event-title').textContent;
        if (registeredEvents.some(e => e.name === eventTitle)) {
            const regBtn = card.querySelector('.register-button');
            if (regBtn) {
                regBtn.textContent = 'Registered';
                regBtn.disabled = true;
                regBtn.style.background = 'var(--success-color)';
                regBtn.style.cursor = 'default';
            }
        }
    });
}

/**
 * Export functions for testing
 * Only exports if running in Node.js environment (for Jest tests)
 */
function initClubManagement() {
    const tableBody = document.querySelector('#clubs-table tbody');
    const addBtn = document.getElementById('add-club-member-btn');
    const modal = document.getElementById('club-member-modal');
    const form = document.getElementById('club-member-form');
    const closeBtns = document.querySelectorAll('.close-club-modal');

    // Make sure we are on the admin dashboard
    if (!tableBody) return;

    // 1. Initial Data Load & Mocking
    let memberships = JSON.parse(localStorage.getItem('allClubMemberships')) || [];
    if (memberships.length === 0) {
        memberships = [
            { id: 1, name: 'Alice Walker', studentId: 'S1001', club: 'tech', status: 'Active' },
            { id: 2, name: 'Bob Builder', studentId: 'S1002', club: 'arts', status: 'Pending' },
            { id: 3, name: 'Charlie Day', studentId: 'S1003', club: 'debate', status: 'Active' }
        ];
        localStorage.setItem('allClubMemberships', JSON.stringify(memberships));
    }

    // 2. Render Table
    function renderTable() {
        tableBody.innerHTML = '';
        memberships = JSON.parse(localStorage.getItem('allClubMemberships')) || [];

        const currentUser = window.AuthService.getCurrentUser();
        const isLeader = currentUser && currentUser.role === 'leader';
        const userClub = isLeader ? currentUser.club : null;

        const getClubName = (code) => {
            const map = { 'tech': 'Tech Society', 'arts': 'Creative Arts', 'debate': 'Debate Club', 'music': 'Music Society', 'sports': 'Sports Club', 'science': 'Dance club- ABCD' };
            return map[code] || code;
        };

        // Filter for Leader
        const filteredMemberships = isLeader
            ? memberships.filter(m => m.club === userClub)
            : memberships;

        filteredMemberships.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${m.id}</td>
                <td>${m.name}</td>
                <td>${m.studentId}</td>
                <td>${getClubName(m.club)}</td>
                <td><span class="status-${m.status.toLowerCase()}">${m.status}</span></td>
                <td>
                    <button class="admin-action edit-club" data-id="${m.id}"><i class="fas fa-edit"></i></button>
                    <button class="admin-action delete-club" data-id="${m.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    renderTable();

    // 3. Modal Actions
    function openModal(member = null) {
        const title = document.getElementById('club-modal-title');
        const idInput = document.getElementById('club-member-id');
        const nameInput = document.getElementById('club-student-name');
        const dbIdInput = document.getElementById('club-student-db-id');
        const clubInput = document.getElementById('club-select');
        const statusInput = document.getElementById('club-status');
        const currentUser = window.AuthService.getCurrentUser();

        if (member) {
            title.textContent = 'Edit Club Member';
            idInput.value = member.id;
            nameInput.value = member.name;
            dbIdInput.value = member.studentId;
            clubInput.value = member.club;
            statusInput.value = member.status;
        } else {
            title.textContent = 'Add Club Member';
            form.reset();
            idInput.value = '';
        }
        if (currentUser && currentUser.role === 'leader') {
            clubInput.value = currentUser.club;
            clubInput.disabled = true;
        } else {
            clubInput.disabled = false;
        }
        modal.style.display = 'block';
    }

    if (addBtn) addBtn.addEventListener('click', () => openModal());

    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        modal.style.display = 'none';
    }));

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // 4. Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentUser = window.AuthService.getCurrentUser();
        const id = document.getElementById('club-member-id').value;
        const name = document.getElementById('club-student-name').value;
        const studentId = document.getElementById('club-student-db-id').value;
        let club = document.getElementById('club-select').value;
        const status = document.getElementById('club-status').value;

        if (currentUser && currentUser.role === 'leader') {
            club = currentUser.club;
        }

        if (id) {
            // Edit
            const index = memberships.findIndex(m => m.id == id);
            if (index !== -1) {
                memberships[index] = { id: parseInt(id), name, studentId, club, status };
            }
        } else {
            // Add
            const newId = memberships.length > 0 ? Math.max(...memberships.map(m => m.id)) + 1 : 1;
            memberships.push({ id: newId, name, studentId, club, status });
        }

        localStorage.setItem('allClubMemberships', JSON.stringify(memberships));
        renderTable();
        modal.style.display = 'none';
    });

    // 5. Table Actions (Edit/Delete)
    tableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.admin-action');
        if (!btn) return;

        const id = btn.getAttribute('data-id');
        if (btn.classList.contains('edit-club')) {
            const member = memberships.find(m => m.id == id);
            const currentUser = window.AuthService.getCurrentUser();
            if (currentUser && currentUser.role === 'leader' && member.club !== currentUser.club) {
                alert('You are not authorized to edit members of other clubs.');
                return;
            }
            openModal(member);
        } else if (btn.classList.contains('delete-club')) {
            const member = memberships.find(m => m.id == id);
            const currentUser = window.AuthService.getCurrentUser();
            if (currentUser && currentUser.role === 'leader' && member && member.club !== currentUser.club) {
                alert('You are not authorized to delete members of other clubs.');
                return;
            }
            if (confirm('Are you sure you want to remove this member?')) {
                memberships = memberships.filter(m => m.id != id);
                localStorage.setItem('allClubMemberships', JSON.stringify(memberships));
                renderTable();
            }
        }
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showFieldError,
        clearFieldError,
        showFormSuccess,
        clearFormErrors,

        // Main initialization functions
        initNavigation,
        initMyHub,
        initTestimonialsAndSliders,
        initTabsAndModals,
        initCalendar,
        initForms,
        initAdmin,
        initAnimations,
        initStudentSession,
        initDynamicEventDates,
        initClubManagement, // Added this to the exports

        // UI update functions
        updateUIForStudent,
        updateEnrollmentStatus
    };
}

// Admin-only: User & Role Management
function initUserManagement() {
    const settingsSection = document.getElementById('settings');
    if (!settingsSection) return;

    const currentUser = window.AuthService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        // Hide entire section if not admin
        settingsSection.style.display = 'none';
        return;
    }

    // Elements
    const addBtn = document.getElementById('add-user-btn');
    const tableBody = document.querySelector('#users-table tbody');
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-form');
    const closeBtns = document.querySelectorAll('.close-user-modal');

    if (!addBtn || !tableBody || !modal || !form) return;

    function loadUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }
    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }
    function renderTable() {
        tableBody.innerHTML = '';
        loadUsers().forEach((u, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.username}</td>
                <td>${u.role}</td>
                <td>${u.role === 'leader' ? (u.club || '-') : '-'}</td>
                <td>
                    <button class="admin-action edit-user" data-index="${idx}"><i class="fas fa-edit"></i></button>
                    <button class="admin-action delete-user" data-index="${idx}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function openModal(user = null, index = null) {
        modal.style.display = 'block';
        document.getElementById('modal-user-index').value = index != null ? String(index) : '';
        document.getElementById('user-username').value = user?.username || '';
        document.getElementById('user-password').value = '';
        document.getElementById('user-role').value = user?.role || 'leader';
        document.getElementById('user-club').value = user?.club || '';
        toggleClubField();
    }

    function closeModal() { modal.style.display = 'none'; }

    function toggleClubField() {
        const role = document.getElementById('user-role').value;
        const clubField = document.getElementById('user-club-group');
        if (clubField) clubField.style.display = role === 'leader' ? 'block' : 'none';
    }

    renderTable();
    addBtn.addEventListener('click', () => openModal());
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.getElementById('user-role')?.addEventListener('change', toggleClubField);

    tableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.admin-action');
        if (!btn) return;
        const idx = parseInt(btn.getAttribute('data-index'));
        const users = loadUsers();
        if (btn.classList.contains('edit-user')) {
            openModal(users[idx], idx);
        } else if (btn.classList.contains('delete-user')) {
            const toDelete = users[idx];
            if (toDelete && toDelete.username === 'admin') {
                alert('Cannot delete default admin.');
                return;
            }
            if (confirm('Delete this user?')) {
                users.splice(idx, 1);
                saveUsers(users);
                renderTable();
                window.AuthService.logActivity(`User deleted: ${toDelete?.username}`);
            }
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const idxStr = document.getElementById('modal-user-index').value;
        const username = document.getElementById('user-username').value.trim();
        const password = document.getElementById('user-password').value;
        const role = document.getElementById('user-role').value;
        const club = document.getElementById('user-club').value.trim();
        if (!username || (!idxStr && !password)) {
            alert('Username and password are required.');
            return;
        }
        if (role === 'leader' && !club) {
            alert('Leader must have a club.');
            return;
        }
        const users = loadUsers();
        const existingIndex = users.findIndex(u => u.username === username);
        const editing = idxStr !== '';
        const idx = editing ? parseInt(idxStr) : -1;
        if ((!editing && existingIndex !== -1) || (editing && existingIndex !== -1 && existingIndex !== idx)) {
            alert('Username already exists.');
            return;
        }
        const newUser = { username, role, club: role === 'leader' ? club : undefined };
        if (password) newUser.password = password;
        if (editing) {
            users[idx] = { ...users[idx], ...newUser };
            saveUsers(users);
            window.AuthService.logActivity(`User updated: ${username} (${role})`);
        } else {
            users.push(newUser);
            saveUsers(users);
            window.AuthService.logActivity(`User created: ${username} (${role})`);
        }
        renderTable();
        closeModal();
    });
}
// FAQ Toggle
document.querySelectorAll(".faq-question").forEach(q => {
    q.addEventListener("click", () => {
        const ans = q.nextElementSibling;
        ans.style.display = ans.style.display === "block" ? "none" : "block";
    });
});

// Chatbot Toggle
function toggleChat() {
    const chat = document.getElementById("chatbot");
    chat.style.display = chat.style.display === "flex" ? "none" : "flex";
}

// Chatbot Logic
function sendMessage() {
    const input = document.getElementById("userInput");
    const chat = document.getElementById("chatBody");

    if (input.value.trim() === "") return;

    const userMsg = document.createElement("div");
    userMsg.className = "user";
    userMsg.innerText = input.value;
    chat.appendChild(userMsg);

    let reply = "Please check the Events page for details.";

    const text = input.value.toLowerCase();

    if (text.includes("register"))
        reply = "You can register from the Events page.";
    else if (text.includes("event"))
        reply = "All upcoming events are listed in the Events section.";
    else if (text.includes("fee"))
        reply = "Some events are free, some require payment.";
    else if (text.includes("contact"))
        reply = "You can contact organizers via Contact page.";
    else if (text.includes("hello"))
        reply = "Hello 👋 How can I help you?";

    const botMsg = document.createElement("div");
    botMsg.className = "bot";
    botMsg.innerText = reply;

    setTimeout(() => chat.appendChild(botMsg), 400);

    input.value = "";
}

function initFavorites() {
    document.querySelectorAll('.favorite-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const card = btn.closest('.club-card');
            if (card) {
                card.classList.toggle('favorited');
                const icon = btn.querySelector('i');
                if (icon) {
                    if (card.classList.contains('favorited')) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far'); // Assuming 'far' is the outline style
                    }
                }
            }
        });
    });
}
