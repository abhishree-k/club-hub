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
 * 2. Testimonials & Image Sliders - UPDATED WITH ARROW NAVIGATION
 */
function initTestimonialsAndSliders() {
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    
    if (testimonialSlides.length === 0) return;

    let currentSlide = 0;
    let autoPlayInterval;

    function showSlide(index) {
        // Remove active class from all slides and dots
        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Add active class to current slide and dot
        testimonialSlides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        
        currentSlide = index;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % testimonialSlides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
        showSlide(currentSlide);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    // Event listeners for arrow buttons
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });
    }

    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoPlay();
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Only handle arrow keys when not in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoPlay();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoPlay();
        }
    });

    // Pause auto-play on hover
    const testimonialSection = document.querySelector('.testimonials-section');
    if (testimonialSection) {
        testimonialSection.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
        });

        testimonialSection.addEventListener('mouseleave', () => {
            startAutoPlay();
        });
    }

    // Start auto-play
    startAutoPlay();

    // Initialize first slide
    showSlide(0);
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

    const eventForm = document.getElementById('event-form');
    const saveEventButton = document.getElementById('save-event'); // Kept variable, though used in form submit
    const deleteEventButton = document.getElementById('delete-event');
    const eventDetailsContainer = document.getElementById('event-details-container');
    const clubFilter = document.getElementById('event-club-filter');
    const dateFilter = document.getElementById('event-date-filter');
    const eventCards = document.querySelectorAll('.event-card');
    const eventSearch = document.getElementById('eventSearch');
    const searchBtn = document.getElementById('search-btn');

    const eventSearch = document.getElementById('eventSearch');
    const searchBtn = document.getElementById('search-btn');

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    let selectedEvent = null;
    let searchTerm = '';


    // Sample events data - using dynamic dates for current/future events
    let events = [
        { id: 1, name: "AI Workshop", club: "tech", date: getFutureDate(7), time: "14:00", location: "CS Building, Room 101", description: "Hands-on session on machine learning." },
        { id: 2, name: "Digital Art Masterclass", club: "arts", date: getFutureDate(14), time: "16:00", location: "Arts Center, Studio 3", description: "Learn advanced techniques." },
        { id: 3, name: "Public Speaking Workshop", club: "debate", date: getFutureDate(21), time: "15:00", location: "Humanities Building, Room 205", description: "Improve your speaking skills." },
        { id: 4, name: "Tech Talk: AI Ethics", club: "tech", date: "2025-10-15", time: "15:00", location: "Auditorium", description: "Discussion on ethical AI development." },
        { id: 5, name: "Photography Workshop", club: "arts", date: "2025-10-20", time: "14:00", location: "Media Lab", description: "Learn basic photography techniques." }
    ];
    // Ensure initial save if empty
    if (!localStorage.getItem('allEvents')) {
        localStorage.setItem('allEvents', JSON.stringify(events));
    } else {
        events = JSON.parse(localStorage.getItem('allEvents'));
    }
    let searchTerm = '';


    // Sample events data - using dynamic dates for current/future events
    let events = [
        { id: 1, name: "AI Workshop", club: "tech", date: getFutureDate(7), time: "14:00", location: "CS Building, Room 101", description: "Hands-on session on machine learning." },
        { id: 2, name: "Digital Art Masterclass", club: "arts", date: getFutureDate(14), time: "16:00", location: "Arts Center, Studio 3", description: "Learn advanced techniques." },
        { id: 3, name: "Public Speaking Workshop", club: "debate", date: getFutureDate(21), time: "15:00", location: "Humanities Building, Room 205", description: "Improve your speaking skills." },
        { id: 4, name: "Tech Talk: AI Ethics", club: "tech", date: "2025-10-15", time: "15:00", location: "Auditorium", description: "Discussion on ethical AI development." },
        { id: 5, name: "Photography Workshop", club: "arts", date: "2025-10-20", time: "14:00", location: "Media Lab", description: "Learn basic photography techniques." }
    ];
    // Ensure initial save if empty
    if (!localStorage.getItem('allEvents')) {
        localStorage.setItem('allEvents', JSON.stringify(events));
    } else {
        events = JSON.parse(localStorage.getItem('allEvents'));
    }

    // Helper: Get Club Name
    function getClubName(clubId) {
        const clubs = { 'tech': 'Tech Society', 'arts': 'Creative Arts', 'debate': 'Debate Club', 'music': 'Music Society', 'sports': 'Sports Club', 'science': 'Science Guild' };
        return clubs[clubId] || 'Club';
    }


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

        const today = new Date();
        const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDay);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            if (isCurrentMonth && i === today.getDate()) dayElement.classList.add('today');

            const dayNumber = document.createElement('div');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = i;
            dayElement.appendChild(dayNumber);

            // Events for day
            const dayEvents = document.createElement('div');
            dayEvents.classList.add('day-events');
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            const dayEventsData = events.filter(event => {
                const matchesDate = event.date === dateStr;

                const matchesSearch = searchTerm === '' ||
                    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    getClubName(event.club).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.description.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesDate && matchesSearch;
            const dayEventsData = events.filter(event => {
                const matchesDate = event.date === dateStr;
                const matchesSearch = searchTerm === '' || 
                    event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    getClubName(event.club).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.description.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesDate && matchesSearch;
            });

            dayEventsData.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.classList.add('day-event', event.club);
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
                    openEventModal(null, dateStr);
                }
            });

            calendarGrid.appendChild(dayElement);
        }
    }

    function showEventDetails(event) {
        if (!eventDetailsContainer) return;
        selectedEvent = event;

        // Sanitize all event data before rendering
        // Sanitize all event data before rendering
        eventDetailsContainer.innerHTML = `
            <div class="event-details">
                <div class="event-header">
                    <span class="event-club-badge ${escapeHtml(event.club)}">${escapeHtml(getClubName(event.club))}</span>
                    <span class="event-club-badge ${escapeHtml(event.club)}">${escapeHtml(getClubName(event.club))}</span>
                    <button id="edit-event" class="action-button"><i class="fas fa-edit"></i> Edit</button>
                </div>
                <h2 class="event-title">${escapeHtml(event.name)}</h2>
                <h2 class="event-title">${escapeHtml(event.name)}</h2>
                <div class="event-date-time">
                    <span><i class="far fa-calendar-alt"></i> ${escapeHtml(formatDate(event.date))}</span>
                    <span><i class="far fa-clock"></i> ${escapeHtml(event.time)}</span>
                    <span><i class="far fa-calendar-alt"></i> ${escapeHtml(formatDate(event.date))}</span>
                    <span><i class="far fa-clock"></i> ${escapeHtml(event.time)}</span>
                </div>
                <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</div>
                <p class="event-description">${escapeHtml(event.description)}</p>
                <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</div>
                <p class="event-description">${escapeHtml(event.description)}</p>
                <div class="event-actions">
                    <button id="register-for-event" class="action-button"><i class="fas fa-user-plus"></i> Register</button>
                    <button id="share-event" class="action-button"><i class="fas fa-share-alt"></i> Share</button>
                </div>
            </div>
        `;

        // Bind dynamic buttons
        document.getElementById('edit-event').addEventListener('click', () => openEventModal(event));
        document.getElementById('register-for-event').addEventListener('click', () => alert(`Registered for ${event.name}`));
        document.getElementById('register-for-event').addEventListener('click', () => alert(`Registered for ${event.name}`));
        document.getElementById('share-event').addEventListener('click', () => alert(`Share link for ${event.name} copied to clipboard!`));
    }

    function openEventModal(event = null, date = null) {
        
        if (!eventModal) return;

        if (event) {
            document.getElementById('modal-title').textContent = 'Edit Event';
            document.getElementById('event-name').value = event.name;
            document.getElementById('event-club').value = event.club;
            document.getElementById('event-date').value = event.date;
            document.getElementById('event-time').value = event.time;
            document.getElementById('event-date').value = event.date;
            document.getElementById('event-time').value = event.time;
            document.getElementById('event-location').value = event.location;
            document.getElementById('event-description').value = event.description;
            if (deleteEventButton) deleteEventButton.style.display = 'block';
            selectedEvent = event;
        } else {
            document.getElementById('modal-title').textContent = 'Add New Event';
            eventForm.reset();
            if (date) document.getElementById('event-date').value = date;
            if (date) document.getElementById('event-date').value = date;
            if (deleteEventButton) deleteEventButton.style.display = 'none';
            selectedEvent = null;
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
                date: document.getElementById('event-date').value,
                time: document.getElementById('event-time').value,
                date: document.getElementById('event-date').value,
                time: document.getElementById('event-time').value,
                location: document.getElementById('event-location').value,
                description: document.getElementById('event-description').value
            };

            if (selectedEvent) {
                Object.assign(selectedEvent, eventData);
            } else {
                eventData.id = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
                events.push(eventData);
                selectedEvent = eventData;
            }
            // Save to LocalStorage
            localStorage.setItem('allEvents', JSON.stringify(events));
            // Save to LocalStorage
            localStorage.setItem('allEvents', JSON.stringify(events));
            renderCalendar();
            showEventDetails(selectedEvent);
            eventModal.style.display = 'none';
        });
    }

    // Delete Event
    if (deleteEventButton) {
        deleteEventButton.addEventListener('click', function () {
            if (selectedEvent && confirm('Are you sure you want to delete this event?')) {
                events = events.filter(e => e.id !== selectedEvent.id);
                localStorage.setItem('allEvents', JSON.stringify(events));
                localStorage.setItem('allEvents', JSON.stringify(events));
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

    // Search Functionality
    function handleSearch() {
        const newSearchTerm = eventSearch.value.trim();

        
        if (newSearchTerm !== searchTerm) {
            searchTerm = newSearchTerm;
            
            if (searchTerm !== '') {
                // Find the first event that matches the search
                const matchingEvent = events.find(event => 
                    event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    getClubName(event.club).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
                


        if (newSearchTerm !== searchTerm) {
            searchTerm = newSearchTerm;

            if (searchTerm !== '') {
                // Find the first event that matches the search
                const matchingEvent = events.find(event =>
                    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    getClubName(event.club).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.description.toLowerCase().includes(searchTerm.toLowerCase())
                );


                if (matchingEvent) {
                    // Navigate to the month and year of the matching event
                    const eventDate = new Date(matchingEvent.date);
                    currentMonth = eventDate.getMonth();
                    currentYear = eventDate.getFullYear();
                }
            }
        }

        
        renderCalendar();
    }

    if (eventSearch) {
        eventSearch.addEventListener('input', handleSearch);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // Filters (Club/Date)
    function filterEvents() {
        if (!clubFilter || !dateFilter) return;
        const clubValue = clubFilter.value;
        const dateValue = dateFilter.value;
        const today = new Date();


        renderCalendar();
    }

    if (eventSearch) {
        eventSearch.addEventListener('input', handleSearch);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    // Search Functionality
    function handleSearch() {
        const newSearchTerm = eventSearch.value.trim();
        
        if (newSearchTerm !== searchTerm) {
            searchTerm = newSearchTerm;
            
            if (searchTerm !== '') {
                // Find the first event that matches the search
                const matchingEvent = events.find(event => 
                    event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    getClubName(event.club).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                if (matchingEvent) {
                    // Navigate to the month and year of the matching event
                    const eventDate = new Date(matchingEvent.date);
                    currentMonth = eventDate.getMonth();
                    currentYear = eventDate.getFullYear();
                }
            }
        }
        
        renderCalendar();
    }

    if (eventSearch) {
        eventSearch.addEventListener('input', handleSearch);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
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
    if (eventDetailsContainer) {
        eventDetailsContainer.innerHTML = `<div class="no-event-selected"><i class="fas fa-calendar-alt"></i><p>Select an event from the calendar to view details</p></div>`;
    }
}

/**
 * 6. Admin Logic
 * Handles login authentication, dashboard rendering, and admin-specific actions.
 */
function initAdmin() {
    // 6a. Admin Login Logic
    const adminLoginForm = document.getElementById('admin-login-form');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('admin-password');
    const confirmPasswordGroup = document.getElementById('confirm-password-group');
    const confirmPasswordInput = document.getElementById('admin-confirm-password');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const toggleModeLink = document.getElementById('toggle-mode');
    const loginButton = document.querySelector('.login-button');
    const footerText = document.getElementById('footer-text');
    const forgotWrapper = document.getElementById('forgot-password-wrapper'); // <div> with Forgot password link
    const forgotWrapper = document.getElementById('forgot-password-wrapper'); // <div> with Forgot password link

    let isLoginMode = true;

    function toggleMode(login) {
        isLoginMode = login;


        if (login) {
            // LOGIN MODE
            // LOGIN MODE
            confirmPasswordGroup.style.display = 'none';
            loginButton.textContent = 'Login';
            tabLogin.classList.add('active');
            tabSignup.classList.remove('active');
            footerText.textContent = "Don't have an account?";
            toggleModeLink.textContent = "Sign Up";
            if (forgotWrapper) forgotWrapper.style.display = 'block';  // show only in login
            if (forgotWrapper) forgotWrapper.style.display = 'block';  // show only in login
        } else {
            // SIGNUP MODE
            // SIGNUP MODE
            confirmPasswordGroup.style.display = 'block';
            loginButton.textContent = 'Create Account';
            tabSignup.classList.add('active');
            tabLogin.classList.remove('active');
            footerText.textContent = "Already have an account?";
            toggleModeLink.textContent = "Login";
            if (forgotWrapper) forgotWrapper.style.display = 'none';   // hide in signup
            if (forgotWrapper) forgotWrapper.style.display = 'none';   // hide in signup
        }
    }

    // Set initial mode (login)
    toggleMode(true);

    // Set initial mode (login)
    toggleMode(true);

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



    if (adminLoginForm) {
        // Auto-fill if remembered
        if (localStorage.getItem('adminRemembered') === 'true') {
            const remembered = localStorage.getItem('adminUsername');
            if (remembered) {
                document.getElementById('admin-username').value = remembered;
                const remCheckbox = document.getElementById('remember-me');
                if (remCheckbox) remCheckbox.checked = true;
            }
        }

        // Clear errors on input
        adminLoginForm.querySelectorAll('input').forEach(field => {
            field.addEventListener('input', function () {
                clearFieldError(this);
            });
        });

        // Clear errors on input
        adminLoginForm.querySelectorAll('input').forEach(field => {
            field.addEventListener('input', function () {
                clearFieldError(this);
            });
        });

        adminLoginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearFormErrors(this);

            const usernameField = document.getElementById('admin-username');
            const passwordField = document.getElementById('admin-password');
            const username = usernameField.value.trim();
            const password = passwordField.value.trim();
            clearFormErrors(this);

            const usernameField = document.getElementById('admin-username');
            const passwordField = document.getElementById('admin-password');
            const username = usernameField.value.trim();
            const password = passwordField.value.trim();
            const rememberMe = document.getElementById('remember-me')?.checked;

            let isValid = true;

            if (!username) {
                showFieldError(usernameField, 'Username is required');
                isValid = false;
            }

            if (!password) {
                showFieldError(passwordField, 'Password is required');
                isValid = false;
            }

            if (!isValid) {
            let isValid = true;


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

   
        } 
        else {
            // Init Sidebar Navigation
            const sidebarLinks = document.querySelectorAll('.admin-menu a');
            const sections = document.querySelectorAll('.admin-tab-content');

            sidebarLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        e.preventDefault();
                        const targetId = href.substring(1);

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

    }

    // Admin Event Management Form
    const adminEventForm = document.getElementById('admin-event-form');


    adminEventForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('admin-event-name').value;



        adminEventForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('admin-event-name').value;

        adminEventForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('admin-event-name').value;
            alert(`Event "${name}" saved successfully!`);
            this.reset();
        });
    });
    });

    function loadAdminDashboard() {
        // Helper
        const getClubName = (id) => {
            const map = { 'tech': 'Tech Society', 'arts': 'Creative Arts' };
            return map[id] || id;
        };



                    <><td>${reg.id}</td><td>${reg.name}</td><td>${reg.email}</td><td>${reg.studentId}</td><td>${reg.clubs.map(c => getClubName(c)).join(', ')}</td><td>${new Date(reg.registeredAt).toLocaleDateString()}</td><td><button class="admin-action view" data-id="${reg.id}"><i class="fas fa-eye"></i></button>
            <button class="admin-action delete" data-id="${reg.id}"><i class="fas fa-trash"></i></button></td></>
                ;
            registrationsTable.querySelector('tbody').appendChild(row);
        }

        const registrationsTable = document.getElementById('registrations-table');
        const allMemberships = JSON.parse(localStorage.getItem('allClubMemberships')) || [];

        if (registrationsTable && allMemberships.length > 0) {
            const tbody = registrationsTable.querySelector('tbody');
            tbody.innerHTML = '';
            allMemberships.forEach(reg => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reg.id}</td>
                    <td>${reg.name}</td>
                    <td>${reg.email}</td>
                    <td>${reg.studentId}</td>
                    <td>${getClubName(reg.club)}</td>
                    <td>${new Date(reg.joinedAt).toLocaleDateString()}</td>
                    <td>
                        <button class="admin-action view" data-id="${reg.id}"><i class="fas fa-eye"></i></button>
                        <button class="admin-action delete" data-id="${reg.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(row);
            });


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



    // Render Event Registrations
    const eventRegistrationsTable = document.getElementById('event-registrations-table');
    if (eventRegistrationsTable) {
        eventRegistrationsTable.querySelector('tbody').innerHTML = ''; // Clear existing rows
        const eventRegs = [
            { id: 1, eventId: 1, name: 'John Doe', email: 'john@example.com', studentId: 'S12345', registeredAt: '2023-10-18' }
        ];
        eventRegs.forEach(reg => {
            const row = document.createElement('tr');
            row.innerHTML = `
    // Render Event Registrations
    const eventRegistrationsTable = document.getElementById('event-registrations-table');
    if (eventRegistrationsTable) {
        eventRegistrationsTable.querySelector('tbody').innerHTML = ''; // Clear existing rows
        const eventRegs = [
            { id: 1, eventId: 1, name: 'John Doe', email: 'john@example.com', studentId: 'S12345', registeredAt: '2023-10-18' }
        ];
        eventRegs.forEach(reg => {
            const row = document.createElement('tr');
            row.innerHTML = `
                    <td>${reg.id}</td><td>Event ${reg.eventId}</td><td>${reg.name}</td><td>${reg.email}</td>
                    <td>${reg.studentId}</td><td>${new Date(reg.registeredAt).toLocaleDateString()}</td>
                    <td><button class="admin-action view" data-id="${reg.id}"><i class="fas fa-eye"></i></button>
                        <button class="admin-action delete" data-id="${reg.id}"><i class="fas fa-trash"></i></button></td>
                `;
            eventRegistrationsTable.querySelector('tbody').appendChild(row);
        });
    }
            eventRegistrationsTable.querySelector('tbody').appendChild(row);
        });

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


    if (adminLink && isAdminLoggedIn) {
        adminLink.href = 'admin-dashboard.html';
        adminLink.textContent = 'Admin Dashboard';
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
/**

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

/**
 * Initialize Club Buttons
 * Adds event listeners to view club buttons
 */
function initClubButtons() {
    document.querySelectorAll('.view-club-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const clubId = this.getAttribute('data-club');
            window.location.href = `club.html?club=${clubId}`;
        });
    });
}

/**
 * Initialize Club Details
 * Loads club details on club.html page
 */
function initClubDetails() {
    if (window.location.pathname.includes('club.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const clubId = urlParams.get('club');
        
        if (clubId) {
            loadClubDetails(clubId);
        }
    }
}

/**
 * Load Club Details
 * Fetches and displays club information
 */
function loadClubDetails(clubId) {
    // Simulate backend API call
    fetchClubDetailsFromBackend(clubId)
        .then(clubData => {
            displayClubDetails(clubData);
        })
        .catch(error => {
            console.error('Error loading club details:', error);
            displayClubError();
        });
}

/**
 * Fetch Club Details from Backend
 * Simulates API call to get club data
 */
function fetchClubDetailsFromBackend(clubId) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            const clubsData = {
                'tech': {
                    name: 'Tech Society - POINT BLANK',
                    icon: '💻',
                    subtitle: 'Innovate, code, and build the future',
                    description: 'Join our vibrant tech community where innovation meets implementation. From hackathons to AI workshops, we provide the platform to turn your ideas into reality.',
                    activities: [
                        'Weekly coding sessions and hackathons',
                        'AI/ML workshops and seminars',
                        'Cybersecurity training programs',
                        'Tech talks by industry experts',
                        'Project development and collaboration'
                    ],
                    benefits: [
                        'Access to cutting-edge technology resources',
                        'Networking with tech professionals',
                        'Skill development and certification opportunities',
                        'Participation in national and international competitions',
                        'Mentorship from senior developers'
                    ],
                    contact: {
                        coordinator: 'Tech Coordinator',
                        email: 'tech@dsce.edu',
                        phone: '+91-XXXX-XXXXXX'
                    }
                },
                'arts': {
                    name: 'Creative Arts - AALEKA',
                    icon: '🎨',
                    subtitle: 'Express yourself through art',
                    description: 'Unleash your creativity in our artistic sanctuary. Whether you\'re a painter, sculptor, or digital artist, find your voice and showcase your talent.',
                    activities: [
                        'Art exhibitions and galleries',
                        'Live drawing and painting sessions',
                        'Digital art workshops',
                        'Collaborative art projects',
                        'Competitions and showcases'
                    ],
                    benefits: [
                        'Access to art supplies and studio space',
                        'Exhibition opportunities',
                        'Skill development workshops',
                        'Networking with artists and designers',
                        'Portfolio development support'
                    ],
                    contact: {
                        coordinator: 'Arts Coordinator',
                        email: 'arts@dsce.edu',
                        phone: '+91-XXXX-XXXXXX'
                    }
                },
                'debate': {
                    name: 'Debate Club - LITSOC',
                    icon: '💬',
                    subtitle: 'Sharpen your mind through debate',
                    description: 'Hone your rhetorical skills and critical thinking in our debate society. Engage in intellectual discourse and prepare for real-world challenges.',
                    activities: [
                        'Weekly debate sessions',
                        'Model United Nations simulations',
                        'Public speaking workshops',
                        'Inter-college debate tournaments',
                        'Guest lectures by renowned speakers'
                    ],
                    benefits: [
                        'Improved communication and critical thinking skills',
                        'Leadership development opportunities',
                        'Participation in national debate competitions',
                        'Networking with professionals',
                        'Confidence building through public speaking'
                    ],
                    contact: {
                        coordinator: 'Debate Coordinator',
                        email: 'debate@dsce.edu',
                        phone: '+91-XXXX-XXXXXX'
                    }
                },
                'music': {
                    name: 'Music Society',
                    icon: '🎵',
                    subtitle: 'Create and perform music',
                    description: 'Join our musical community to create, perform, and appreciate music in all its forms. From concerts to jam sessions, let the rhythm guide you.',
                    activities: [
                        'Concert performances and shows',
                        'Jam sessions and open mics',
                        'Music composition workshops',
                        'Shayari and poetry sessions',
                        'Music production training'
                    ],
                    benefits: [
                        'Access to musical instruments and equipment',
                        'Performance opportunities',
                        'Music theory and production training',
                        'Collaboration with musicians',
                        'Recording studio access'
                    ],
                    contact: {
                        coordinator: 'Music Coordinator',
                        email: 'music@dsce.edu',
                        phone: '+91-XXXX-XXXXXX'
                    }
                },
                'sports': {
                    name: 'Sports Club',
                    icon: '⚽',
                    subtitle: 'Stay active and competitive',
                    description: 'Maintain your physical fitness and competitive spirit through various sports activities. Teamwork, discipline, and victory await you.',
                    activities: [
                        'Inter-college sports tournaments',
                        'Fitness training sessions',
                        'Team building activities',
                        'Sports workshops and clinics',
                        'Recreational sports events'
                    ],
                    benefits: [
                        'Access to sports facilities and equipment',
                        'Fitness assessment and training programs',
                        'Team sports participation',
                        'Leadership development',
                        'Health and wellness support'
                    ],
                    contact: {
                        coordinator: 'Sports Coordinator',
                        email: 'sports@dsce.edu',
                        phone: '+91-XXXX-XXXXXX'
                    }
                },
                'science': {
                    name: 'Dance Club - ABCD',
                    icon: '💃',
                    subtitle: 'Move to the beat and create memories',
                    description: 'Express yourself through dance and movement. Join our energetic dance community for performances, competitions, and unforgettable experiences.',
                    activities: [
                        'Dance performances and shows',
                        'Choreography workshops',
                        'Dance competitions',
                        'Celebrity meetups and interactions',
                        'Dance fitness sessions'
                    ],
                    benefits: [
                        'Professional dance training',
                        'Performance opportunities',
                        'Fitness and health benefits',
                        'Creative expression development',
                        'Social connections and friendships'
                    ],
                    contact: {
                        coordinator: 'Dance Coordinator',
                        email: 'dance@dsce.edu',
                        phone: '+91-XXXX-XXXXXX'
                    }
                }
            };

            const clubData = clubsData[clubId];
            if (clubData) {
                resolve(clubData);
            } else {
                reject(new Error('Club not found'));
            }
        }, 500); // Simulate 500ms network delay
    });
}

/**
 * Display Club Details
 * Updates the DOM with club information
 */
function displayClubDetails(clubData) {
    document.getElementById('club-title').textContent = clubData.name;
    document.getElementById('club-subtitle').textContent = clubData.subtitle;
    document.getElementById('club-icon').textContent = clubData.icon;
    document.getElementById('club-name').textContent = clubData.name;
    document.getElementById('club-description').textContent = clubData.description;

    // Activities
    const activitiesList = document.getElementById('club-activities-list');
    activitiesList.innerHTML = '';
    clubData.activities.forEach(activity => {
        const li = document.createElement('li');
        li.textContent = activity;
        activitiesList.appendChild(li);
    });

    // Benefits
    const benefitsList = document.getElementById('club-benefits-list');
    benefitsList.innerHTML = '';
    clubData.benefits.forEach(benefit => {
        const li = document.createElement('li');
        li.textContent = benefit;
        benefitsList.appendChild(li);
    });

    // Contact
    const contactInfo = document.getElementById('club-contact-info');
    contactInfo.innerHTML = `
        <p><strong>Coordinator:</strong> ${clubData.contact.coordinator}</p>
        <p><strong>Email:</strong> <a href="mailto:${clubData.contact.email}" style="color: var(--accent-color);">${clubData.contact.email}</a></p>
        <p><strong>Phone:</strong> ${clubData.contact.phone}</p>
    `;

    // Join button functionality
    const joinBtn = document.getElementById('join-club-btn');
    const student = JSON.parse(localStorage.getItem('studentUser'));
    if (student) {
        const joinedClubs = JSON.parse(localStorage.getItem(`clubs_${student.id}`)) || [];
        const clubId = new URLSearchParams(window.location.search).get('club');
        if (joinedClubs.includes(clubId)) {
            joinBtn.textContent = 'Already Joined';
            joinBtn.disabled = true;
            joinBtn.style.background = 'var(--success-color)';
        } else {
            joinBtn.addEventListener('click', function() {
                joinClub(clubId);
            });
        }
    } else {
        joinBtn.textContent = 'Login to Join';
        joinBtn.addEventListener('click', function() {
            window.location.href = 'registration.html#student-login';
        });
    }
}

/**
 * Join Club
 * Adds club to student's joined clubs
 */
function joinClub(clubId) {
    const student = JSON.parse(localStorage.getItem('studentUser'));
    if (!student) return;

    let joinedClubs = JSON.parse(localStorage.getItem(`clubs_${student.id}`)) || [];
    if (!joinedClubs.includes(clubId)) {
        joinedClubs.push(clubId);
        localStorage.setItem(`clubs_${student.id}`, JSON.stringify(joinedClubs));
        
        const joinBtn = document.getElementById('join-club-btn');
        joinBtn.textContent = 'Joined!';
        joinBtn.disabled = true;
        joinBtn.style.background = 'var(--success-color)';
        
        // Update enrollment status
        updateEnrollmentStatus();
    }
}

/**
 * Display Club Error
 * Shows error message when club data fails to load
 */
function displayClubError() {
    document.getElementById('club-title').textContent = 'Club Not Found';
    document.getElementById('club-subtitle').textContent = 'The requested club could not be found.';
    document.getElementById('club-description').textContent = 'Please check the club ID or return to the home page.';
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
