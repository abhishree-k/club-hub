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
            if (username === 'admin' && password === 'admin123') {
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
            // Leader: leader_tech / tech123
            if (username.startsWith('leader_')) {
                const club = username.split('_')[1];
                if (password === `${club}123`) {
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
    initFavorites();

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

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (successMsg.parentNode) successMsg.remove();
    }, 5000);
}

/**
 * 1. Navigation & Scrolling Logic
 * Handles mobile menu toggling and smooth scrolling.
 */
function initNavigation() {
    // Elements
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle'); // toggle button
    const mobileMenu = document.querySelector('.nav-links'); // nav list

    if (!mobileMenuToggle || !mobileMenu) return; // nothing to do if missing

    const navLinks = mobileMenu.querySelectorAll('a');
    let isMenuOpen = false;

    // Open the menu and move focus to first link
    function openMenu() {
        isMenuOpen = true;
        mobileMenu.classList.add('active');
        mobileMenuToggle.classList.add('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');

        // Focus the first link inside the menu (small delay to allow CSS transition)
        setTimeout(() => {
            const firstLink = mobileMenu.querySelector('a');
            if (firstLink) firstLink.focus();
        }, 50);

        // Attach document key handler for Escape, Tab trap and arrow navigation
        document.addEventListener('keydown', onDocumentKeyDown);
    }

    // Close the menu and return focus to toggle
    function closeMenu() {
        isMenuOpen = false;
        mobileMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenuToggle.focus();

        // Remove document-level key handler
        document.removeEventListener('keydown', onDocumentKeyDown);
    }

    function toggleMenu() {
        if (isMenuOpen) closeMenu(); else openMenu();
    }

    // Click to toggle
    mobileMenuToggle.addEventListener('click', function () {
        toggleMenu();
    });

    // Keyboard activation for toggle (Enter / Space)
    mobileMenuToggle.addEventListener('keydown', function (event) {
        // Activate on Enter or Space
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
            toggleMenu();
        }
    });

    // Helper: move focus by delta within menu links (wraps around)
    function moveFocus(delta) {
        const focusable = Array.from(mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'));
        if (!focusable.length) return;

        const currentIndex = focusable.indexOf(document.activeElement);
        let nextIndex = currentIndex + delta;

        // If nothing is focused inside the menu, focus the first (or last if delta < 0)
        if (currentIndex === -1) {
            nextIndex = delta > 0 ? 0 : focusable.length - 1;
        }

        // Wrap around
        if (nextIndex < 0) nextIndex = focusable.length - 1;
        if (nextIndex >= focusable.length) nextIndex = 0;

        focusable[nextIndex].focus();
    }

    // Document-level keyboard handler: Escape to close, Tab to trap focus, Arrow keys to navigate
    function onDocumentKeyDown(event) {
        // Close on Escape
        if (event.key === 'Escape') {
            if (isMenuOpen) closeMenu();
            return;
        }

        // Arrow navigation (Left/Up = previous, Right/Down = next)
        if (isMenuOpen && (event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowLeft')) {
            event.preventDefault();
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') moveFocus(1);
            else moveFocus(-1);
            return;
        }

        // Focus trap: if menu is open and Tab is pressed, ensure focus cycles within menu
        if (event.key === 'Tab' && isMenuOpen) {
            const focusable = mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey) { // Shift+Tab
                if (document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                }
            } else { // Tab
                if (document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }
    }

    // Close when clicking outside the menu
    document.addEventListener('click', function (event) {
        if (isMenuOpen && !mobileMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            closeMenu();
        }
    });

    // Smooth scrolling for anchor links (preserve previous behavior)
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
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    closeMenu();
                }
            }
        });
    });
}

function initMyHub() {
    // Only run on My Hub page
    if (!window.location.pathname.includes('my-hub.html')) {
        return;
    }

    const student = JSON.parse(localStorage.getItem('studentUser'));
    if (!student) {
        window.location.href = 'registration.html#student-login';
        return;
    }

    const welcomeMsg = document.getElementById('hub-welcome-msg');
    if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${student.name}!`;

    // Render Favorites in My Hub
    const favoritesListEl = document.getElementById('favorites-list');
    if (favoritesListEl) {
        const favs = getFavoriteClubs();
        if (favs.length === 0) {
            favoritesListEl.innerHTML = '<div class="no-data"><p>You have no favorite clubs yet.</p><a href="index.html" class="action-button" style="display:inline-block; margin-top:1rem;">Discover Clubs</a></div>';
        } else {
            favoritesListEl.innerHTML = '';
            const clubsMap = {
                'tech': { name: 'Tech Society- POINT BLANK', icon: '💻' },
                'arts': { name: 'Creative Arts-AALEKA', icon: '🎨' },
                'debate': { name: 'Debate Club- LITSOC', icon: '💬' },
                'music': { name: 'Music Society', icon: '🎵' },
                'sports': { name: 'Sports Club', icon: '⚽' },
                'science': { name: 'Dance club- ABCD', icon: '💃' }
            };

            favs.forEach(clubId => {
                const club = clubsMap[clubId] || { name: clubId, icon: '🌟' };
                const item = document.createElement('div');
                item.classList.add('hub-item');
                item.innerHTML = `
                    <div class="hub-item-info">
                        <h4>${club.icon} ${club.name}</h4>
                        <p>Favorited</p>
                    </div>
                `;
                favoritesListEl.appendChild(item);
            });
        }
    }

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

            // Show success message instead of alert
            const successMessage = document.getElementById('club-success-message');
            if (successMessage) {
                successMessage.classList.remove('hidden');
                // Scroll to the message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Auto-hide the message after 5 seconds
                setTimeout(() => {
                    successMessage.classList.add('hidden');
                }, 5000);
            }

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

    function showEventDetails(event) {
        if (!eventDetailsContainer) return;
        selectedEvent = event;

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
        if (!confirmPasswordGroup || !loginButton || !tabLogin || !tabSignup) return;

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
                const result = window.AuthService.login(username, password);

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
                    // Immediate redirect instead of timeout to reduce "flicker/fluctuation"
                    window.location.replace('admin-dashboard.html');
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
        // Redundant check removed. guardRoute handles this globally.
        // const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        // if (!isLoggedIn) { ... }
        if (true) {
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
                            // setTimeout(initAnalytics, 100); // Removed: we use initDashboardCharts now
                        }

                    }
                });
            });

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
            const cu = window.AuthService.getCurrentUser();
            if (cu && cu.role === 'student') {
                localStorage.removeItem('currentUser');
            }
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

/* Favorites: simple localStorage-backed favorites for clubs */
const FAVORITES_KEY = 'favoriteClubs';

function getFavoriteClubs() {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

function isClubFavorited(id) {
    return getFavoriteClubs().includes(id);
}

function setClubFavorited(id, favorited) {
    const favs = getFavoriteClubs();
    if (favorited) {
        if (!favs.includes(id)) favs.push(id);
    } else {
        const idx = favs.indexOf(id);
        if (idx !== -1) favs.splice(idx, 1);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function updateFavoriteUI() {
    document.querySelectorAll('.favorite-toggle').forEach(btn => {
        const clubId = btn.getAttribute('data-club');
        const icon = btn.querySelector('i');
        const card = btn.closest('.club-card');
        if (isClubFavorited(clubId)) {
            btn.classList.add('active');
            if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
            if (card) card.classList.add('favorited');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('active');
            if (icon) { icon.classList.remove('fas'); icon.classList.add('far'); }
            if (card) card.classList.remove('favorited');
            btn.setAttribute('aria-pressed', 'false');
        }
    });
}

function initFavorites() {
    // Delegate clicks for favorite toggles
    document.addEventListener('click', function (e) {
        const btn = e.target.closest && e.target.closest('.favorite-toggle');
        if (!btn) return;
        const clubId = btn.getAttribute('data-club');
        if (!clubId) return;
        const currently = isClubFavorited(clubId);
        setClubFavorited(clubId, !currently);
        updateFavoriteUI();

        // If on My Hub, re-run initMyHub to refresh favorites list
        if (typeof initMyHub === 'function') initMyHub();
    });

    // Initial render
    updateFavoriteUI();
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
