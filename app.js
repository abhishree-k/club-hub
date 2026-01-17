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
    initFeedbackSystem();

    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});

/**
 * Security: HTML Sanitization Utility
 * Prevents XSS attacks by escaping HTML special characters.
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} unsafe - The untrusted string to sanitize
 * @returns {string} - The sanitized string safe for DOM insertion
 * 
 * @example
 * // Prevents XSS from user input
 * const userInput = '<script>alert("XSS")</script>';
 * const safe = escapeHtml(userInput);
 * element.innerHTML = safe; // Renders as text, not executed
 * 
 * @example
 * // Safe display of user names using innerHTML with sanitization
 * const userName = localStorage.getItem('userName');
 * document.getElementById('welcome').innerHTML = escapeHtml(userName);
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return unsafe;
    }

    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * 0. DataManager Service (Virtual Backend)
 * Centralizes all data persistence logic.
 * Serves as a single source of truth for Users, Events, and Clubs.
 */
const DB = {
    // --- USER / STUDENT MODULE ---
    users: {
        login: (name, id) => {
            const user = { name, id, role: 'student', joined: new Date().toISOString() };
            localStorage.setItem('studentUser', JSON.stringify(user));
            return user;
        },
        getCurrent: () => {
            return JSON.parse(localStorage.getItem('studentUser'));
        },
        logout: () => {
            localStorage.removeItem('studentUser');
        },
        register: (details) => {
            // In a real app, this would save to a users table
            // For now, we simulate "session" creation
            const user = { ...details, role: 'student', joined: new Date().toISOString() };
            localStorage.setItem('studentUser', JSON.stringify(user));
            return user;
        }
    },

    // --- ADMIN MODULE ---
    admin: {
        getUsers: () => JSON.parse(localStorage.getItem('adminUsers')) || [],

        login: (username, password) => {
            // 1. Hardcoded Check
            if (username === 'admin' && password === 'admin123') return { success: true, user: { username: 'admin' } };

            // 2. DB Check
            const admins = DB.admin.getUsers();
            const found = admins.find(u => u.username === username && u.password === password);
            return found ? { success: true, user: found } : { success: false };
        },

        register: (username, password) => {
            const admins = DB.admin.getUsers();
            if (username === 'admin' || admins.some(u => u.username === username)) {
                return { success: false, message: 'Username already exists' };
            }
            admins.push({ username, password });
            localStorage.setItem('adminUsers', JSON.stringify(admins));
            return { success: true };
        },

        setSession: (username, remember) => {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('currentAdminUser', username);
            if (remember) {
                localStorage.setItem('adminRemembered', 'true');
                localStorage.setItem('adminUsername', username);
            } else {
                localStorage.removeItem('adminRemembered');
                localStorage.removeItem('adminUsername');
            }
        },

        logout: () => {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('currentAdminUser');
        },

        isLoggedIn: () => localStorage.getItem('adminLoggedIn') === 'true'
    },

    // --- EVENTS MODULE ---
    events: {
        getAll: () => {
            let events = JSON.parse(localStorage.getItem('allEvents'));
            if (!events || events.length === 0) {
                // Bootstrap Initial Data
                events = [
                    { id: 1, name: "AI Workshop", club: "tech", date: "2023-11-15", time: "14:00", location: "CS Building, Room 101", description: "Hands-on session on machine learning." },
                    { id: 2, name: "Digital Art Masterclass", club: "arts", date: "2023-11-20", time: "16:00", location: "Arts Center, Studio 3", description: "Learn advanced techniques." },
                    { id: 3, name: "Public Speaking Workshop", club: "debate", date: "2023-11-22", time: "15:00", location: "Humanities Building, Room 205", description: "Improve your speaking skills." }
                ];
                localStorage.setItem('allEvents', JSON.stringify(events));
            }
            return events;
        },
        add: (event) => {
            const events = DB.events.getAll();
            const newEvent = { ...event, id: Date.now() + Math.floor(Math.random() * 1000) };
            events.push(newEvent);
            localStorage.setItem('allEvents', JSON.stringify(events));
            return newEvent;
        },
        update: (updatedEvent) => {
            let events = DB.events.getAll();
            const index = events.findIndex(e => e.id == updatedEvent.id);
            if (index !== -1) {
                events[index] = { ...events[index], ...updatedEvent };
                localStorage.setItem('allEvents', JSON.stringify(events));
                return true;
            }
            return false;
        },
        delete: (id) => {
            let events = DB.events.getAll();
            events = events.filter(e => e.id != id);
            localStorage.setItem('allEvents', JSON.stringify(events));
        }
    },

    // --- CLUBS & MEMBERSHIPS MODULE ---
    clubs: {
        getAllMemberships: () => {
            let memberships = JSON.parse(localStorage.getItem('allClubMemberships')) || [];
            if (memberships.length === 0) {
                memberships = [
                    { id: 1, name: 'Alice Walker', studentId: 'S1001', club: 'tech', status: 'Active' },
                    { id: 2, name: 'Bob Builder', studentId: 'S1002', club: 'arts', status: 'Pending' },
                    { id: 3, name: 'Charlie Day', studentId: 'S1003', club: 'debate', status: 'Active' }
                ];
                localStorage.setItem('allClubMemberships', JSON.stringify(memberships));
            }
            return memberships;
        },
        getStudentMemberships: (studentId) => {
            const all = DB.clubs.getAllMemberships();
            return all.filter(m => m.studentId === studentId);
        },
        join: (student, clubId, details = {}) => {
            let list = DB.clubs.getAllMemberships();
            // Check for existing membership (Active or Pending)
            const existing = list.find(m => m.studentId === student.id && m.club === clubId);

            if (existing) return { success: false, message: 'Already a member or request pending.' };

            const newMember = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: student.name,
                studentId: student.id,
                club: clubId,
                status: 'Pending',
                joinedAt: new Date().toISOString(),
                ...details
            };
            list.push(newMember);
            localStorage.setItem('allClubMemberships', JSON.stringify(list));
            return { success: true, message: 'Membership requested successfully!' };
        },
        addMember: (member) => {
            const list = DB.clubs.getAllMemberships();
            const newMember = { ...member, id: Date.now() + Math.floor(Math.random() * 1000) };
            list.push(newMember);
            localStorage.setItem('allClubMemberships', JSON.stringify(list));
            return newMember;
        },
        updateMember: (id, updates) => {
            let list = DB.clubs.getAllMemberships();
            const idx = list.findIndex(m => m.id == id);
            if (idx !== -1) {
                list[idx] = { ...list[idx], ...updates };
                localStorage.setItem('allClubMemberships', JSON.stringify(list));
            }
        },
        deleteMember: (id) => {
            let list = DB.clubs.getAllMemberships();
            list = list.filter(m => m.id != id);
            localStorage.setItem('allClubMemberships', JSON.stringify(list));
        }
    },

    // --- EVENT REGISTRATIONS MODULE ---
    registrations: {
        getAll: () => JSON.parse(localStorage.getItem('allEventRegistrations')) || [],
        getForStudent: (studentId) => {
            const all = DB.registrations.getAll();
            return all.filter(r => r.studentId === studentId);
        },
        getForEvent: (eventId) => {
            const all = DB.registrations.getAll();
            return all.filter(r => r.eventId == eventId);
        },
        add: (registration) => {
            let all = DB.registrations.getAll();
            // Prevent duplicate
            if (all.some(r => r.studentId === registration.studentId && r.eventId == registration.eventId)) {
                return false;
            }
            all.push({ ...registration, id: Date.now() + Math.floor(Math.random() * 1000), registeredAt: new Date().toISOString() });
            localStorage.setItem('allEventRegistrations', JSON.stringify(all));
            return true;
        }
    }
};

// --- GLOBAL FORM HELPERS ---
function showFieldError(input, message) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) {
        console.warn("Field Error (no form-group):", message);
        alert("Error: " + message);
        return;
    }
    let error = formGroup.querySelector('.form-error');
    if (!error) {
        error = document.createElement('div');
        error.classList.add('form-error');
        error.style.color = '#ef4444';
        error.style.fontSize = '0.85rem';
        error.style.marginTop = '0.25rem';
        formGroup.appendChild(error);
    }
    error.textContent = message;
    input.classList.add('error');
}

function clearFieldError(input) {
    const formGroup = input.closest('.form-group');
    if (formGroup) {
        const error = formGroup.querySelector('.form-error');
        if (error) error.remove();
    }
    input.classList.remove('error');
}

function clearFormErrors(form) {
    form.querySelectorAll('.form-error').forEach(e => e.remove());
    form.querySelectorAll('.error').forEach(i => i.classList.remove('error'));
}

function showFormSuccess(form, message) {
    alert(message);
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
    const student = DB.users.getCurrent();
    if (!student) {
        window.location.href = 'registration.html#student-login';
        return;
    }

    const welcomeMsg = document.getElementById('hub-welcome-msg');
    // Sanitize user name to prevent XSS
    if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${student.name}!`;

    const joinedClubs = DB.clubs.getStudentMemberships(student.id).map(m => m.club);

    // Map registrations to event objects
    const registrations = DB.registrations.getForStudent(student.id);
    const allEvents = DB.events.getAll();
    const registeredEvents = registrations.map(reg => {
        const evt = allEvents.find(e => e.id == reg.eventId);
        return evt ? evt : null;
    }).filter(e => e !== null);

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

            // Save to DB if user is logged in
            // Save to DB if user is logged in
            if (selectedClubs.length > 0) {
                const student = DB.users.getCurrent();
                if (student) {
                    if (student.id === studentId.value) {
                        selectedClubs.forEach(clubId => {
                            const result = DB.clubs.join(student, clubId, {
                                email: email.value,
                                major: major.value,
                                year: year.value
                            });
                            if (!result.success) {
                                console.warn(`Club join failed for ${clubId}: ${result.message}`);
                            }
                        });
                    } else {
                        alert(`Note: The Student ID entered (${studentId.value}) does not match your logged-in ID (${student.id}). Registration was not saved to your profile.`);
                    }
                } else {
                    console.log("User not logged in. Registration not persisted to DB.");
                    // Optional warning: alert("Please login to save your club membership.");
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
            // Check for conflicts if logged in
            const student = DB.users.getCurrent();
            if (student && student.id === studentId.value) {
                const allEvents = DB.events.getAll();
                const currentEvent = allEvents.find(ev => ev.name === eventName);

                if (currentEvent) {
                    const myRegistrations = DB.registrations.getForStudent(student.id);

                    // Conflict detection
                    const conflict = myRegistrations.find(reg => {
                        const regEvent = allEvents.find(e => e.id == reg.eventId);
                        if (!regEvent || regEvent.date !== currentEvent.date) return false;

                        const regTime = parseInt(regEvent.time.split(':')[0]);
                        const currTime = parseInt(currentEvent.time.split(':')[0]);
                        return Math.abs(regTime - currTime) < 2;
                    });

                    if (conflict) {
                        const conflictEvent = allEvents.find(e => e.id == conflict.eventId);
                        showFieldError(studentId, `Conflict Detected! You are already registered for "${conflictEvent ? conflictEvent.name : 'another event'}" at ${conflictEvent ? conflictEvent.time : '??'} on this day.`);
                        return;
                    }

                    // Register
                    const success = DB.registrations.add({
                        studentId: student.id,
                        eventId: currentEvent.id,
                        name: student.name,
                        email: email.value
                    });

                    if (success) {
                        showFormSuccess(this, 'Event registration submitted successfully!');
                        setTimeout(() => {
                            this.reset();
                            const container = document.getElementById('event-registration-form-container');
                            if (container) container.classList.add('hidden');
                        }, 5000);
                        updateEnrollmentStatus();
                    } else {
                        alert(`You are already registered for this event!`);
                    }
                } else {
                    console.error("Event not found in DB: " + eventName);
                    alert("System Error: Event details not found.");
                }
            } else {
                if (!student) {
                    alert("Please login to register for events.");
                } else {
                    alert(`Note: The Student ID entered (${studentId.value}) does not match your logged-in ID (${student.id}). Registration was not saved.`);
                }
            }
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

            const student = DB.users.login(name, id);
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

    // Sample events data
    // Load events from DB
    let events = DB.events.getAll();

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

        // Fetch Reviews
        const allReviews = JSON.parse(localStorage.getItem('eventReviews')) || [];
        const eventReviews = allReviews.filter(r => r.eventId === event.id && r.isVisible);
        const avgRating = eventReviews.length ? (eventReviews.reduce((sum, r) => sum + r.rating, 0) / eventReviews.length).toFixed(1) : 'No Ratings';
        const starCount = eventReviews.length ? Math.round(eventReviews.reduce((sum, r) => sum + r.rating, 0) / eventReviews.length) : 0;
        const starStr = '⭐'.repeat(starCount);

        // Sanitize all event data before rendering
        eventDetailsContainer.innerHTML = `
            <div class="event-details">
                <div class="event-header">
                    <span class="event-club-badge ${escapeHtml(event.club)}">${escapeHtml(getClubName(event.club))}</span>
                    <button id="edit-event" class="action-button"><i class="fas fa-edit"></i> Edit</button>
                </div>
                <h2 class="event-title">${escapeHtml(event.name)}</h2>
                
                <div class="event-rating-summary" style="margin: 10px 0; color: #ffd700;">
                    <span style="font-size: 1.2em; font-weight: bold;">${avgRating}</span>
                    <span>${starStr}</span>
                    <span style="color: #ccc; font-size: 0.9em;">(${eventReviews.length} reviews)</span>
                </div>

                <div class="event-date-time">
                    <span><i class="far fa-calendar-alt"></i> ${escapeHtml(formatDate(event.date))}</span>
                    <span><i class="far fa-clock"></i> ${escapeHtml(event.time)}</span>
                </div>
                <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</div>
                <p class="event-description">${escapeHtml(event.description)}</p>
                <div class="event-actions">
                    <button id="register-for-event" class="action-button"><i class="fas fa-user-plus"></i> Register</button>
                    <button id="share-event" class="action-button"><i class="fas fa-share-alt"></i> Share</button>
                    <button id="rate-event" class="action-button" style="background: #e11d48;"><i class="fas fa-star"></i> Rate Event</button>
                </div>

                <!-- Reviews List -->
                <div class="event-reviews-list" style="margin-top: 20px; border-top: 1px solid #334155; padding-top: 15px;">
                    <h3 style="margin-bottom: 10px; font-size: 1.1em;">Recent Feedback</h3>
                    ${eventReviews.length === 0 ? '<p style="color:#94a3b8; font-style:italic;">No reviews yet. Be the first!</p>' :
                eventReviews.slice(0, 3).map(r => `
                        <div class="review-item" style="background: #1e293b; padding: 10px; border-radius: 8px; margin-bottom: 8px;">
                            <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                                <strong style="color: #e2e8f0;">${escapeHtml(r.userName)}</strong>
                                <span style="color: #ffd700;">${'⭐'.repeat(r.rating)}</span>
                            </div>
                            <p style="color: #cbd5e1; font-size: 0.9em; margin: 0;">${escapeHtml(r.comment)}</p>
                        </div>
                      `).join('')}
                </div>
            </div>
        `;

        // Bind dynamic buttons
        const editBtn = document.getElementById('edit-event');
        if (editBtn) editBtn.addEventListener('click', () => openEventModal(event));

        const regBtn = document.getElementById('register-for-event');
        if (regBtn) regBtn.addEventListener('click', () => alert(`Registered for ${event.name}`));

        const shareBtn = document.getElementById('share-event');
        if (shareBtn) shareBtn.addEventListener('click', () => alert(`Share link for ${event.name} copied to clipboard!`));

        const rateBtn = document.getElementById('rate-event');
        if (rateBtn) {
            rateBtn.addEventListener('click', () => {
                const modal = document.getElementById('feedback-modal');
                if (modal) {
                    modal.style.display = 'flex';
                    document.getElementById('feedback-event-id').value = event.id;
                    document.getElementById('feedback-event-name').value = event.name;
                }
            });
        }
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
                // Update
                const updatedEvent = { ...selectedEvent, ...eventData };
                DB.events.update(updatedEvent);
            } else {
                // Add
                DB.events.add(eventData);
            }
            // Refresh and Render
            events = DB.events.getAll();
            renderCalendar();
            showEventDetails(selectedEvent ? { ...selectedEvent, ...eventData } : events[events.length - 1]);
            eventModal.style.display = 'none';

        });
    }

    // Delete Event
    if (deleteEventButton) {
        deleteEventButton.addEventListener('click', function () {
            if (selectedEvent && confirm('Are you sure you want to delete this event?')) {
                DB.events.delete(selectedEvent.id);
                events = DB.events.getAll();
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
    console.log("initAdmin called");
    const adminLoginForm = document.getElementById('admin-login-form');
    if (!adminLoginForm) console.error("Admin login form not found!");

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

    // Helper Functions for Form Validation


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
            console.log("Real Admin Form Submitted");
            clearFormErrors(this);

            const usernameField = document.getElementById('admin-username');
            const passwordField = document.getElementById('admin-password');
            const username = usernameField.value.trim();
            const password = passwordField.value.trim();
            const rememberMe = document.getElementById('remember-me')?.checked;

            console.log("Submitting with:", { username, isLoginMode });

            let isValid = true;
            if (!username) { showFieldError(usernameField, 'Username is required'); isValid = false; }
            if (!password) { showFieldError(passwordField, 'Password is required'); isValid = false; }
            if (!isValid) return;

            if (isLoginMode) {
                // LOGIN LOGIC
                console.log("Attempting Login...");
                const result = DB.admin.login(username, password);

                if (result.success) {
                    console.log("Login Success");
                    DB.admin.setSession(username, rememberMe);

                    if (loginButton) {
                        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Logging in...</span>';
                        loginButton.disabled = true;
                    }
                    setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 1000);
                } else {
                    console.warn("Login Failed");
                    alert('Invalid credentials. Please try again.');
                }
            } else {
                // SIGN UP LOGIC
                console.log("Attempting Signup...");
                const confirmPass = confirmPasswordInput.value;
                if (password !== confirmPass) {
                    alert('Passwords do not match!');
                    return;
                }

                const result = DB.admin.register(username, password);
                if (!result.success) {
                    alert(result.message);
                    return;
                }

                console.log("Signup Success, admin saved.");
                alert('Account created successfully! Please login.');
                toggleMode(true);
            }
        });
    }




    // 6b. Admin Dashboard Logic
    const adminDashboard = document.getElementById('admin-dashboard');
    if (adminDashboard) {
        if (!DB.admin.isLoggedIn()) {
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

                        if (targetId === 'reviews') {
                            renderReviewsTable();
                        }
                    }
                });
            });

            loadAdminDashboard();
            initClubManagement();
            const logoutButton = document.getElementById('admin-logout');
            if (logoutButton) {
                logoutButton.addEventListener('click', function () {
                    DB.admin.logout();
                    window.location.href = 'admin-login.html';
                });
            }
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
                console.log("Admin Event Form Invalid");
                return;
            }

            // Create Event via DB
            const newEvent = {
                name,
                club,
                date,
                time,
                location,
                description: 'Event created by admin', // Add default desc
            };
            DB.events.add(newEvent);

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
            DB.users.logout();
            updateUIForStudent();
            window.location.href = 'index.html';
        });
    }

    // Auto-fill forms if logged in
    const student = DB.users.getCurrent();
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
    const student = DB.users.getCurrent();
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
    const student = DB.users.getCurrent();
    if (!student) return;

    const joinedClubs = DB.clubs.getStudentMemberships(student.id).map(m => m.club);

    const registrations = DB.registrations.getForStudent(student.id);
    const allEvents = DB.events.getAll();
    const registeredEvents = registrations.map(reg => allEvents.find(e => e.id == reg.eventId)).filter(e => e);

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
    let memberships = DB.clubs.getAllMemberships();

    // 2. Render Table
    function renderTable() {
        tableBody.innerHTML = '';
        memberships = DB.clubs.getAllMemberships();

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
            DB.clubs.updateMember(id, { name, studentId, club, status });
        } else {
            // Add
            DB.clubs.addMember({ name, studentId, club, status });
        }

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
                DB.clubs.deleteMember(id);
                renderTable();
            }
        }
    });
}

/**
 * 9. Feedback & Review System
 * Handles submission and display of event reviews.
 */
function initFeedbackSystem() {
    const feedbackForm = document.getElementById('feedback-form');
    // Also handle the static feedback modal toggle logic here properly if not done elsewhere
    const openFeedbackBtn = document.getElementById("open-feedback");
    const feedbackModal = document.getElementById("feedback-modal");
    const closeFeedback = document.getElementById("close-feedback");

    if (openFeedbackBtn && feedbackModal) {
        openFeedbackBtn.onclick = (e) => {
            e.preventDefault();
            feedbackModal.style.display = "flex";
        };
    }
    if (closeFeedback && feedbackModal) {
        closeFeedback.onclick = () => feedbackModal.style.display = "none";
    }

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const eventId = document.getElementById('feedback-event-id').value;
            const name = document.getElementById('feedback-name').value;
            const rating = document.getElementById('feedback-rating').value;
            const comment = document.getElementById('feedback-text').value;
            const eventName = document.getElementById('feedback-event-name').value;

            if (!eventId) {
                alert('Please select an event to rate first!');
                return;
            }

            const reviews = JSON.parse(localStorage.getItem('eventReviews')) || [];
            const newReview = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                eventId: parseInt(eventId),
                eventName: eventName,
                userName: name,
                rating: parseInt(rating),
                comment: comment,
                date: new Date().toISOString(),
                isVisible: true
            };
            reviews.push(newReview);
            localStorage.setItem('eventReviews', JSON.stringify(reviews));

            alert('Thank you for your feedback!');
            if (feedbackModal) feedbackModal.style.display = 'none';
            feedbackForm.reset();
        });
    }
}

function renderReviewsTable() {
    const tbody = document.querySelector('#reviews-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Mock data if empty
    let reviews = JSON.parse(localStorage.getItem('eventReviews')) || [];

    reviews.forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${r.id}</td>
            <td>${escapeHtml(r.eventName || 'Event')}</td>
            <td>${escapeHtml(r.userName)}</td>
            <td>${'⭐'.repeat(r.rating)}</td>
            <td>${escapeHtml(r.comment)}</td>
            <td>${new Date(r.date).toLocaleDateString()}</td>
            <td><span class="status-${r.isVisible ? 'active' : 'inactive'}">${r.isVisible ? 'Visible' : 'Hidden'}</span></td>
            <td>
                <button class="admin-action toggle-visibility" data-id="${r.id}"><i class="fas fa-${r.isVisible ? 'eye-slash' : 'eye'}"></i></button>
                <button class="admin-action delete-review" data-id="${r.id}"><i class="fas fa-trash"></i></button>
            </td>
            `;
        tbody.appendChild(row);
    });

    // Bind actions
    tbody.querySelectorAll('.toggle-visibility').forEach(btn => btn.addEventListener('click', function () {
        const id = this.dataset.id;
        const revs = JSON.parse(localStorage.getItem('eventReviews')) || [];
        const idx = revs.findIndex(x => x.id == id);
        if (idx != -1) {
            revs[idx].isVisible = !revs[idx].isVisible;
            localStorage.setItem('eventReviews', JSON.stringify(revs));
            renderReviewsTable();
        }
    }));

    tbody.querySelectorAll('.delete-review').forEach(btn => btn.addEventListener('click', function () {
        if (confirm('Delete review?')) {
            const id = this.dataset.id;
            let revs = JSON.parse(localStorage.getItem('eventReviews')) || [];
            revs = revs.filter(x => x.id != id);
            localStorage.setItem('eventReviews', JSON.stringify(revs));
            renderReviewsTable();
        }
    }));
}
