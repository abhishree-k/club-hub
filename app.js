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
    initFavorites();
    initBackToTop();

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
 * UI Helper: Form Error Handling
 */
function showFieldError(input, message) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    let errorDisplay = formGroup.querySelector('.form-error-message');

    if (!errorDisplay) {
        errorDisplay = document.createElement('div');
        errorDisplay.className = 'form-error-message';
        errorDisplay.style.color = '#ff6b6b';
        errorDisplay.style.fontSize = '0.85rem';
        errorDisplay.style.marginTop = '0.25rem';
        formGroup.appendChild(errorDisplay);
    }

    errorDisplay.textContent = message;
    input.classList.add('input-error');
    input.style.borderColor = '#ff6b6b';
}

function clearFieldError(input) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    if (formGroup) {
        const errorDisplay = formGroup.querySelector('.form-error-message');
        if (errorDisplay) {
            errorDisplay.remove();
        }
    }
    input.classList.remove('input-error');
    input.style.borderColor = '';
}

function clearFormErrors(form) {
    const errors = form.querySelectorAll('.form-error-message');
    errors.forEach(el => el.remove());

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(el => {
        el.classList.remove('input-error');
        el.style.borderColor = '';
    });
}

function showFormSuccess(form, message) {
    let successMsg = form.querySelector('.form-success-message');
    if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.className = 'form-success-message';
        successMsg.style.color = '#00b894';
        successMsg.style.textAlign = 'center';
        successMsg.style.marginTop = '1rem';
        successMsg.style.fontWeight = 'bold';

        const actions = form.querySelector('.form-actions') || form.querySelector('button[type="submit"]');
        if (actions) {
            form.insertBefore(successMsg, actions);
        } else {
            form.appendChild(successMsg);
        }
    }
    successMsg.textContent = message;

    setTimeout(() => {
        if (successMsg.parentNode) successMsg.remove();
    }, 5000);
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
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });
        setInterval(() => {
            currentSlide = (currentSlide + 1) % testimonialSlides.length;
            showSlide(currentSlide);
        }, 5000);
    }
}

/**
 * 3. Tabs, Modals & UI Toggles
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
            button.addEventListener('click', () => switchTab(button.getAttribute('data-tab')));
        });
    }
}

/**
 * 4. Forms
 */
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

/**
 * 5. Calendar System
 */
function initCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;
    renderCalendar();
}

/**
 * 6. Admin Logic - REPAIRED WITHOUT DELETING LOGIC
 */
function initAdmin() {
    const adminLoginForm = document.getElementById('admin-login-form');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('admin-password');
    const confirmPasswordInput = document.getElementById('admin-confirm-password');
    const confirmPasswordGroup = document.getElementById('confirm-password-group');
    const loginButton = document.querySelector('.login-button');

    let isLoginMode = true;

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const username = document.getElementById('admin-username').value;
            const password = passwordInput.value;

            if (isLoginMode) {
                if (username === 'admin' && password === 'admin123') {
                    localStorage.setItem('adminLoggedIn', 'true');
                    window.location.href = 'admin-dashboard.html';
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
                alert("Account logic goes here!");
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
}

/**
 * 7. Visual Animations
 */
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

function initFavorites() {}

/**
 * 9. Back to Top Utility
 */
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

/** FAQ & Chatbot Logic */
document.querySelectorAll(".faq-question").forEach(q => {
    q.addEventListener("click", () => {
        const ans = q.nextElementSibling;
        ans.style.display = ans.style.display === "block" ? "none" : "block";
    });
});

function toggleChat() {
    const chat = document.getElementById("chatbot");
    if (chat) chat.style.display = chat.style.display === "flex" ? "none" : "flex";
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
        initAdmin,
        initAnimations,
        initStudentSession,
        initBackToTop
    };
}