/**
 * Navigation Tests
 * Tests for mobile menu toggle and smooth scrolling functionality
 */

const { initNavigation } = require('../app.js');

describe('Navigation', () => {
    describe('Mobile Menu Toggle', () => {
        beforeEach(() => {
            // Set up DOM structure for navigation
            document.body.innerHTML = `
                <nav class="cosmic-nav">
                    <ul class="nav-links">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#events">Events</a></li>
                    </ul>
                    <div class="mobile-menu-toggle nav-hamburger">
                        <div class="line"></div>
                        <div class="line"></div>
                        <div class="line"></div>
                    </div>
                </nav>
            `;
        });

        test('should toggle nav-links active class when hamburger is clicked', () => {
            initNavigation();

            const hamburger = document.querySelector('.nav-hamburger');
            const navLinks = document.querySelector('.nav-links');

            // Initially should not have active class
            expect(navLinks.classList.contains('active')).toBe(false);

            // Click hamburger
            hamburger.click();

            // Should now have active class
            expect(navLinks.classList.contains('active')).toBe(true);

            // Click again
            hamburger.click();

            // Should remove active class
            expect(navLinks.classList.contains('active')).toBe(false);
        });

        test('should toggle hamburger active class when clicked', () => {
            initNavigation();

            const hamburger = document.querySelector('.nav-hamburger');

            expect(hamburger.classList.contains('active')).toBe(false);

            hamburger.click();
            expect(hamburger.classList.contains('active')).toBe(true);

            hamburger.click();
            expect(hamburger.classList.contains('active')).toBe(false);
        });

        test('should handle missing elements gracefully', () => {
            document.body.innerHTML = '<div></div>'; // No navigation elements

            // Should not throw error
            expect(() => {
                initNavigation();
            }).not.toThrow();
        });
    });

    describe('Smooth Scrolling', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <nav class="cosmic-nav">
                    <ul class="nav-links">
                        <li><a href="#section1">Section 1</a></li>
                        <li><a href="#section2">Section 2</a></li>
                        <li><a href="#">Empty Link</a></li>
                    </ul>
                    <div class="mobile-menu-toggle nav-hamburger">
                        <div class="line"></div>
                    </div>
                </nav>
                <section id="section1" style="position: absolute; top: 500px;">
                    <h2>Section 1</h2>
                </section>
                <section id="section2" style="position: absolute; top: 1000px;">
                    <h2>Section 2</h2>
                </section>
            `;
        });

        test('should call scrollTo when clicking anchor link', () => {
            initNavigation();

            const link = document.querySelector('a[href="#section1"]');
            link.click();

            expect(window.scrollTo).toHaveBeenCalled();
        });

        test('should not scroll when clicking empty hash', () => {
            initNavigation();

            const emptyLink = document.querySelector('a[href="#"]');
            emptyLink.click();

            expect(window.scrollTo).not.toHaveBeenCalled();
        });

        test('should close mobile menu after navigation', () => {
            initNavigation();

            const hamburger = document.querySelector('.nav-hamburger');
            const navLinks = document.querySelector('.nav-links');
            const link = document.querySelector('a[href="#section1"]');

            // Open mobile menu
            hamburger.click();
            expect(navLinks.classList.contains('active')).toBe(true);

            // Click navigation link
            link.click();

            // Mobile menu should be closed
            expect(navLinks.classList.contains('active')).toBe(false);
            expect(hamburger.classList.contains('active')).toBe(false);
        });
    });
});