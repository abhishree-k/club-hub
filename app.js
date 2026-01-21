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
    initDynamicEventDates();
  
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});

/**
 * Date Helper Functions
 * Generates dynamic dates relative to today to keep events current.
 */

/**
 * Gets a future date relative to today
 * @param {number} daysFromNow - Number of days from today (positive for future)
 * @returns {string} - Date in YYYY-MM-DD format
 * 
 * @example
 * // Get a date 7 days from now
 * const futureDate = getFutureDate(7); // "2026-01-24"
 * 
 * @example
 * // Get today's date
 * const today = getFutureDate(0); // "2026-01-17"
 */
function getFutureDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Gets the current month and year for calendar display
 * @returns {Object} - Object with month and year properties
 * 
 * @example
 * const current = getCurrentMonthYear();
 * console.log(current.month); // 0-11 (January=0)
 * console.log(current.year);  // 2026
 */
function getCurrentMonthYear() {
    const date = new Date();
    return {
        month: date.getMonth(),
        year: date.getFullYear()
    };
}

/**
 * 1. Navigation & Scrolling Logic
 * Handles mobile menu toggling and smooth scrolling.
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
            }
        });
    });
}

function initMyHub() {
    const student = JSON.parse(localStorage.getItem('studentUser'));
    if (!student) {
        window.location.href = 'registration.html#student-login';
        return;
    }

    const welcomeMsg = document.getElementById('hub-welcome-msg');
    // Sanitize user name to prevent XSS
    if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${student.name}!`;

    const joinedClubs = JSON.parse(localStorage.getItem(`clubs_${student.id}`)) || [];
    const registeredEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];

    // Populate Clubs
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

    // Populate Events
    const eventsList = document.getElementById('registered-events-list');
    if (eventsList) {
        if (registeredEvents.length === 0) {
            eventsList.innerHTML = '<div class="no-data"><p>You haven\'t registered for any events yet.</p><a href="events.html" class="action-button" style="display:inline-block; margin-top:1rem;">View Events</a></div>';
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
        }
    }
}

/**
 * 2. Testimonials & Image Sliders
 * Handles carousels and auto-rotating images.
 */
function initTestimonialsAndSliders() {
    // Testimonial carousel
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

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });

        // Auto-rotate testimonials
        setInterval(() => {
            currentSlide = (currentSlide + 1) % testimonialSlides.length;
            showSlide(currentSlide);
        }, 5000);
    }

    // Generic Image sliders (Highlights)
    const imageSliders = document.querySelectorAll('.image-slider');
    if (imageSliders.length > 0) {
        imageSliders.forEach(slider => {
            const images = slider.querySelectorAll('img');
            if (images.length > 0) {
                let currentImage = 0;
                images[currentImage].classList.add('active');

                setInterval(() => {
                    images[currentImage].classList.remove('active');
                    currentImage = (currentImage + 1) % images.length;
                    images[currentImage].classList.add('active');
                }, 3000);
            }
        });
    }
}

/**
 * 3. Tabs, Modals & UI Toggles
 * Handles registration tabs, event detail modals, and toggle buttons.
 */
function initTabsAndModals() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0) {
        // Helper to switch tabs
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

        // Click Listeners
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // Hash Handling (for nav links)
        const checkHash = () => {
            const hash = window.location.hash.substring(1); // remove '#'
            if (hash) {
                switchTab(hash);
            }
        };

        checkHash(); // Run on load
        window.addEventListener('hashchange', checkHash); // Run on hash change
    }

    // Event registration toggles (Show/Hide form)
    const registerButtons = document.querySelectorAll('.register-button');
    const eventRegistrationFormContainer = document.getElementById('event-registration-form-container');
    const cancelEventRegistration = document.getElementById('cancel-event-registration');

    if (registerButtons.length > 0 && eventRegistrationFormContainer) {
        registerButtons.forEach(button => {
            button.addEventListener('click', function () {
                const eventCard = this.closest('.event-card');
                // Guard clause if button is not inside a card
                if (eventCard) {
                    const eventName = eventCard.querySelector('.event-title').textContent;
                    const nameDisplay = document.getElementById('selected-event-name');
                    if (nameDisplay) nameDisplay.textContent = eventName;
                }

                eventRegistrationFormContainer.classList.remove('hidden');
                eventRegistrationFormContainer.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    if (cancelEventRegistration && eventRegistrationFormContainer) {
        cancelEventRegistration.addEventListener('click', function () {
            eventRegistrationFormContainer.classList.add('hidden');
        });
    }

    // Generic Modal Logic (e.g., for Calendar)
    const modal = document.getElementById('event-modal');
    const closeModal = document.querySelector('.close-modal');

    if (modal) {
        if (closeModal) {
            closeModal.addEventListener('click', function () {
                modal.style.display = 'none';
            });
        }
        window.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

/**
 * 4. Forms
 * Handles general public-facing form submissions (Club Reg, Certificate, etc).
 */
function initForms() {
    // Club Registration
    const clubRegistrationForm = document.getElementById('club-registration-form');
    if (clubRegistrationForm) {
        // Clear errors on input
        clubRegistrationForm.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', function () {
                clearFieldError(this);
            });
        });

        clubRegistrationForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearFormErrors(this);

            // Validate all required fields
            const firstName = document.getElementById('club-first-name');
            const lastName = document.getElementById('club-last-name');
            const email = document.getElementById('club-email');
            const studentId = document.getElementById('club-student-id');
            const major = document.getElementById('club-major');
            const year = document.getElementById('club-year');

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

            if (!major.value.trim()) {
                showFieldError(major, 'Major is required');
                isValid = false;
            }

            if (!year.value) {
                showFieldError(year, 'Please select your year of study');
                isValid = false;
            }

            const selectedClubs = Array.from(this.querySelectorAll('input[name="club"]:checked')).map(cb => cb.value);
            const clubCheckboxContainer = this.querySelector('.club-checkboxes');

            if (selectedClubs.length === 0) {
                // Avoid duplicating error elements
                let existingClubError = clubCheckboxContainer.parentNode.querySelector('.form-error.club-error');
                if (!existingClubError) {
                    const errorMsg = document.createElement('div');
                    errorMsg.classList.add('form-error', 'club-error');
                    errorMsg.textContent = 'Please select at least one club';
                    errorMsg.style.marginTop = '0.5rem';
                    clubCheckboxContainer.parentNode.appendChild(errorMsg);
                }

                // Attach change listeners once to clear the error when a club is selected
                if (!clubCheckboxContainer.dataset.clubListenersAttached) {
                    const clubCheckboxes = this.querySelectorAll('input[name="club"]');
                    clubCheckboxes.forEach(cb => {
                        cb.addEventListener('change', () => {
                            const anyChecked = clubCheckboxContainer.querySelectorAll('input[name="club"]:checked').length > 0;
                            const clubError = clubCheckboxContainer.parentNode.querySelector('.form-error.club-error');
                            if (anyChecked && clubError) {
                                clubError.remove();
                            }
                        });
                    });
                    clubCheckboxContainer.dataset.clubListenersAttached = 'true';
                }
                isValid = false;
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
        });
    }
}

/**
 * 5. Calendar System
 * Contains all logic for the interactive event calendar.
 */
function initCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    // If no calendar grid exists on this page, exit early
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

    // Render Calendar Logic
    function renderCalendar() {
        while (calendarGrid.children.length > 7) {
            calendarGrid.removeChild(calendarGrid.lastChild);
        }

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
    const forgotWrapper = document.getElementById('forgot-password-wrapper'); // <div> with Forgot password link

    let isLoginMode = true;

    function toggleMode(login) {
        isLoginMode = login;

        if (login) {
            // LOGIN MODE
            confirmPasswordGroup.style.display = 'none';
            loginButton.textContent = 'Login';
            tabLogin.classList.add('active');
            tabSignup.classList.remove('active');
            footerText.textContent = "Don't have an account?";
            toggleModeLink.textContent = "Sign Up";
            if (forgotWrapper) forgotWrapper.style.display = 'block';  // show only in login
        } else {
            // SIGNUP MODE
            confirmPasswordGroup.style.display = 'block';
            loginButton.textContent = 'Create Account';
            tabSignup.classList.add('active');
            tabLogin.classList.remove('active');
            footerText.textContent = "Already have an account?";
            toggleModeLink.textContent = "Login";
            if (forgotWrapper) forgotWrapper.style.display = 'none';   // hide in signup
        }
    }

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
            this.innerHTML = type === 'password'
                ? '<i class="fas fa-eye"></i>'
                : '<i class="fas fa-eye-slash"></i>';
        });
    }

    // Login / Signup Submission
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
                const result = checkAdminCredentials(username, password);

                if (result.success) {
                    if (rememberMe) {
                        localStorage.setItem('adminRemembered', 'true');
                        localStorage.setItem('adminUsername', username);
                    } else {
                        localStorage.removeItem('adminRemembered');
                        localStorage.removeItem('adminUsername');
                    }

                    localStorage.setItem('adminLoggedIn', 'true');
                    localStorage.setItem('currentAdminUser', username);

                    if (loginButton) {
                        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Logging in...</span>';
                        loginButton.disabled = true;
                    }
                    setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 1000);
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

                const existingAdmins = JSON.parse(localStorage.getItem('adminUsers')) || [];
                if (username === 'admin' || existingAdmins.some(u => u.username === username)) {
                    alert('Username already exists. Please choose another.');
                    return;
                }

                // Save new admin user
                existingAdmins.push({ username, password });
                localStorage.setItem('adminUsers', JSON.stringify(existingAdmins));
                alert('Account created successfully! You can now log in.');
                toggleMode(true);
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
    const adminDashboard = document.getElementById('admin-dashboard');
    if (adminDashboard) {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        if (!isLoggedIn) {
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

                        document.querySelectorAll('.admin-menu li').forEach(li => li.classList.remove('active'));
                        link.parentElement.classList.add('active');

                        sections.forEach(sec => sec.style.display = 'none');
                        const targetSec = document.getElementById(targetId);
                        if (targetSec) targetSec.style.display = 'block';

                        if (targetId === 'dashboard') {
                            setTimeout(initAnalytics, 100);
                        }
                    }
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
                });
            }
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
}

/**
 * 7. Visual Animations
 * Handles Timeline, Gallery scroll, Parallax, and Decorative particles.
 */
function initAnimations() {
    // Scroll Detection Helper
    const checkScrollAnimations = () => {
        const windowHeight = window.innerHeight;

        // Timeline Items
        document.querySelectorAll('.timeline-item').forEach(item => {
            if (item.getBoundingClientRect().top < windowHeight * 0.75) item.classList.add('visible');
        });

        // Slide Up Elements
        document.querySelectorAll('.club-card, .section-title, .hero-content').forEach(el => {
            if (el.getBoundingClientRect().top < windowHeight * 0.75) el.classList.add('slide-up');
        });
    };

    // Initial check and Listener
    checkScrollAnimations();
    window.addEventListener('scroll', checkScrollAnimations);

    // Floating Planets
    document.querySelectorAll('.planet').forEach(planet => {
        const duration = 6 + Math.random() * 4;
        const delay = Math.random() * 2;
        planet.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
    });

    // Twinkling Stars
    const starsBackground = document.querySelector('.stars-background');
    if (starsBackground) {
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.classList.add('star', 'twinkle');
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            const size = 1 + Math.random() * 2;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.animationDelay = `${Math.random() * 5}s`;
            starsBackground.appendChild(star);
        }
    }

    // Gallery Drag Scroll
    document.querySelectorAll('.gallery-scroll').forEach(gallery => {
        let isDown = false, startX, scrollLeft;
        gallery.addEventListener('mousedown', (e) => {
            isDown = true;
            gallery.classList.add('active'); // Optional visual cue class
            startX = e.pageX - gallery.offsetLeft;
            scrollLeft = gallery.scrollLeft;
            gallery.style.cursor = 'grabbing';
        });
        gallery.addEventListener('mouseleave', () => { isDown = false; gallery.style.cursor = 'grab'; });
        gallery.addEventListener('mouseup', () => { isDown = false; gallery.style.cursor = 'grab'; });
        gallery.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - gallery.offsetLeft;
            const walk = (x - startX) * 2;
            gallery.scrollLeft = scrollLeft - walk;
        });
    });

    // Featured Items Gradient Border
    document.querySelectorAll('.featured-item').forEach(item => item.classList.add('gradient-border'));

    // Button Pulse Effect
    document.querySelectorAll('.action-button, .submit-button, .register-button').forEach(btn => {
        btn.addEventListener('mouseenter', () => btn.classList.add('pulse'));
        btn.addEventListener('mouseleave', () => btn.classList.remove('pulse'));
    });

    // Loading Spinner
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) spinner.classList.add('rotate');

    // Typewriter Effect
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const text = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        let i = 0;
        const typing = setInterval(() => {
            if (i < text.length) {
                heroSubtitle.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
            }
        }, 50);
    }

    // Parallax
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            heroSection.style.backgroundPositionY = `${window.pageYOffset * 0.5}px`;
        });
    }
}

function initStudentSession() {
    updateUIForStudent();

    const logoutBtn = document.getElementById('student-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('studentUser');
            updateUIForStudent();
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
}

function updateUIForStudent() {
    const student = JSON.parse(localStorage.getItem('studentUser'));
    const navMyHub = document.getElementById('nav-my-hub');
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');

    if (student) {
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
