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

    const hamburger = document.querySelector('.nav-hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }


    // Smooth scrolling for anchor links

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


                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if (hamburger) hamburger.classList.remove('active');
                }

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

    // Sanitize user name to prevent XSS
    if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${student.name}!`;

    const clubsList = document.getElementById('joined-clubs-list');
    const eventsList = document.getElementById('registered-events-list');


    try {
        const res = await fetch('http://localhost:3000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });


    const clubsList = document.getElementById('joined-clubs-list');
    if (clubsList) {
        if (joinedClubs.length === 0) {
            clubsList.innerHTML = '<div class="no-data"><p>You haven\'t joined any clubs yet.</p><a href="registration.html" class="action-button" style="display:inline-block; margin-top:1rem;">Discover Clubs</a></div>';
        } else {
            clubsList.innerHTML = '';
            joinedClubs.forEach(clubId => {
                const clubs = {
                    'tech': { name: 'Tech Society- POINT BLANK', icon: '💻' },
                    'arts': { name: 'Creative Arts-AALEKA', icon: '🎨' },
                    'debate': { name: 'Debate Club- LITSOC', icon: '💬' },
                    'music': { name: 'Music Society', icon: '🎵' },
                    'sports': { name: 'Sports Club', icon: '⚽' },
                    'science': { name: 'Dance club- ABCD', icon: '💃' }
                };
                // Sanitize clubId to prevent XSS if custom club name is added
                const club = clubs[clubId] || { name: escapeHtml(clubId), icon: '🌟' };

                const item = document.createElement('div');
                item.classList.add('hub-item');
                item.innerHTML = `
                    <div class="hub-item-info">
                        <h4>${club.icon} ${club.name}</h4>
                        <p>Active Member</p>
                    </div>
                `;
                clubsList.appendChild(item);
            });
        }
    }

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
            // Sort by date then time
            registeredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

            registeredEvents.forEach(event => {
                const item = document.createElement('div');
                item.classList.add('hub-item');
                // Sanitize event data from localStorage
                item.innerHTML = `
                    <div class="hub-item-info">
                        <h4>${escapeHtml(event.name)}</h4>
                        <p><i class="far fa-calendar-alt"></i> ${escapeHtml(event.date)} | <i class="far fa-clock"></i> ${escapeHtml(event.time)}</p>
                    </div>
                `;
                eventsList.appendChild(item);
            });

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


        clubRegistrationForm.addEventListener('submit', function (e) {

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


            const selectedClubs = Array.from(this.querySelectorAll('input[name="club"]:checked')).map(cb => cb.value);
            const clubCheckboxContainer = this.querySelector('.club-checkboxes');

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


            if (!isValid) {
                return;
            }

            // Save to localStorage if user is logged in
            if (selectedClubs.length > 0) {
                const student = JSON.parse(localStorage.getItem('studentUser'));
                if (student && student.id === studentId.value) {
                    const joinedClubs = JSON.parse(localStorage.getItem(`clubs_${studentId.value}`)) || [];

                    // Update Global Membership List (for Admin & Analytics)
                    let allMemberships = JSON.parse(localStorage.getItem('allClubMemberships')) || [];

                    selectedClubs.forEach(club => {
                        if (!joinedClubs.includes(club)) {
                            joinedClubs.push(club);

                            // Add to global list if not already there (simple check)
                            // In a real app, this would be handled by backend relationships
                            const existing = allMemberships.find(m => m.studentId === studentId.value && m.club === club);
                            if (!existing) {
                                const newId = allMemberships.length > 0 ? Math.max(...allMemberships.map(m => m.id)) + 1 : 1;
                                allMemberships.push({
                                    id: newId,
                                    name: student.name,
                                    studentId: studentId.value,
                                    club: club,
                                    status: 'Pending', // Default status
                                    joinedAt: new Date().toISOString()
                                });
                            }
                        }
                    });
                    localStorage.setItem(`clubs_${studentId.value}`, JSON.stringify(joinedClubs));
                    localStorage.setItem('allClubMemberships', JSON.stringify(allMemberships));
                }
            }

            showFormSuccess(this, 'Club registration submitted successfully! We will contact you soon.');
            this.reset();
            updateEnrollmentStatus();
        });
    }

    // Event Registration
    const eventRegistrationForm = document.getElementById('event-registration-form');
    if (eventRegistrationForm) {
        // Clear errors on input
        eventRegistrationForm.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', function () {
                clearFieldError(this);
            });
        });

        eventRegistrationForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearFormErrors(this);

            const eventName = document.getElementById('selected-event-name').textContent;
            const firstName = document.getElementById('event-first-name');
            const lastName = document.getElementById('event-last-name');
            const email = document.getElementById('event-email');
            const studentId = document.getElementById('event-student-id');

            let isValid = true;

            if (!firstName.value.trim()) {
                showFieldError(firstName, 'First name is required');
                isValid = false;
            }

            if (!lastName.value.trim()) {
                showFieldError(lastName, 'Last name is required');
                isValid = false;
            }

            if (!email.value.trim()) {
                showFieldError(email, 'Email is required');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                showFieldError(email, 'Please enter a valid email address');
                isValid = false;
            }

            if (!studentId.value.trim()) {
                showFieldError(studentId, 'Student ID is required');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            // Check for conflicts if logged in
            const student = JSON.parse(localStorage.getItem('studentUser'));
            if (student && student.id === studentId) {
                // Dynamic event dates - updated to use relative dates
                const events = [
                    { id: 1, name: "AI Workshop Series", date: getFutureDate(7), time: "14:00" },
                    { id: 2, name: "Digital Art Masterclass", date: getFutureDate(14), time: "16:00" },
                    { id: 3, name: "Public Speaking Workshop", date: getFutureDate(21), time: "15:00" }
                ];

                const currentEvent = events.find(ev => ev.name === eventName);
                if (currentEvent) {
                    const studentEvents = JSON.parse(localStorage.getItem(`events_${studentId.value}`)) || [];

                    // Conflict detection: Same day, overlapping time (mocking 2 hour duration)
                    const conflict = studentEvents.find(se => {
                        if (se.date !== currentEvent.date) return false;
                        const seTime = parseInt(se.time.split(':')[0]);
                        const ceTime = parseInt(currentEvent.time.split(':')[0]);
                        return Math.abs(seTime - ceTime) < 2;
                    });

                    if (conflict) {
                        showFieldError(studentId, `Conflict Detected! You are already registered for "${conflict.name}" at ${conflict.time} on this day.`);
                        return;
                    }

                    studentEvents.push(currentEvent);
                    localStorage.setItem(`events_${studentId.value}`, JSON.stringify(studentEvents));

                    // Update Global Event Registrations (for Admin & Analytics)
                    let allEventRegs = JSON.parse(localStorage.getItem('allEventRegistrations')) || [];
                    allEventRegs.push({
                        eventName: currentEvent.name,
                        eventId: currentEvent.id,
                        studentId: student.id,
                        studentName: student.name,
                        date: new Date().toISOString()
                    });
                    localStorage.setItem('allEventRegistrations', JSON.stringify(allEventRegs));
                }
            }

            showFormSuccess(this, 'Event registration submitted successfully!');
            setTimeout(() => {
                this.reset();
                const container = document.getElementById('event-registration-form-container');
                if (container) container.classList.add('hidden');
            }, 5000);
            updateEnrollmentStatus();
        });
    }

    // Student Login
    const studentLoginForm = document.getElementById('student-login-form');
    if (studentLoginForm) {
        // Clear errors on input
        studentLoginForm.querySelectorAll('input').forEach(field => {
            field.addEventListener('input', function () {
                clearFieldError(this);
            });
        });

        studentLoginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearFormErrors(this);

            const nameField = document.getElementById('login-student-name');
            const idField = document.getElementById('login-student-id');
            const name = nameField.value.trim();
            const id = idField.value.trim();

            let isValid = true;

            if (!name) {
                showFieldError(nameField, 'Full name is required');
                isValid = false;
            }

            if (!id) {
                showFieldError(idField, 'Student ID is required');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            const student = { name, id };
            localStorage.setItem('studentUser', JSON.stringify(student));
            updateUIForStudent();

            const loginMessage = document.getElementById('login-message');
            if (loginMessage) {
                loginMessage.textContent = 'Login successful! Redirecting...';
                loginMessage.style.color = 'var(--success-color)';
            }

            setTimeout(() => {
                const clubTab = document.querySelector('[data-tab="club-registration"]');
                if (clubTab) clubTab.click();
            }, 1000);
        });
    }

    // Certificate Upload
    const certificateForm = document.getElementById('certificate-form');
    if (certificateForm) {
        // Clear errors on input/change
        certificateForm.querySelectorAll('input, select').forEach(field => {
            field.addEventListener('input', function () {
                clearFieldError(this);
            });
            field.addEventListener('change', function () {
                clearFieldError(this);
            });
        });

        certificateForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearFormErrors(this);

            const studentIdField = document.getElementById('certificate-student-id');
            const eventIdField = document.getElementById('certificate-event');
            const fileField = document.getElementById('certificate-file');

            const studentId = studentIdField.value.trim();
            const eventId = eventIdField.value;
            const certificateFile = fileField.files[0];

            let isValid = true;

            if (!studentId) {
                showFieldError(studentIdField, 'Student ID is required');
                isValid = false;
            }

            if (!eventId) {
                showFieldError(eventIdField, 'Please select an event');
                isValid = false;
            }

            if (!certificateFile) {
                showFieldError(fileField, 'Please select a certificate file');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            showFormSuccess(this, `Certificate for student ${studentId} for event ${eventId} uploaded successfully!`);
            setTimeout(() => {
                this.reset();
            }, 3000);

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


    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    let selectedEvent = null;

    // Sample events data - using dynamic dates for current/future events
    let events = [
        { id: 1, name: "AI Workshop", club: "tech", date: getFutureDate(7), time: "14:00", location: "CS Building, Room 101", description: "Hands-on session on machine learning." },
        { id: 2, name: "Digital Art Masterclass", club: "arts", date: getFutureDate(14), time: "16:00", location: "Arts Center, Studio 3", description: "Learn advanced techniques." },
        { id: 3, name: "Public Speaking Workshop", club: "debate", date: getFutureDate(21), time: "15:00", location: "Humanities Building, Room 205", description: "Improve your speaking skills." }
    ];
    // Ensure initial save if empty
    if (!localStorage.getItem('allEvents')) {
        localStorage.setItem('allEvents', JSON.stringify(events));
    }

    // Helper: Get Club Name
    function getClubName(clubId) {
        const clubs = { 'tech': 'Tech Society', 'arts': 'Creative Arts', 'debate': 'Debate Club', 'music': 'Music Society', 'sports': 'Sports Club', 'science': 'Science Guild' };
        return clubs[clubId] || 'Club';
    }

    // Helper: Format Date
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
            const dayEventsData = events.filter(event => event.date === dateStr);

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
        eventDetailsContainer.innerHTML = `
            <div class="event-details">
                <div class="event-header">
                    <span class="event-club-badge ${escapeHtml(event.club)}">${escapeHtml(getClubName(event.club))}</span>
                    <button id="edit-event" class="action-button"><i class="fas fa-edit"></i> Edit</button>
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

        // Bind dynamic buttons
        document.getElementById('edit-event').addEventListener('click', () => openEventModal(event));
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
            document.getElementById('event-location').value = event.location;
            document.getElementById('event-description').value = event.description;
            if (deleteEventButton) deleteEventButton.style.display = 'block';
            selectedEvent = event;
        } else {
            document.getElementById('modal-title').textContent = 'Add New Event';
            eventForm.reset();
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

    let isLoginMode = true;

    function toggleMode(login) {
        isLoginMode = login;
        if (login) {
            confirmPasswordGroup.style.display = 'none';
            loginButton.textContent = 'Login';
            tabLogin.classList.add('active');
            tabSignup.classList.remove('active');
            footerText.textContent = "Don't have an account?";
            toggleModeLink.textContent = "Sign Up";
        } else {
            confirmPasswordGroup.style.display = 'block';
            loginButton.textContent = 'Create Account';
            tabSignup.classList.add('active');
            tabLogin.classList.remove('active');
            footerText.textContent = "Already have an account?";
            toggleModeLink.textContent = "Login";
        }
    }

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

    // Login Submission
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

        adminLoginForm.addEventListener('submit', function (e) {
            e.preventDefault();
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
                return;
            }

            if (isLoginMode) {
                // LOGIN LOGIC
                // Check stored custom admins first, then hardcoded default
                const result = checkAdminCredentials(username, password);


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

                    alert('Invalid credentials. Please try again.');
                }
            } else {
                // SIGN UP LOGIC
                const confirmPass = confirmPasswordInput.value;
                if (password !== confirmPass) {
                    alert('Passwords do not match!');
                    return;
                }

                // Check if user exists
                const existingAdmins = JSON.parse(localStorage.getItem('adminUsers')) || [];
                if (username === 'admin' || existingAdmins.some(u => u.username === username)) {
                    alert('Username already exists. Please choose another.');
                    return;
                }
            }
        });
    }

    function checkAdminCredentials(u, p) {
        // 1. Default Hardcoded
        if (u === 'admin' && p === 'admin123') return { success: true };

        // 2. Local Storage
        const admins = JSON.parse(localStorage.getItem('adminUsers')) || [];
        const found = admins.find(user => user.username === u && user.password === p);
        if (found) return { success: true };

        return { success: false };
    }


    // 6b. Admin Dashboard Logic

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

        } else {
            // Init Sidebar Navigation
            const sidebarLinks = document.querySelectorAll('.admin-menu a');
            const sections = document.querySelectorAll('.admin-tab-content');

            sidebarLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        e.preventDefault();
                        const targetId = href.substring(1);

                        // Update Active State
                        document.querySelectorAll('.admin-menu li').forEach(li => li.classList.remove('active'));
                        link.parentElement.classList.add('active');

                        // Show Target Section
                        sections.forEach(sec => sec.style.display = 'none');
                        const targetSec = document.getElementById(targetId);
                        if (targetSec) targetSec.style.display = 'block';

                        // Auto-refresh analytics when switching to dashboard
                        if (targetId === 'dashboard') {
                            setTimeout(initAnalytics, 100); // Small delay to ensure container is visible
                        }
                    }
                });

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


            loadAdminDashboard();
            initClubManagement();
            initAnalytics();
            const logoutButton = document.getElementById('admin-logout');
            if (logoutButton) {
                logoutButton.addEventListener('click', function () {
                    localStorage.removeItem('adminLoggedIn');
                    window.location.href = 'admin-login.html';

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
    if (adminEventForm) {
        // Clear errors on input
        adminEventForm.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', function () {
                clearFieldError(this);
            });
        });

        adminEventForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearFormErrors(this);

            const nameField = document.getElementById('admin-event-name');
            const clubField = document.getElementById('admin-event-club');
            const dateField = document.getElementById('admin-event-date');
            const timeField = document.getElementById('admin-event-time');
            const locationField = document.getElementById('admin-event-location');

            const name = nameField?.value.trim();
            const club = clubField?.value;
            const date = dateField?.value;
            const time = timeField?.value;
            const location = locationField?.value.trim();

            let isValid = true;

            if (!name) {
                showFieldError(nameField, 'Event name is required');
                isValid = false;
            }

            if (!club) {
                showFieldError(clubField, 'Please select a club');
                isValid = false;
            }

            if (!date) {
                showFieldError(dateField, 'Event date is required');
                isValid = false;
            }

            if (!time) {
                showFieldError(timeField, 'Event time is required');
                isValid = false;
            }

            if (!location) {
                showFieldError(locationField, 'Event location is required');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            showFormSuccess(this, `Event "${name}" saved successfully!`);
            setTimeout(() => {
                this.reset();
            }, 2000);
        });
    }
    
}

function loadAdminDashboard() {
    // Helper
    const getClubName = (id) => {
        const map = { 'tech': 'Tech Society', 'arts': 'Creative Arts' };
        return map[id] || id;
    };

    // Render Student Registrations
    const registrationsTable = document.getElementById('registrations-table');
    if (registrationsTable) {
        registrationsTable.querySelector('tbody').innerHTML = ''; // Clear existing rows
        const registrations = [
            { id: 1, name: 'John Doe', email: 'john@example.com', studentId: 'S12345', clubs: ['tech', 'debate'], registeredAt: '2023-10-15' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', studentId: 'S12346', clubs: ['arts', 'music'], registeredAt: '2023-10-16' }
        ];
        registrations.forEach(reg => {
            const row = document.createElement('tr');
            row.innerHTML = `
                    <td>${reg.id}</td><td>${reg.name}</td><td>${reg.email}</td><td>${reg.studentId}</td>
                    <td>${reg.clubs.map(c => getClubName(c)).join(', ')}</td>
                    <td>${new Date(reg.registeredAt).toLocaleDateString()}</td>
                    <td><button class="admin-action view" data-id="${reg.id}"><i class="fas fa-eye"></i></button>
                        <button class="admin-action delete" data-id="${reg.id}"><i class="fas fa-trash"></i></button></td>
                `;
            registrationsTable.querySelector('tbody').appendChild(row);
        });
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
                    <td>${reg.id}</td><td>Event ${reg.eventId}</td><td>${reg.name}</td><td>${reg.email}</td>
                    <td>${reg.studentId}</td><td>${new Date(reg.registeredAt).toLocaleDateString()}</td>
                    <td><button class="admin-action view" data-id="${reg.id}"><i class="fas fa-eye"></i></button>
                        <button class="admin-action delete" data-id="${reg.id}"><i class="fas fa-trash"></i></button></td>
                `;
            eventRegistrationsTable.querySelector('tbody').appendChild(row);
        });
    }

    // Dashboard Button Actions
    document.querySelectorAll('.admin-action.view').forEach(btn => btn.addEventListener('click', () => alert('View details')));
    document.querySelectorAll('.admin-action.delete').forEach(btn => btn.addEventListener('click', () => confirm('Delete?') && alert('Deleted')));


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

    // Auto-fill forms if logged in
    const student = JSON.parse(localStorage.getItem('studentUser'));
    if (student) {
        const fillForm = (prefix) => {
            const nameParts = student.name.split(' ');
            const firstName = document.getElementById(`${prefix}-first-name`);
            const lastName = document.getElementById(`${prefix}-last-name`);
            const studentId = document.getElementById(`${prefix}-student-id`);

            if (firstName) firstName.value = nameParts[0] || '';
            if (lastName) lastName.value = nameParts.slice(1).join(' ') || '';
            if (studentId) studentId.value = student.id;
        };

        fillForm('club');
        fillForm('event');
    }

    updateEnrollmentStatus();

    updateUIForStudent();

}

function updateUIForStudent() {
    const token = localStorage.getItem('studentToken');
    const navMyHub = document.getElementById('nav-my-hub');
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');


    if (student) {

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
 * Initialize Dynamic Event Dates
 * Updates event cards with dynamic dates based on data-days-offset attribute
 */
function initDynamicEventDates() {
    document.querySelectorAll('.event-card[data-days-offset]').forEach(card => {
        const daysOffset = parseInt(card.getAttribute('data-days-offset'));
        if (isNaN(daysOffset)) return;

        // Calculate the future date
        const futureDate = getFutureDate(daysOffset);
        
        // Update data-date attribute for filtering
        card.setAttribute('data-date', futureDate);
        
        // Format and display the date
        const dateElement = card.querySelector('.event-date');
        if (dateElement) {
            let date;
            // Avoid timezone issues when parsing plain "YYYY-MM-DD" dates
            if (typeof futureDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(futureDate)) {
                const [year, month, day] = futureDate.split('-').map(Number);
                date = new Date(year, month - 1, day);
            } else {
                date = new Date(futureDate);
            }
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            const formattedDate = date.toLocaleDateString('en-US', options);
            dateElement.textContent = formattedDate;
        }
    });
}

/**
 * 9. Analytics Logic
 * Renders charts using Chart.js for the Admin Dashboard.
 */
function initAnalytics() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') return;

    // Common Chart Options
    Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

    // --- 1. Fetch Real Data from LocalStorage ---

    // Event Data
    const allEventRegs = JSON.parse(localStorage.getItem('allEventRegistrations')) || [
        // Mock data fallback if empty (for demo)
        { eventName: 'AI Workshop', date: '2023-11-15' },
        { eventName: 'AI Workshop', date: '2023-11-15' },
        { eventName: 'Digital Art Masterclass', date: '2023-11-20' },
        { eventName: 'Public Speaking Workshop', date: '2023-11-22' },
        { eventName: 'Public Speaking Workshop', date: '2023-11-22' },
        { eventName: 'Public Speaking Workshop', date: '2023-11-22' }
    ];

    // Club Data
    const allMemberships = JSON.parse(localStorage.getItem('allClubMemberships')) || [
        // Mock data fallback
        { club: 'tech', status: 'Active', joinedAt: '2023-10-01' },
        { club: 'tech', status: 'Active', joinedAt: '2023-10-05' },
        { club: 'arts', status: 'Pending', joinedAt: '2023-10-10' },
        { club: 'debate', status: 'Active', joinedAt: '2023-10-12' }
    ];

    // --- 2. Process Data ---

    // Process Events: Count per Event Name
    const eventCounts = {};
    allEventRegs.forEach(reg => {
        eventCounts[reg.eventName] = (eventCounts[reg.eventName] || 0) + 1;
    });
    const eventLabels = Object.keys(eventCounts);
    const eventData = Object.values(eventCounts);

    // Process Clubs: Count per Club Code
    const clubCounts = {};
    const clubNames = {
        'tech': 'Tech Society', 'arts': 'Creative Arts', 'debate': 'Debate Club',
        'music': 'Music Society', 'sports': 'Sports Club', 'science': 'Dance club- ABCD'
    };
    allMemberships.forEach(m => {
        const name = clubNames[m.club] || m.club;
        clubCounts[name] = (clubCounts[name] || 0) + 1;
    });
    const clubLabels = Object.keys(clubCounts);
    const clubDataValues = Object.values(clubCounts);

    // Process Engagement: Actions per Month
    const monthlyActivity = {};
    const processDate = (dateStr) => {
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return;
        const key = d.toLocaleString('default', { month: 'short' }); // e.g., "Nov"
        monthlyActivity[key] = (monthlyActivity[key] || 0) + 1;
    };

    allEventRegs.forEach(r => processDate(r.date));
    allMemberships.forEach(m => processDate(m.joinedAt));

    // Sort Months (Naive approach for this year/fixed list)
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sortedMonths = Object.keys(monthlyActivity).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    const engagementData = sortedMonths.map(m => monthlyActivity[m]);


    // --- 3. Render Charts (Destroy existing first) ---

    // Helper: Destroy and Create
    const createChart = (canvasId, config) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const existingChart = Chart.getChart(canvas);
        if (existingChart) existingChart.destroy();

        new Chart(canvas, config);
    };

    // Render Event Participation Chart
    createChart('eventParticipationChart', {
        type: 'bar',
        data: {
            labels: eventLabels.length ? eventLabels : ['No Data'],
            datasets: [{
                label: 'Registrations',
                data: eventData.length ? eventData : [0],
                backgroundColor: 'rgba(108, 92, 231, 0.6)',
                borderColor: 'rgba(108, 92, 231, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Render Active Clubs Chart
    createChart('activeClubsChart', {
        type: 'doughnut',
        data: {
            labels: clubLabels.length ? clubLabels : ['No Data'],
            datasets: [{
                data: clubDataValues.length ? clubDataValues : [1], // 1 for empty placeholder
                backgroundColor: [
                    'rgba(108, 92, 231, 0.8)', 'rgba(253, 121, 168, 0.8)',
                    'rgba(0, 184, 148, 0.8)', 'rgba(9, 132, 227, 0.8)',
                    'rgba(225, 112, 85, 0.8)', 'rgba(255, 234, 167, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, color: 'white' } }
            }
        }
    });

    // Render Monthly Engagement Chart
    createChart('monthlyEngagementChart', {
        type: 'line',
        data: {
            labels: sortedMonths.length ? sortedMonths : ['Nov'],
            datasets: [{
                label: 'Activity',
                data: engagementData.length ? engagementData : [0],
                borderColor: '#00cec9',
                backgroundColor: 'rgba(0, 206, 201, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00cec9'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
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

function initClubButtons() {
    document.querySelectorAll('.view-club-btn').forEach(btn => {
        btn.addEventListener('click', function () {
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
}
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
