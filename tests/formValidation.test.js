/**
 * Form Validation Tests
 * Tests for inline form validation helpers
 */

const { showFieldError, clearFieldError, showFormSuccess, clearFormErrors } = require('../app.js');

describe('Form Validation Helpers', () => {
    describe('showFieldError', () => {
        let inputField;

        beforeEach(() => {
            document.body.innerHTML = `
                <form id="test-form">
                    <div class="form-group">
                        <label for="test-input">Test Input</label>
                        <input type="text" id="test-input" />
                    </div>
                </form>
            `;
            inputField = document.getElementById('test-input');
        });

        test('should add error class to field', () => {
            showFieldError(inputField, 'This field is required');
            
            expect(inputField.classList.contains('error')).toBe(true);
        });

        test('should display error message after field', () => {
            showFieldError(inputField, 'This field is required');
            
            const errorMessage = inputField.parentNode.querySelector('.form-error');
            expect(errorMessage).not.toBeNull();
            expect(errorMessage.textContent).toBe('This field is required');
        });

        test('should add ARIA alert role to error message', () => {
            showFieldError(inputField, 'Invalid input');
            
            const errorMessage = inputField.parentNode.querySelector('.form-error');
            expect(errorMessage.getAttribute('role')).toBe('alert');
        });

        test('should remove previous error before showing new one', () => {
            showFieldError(inputField, 'First error');
            showFieldError(inputField, 'Second error');
            
            const errorMessages = inputField.parentNode.querySelectorAll('.form-error');
            expect(errorMessages.length).toBe(1);
            expect(errorMessages[0].textContent).toBe('Second error');
        });

        test('should handle null field gracefully', () => {
            expect(() => {
                showFieldError(null, 'Error message');
            }).not.toThrow();
        });
    });

    describe('clearFieldError', () => {
        let inputField;

        beforeEach(() => {
            document.body.innerHTML = `
                <form id="test-form">
                    <div class="form-group">
                        <input type="text" id="test-input" class="error" />
                        <div class="form-error">Error message</div>
                    </div>
                </form>
            `;
            inputField = document.getElementById('test-input');
        });

        test('should remove error class from field', () => {
            clearFieldError(inputField);
            
            expect(inputField.classList.contains('error')).toBe(false);
        });

        test('should remove error message element', () => {
            clearFieldError(inputField);
            
            const errorMessage = inputField.parentNode.querySelector('.form-error');
            expect(errorMessage).toBeNull();
        });

        test('should handle field without error gracefully', () => {
            const cleanField = document.createElement('input');
            document.body.appendChild(cleanField);
            
            expect(() => {
                clearFieldError(cleanField);
            }).not.toThrow();
        });

        test('should handle null field gracefully', () => {
            expect(() => {
                clearFieldError(null);
            }).not.toThrow();
        });
    });

    describe('showFormSuccess', () => {
        let form;

        beforeEach(() => {
            document.body.innerHTML = `
                <form id="test-form">
                    <input type="text" />
                    <button type="submit">Submit</button>
                </form>
            `;
            form = document.getElementById('test-form');
        });

        test('should add success message to form', () => {
            showFormSuccess(form, 'Form submitted successfully!');
            
            const successMessage = form.querySelector('.form-success');
            expect(successMessage).not.toBeNull();
            expect(successMessage.textContent).toBe('Form submitted successfully!');
        });

        test('should add ARIA status role to success message', () => {
            showFormSuccess(form, 'Success!');
            
            const successMessage = form.querySelector('.form-success');
            expect(successMessage.getAttribute('role')).toBe('status');
        });

        test('should insert success message at top of form', () => {
            showFormSuccess(form, 'Success!');
            
            const successMessage = form.querySelector('.form-success');
            expect(form.firstChild).toBe(successMessage);
        });

        test('should remove previous success message', () => {
            showFormSuccess(form, 'First success');
            showFormSuccess(form, 'Second success');
            
            const successMessages = form.querySelectorAll('.form-success');
            expect(successMessages.length).toBe(1);
            expect(successMessages[0].textContent).toBe('Second success');
        });

        test('should handle null form gracefully', () => {
            expect(() => {
                showFormSuccess(null, 'Success!');
            }).not.toThrow();
        });
    });

    describe('clearFormErrors', () => {
        let form;

        beforeEach(() => {
            document.body.innerHTML = `
                <form id="test-form">
                    <input type="text" class="error" />
                    <div class="form-error">Error 1</div>
                    <input type="email" class="error" />
                    <div class="form-error">Error 2</div>
                    <div class="form-success">Success message</div>
                </form>
            `;
            form = document.getElementById('test-form');
        });

        test('should remove all error classes', () => {
            clearFormErrors(form);
            
            const errorFields = form.querySelectorAll('.error');
            expect(errorFields.length).toBe(0);
        });

        test('should remove all error messages', () => {
            clearFormErrors(form);
            
            const errorMessages = form.querySelectorAll('.form-error');
            expect(errorMessages.length).toBe(0);
        });

        test('should remove success messages', () => {
            clearFormErrors(form);
            
            const successMessages = form.querySelectorAll('.form-success');
            expect(successMessages.length).toBe(0);
        });

        test('should handle null form gracefully', () => {
            expect(() => {
                clearFormErrors(null);
            }).not.toThrow();
        });
    });

    describe('Form Validation Integration', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <form id="login-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" required />
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required />
                    </div>
                    <button type="submit">Login</button>
                </form>
            `;
        });

        test('should validate required fields and show errors', () => {
            const usernameField = document.getElementById('username');
            const passwordField = document.getElementById('password');
            
            // Simulate validation
            if (!usernameField.value) {
                showFieldError(usernameField, 'Username is required');
            }
            if (!passwordField.value) {
                showFieldError(passwordField, 'Password is required');
            }
            
            expect(usernameField.classList.contains('error')).toBe(true);
            expect(passwordField.classList.contains('error')).toBe(true);
            
            const errorMessages = document.querySelectorAll('.form-error');
            expect(errorMessages.length).toBe(2);
        });

        test('should clear errors when user corrects input', () => {
            const usernameField = document.getElementById('username');
            
            // Show error
            showFieldError(usernameField, 'Username is required');
            expect(usernameField.classList.contains('error')).toBe(true);
            
            // User types
            usernameField.value = 'john_doe';
            
            // Clear error
            clearFieldError(usernameField);
            expect(usernameField.classList.contains('error')).toBe(false);
            expect(document.querySelector('.form-error')).toBeNull();
        });
    });
});
