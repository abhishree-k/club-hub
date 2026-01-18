/**
 * Main Entry Point
 * All functionality is initialized here via modular functions.
 */
document.addEventListener('DOMContentLoaded', function () {
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

    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});

// Global functions for conflict detection
const BUFFER_TIME_MINUTES = 30; // Buffer time in minutes for near conflicts

function eventsOverlap(event1, event2) {
    const start1 = new Date(event1.startDate + 'T' + event1.startTime);
    const end1 = new Date(event1.endDate + 'T' + event1.endTime);
    const start2 = new Date(event2.startDate + 'T' + event2.startTime);
    const end2 = new Date(event2.endDate + 'T' + event2.endTime);
    return start1 < end2 && start2 < end1;
}

function getConflictType(event1, event2) {
    const start1 = new Date(event1.startDate + 'T' + event1.startTime);
    const end1 = new Date(event1.endDate + 'T' + event1.endTime);
    const start2 = new Date(event2.startDate + 'T' + event2.startTime);
    const end2 = new Date(event2.endDate + 'T' + event2.endTime);

    // Direct conflict
    if (start1 < end2 && start2 < end1) {
        return 'direct';
    }

    // Near conflict (within buffer time)
    const bufferMs = BUFFER_TIME_MINUTES * 60 * 1000;
    const end1WithBuffer = new Date(end1.getTime() + bufferMs);
    const end2WithBuffer = new Date(end2.getTime() + bufferMs);

    if ((start2 <= end1WithBuffer && start2 >= end1) || (start1 <= end2WithBuffer && start1 >= end2)) {
        return 'near';
    }

    return 'none';
}

function calculateOverlapMinutes(event1, event2) {
    const start1 = new Date(event1.startDate + 'T' + event1.startTime);
    const end1 = new Date(event1.endDate + 'T' + event1.endTime);
    const start2 = new Date(event2.startDate + 'T' + event2.startTime);
    const end2 = new Date(event2.endDate + 'T' + event2.endTime);

    const overlapStart = Math.max(start1.getTime(), start2.getTime());
    const overlapEnd = Math.min(end1.getTime(), end2.getTime());

    if (overlapEnd > overlapStart) {
        return Math.round((overlapEnd - overlapStart) / (1000 * 60));
    }
    return 0;
}

function registerForEvent(event) {
    const student = JSON.parse(localStorage.getItem('studentUser'));
    if (!student) {
        alert('Please login to register for events.');
        window.location.href = 'registration.html#student-login';
        return;
    }

    const registeredEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];

    // Check for conflicts
    const conflicts = registeredEvents.filter(regEvent => eventsOverlap(regEvent, event));

    if (conflicts.length > 0) {
        showConflictModal(event, conflicts, registeredEvents);
    } else {
        // No conflicts, register
        registeredEvents.push(event);
        localStorage.setItem(`events_${student.id}`, JSON.stringify(registeredEvents));
        alert(`Successfully registered for ${event.name}!`);
        updateUIForStudent();
    }
}

function showConflictModal(event, conflicts, registeredEvents) {
    const modal = document.getElementById('conflict-modal');
    const details = document.getElementById('conflict-details');
    const suggestions = document.getElementById('alternative-suggestions');

    // Determine conflict type
    const conflictType = conflicts.length > 0 ? getConflictType(conflicts[0], event) : 'direct';
    const overlapMinutes = conflicts.length > 0 ? calculateOverlapMinutes(conflicts[0], event) : 0;
    const conflictTypeLabel = conflictType === 'direct' ? 'Direct Conflict' : 'Near Conflict (Buffer Time)';
    const conflictTypeBadgeClass = conflictType === 'direct' ? 'conflict-badge-direct' : 'conflict-badge-near';

    // Build timeline visualization
    const timelineHTML = buildConflictTimeline(conflicts[0], event);

    details.innerHTML = `
        <div class="conflict-header">
            <div class="conflict-type-badge ${conflictTypeBadgeClass}">${conflictTypeLabel}</div>
        </div>
        <p class="conflict-message">You are trying to register for <strong>${event.name}</strong>, which overlaps with an existing registration:</p>
        
        <div class="conflict-comparison">
            <div class="conflict-column existing">
                <div class="column-header">📋 EXISTING EVENT</div>
                <div class="conflict-event">
                    <h4>${conflicts[0].name}</h4>
                    <p><i class="fas fa-calendar-alt"></i> ${formatDate(conflicts[0].startDate, conflicts[0].endDate)}</p>
                    <p><i class="fas fa-clock"></i> ${conflicts[0].startTime} - ${conflicts[0].endTime}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${conflicts[0].location}</p>
                </div>
            </div>
            <div class="conflict-arrow">→</div>
            <div class="conflict-column new">
                <div class="column-header">✨ NEW EVENT</div>
                <div class="conflict-event">
                    <h4>${event.name}</h4>
                    <p><i class="fas fa-calendar-alt"></i> ${formatDate(event.startDate, event.endDate)}</p>
                    <p><i class="fas fa-clock"></i> ${event.startTime} - ${event.endTime}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                </div>
            </div>
        </div>
        
        <div class="conflict-timeline">
            ${timelineHTML}
        </div>
        
        <div class="overlap-info">
            <strong>⏱️ Approximate overlap: ${overlapMinutes} minutes.</strong>
        </div>
    `;

    // Suggest alternatives
    const alternatives = window.events.filter(e => {
        if (e.club !== event.club || e.id === event.id) return false;
        return registeredEvents.every(reg => {
            const type = getConflictType(reg, e);
            return type === 'none';
        });
    }).slice(0, 3);

    if (alternatives.length > 0) {
        suggestions.innerHTML = `
            <div class="alternatives-section">
                <h3>💡 Suggested Alternatives</h3>
                ${alternatives.map(alt => `
                    <div class="alternative-event" data-id="${alt.id}">
                        <div class="alt-header">
                            <h4>${alt.name}</h4>
                        </div>
                        <p><i class="fas fa-calendar-alt"></i> ${formatDate(alt.startDate, alt.endDate)}</p>
                        <p><i class="fas fa-clock"></i> ${alt.startTime} - ${alt.endTime}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${alt.location}</p>
                        <button class="swap-button" data-id="${alt.id}">🔄 Swap to This Event</button>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        suggestions.innerHTML = '<div class="no-alternatives"><p>ℹ️ No non-conflicting alternatives found.</p></div>';
    }

    modal.classList.add('active');

    // Bind close
    const closeBtn = document.querySelector('#conflict-modal .close-modal');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

    // Store current conflict context
    modal.dataset.eventId = event.id;
    modal.dataset.conflictEventId = conflicts[0].id;

    // Bind buttons
    const cancelBtn = document.getElementById('cancel-registration');
    if (cancelBtn) {
        cancelBtn.onclick = () => modal.classList.remove('active');
    }

    const forceBtn = document.getElementById('force-register');
    if (forceBtn) {
        forceBtn.onclick = () => {
            const student = JSON.parse(localStorage.getItem('studentUser'));
            const studentEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];
            studentEvents.push(event);
            localStorage.setItem(`events_${student.id}`, JSON.stringify(studentEvents));
            alert(`✓ Registered for ${event.name} with conflict!`);
            modal.classList.remove('active');
            updateUIForStudent();
            if (document.querySelector('.calendar-grid')) {
                renderCalendar();
            }
        };
    }

    // Bind swap buttons
    document.querySelectorAll('.swap-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const altId = parseInt(btn.dataset.id);
            const altEvent = window.events.find(e => e.id === altId);
            const student = JSON.parse(localStorage.getItem('studentUser'));
            const studentEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];

            // Remove conflicting event
            const conflictEventId = parseInt(modal.dataset.conflictEventId);
            const updatedEvents = studentEvents.filter(e => e.id !== conflictEventId);

            // Add new event
            updatedEvents.push(altEvent);
            localStorage.setItem(`events_${student.id}`, JSON.stringify(updatedEvents));

            alert(`✓ Swapped ${conflicts[0].name} with ${altEvent.name}!`);
            modal.classList.remove('active');
            updateUIForStudent();
            if (document.querySelector('.calendar-grid')) {
                renderCalendar();
            }
        });
    });
}

function buildConflictTimeline(existingEvent, newEvent) {
    const start1 = new Date(existingEvent.startDate + 'T' + existingEvent.startTime);
    const end1 = new Date(existingEvent.endDate + 'T' + existingEvent.endTime);
    const start2 = new Date(newEvent.startDate + 'T' + newEvent.startTime);
    const end2 = new Date(newEvent.endDate + 'T' + newEvent.endTime);

    const minTime = Math.min(start1.getTime(), start2.getTime());
    const maxTime = Math.max(end1.getTime(), end2.getTime());
    const totalDuration = maxTime - minTime;

    const getPosition = (time) => ((time - minTime) / totalDuration) * 100;

    const pos1Start = getPosition(start1.getTime());
    const pos1End = getPosition(end1.getTime());
    const pos2Start = getPosition(start2.getTime());
    const pos2End = getPosition(end2.getTime());

    return `
        <div class="timeline-container">
            <div class="timeline-track">
                <div class="timeline-event existing" style="left: ${pos1Start}%; width: ${pos1End - pos1Start}%;">
                    <span class="event-time">${existingEvent.startTime}</span>
                </div>
                <div class="timeline-event new" style="left: ${pos2Start}%; width: ${pos2End - pos2Start}%;">
                    <span class="event-time">${newEvent.startTime}</span>
                </div>
            </div>
            <div class="timeline-legend">
                <div class="legend-item existing"><span class="legend-dot"></span> Existing event</div>
                <div class="legend-item new"><span class="legend-dot"></span> New event</div>
            </div>
        </div>
    `;
}

function formatDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (startDate === endDate) {
        return start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
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
            // Sort by start date
            registeredEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            registeredEvents.forEach(event => {
                const item = document.createElement('div');
                item.classList.add('hub-item');
                // Format date properly
                const startDate = new Date(event.startDate);
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
                    const eventSelect = document.getElementById('event-select');
                    if (eventSelect) eventSelect.value = eventName;
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

            if (selectedClubs.length === 0) {
                alert('Please select at least one club.');
                return;
            }

            // Save student data
            const studentData = {
                firstName: document.getElementById('club-first-name').value,
                lastName: document.getElementById('club-last-name').value,
                email: document.getElementById('club-email').value,
                studentId: studentId,
                major: document.getElementById('club-major').value,
                year: document.getElementById('club-year').value,
                clubs: selectedClubs,
                reason: document.getElementById('club-reason').value,
                registeredAt: new Date().toISOString()
            };

            localStorage.setItem(`student_${studentId}`, JSON.stringify(studentData));

            // Save clubs
            localStorage.setItem(`clubs_${studentId}`, JSON.stringify(selectedClubs));

            // If logged in, update the session
            const student = JSON.parse(localStorage.getItem('studentUser'));
            if (student && student.id === studentId) {
                // Already handled
            }

            alert('Club registration submitted successfully!');
            this.reset();
            updateEnrollmentStatus();
        });
    }

    // Event Registration
    const eventRegistrationForm = document.getElementById('event-registration-form');
    if (eventRegistrationForm) {
        // Populate event select
        const eventSelect = document.getElementById('event-select');
        if (eventSelect) {
            eventSelect.innerHTML = '<option value="">Choose an event</option>'; // Clear existing options
            window.events.forEach(event => {
                const option = document.createElement('option');
                option.value = event.name;
                option.textContent = event.name;
                eventSelect.appendChild(option);
            });

            // Update selected event name
            eventSelect.addEventListener('change', function () {
                document.getElementById('selected-event-name').textContent = this.value;
            });
        }

        eventRegistrationForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const eventName = document.getElementById('event-select').value;
            const studentId = document.getElementById('event-student-id').value;
            const firstName = document.getElementById('event-first-name').value;
            const lastName = document.getElementById('event-last-name').value;
            const email = document.getElementById('event-email').value;
            const dietary = document.getElementById('event-dietary').value;
            const accessibility = document.getElementById('event-accessibility').value;

            if (!eventName || !studentId || !firstName || !lastName || !email) {
                alert('Please fill in all required fields.');
                return;
            }

            const currentEvent = window.events.find(ev => ev.name === eventName);
            if (!currentEvent) {
                alert('Event not found.');
                return;
            }

            // Save student data if not exists
            let studentData = JSON.parse(localStorage.getItem(`student_${studentId}`));
            if (!studentData) {
                studentData = {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    studentId: studentId,
                    registeredAt: new Date().toISOString()
                };
                localStorage.setItem(`student_${studentId}`, JSON.stringify(studentData));
            }

            // Check for conflicts if logged in
            const student = JSON.parse(localStorage.getItem('studentUser'));
            let studentEvents = JSON.parse(localStorage.getItem(`events_${studentId}`)) || [];

            if (student && student.id === studentId) {
                // Conflict detection
                const conflicts = studentEvents.filter(regEvent => eventsOverlap(regEvent, currentEvent));

                if (conflicts.length > 0) {
                    showConflictModal(currentEvent, conflicts, studentEvents);
                    return;
                }
            }

            // Save event registration
            const registrationData = {
                ...currentEvent,
                registrationDetails: {
                    firstName,
                    lastName,
                    email,
                    studentId,
                    dietary,
                    accessibility,
                    registeredAt: new Date().toISOString()
                }
            };

            studentEvents.push(registrationData);
            localStorage.setItem(`events_${studentId}`, JSON.stringify(studentEvents));

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

            // Save certificate request
            const certificateRequests = JSON.parse(localStorage.getItem('certificateRequests')) || [];
            certificateRequests.push({
                studentId,
                eventId,
                fileName: certificateFile.name,
                fileSize: certificateFile.size,
                requestedAt: new Date().toISOString()
            });
            localStorage.setItem('certificateRequests', JSON.stringify(certificateRequests));

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

    // Helper: Get Club Name
    function getClubName(clubId) {
        const clubs = { 'tech': 'Tech Society', 'arts': 'Creative Arts', 'debate': 'Debate Club', 'music': 'Music Society', 'sports': 'Sports Club', 'science': 'Science Guild' };
        return clubs[clubId] || 'Club';
    }

    // Helper: Format Date
    function formatDate(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (startDate === endDate) {
            return start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } else {
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
    }

    function registerForEvent(event) {
        const student = JSON.parse(localStorage.getItem('studentUser'));
        if (!student) {
            alert('Please login to register for events.');
            window.location.href = 'registration.html#student-login';
            return;
        }

        const registeredEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];

        // Check for conflicts
        const conflicts = registeredEvents.filter(regEvent => eventsOverlap(regEvent, event));

        if (conflicts.length > 0) {
            showConflictModal(event, conflicts, registeredEvents);
        } else {
            // No conflicts, register
            registeredEvents.push(event);
            localStorage.setItem(`events_${student.id}`, JSON.stringify(registeredEvents));
            alert(`Successfully registered for ${event.name}!`);
            updateUIForStudent();
            renderCalendar(); // Update calendar highlights
        }
    }

    function showConflictModal(event, conflicts, registeredEvents) {
        const modal = document.getElementById('conflict-modal');
        const details = document.getElementById('conflict-details');
        const suggestions = document.getElementById('alternative-suggestions');

        details.innerHTML = `
            <p>You are trying to register for:</p>
            <div class="conflict-event">
                <strong>${event.name}</strong><br>
                ${formatDate(event.startDate, event.endDate)}<br>
                ${event.startTime} - ${event.endTime}<br>
                ${event.location}
            </div>
            <p>But you are already registered for:</p>
            ${conflicts.map(c => `
                <div class="conflict-event">
                    <strong>${c.name}</strong><br>
                    ${formatDate(c.startDate, c.endDate)}<br>
                    ${c.startTime} - ${c.endTime}<br>
                    ${c.location}
                </div>
            `).join('')}
        `;

        // Suggest alternatives
        const alternatives = events.filter(e =>
            e.club === event.club &&
            e.id !== event.id &&
            registeredEvents.every(reg => !eventsOverlap(reg, e))
        ).slice(0, 3);

        if (alternatives.length > 0) {
            suggestions.innerHTML = `
                <h3>Alternative Events:</h3>
                ${alternatives.map(alt => `
                    <div class="alternative-event" data-id="${alt.id}" style="cursor: pointer;">
                        <strong>${alt.name}</strong><br>
                        ${formatDate(alt.startDate, alt.endDate)} ${alt.startTime} - ${alt.endTime}<br>
                        ${alt.location}
                        <button class="swap-button" data-id="${alt.id}">Swap to This Event</button>
                    </div>
                `).join('')}
            `;
        } else {
            suggestions.innerHTML = '<p class="no-alternatives">No alternative events available.</p>';
        }

        // Show modal with active class for proper centering
        modal.classList.add('active');

        // Bind close button
        const closeBtn = document.querySelector('#conflict-modal .close-modal');
        if (closeBtn) {
            closeBtn.onclick = () => modal.classList.remove('active');
        }

        // Bind "Cancel" button (Keep Existing Event)
        const cancelBtn = document.getElementById('cancel-registration');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                modal.classList.remove('active');
            };
        }

        // Bind "Register Anyway" button (Force Register)
        const forceBtn = document.getElementById('force-register');
        if (forceBtn) {
            forceBtn.onclick = () => {
                const student = JSON.parse(localStorage.getItem('studentUser'));
                const registeredEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];
                registeredEvents.push(event);
                localStorage.setItem(`events_${student.id}`, JSON.stringify(registeredEvents));
                alert(`✅ Registered for ${event.name} despite conflict!`);
                modal.classList.remove('active');
                updateUIForStudent();
                renderCalendar(); // Re-render to show conflicts
            };
        }

        // Bind swap buttons for alternative events
        document.querySelectorAll('.swap-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const altId = parseInt(btn.dataset.id);
                const altEvent = window.events.find(ev => ev.id === altId);
                if (altEvent) {
                    const student = JSON.parse(localStorage.getItem('studentUser'));
                    let registeredEvents = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];

                    // Remove the conflicting event(s)
                    registeredEvents = registeredEvents.filter(e => !conflicts.some(c => c.id === e.id));

                    // Add the new alternative event
                    registeredEvents.push(altEvent);
                    localStorage.setItem(`events_${student.id}`, JSON.stringify(registeredEvents));

                    alert(`✅ Swapped to ${altEvent.name}!`);
                    modal.classList.remove('active');
                    updateUIForStudent();
                    renderCalendar();
                }
            });
        });
    }

    // Render Calendar Logic
    function renderCalendar() {
        while (calendarGrid.children.length > 7) {
            calendarGrid.removeChild(calendarGrid.lastChild);
        }

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (currentMonthElement) currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        // Update date pickers
        if (monthPicker) monthPicker.value = currentMonth;
        if (yearPicker) yearPicker.value = currentYear;

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
            const dayEventsData = window.events.filter(event => {
                const eventStart = new Date(event.startDate);
                const eventEnd = new Date(event.endDate);
                const currentDay = new Date(dateStr);
                return currentDay >= eventStart && currentDay <= eventEnd;
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
        document.getElementById('edit-event').addEventListener('click', () => openEventModal(event));
        document.getElementById('register-for-event').addEventListener('click', () => registerForEvent(event));
        document.getElementById('share-event').addEventListener('click', () => alert(`Share link for ${event.name} copied to clipboard!`));
    }

    function openEventModal(event = null, date = null) {
        if (!eventModal) return;

        if (event) {
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

        adminLoginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            const rememberMe = document.getElementById('remember-me')?.checked;

            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }

            if (isLoginMode) {
                // LOGIN LOGIC
                // Check stored custom admins first, then hardcoded default
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

                // Check if user exists
                const existingAdmins = JSON.parse(localStorage.getItem('adminUsers')) || [];
                if (username === 'admin' || existingAdmins.some(u => u.username === username)) {
                    alert('Username already exists. Please choose another.');
                    return;
                }

                // Create new admin
                existingAdmins.push({ username, password });
                localStorage.setItem('adminUsers', JSON.stringify(existingAdmins));

                alert('Account created successfully! Please login.');
                toggleMode(true); // Switch to login
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

                        // Update Active State
                        document.querySelectorAll('.admin-menu li').forEach(li => li.classList.remove('active'));
                        link.parentElement.classList.add('active');

                        // Show Target Section
                        sections.forEach(sec => sec.style.display = 'none');
                        const targetSec = document.getElementById(targetId);
                        if (targetSec) targetSec.style.display = 'block';
                    }
                });
            });

            loadAdminDashboard();
            initClubManagement();
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
        const studentData = JSON.parse(localStorage.getItem(`student_${student.id}`));
        const fillForm = (prefix) => {
            if (studentData) {
                const firstName = document.getElementById(`${prefix}-first-name`);
                const lastName = document.getElementById(`${prefix}-last-name`);
                const email = document.getElementById(`${prefix}-email`);
                const studentId = document.getElementById(`${prefix}-student-id`);

                if (firstName) firstName.value = studentData.firstName || '';
                if (lastName) lastName.value = studentData.lastName || '';
                if (email) email.value = studentData.email || '';
                if (studentId) studentId.value = studentData.studentId || '';
            } else {
                // Fallback to name split
                const nameParts = student.name.split(' ');
                const firstName = document.getElementById(`${prefix}-first-name`);
                const lastName = document.getElementById(`${prefix}-last-name`);
                const studentId = document.getElementById(`${prefix}-student-id`);

                if (firstName) firstName.value = nameParts[0] || '';
                if (lastName) lastName.value = nameParts.slice(1).join(' ') || '';
                if (studentId) studentId.value = student.id;
            }
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

    // Update calendar if on events page
    if (document.querySelector('.calendar-grid')) {
        renderCalendar();
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
 * 8. Club Management Logic
 * Handles CRUD operations for club memberships in the Admin Dashboard.
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

        const getClubName = (code) => {
            const map = { 'tech': 'Tech Society', 'arts': 'Creative Arts', 'debate': 'Debate Club', 'music': 'Music Society', 'sports': 'Sports Club', 'science': 'Dance club- ABCD' };
            return map[code] || code;
        };

        memberships.forEach(m => {
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
        const id = document.getElementById('club-member-id').value;
        const name = document.getElementById('club-student-name').value;
        const studentId = document.getElementById('club-student-db-id').value;
        const club = document.getElementById('club-select').value;
        const status = document.getElementById('club-status').value;

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
            openModal(member);
        } else if (btn.classList.contains('delete-club')) {
            if (confirm('Are you sure you want to remove this member?')) {
                memberships = memberships.filter(m => m.id != id);
                localStorage.setItem('allClubMemberships', JSON.stringify(memberships));
                renderTable();
            }
        }
    });
}
