/**
 * Main Entry Point
 * All functionality is initialized here via modular functions.
 */

// Centralized Event Data Source
// NOTE: duration is expressed in hours and is used for conflict / overlap detection.
const ALL_EVENTS = [
    { id: 1, name: "AI Workshop Series", club: "tech", date: "2023-11-15", time: "14:00", duration: 3, location: "CS Building, Room 101", description: "Hands-on session on machine learning." },
    { id: 2, name: "Digital Art Masterclass", club: "arts", date: "2023-11-20", time: "16:00", duration: 3, location: "Arts Center, Studio 3", description: "Learn advanced techniques." },
    { id: 3, name: "Public Speaking Workshop", club: "debate", date: "2023-11-22", time: "15:00", duration: 3, location: "Humanities Building, Room 205", description: "Improve your speaking skills." },
    // Deliberate overlap with AI Workshop for testing direct conflict behaviour
    { id: 4, name: "Music Jam Session", club: "music", date: "2023-11-15", time: "15:00", duration: 2, location: "Auditorium", description: "Open mic and jam session." },
    { id: 5, name: "Football Match", club: "sports", date: "2023-11-25", time: "10:00", duration: 3, location: "College Ground", description: "Inter-department match." }
];

// Default buffer used for "near conflicts" (minutes before/after an event)
const DEFAULT_CONFLICT_BUFFER_MINUTES = 30;

/**
 * Helper: compute start/end Date objects (with optional buffer)
 * Supports (optional) multi‑day events via endDate if ever added.
 */
function getEventTimeRange(ev, bufferMinutes = 0) {
    const baseStart = new Date(`${ev.date}T${ev.time}`);
    const durationHours = ev.duration || 1;
    const baseEnd = new Date(baseStart.getTime() + durationHours * 60 * 60 * 1000);

    const start = bufferMinutes
        ? new Date(baseStart.getTime() - bufferMinutes * 60 * 1000)
        : baseStart;
    const end = bufferMinutes
        ? new Date(baseEnd.getTime() + bufferMinutes * 60 * 1000)
        : baseEnd;

    return {
        start,
        end,
        baseStart,
        baseEnd
    };
}

/**
 * Utility: Check for conflicts
 * Returns a rich conflict object if one exists, otherwise null.
 * - type: 'direct' (time windows overlap) or 'near' (buffer-time overlap only)
 * - overlapMinutes: approximate duration of the overlap window
 * @param {Object} newEvent - The event user wants to register for
 * @param {Array} registeredEvents - Array of events user is already registered for
 * @param {Object} options - { bufferMinutes?: number }
 */
function findConflict(newEvent, registeredEvents, options = {}) {
    if (!registeredEvents || registeredEvents.length === 0) return null;

    const bufferMinutes = options.bufferMinutes ?? DEFAULT_CONFLICT_BUFFER_MINUTES;
    const newRange = getEventTimeRange(newEvent, 0);
    const newBufferedRange = getEventTimeRange(newEvent, bufferMinutes);

    let foundConflict = null;

    registeredEvents.forEach(existingEvent => {
        if (foundConflict) return;

        // Skip comparing with itself (if re-registering)
        if (existingEvent.id === newEvent.id) return;

        if (existingEvent.date !== newEvent.date) return;

        const existingRange = getEventTimeRange(existingEvent, 0);
        const existingBufferedRange = getEventTimeRange(existingEvent, bufferMinutes);

        // Direct overlap: (StartA < EndB) and (EndA > StartB)
        const hasDirectOverlap =
            newRange.baseStart < existingRange.baseEnd &&
            newRange.baseEnd > existingRange.baseStart;

        // Near overlap: no direct overlap, but overlaps when buffer applied
        const hasBufferedOverlap =
            !hasDirectOverlap &&
            newBufferedRange.start < existingBufferedRange.end &&
            newBufferedRange.end > existingBufferedRange.start;

        if (!hasDirectOverlap && !hasBufferedOverlap) return;

        const overlapStart = hasDirectOverlap
            ? new Date(Math.max(newRange.baseStart.getTime(), existingRange.baseStart.getTime()))
            : new Date(Math.max(newBufferedRange.start.getTime(), existingBufferedRange.start.getTime()));
        const overlapEnd = hasDirectOverlap
            ? new Date(Math.min(newRange.baseEnd.getTime(), existingRange.baseEnd.getTime()))
            : new Date(Math.min(newBufferedRange.end.getTime(), existingBufferedRange.end.getTime()));

        const overlapMinutes = Math.max(0, Math.round((overlapEnd - overlapStart) / (60 * 1000)));

        foundConflict = {
            existingEvent,
            type: hasDirectOverlap ? 'direct' : 'near',
            overlapMinutes,
            bufferMinutes
        };
    });

    return foundConflict;
}

/**
 * Utility: Get Alternatives
 * Returns events from same club or same day that don't conflict.
 */
function getAlternatives(conflictingEvent, registeredEvents) {
    return ALL_EVENTS.filter(ev =>
        ev.id !== conflictingEvent.id && // Not the conflict itself
        (ev.club === conflictingEvent.club || ev.date === conflictingEvent.date) && // Contextually relevant
        !findConflict(ev, registeredEvents) // Must not also conflict
    );
}

document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initTestimonialsAndSliders();
    initTabsAndModals();
    initCalendar();
    initForms();
    initAdmin();
    initAnimations();
    initStudentSession();
    initConflictModal(); // New module
});

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
                const club = clubs[clubId] || { name: clubId, icon: '🌟' };

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
                item.innerHTML = `
                    <div class="hub-item-info">
                        <h4>${event.name}</h4>
                        <p><i class="far fa-calendar-alt"></i> ${event.date} | <i class="far fa-clock"></i> ${event.time}</p>
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
        clubRegistrationForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const studentId = document.getElementById('club-student-id').value;
            const selectedClubs = Array.from(this.querySelectorAll('input[name="club"]:checked')).map(cb => cb.value);

            if (selectedClubs.length > 0) {
                const student = JSON.parse(localStorage.getItem('studentUser'));
                if (student && student.id === studentId) {
                    const joinedClubs = JSON.parse(localStorage.getItem(`clubs_${studentId}`)) || [];
                    selectedClubs.forEach(club => {
                        if (!joinedClubs.includes(club)) joinedClubs.push(club);
                    });
                    localStorage.setItem(`clubs_${studentId}`, JSON.stringify(joinedClubs));
                }
            }

            alert('Club registration submitted successfully!');
            this.reset();
            updateEnrollmentStatus();
        });
    }

    // Event Registration
    const eventRegistrationForm = document.getElementById('event-registration-form');
    if (eventRegistrationForm) {
        eventRegistrationForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const eventName = document.getElementById('selected-event-name').textContent;
            const studentId = document.getElementById('event-student-id').value;

            // Check for conflicts if logged in
            const student = JSON.parse(localStorage.getItem('studentUser'));
            if (student && student.id === studentId) {
                // Use Centralized Data
                const events = (typeof ALL_EVENTS !== 'undefined') ? ALL_EVENTS : [
                    { id: 1, name: "AI Workshop Series", date: "2023-11-15", time: "14:00" },
                    { id: 2, name: "Digital Art Masterclass", date: "2023-11-20", time: "16:00" },
                    { id: 3, name: "Public Speaking Workshop", date: "2023-11-22", time: "15:00" }
                ];

                const currentEvent = events.find(ev => ev.name === eventName);
                if (currentEvent) {
                    const studentEvents = JSON.parse(localStorage.getItem(`events_${studentId}`)) || [];

                    // New Conflict Logic (direct + near conflicts with buffer)
                    const conflict = findConflict(currentEvent, studentEvents);

                    if (conflict) {
                        // Trigger Modal instead of silent block
                        if (typeof window.showConflictModal === 'function') {
                            window.showConflictModal(currentEvent, conflict.existingEvent, studentEvents, conflict);
                            // Hide the registration form
                            const container = document.getElementById('event-registration-form-container');
                            if (container) container.classList.add('hidden');
                        } else {
                            const label = conflict.type === 'near' ? 'Near conflict' : 'Conflict';
                            alert(`${label} detected! You are already registered for "${conflict.existingEvent.name}" at ${conflict.existingEvent.time} on this day.`);
                        }
                        return;
                    }

                    studentEvents.push(currentEvent);
                    localStorage.setItem(`events_${studentId}`, JSON.stringify(studentEvents));
                }
            }

            alert('Event registration submitted successfully!');
            this.reset();
            const container = document.getElementById('event-registration-form-container');
            if (container) container.classList.add('hidden');
            updateEnrollmentStatus();
        });
    }

    // Student Login
    const studentLoginForm = document.getElementById('student-login-form');
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('login-student-name').value;
            const id = document.getElementById('login-student-id').value;

            if (name && id) {
                const student = { name, id };
                localStorage.setItem('studentUser', JSON.stringify(student));
                updateUIForStudent();
                document.getElementById('login-message').textContent = 'Login successful!';
                setTimeout(() => {
                    const clubTab = document.querySelector('[data-tab="club-registration"]');
                    if (clubTab) clubTab.click();
                }, 1000);
            }
        });
    }

    // Certificate Upload
    const certificateForm = document.getElementById('certificate-form');
    if (certificateForm) {
        certificateForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const studentId = document.getElementById('certificate-student-id').value;
            const eventId = document.getElementById('certificate-event').value;
            const certificateFile = document.getElementById('certificate-file').files[0];

            if (!studentId || !eventId || !certificateFile) {
                alert('Please fill all fields and select a file');
                return;
            }
            alert(`Certificate for student ${studentId} for event ${eventId} uploaded successfully!`);
            this.reset();
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

    // Sample events data
    let events = [
        { id: 1, name: "AI Workshop", club: "tech", date: "2023-11-15", time: "14:00", location: "CS Building, Room 101", description: "Hands-on session on machine learning." },
        { id: 2, name: "Digital Art Masterclass", club: "arts", date: "2023-11-20", time: "16:00", location: "Arts Center, Studio 3", description: "Learn advanced techniques." },
        { id: 3, name: "Public Speaking Workshop", club: "debate", date: "2023-11-22", time: "15:00", location: "Humanities Building, Room 205", description: "Improve your speaking skills." }
    ];

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

        eventDetailsContainer.innerHTML = `
            <div class="event-details">
                <div class="event-header">
                    <span class="event-club-badge ${event.club}">${getClubName(event.club)}</span>
                    <button id="edit-event" class="action-button"><i class="fas fa-edit"></i> Edit</button>
                </div>
                <h2 class="event-title">${event.name}</h2>
                <div class="event-date-time">
                    <span><i class="far fa-calendar-alt"></i> ${formatDate(event.date)}</span>
                    <span><i class="far fa-clock"></i> ${event.time}</span>
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
    // Using global ALL_EVENTS if available, else local fallback
    // Note: In a real app we might merge local and global, but for this feature we prioritize ALL_EVENTS
    // Update render function to use ALL_EVENTS
    events = (typeof ALL_EVENTS !== 'undefined') ? JSON.parse(JSON.stringify(ALL_EVENTS)) : events;

    // Check local storage for user registered events to highlight conflicts
    const student = JSON.parse(localStorage.getItem('studentUser'));
    let registeredEvents = [];
    if (student) {
        registeredEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];
    }

    // Enrich events with conflict status for calendar visualization
    events.forEach(ev => {
        const conflict = findConflict(ev, registeredEvents);
        // If it's the exact same event ID, it's 'registered', not 'conflict'
        if (conflict && conflict.existingEvent.id !== ev.id) {
            ev.isConflict = true;
            ev.conflictType = conflict.type; // 'direct' or 'near'
            ev.conflictsWith = conflict.existingEvent.name;
        }
    });

    renderCalendar();

    // Helper to render calendar with conflicts
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

            let hasDayConflict = false;

            dayEventsData.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.classList.add('day-event', event.club);

                if (event.isConflict) {
                    const typeClass = event.conflictType === 'near' ? 'conflict-near' : 'conflict-direct';
                    eventElement.classList.add('conflict', typeClass);
                    hasDayConflict = true;

                    // Simple tooltip-style native title
                    const label = event.conflictType === 'near' ? 'Near conflict' : 'Direct conflict';
                    eventElement.title = `${label} with "${event.conflictsWith}"`;
                }

                eventElement.textContent = event.name + (event.isConflict ? " (⚠)" : "");
                eventElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEventDetails(event);
                });
                dayEvents.appendChild(eventElement);
            });

            if (hasDayConflict) {
                dayElement.classList.add('has-conflict');
            }

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

        adminLoginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            const rememberMe = document.getElementById('remember-me')?.checked;

            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }

            // Mock Validation
            if (username === 'admin' && password === 'admin123') {
                if (rememberMe) {
                    localStorage.setItem('adminRemembered', 'true');
                    localStorage.setItem('adminUsername', username);
                } else {
                    localStorage.removeItem('adminRemembered');
                    localStorage.removeItem('adminUsername');
                }

                // Session Mock
                localStorage.setItem('adminLoggedIn', 'true'); // Using local storage to persist across page loads in this demo

                // UI Feedback
                const loginButton = document.querySelector('.login-button');
                if (loginButton) {
                    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Logging in...</span>';
                    loginButton.disabled = true;
                }
                setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 1000);

            } else {
                alert('Invalid credentials. Please try again.');
            }
        });
    }

    // 6b. Admin Dashboard Logic
    const adminDashboard = document.getElementById('admin-dashboard');
    if (adminDashboard) {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        if (!isLoggedIn) {
            window.location.href = 'admin-login.html';
        } else {
            loadAdminDashboard();
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
        adminEventForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('admin-event-name').value;
            alert(`Event "${name}" saved successfully!`);
            this.reset();
        });
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
}

/**
 * 7. Visual Animations
 * Handles Timeline, Gallery scroll, Parallax, and Decorative particles.
 */
function initAnimations() {
    // Timeline Scroll Animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        timelineItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(50px)';
            item.style.transition = 'all 0.6s ease';
            observer.observe(item);
        });
    }

    // Parallax effect for planets
    const planets = document.querySelectorAll('.planet');
    if (planets.length > 0) {
        window.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            planets.forEach((planet, index) => {
                const speed = (index + 1) * 20;
                planet.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });
        });
    }
}

/**
 * 8. Conflict Modal Logic
 * Handles showing the conflict warning modal and alternatives.
 */
function initConflictModal() {
    const modal = document.getElementById('conflict-modal');
    if (!modal) return;

    // Close Logic
    const closeBtn = modal.querySelector('.close-conflict-modal');
    const cancelBtn = document.getElementById('conflict-cancel-btn');
    const swapBtn = document.getElementById('conflict-swap-btn');
    const proceedBtn = document.getElementById('conflict-proceed-btn');

    function hideModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    if (closeBtn) closeBtn.addEventListener('click', hideModal);
    if (cancelBtn) cancelBtn.addEventListener('click', hideModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    // Store handlers on modal so showConflictModal can attach per-conflict behaviour
    modal._controls = { hideModal, swapBtn, proceedBtn };
}

/**
 * Global API to trigger conflict modal
 */
window.showConflictModal = function (newEvent, conflictingEvent, registeredEvents, conflictMeta) {
    const modal = document.getElementById('conflict-modal');
    if (!modal) return;

    const { hideModal, swapBtn, proceedBtn } = modal._controls || {};

    // Populate details
    document.getElementById('conflict-new-event-name').textContent = newEvent.name;

    const existingDetails = document.getElementById('conflict-existing-details');
    existingDetails.innerHTML = `
        <strong>${conflictingEvent.name}</strong><br>
        <span class="text-xs"><i class="far fa-clock"></i> ${conflictingEvent.date} @ ${conflictingEvent.time}</span>
    `;

    const newDetails = document.getElementById('conflict-new-details');
    newDetails.innerHTML = `
        <strong>${newEvent.name}</strong><br>
        <span class="text-xs"><i class="far fa-clock"></i> ${newEvent.date} @ ${newEvent.time}</span>
    `;

    // Conflict meta details (type + overlap duration + simple timeline)
    const typeBadge = document.getElementById('conflict-type-badge');
    const overlapText = document.getElementById('conflict-overlap-text');
    const timelineExisting = document.getElementById('conflict-timeline-existing');
    const timelineNew = document.getElementById('conflict-timeline-new');

    if (conflictMeta && typeBadge && overlapText && timelineExisting && timelineNew) {
        const label = conflictMeta.type === 'near' ? 'Near Conflict (buffer time overlap)' : 'Direct Conflict';
        typeBadge.textContent = label;
        typeBadge.className = 'conflict-type-badge ' + (conflictMeta.type === 'near' ? 'near' : 'direct');

        const minutes = conflictMeta.overlapMinutes;
        if (minutes && minutes > 0) {
            overlapText.textContent = `Approximate overlap: ${minutes} minute${minutes === 1 ? '' : 's'}.`;
        } else {
            overlapText.textContent = '';
        }

        // Very lightweight visual timeline using flex widths
        const existingRange = getEventTimeRange(conflictingEvent, 0);
        const newRange = getEventTimeRange(newEvent, 0);

        const dayStart = new Date(existingRange.baseStart);
        dayStart.setHours(6, 0, 0, 0); // assume earliest 6 AM
        const dayEnd = new Date(existingRange.baseStart);
        dayEnd.setHours(22, 0, 0, 0); // assume latest 10 PM
        const totalMs = dayEnd - dayStart;

        function toPercent(range) {
            const startOffset = Math.max(0, range.baseStart - dayStart);
            const endOffset = Math.min(totalMs, range.baseEnd - dayStart);
            const width = Math.max(5, ((endOffset - startOffset) / totalMs) * 100);
            const left = (startOffset / totalMs) * 100;
            return { left, width };
        }

        const existingPerc = toPercent(existingRange);
        const newPerc = toPercent(newRange);

        timelineExisting.style.left = `${existingPerc.left}%`;
        timelineExisting.style.width = `${existingPerc.width}%`;

        timelineNew.style.left = `${newPerc.left}%`;
        timelineNew.style.width = `${newPerc.width}%`;
    }

    // Populate Alternatives
    const alternativesContainer = document.getElementById('conflict-alternatives-list');
    const alternatives = getAlternatives(conflictingEvent, registeredEvents);

    alternativesContainer.innerHTML = '';

    if (alternatives.length === 0) {
        alternativesContainer.innerHTML = '<p style="color:rgba(255,255,255,0.6); font-style:italic;">No non-conflicting alternatives found.</p>';
    } else {
        alternatives.forEach(alt => {
            const el = document.createElement('div');
            el.className = 'alternative-card';
            el.innerHTML = `
                <div class="alternative-info">
                    <h5>${alt.name}</h5>
                    <p>${alt.date} @ ${alt.time}</p>
                </div>
                <button class="action-button small" onclick="registerForAlternative(${alt.id})">
                    Register
                </button>
            `;
            alternativesContainer.appendChild(el);
        });
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling

    // Wire up conflict actions (swap / proceed) fresh for each invocation
    if (swapBtn) {
        swapBtn.onclick = function () {
            const student = JSON.parse(localStorage.getItem('studentUser'));
            if (!student) return;

            let studentEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];
            // Remove the conflicting event, then add the new one
            studentEvents = studentEvents.filter(e => e.id !== conflictingEvent.id);
            studentEvents.push(newEvent);
            localStorage.setItem(`events_${student.id}`, JSON.stringify(studentEvents));

            alert(`You are now registered for "${newEvent.name}" instead of "${conflictingEvent.name}".`);
            if (hideModal) hideModal();
            if (typeof updateEnrollmentStatus === 'function') updateEnrollmentStatus();
            // Refresh calendar / hub views if present
            try { window.location.reload(); } catch (e) { /* no-op */ }
        };
    }

    if (proceedBtn) {
        proceedBtn.onclick = function () {
            const student = JSON.parse(localStorage.getItem('studentUser'));
            if (!student) return;

            const studentEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];
            studentEvents.push(newEvent);
            localStorage.setItem(`events_${student.id}`, JSON.stringify(studentEvents));

            alert(`You have been additionally registered for "${newEvent.name}" (overlapping schedule).`);
            if (hideModal) hideModal();
            if (typeof updateEnrollmentStatus === 'function') updateEnrollmentStatus();
            try { window.location.reload(); } catch (e) { /* no-op */ }
        };
    }
};

window.registerForAlternative = function (altId) {
    const student = JSON.parse(localStorage.getItem('studentUser'));
    if (!student) return;

    const event = ALL_EVENTS.find(e => e.id === altId);
    if (event) {
        const studentEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];
        studentEvents.push(event);
        localStorage.setItem(`events_${student.id}`, JSON.stringify(studentEvents));

        alert(`Successfully registered for alternative: ${event.name}`);
        document.getElementById('conflict-modal').style.display = 'none';
        document.body.style.overflow = 'auto';

        // Refresh UI if on My Hub
        if (typeof updateEnrollmentStatus === 'function') updateEnrollmentStatus();
        window.location.reload(); // Simple refresh to update state
    }
};    // Twinkling Stars
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