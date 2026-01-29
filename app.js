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
            if (window.location.pathname.includes('my-hub.html')) {
                localStorage.removeItem('studentToken');
                window.location.href = 'registration.html#student-login';
            }
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

            calendarGrid.appendChild(dayEl);
        }
    }

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

    renderCalendar();
}

/**
 * 6. Admin
 */
function initAdmin() {
    // 1. Admin Login
    const adminLoginForm = document.getElementById('admin-login-form');
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

                if (response.ok) {
                    const data = await response.json();
                    if (data.user.role === 'admin') {
                        localStorage.setItem('adminToken', data.token);
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        alert('Access Denied: You are not an admin.');
                    }
                } else {
                    alert('Login failed');
                }
            } catch (error) {
                console.error('Admin Login Error:', error);
                alert('Login error');
            }
        });
    }

    // 2. Dashboard Logic
    const adminDashboard = document.getElementById('admin-dashboard');
    if (adminDashboard) {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = 'admin-login.html';
            return;
        }

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

                // Update Active Section
                sections.forEach(sec => sec.style.display = 'none');
                const targetSec = document.getElementById(targetId);
                if (targetSec) targetSec.style.display = 'block';

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

        async function loadFeedbacks() {
            try {
                const res = await fetch('http://localhost:3000/api/admin/feedbacks', {
                    headers: { 'Authorization': `Bearer ${token}` }
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
            window.location.href = 'index.html';
        });
    }
    updateUIForStudent();
}

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

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showFieldError,
        clearFieldError,
        showFormSuccess,
        clearFormErrors,
        initNavigation,
        escapeHtml,
        getFutureDate,
        getCurrentMonthYear
    };
}