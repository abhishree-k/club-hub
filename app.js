// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.nav-hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });
    
    // Testimonial carousel
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
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
    
    // Tab functionality for registration page
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    // Event registration form toggle
    const registerButtons = document.querySelectorAll('.register-button');
    const eventRegistrationForm = document.getElementById('event-registration-form-container');
    const cancelEventRegistration = document.getElementById('cancel-event-registration');
    
    if (registerButtons.length > 0) {
        registerButtons.forEach(button => {
            button.addEventListener('click', function() {
                const eventCard = this.closest('.event-card');
                const eventName = eventCard.querySelector('.event-title').textContent;
                
                document.getElementById('selected-event-name').textContent = eventName;
                eventRegistrationForm.classList.remove('hidden');
                
                // Scroll to form
                eventRegistrationForm.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
    
    if (cancelEventRegistration) {
        cancelEventRegistration.addEventListener('click', function() {
            eventRegistrationForm.classList.add('hidden');
        });
    }
    
    // Form submissions
    const clubRegistrationForm = document.getElementById('club-registration-form');
    if (clubRegistrationForm) {
        clubRegistrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Club registration submitted successfully!');
            this.reset();
        });
    }
    
    const EventRegistrationForm = document.getElementById('event-registration-form');
    if (eventRegistrationForm) {
        eventRegistrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Event registration submitted successfully!');
            this.reset();
            eventRegistrationForm.classList.add('hidden');
        });
    }
    
    // Timeline animation on scroll
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    function checkTimelineItems() {
        timelineItems.forEach(item => {
            const itemTop = item.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (itemTop < windowHeight * 0.75) {
                item.classList.add('visible');
            }
        });
    }
    
    // Initial check
    checkTimelineItems();
    
    // Check on scroll
    window.addEventListener('scroll', checkTimelineItems);
    
    // Image slider for highlights
    const imageSliders = document.querySelectorAll('.image-slider');
    
    if (imageSliders.length > 0) {
        imageSliders.forEach(slider => {
            const images = slider.querySelectorAll('img');
            let currentImage = 0;
            
            // Show first image
            images[currentImage].classList.add('active');
            
            // Auto-rotate images
            setInterval(() => {
                images[currentImage].classList.remove('active');
                currentImage = (currentImage + 1) % images.length;
                images[currentImage].classList.add('active');
            }, 3000);
        });
    }
    
    // Modal functionality
    const modal = document.getElementById('event-modal');
    const closeModal = document.querySelector('.close-modal');
    
    if (modal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    // Calendar functionality
    const calendarGrid = document.querySelector('.calendar-grid');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const eventModal = document.getElementById('event-modal');
    const eventForm = document.getElementById('event-form');
    const saveEventButton = document.getElementById('save-event');
    const deleteEventButton = document.getElementById('delete-event');
    const eventDetailsContainer = document.getElementById('event-details-container');
    
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedEvent = null;
    
    // Sample events data (would come from database in real app)
    let events = [
        {
            id: 1,
            name: "AI Workshop",
            club: "tech",
            date: "2023-11-15",
            time: "14:00",
            location: "CS Building, Room 101",
            description: "Hands-on session on machine learning fundamentals and applications."
        },
        {
            id: 2,
            name: "Digital Art Masterclass",
            club: "arts",
            date: "2023-11-20",
            time: "16:00",
            location: "Arts Center, Studio 3",
            description: "Learn advanced techniques in digital painting and illustration."
        },
        {
            id: 3,
            name: "Public Speaking Workshop",
            club: "debate",
            date: "2023-11-22",
            time: "15:00",
            location: "Humanities Building, Room 205",
            description: "Improve your public speaking and presentation skills."
        }
    ];
    
    // Render calendar
    function renderCalendar() {
        // Clear previous calendar days
        while (calendarGrid.children.length > 7) {
            calendarGrid.removeChild(calendarGrid.lastChild);
        }
        
        // Set current month and year in header
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        // Get first day of month and total days in month
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Get days from previous month
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
        
        // Add empty cells for days of previous month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add cells for current month
        const today = new Date();
        const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            
            // Check if this is today
            if (isCurrentMonth && i === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Day number
            const dayNumber = document.createElement('div');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = i;
            dayElement.appendChild(dayNumber);
            
            // Add events for this day
            const dayEvents = document.createElement('div');
            dayEvents.classList.add('day-events');
            
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            const dayEventsData = events.filter(event => event.date === dateStr);
            
            dayEventsData.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.classList.add('day-event', event.club);
                eventElement.textContent = event.name;
                eventElement.addEventListener('click', () => showEventDetails(event));
                dayEvents.appendChild(eventElement);
            });
            
            dayElement.appendChild(dayEvents);
            
            // Add click event to create new event
            dayElement.addEventListener('click', function(e) {
                if (e.target === this || e.target.classList.contains('day-number')) {
                    openEventModal(null, dateStr);
                }
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    // Show event details
    function showEventDetails(event) {
        selectedEvent = event;
        
        const eventHtml = `
            <div class="event-details">
                <div class="event-header">
                    <span class="event-club-badge ${event.club}">${getClubName(event.club)}</span>
                    <button id="edit-event" class="action-button">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
                <h2 class="event-title">${event.name}</h2>
                <div class="event-date-time">
                    <span><i class="far fa-calendar-alt"></i> ${formatDate(event.date)}</span>
                    <span><i class="far fa-clock"></i> ${event.time}</span>
                </div>
                <div class="event-location">
                    <i class="fas fa-map-marker-alt"></i> ${event.location}
                </div>
                <p class="event-description">${event.description}</p>
                <div class="event-actions">
                    <button id="register-for-event" class="action-button">
                        <i class="fas fa-user-plus"></i> Register
                    </button>
                    <button id="share-event" class="action-button">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                </div>
            </div>
        `;
        
        eventDetailsContainer.innerHTML = eventHtml;
        
        // Add event listeners to buttons
        document.getElementById('edit-event').addEventListener('click', () => {
            openEventModal(event);
        });
        
        document.getElementById('register-for-event').addEventListener('click', () => {
            alert(`Registered for ${event.name}`);
        });
        
        document.getElementById('share-event').addEventListener('click', () => {
            alert(`Share link for ${event.name} copied to clipboard!`);
        });
    }
    
    // Open event modal for adding/editing
    function openEventModal(event = null, date = null) {
        if (event) {
            // Editing existing event
            document.getElementById('modal-title').textContent = 'Edit Event';
            document.getElementById('event-name').value = event.name;
            document.getElementById('event-club').value = event.club;
            document.getElementById('event-date').value = event.date;
            document.getElementById('event-time').value = event.time;
            document.getElementById('event-location').value = event.location;
            document.getElementById('event-description').value = event.description;
            
            deleteEventButton.style.display = 'block';
            selectedEvent = event;
        } else {
            // Adding new event
            document.getElementById('modal-title').textContent = 'Add New Event';
            document.getElementById('event-form').reset();
            
            if (date) {
                document.getElementById('event-date').value = date;
            }
            
            deleteEventButton.style.display = 'none';
            selectedEvent = null;
        }
        
        eventModal.style.display = 'flex';
    }
    
    // Format date for display
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    // Get club name from club ID
    function getClubName(clubId) {
        const clubs = {
            'tech': 'Tech Society',
            'arts': 'Creative Arts',
            'debate': 'Debate Club',
            'music': 'Music Society',
            'sports': 'Sports Club',
            'science': 'Science Guild'
        };
        
        return clubs[clubId] || 'Club';
    }
    
    // Event form submission
    eventForm.addEventListener('submit', function(e) {
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
            // Update existing event
            Object.assign(selectedEvent, eventData);
        } else {
            // Add new event
            eventData.id = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
            events.push(eventData);
            selectedEvent = eventData;
        }
        
        renderCalendar();
        showEventDetails(selectedEvent);
        eventModal.style.display = 'none';
    });
    
    // Delete event
    deleteEventButton.addEventListener('click', function() {
        if (selectedEvent && confirm('Are you sure you want to delete this event?')) {
            events = events.filter(e => e.id !== selectedEvent.id);
            renderCalendar();
            eventDetailsContainer.innerHTML = `
                <div class="no-event-selected">
                    <i class="fas fa-calendar-alt"></i>
                    <p>Select an event from the calendar to view details</p>
                </div>
            `;
            eventModal.style.display = 'none';
        }
    });
    
    // Navigation between months
    prevMonthButton.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    nextMonthButton.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Filter events by club and date
    const clubFilter = document.getElementById('event-club-filter');
    const dateFilter = document.getElementById('event-date-filter');
    const eventCards = document.querySelectorAll('.event-card');
    
    if (clubFilter && dateFilter && eventCards.length > 0) {
        function filterEvents() {
            const clubValue = clubFilter.value;
            const dateValue = dateFilter.value;
            const today = new Date();
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
                    if (dateValue === 'this-week') {
                        dateMatch = cardDate >= currentWeekStart && cardDate <= currentWeekEnd;
                    } else if (dateValue === 'this-month') {
                        dateMatch = cardDate >= currentMonthStart && cardDate <= currentMonthEnd;
                    } else if (dateValue === 'next-month') {
                        dateMatch = cardDate >= nextMonthStart && cardDate <= nextMonthEnd;
                    }
                }
                
                if (clubMatch && dateMatch) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
        clubFilter.addEventListener('change', filterEvents);
        dateFilter.addEventListener('change', filterEvents);
    }
    
    // Initialize calendar
    renderCalendar();
    
    // Show no event selected message initially
    if (eventDetailsContainer) {
        eventDetailsContainer.innerHTML = `
            <div class="no-event-selected">
                <i class="fas fa-calendar-alt"></i>
                <p>Select an event from the calendar to view details</p>
            </div>
        `;
    }
    

    
    
    
    
    // Helper function to get club name
    function getClubName(clubId) {
        const clubs = {
            'tech': 'Tech Society',
            'arts': 'Creative Arts',
            'debate': 'Debate Club',
            'music': 'Music Society',
            'sports': 'Sports Club',
            'science': 'Science Guild'
        };
        
        return clubs[clubId] || clubId;
    }
    
    // Helper function to get event name (mock)
    function getEventName(eventId) {
        const events = {
            1: 'AI Workshop',
            2: 'Digital Art Masterclass',
            3: 'Public Speaking Workshop'
        };
        
        return events[eventId] || `Event ${eventId}`;
    }
    
    // Certificate upload functionality
    const certificateForm = document.getElementById('certificate-form');
    if (certificateForm) {
        certificateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const studentId = document.getElementById('certificate-student-id').value;
            const eventId = document.getElementById('certificate-event').value;
            const certificateFile = document.getElementById('certificate-file').files[0];
            
            if (!studentId || !eventId || !certificateFile) {
                alert('Please fill all fields and select a file');
                return;
            }
            
            // In a real app, this would upload to a server
            alert(`Certificate for student ${studentId} for event ${eventId} uploaded successfully!`);
            this.reset();
        });
    }
    
    // Event management in admin dashboard
    const eventForm = document.getElementById('admin-event-form');
    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const eventData = {
                name: document.getElementById('admin-event-name').value,
                club: document.getElementById('admin-event-club').value,
                date: document.getElementById('admin-event-date').value,
                time: document.getElementById('admin-event-time').value,
                location: document.getElementById('admin-event-location').value,
                description: document.getElementById('admin-event-description').value,
                capacity: document.getElementById('admin-event-capacity').value
            };
            
            // In a real app, this would save to a database
            alert(`Event "${eventData.name}" saved successfully!`);
            this.reset();
        });
    }
    // Animate elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.club-card, .section-title, .hero-content');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight * 0.75) {
                element.classList.add('slide-up');
            }
        });
    };
    
    // Initial check
    animateOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Floating animation for planets
    const planets = document.querySelectorAll('.planet');
    planets.forEach((planet, index) => {
        // Randomize animation duration and delay
        const duration = 6 + Math.random() * 4;
        const delay = Math.random() * 2;
        
        planet.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
    });
    
    // Twinkling stars
    const starsBackground = document.querySelector('.stars-background');
    if (starsBackground) {
        // Add more stars dynamically
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.classList.add('star', 'twinkle');
            
            // Random position
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            
            // Random size
            const size = 1 + Math.random() * 2;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            
            // Random animation delay
            star.style.animationDelay = `${Math.random() * 5}s`;
            
            starsBackground.appendChild(star);
        }
    }
    
    // Gallery scroll animation
    const galleries = document.querySelectorAll('.gallery-scroll');
    galleries.forEach(gallery => {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        gallery.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - gallery.offsetLeft;
            scrollLeft = gallery.scrollLeft;
            gallery.style.cursor = 'grabbing';
        });
        
        gallery.addEventListener('mouseleave', () => {
            isDown = false;
            gallery.style.cursor = 'grab';
        });
        
        gallery.addEventListener('mouseup', () => {
            isDown = false;
            gallery.style.cursor = 'grab';
        });
        
        gallery.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - gallery.offsetLeft;
            const walk = (x - startX) * 2;
            gallery.scrollLeft = scrollLeft - walk;
        });
    });
    
    // Gradient border animation for featured items
    const featuredItems = document.querySelectorAll('.featured-item');
    featuredItems.forEach(item => {
        item.classList.add('gradient-border');
    });
    
    // Hover animation for buttons
    const buttons = document.querySelectorAll('.action-button, .submit-button, .register-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.classList.add('pulse');
        });
        
        button.addEventListener('mouseleave', () => {
            button.classList.remove('pulse');
        });
    });
    
    // Rotating animation for loading spinner
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
        spinner.classList.add('rotate');
    }
    
    // Typewriter effect for hero subtitle
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
    
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;
            heroSection.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
        });
    }

    // ---------- Admin Navbar Link ----------
const adminLink = document.querySelector('a[href="admin-login.html"]');

if (adminLink && localStorage.getItem('adminLoggedIn') === 'true') {
    adminLink.textContent = 'Dashboard';
    adminLink.href = 'admin-dashboard.html';
}

});

