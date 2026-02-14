/**
 * Main Entry Point
 * All functionality is initialized here via modular functions.
 */
document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initTestimonialsAndSliders();
    initTabsAndModals();
    initCalendar(); // Now includes navigation event listeners
    initForms();
    initAdmin();
    initAnimations();
    initStudentSession();
    initFavorites();
    initBackToTop();
    initFeedbackNotification();

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
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    if (testimonialSlides.length === 0) return;

    let currentSlide = 0;

    function showSlide(index) {
        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        testimonialSlides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        
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
 * 5. Calendar System - REPAIRED
 * Handles month/year navigation, jumps, and reset to today.
 */
function initCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;

    // Navigation UI Elements
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const monthPicker = document.getElementById('month-picker');
    const yearPicker = document.getElementById('year-picker');
    const jumpToDateBtn = document.getElementById('jump-to-date');
    const todayBtn = document.getElementById('today-btn');

    // Initial State: Defaults to current month/year
    let dateContext = new Date();
    let currentMonth = dateContext.getMonth();
    let currentYear = dateContext.getFullYear();

    // Populate Year Picker dynamically if it exists and is empty
    if (yearPicker && yearPicker.options.length === 0) {
        const startYear = currentYear - 5;
        const endYear = currentYear + 5;
        for (let y = startYear; y <= endYear; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            if (y === currentYear) opt.selected = true;
            yearPicker.appendChild(opt);
        }
    }

    /**
     * Helper to update global month/year display and re-render grid.
     */
    function updateAndRender() {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // 1. Update text header
        if (currentMonthElement) {
            currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        }

        // 2. Sync dropdown pickers
        if (monthPicker) monthPicker.value = currentMonth;
        if (yearPicker) yearPicker.value = currentYear;

        // 3. Re-trigger the logic that draws the calendar boxes
        // Ensure you have a function named renderCalendar that accepts these arguments
        if (typeof renderCalendar === "function") {
            renderCalendar(currentMonth, currentYear);
        }
    }

    // --- Event Listeners for Navigation ---

    if (prevMonthButton) {
        prevMonthButton.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            updateAndRender();
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            updateAndRender();
        });
    }

    if (jumpToDateBtn && monthPicker && yearPicker) {
        jumpToDateBtn.addEventListener('click', () => {
            currentMonth = parseInt(monthPicker.value);
            currentYear = parseInt(yearPicker.value);
            updateAndRender();
        });
    }

    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            const now = new Date();
            currentMonth = now.getMonth();
            currentYear = now.getFullYear();
            updateAndRender();
        });
    }

    // Initial render call on load
    updateAndRender();
}

/**
 * 6. Admin Logic
 */
function initAdmin() {
    const adminLoginForm = document.getElementById('admin-login-form');
    const passwordInput = document.getElementById('admin-password');

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
                    alert('Login failed');
                }
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

/**
 * Session Helpers
 */
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

/**
 * 11. Feedback Notification Utility
 */
function initFeedbackNotification() {
    const feedbackForm = document.getElementById('feedback-form') || document.querySelector('#feedback-modal form');
    const successCard = document.getElementById('feedbackSuccessCard');

    if (feedbackForm && successCard) {
        feedbackForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const feedbackModal = document.getElementById('feedback-modal');
            if (feedbackModal) {
                feedbackModal.style.display = 'none';
                feedbackModal.classList.remove('active');
            }
            successCard.classList.add('show-success');
            feedbackForm.reset();
            setTimeout(() => {
                successCard.classList.remove('show-success');
            }, 4000);
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
    if (chat) chat.style.display = (chat.style.display === "flex") ? "none" : "flex";
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
        initBackToTop,
        initFeedbackNotification
    };
}