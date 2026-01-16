/**
 * Form Validation Utility
 * Provides reusable validation functions and inline error message display
 */

/**
 * Validation Rules
 */
const ValidationRules = {
    required: (value) => {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return value !== null && value !== undefined && value !== '';
    },
    
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },
    
    minLength: (min) => (value) => {
        return value && value.length >= min;
    },
    
    maxLength: (max) => (value) => {
        return value && value.length <= max;
    },
    
    pattern: (regex) => (value) => {
        return regex.test(value);
    },
    
    studentId: (value) => {
        // Student ID format: alphanumeric, typically starts with letter
        const studentIdRegex = /^[A-Za-z][A-Za-z0-9]{4,}$/;
        return studentIdRegex.test(value);
    },
    
    name: (value) => {
        // Name should only contain letters, spaces, hyphens, and apostrophes
        const nameRegex = /^[A-Za-z\s'-]+$/;
        return nameRegex.test(value);
    },
    
    phone: (value) => {
        // Phone number validation (flexible format)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    }
};

/**
 * Error Messages
 */
const ErrorMessages = {
    required: (fieldName) => `${fieldName} is required`,
    email: 'Please enter a valid email address',
    minLength: (min) => `Must be at least ${min} characters long`,
    maxLength: (max) => `Must be no more than ${max} characters long`,
    studentId: 'Please enter a valid student ID (e.g., S12345)',
    name: 'Please enter a valid name (letters only)',
    phone: 'Please enter a valid phone number',
    pattern: 'Please enter a valid value',
    default: 'Please enter a valid value'
};

/**
 * Create error message element
 */
function createErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');
    errorElement.textContent = message;
    return errorElement;
}

/**
 * Create success message element
 */
function createSuccessMessage(message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.setAttribute('role', 'status');
    successElement.setAttribute('aria-live', 'polite');
    successElement.innerHTML = '<i class="fas fa-check-circle"></i> ' + message;
    return successElement;
}

/**
 * Show error for a field
 */
function showFieldError(field, message) {
    // Remove existing error
    clearFieldError(field);
    
    // Add error class to field
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    // Create and insert error message
    const errorElement = createErrorMessage(message);
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.appendChild(errorElement);
    }
}

/**
 * Clear error for a field
 */
function clearFieldError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

/**
 * Show success state for a field
 */
function showFieldSuccess(field) {
    clearFieldError(field);
    field.classList.add('success');
}

/**
 * Clear success state for a field
 */
function clearFieldSuccess(field) {
    field.classList.remove('success');
}

/**
 * Validate a single field
 */
function validateField(field, rules = []) {
    const value = field.value;
    const fieldName = field.getAttribute('name') || field.getAttribute('id') || 'This field';
    const formGroup = field.closest('.form-group');
    const labelElement = formGroup ? formGroup.querySelector('label') : null;
    const label = labelElement ? labelElement.textContent : fieldName;
    
    // Clear previous states
    clearFieldError(field);
    clearFieldSuccess(field);
    
    // If field is empty and not required, it's valid
    if (!value && !rules.includes('required')) {
        return true;
    }
    
    // Check each rule
    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        let isValid = true;
        let errorMessage = ErrorMessages.default;
        
        if (rule === 'required') {
            isValid = ValidationRules.required(value);
            errorMessage = ErrorMessages.required(label);
        } else if (rule === 'email') {
            isValid = ValidationRules.email(value);
            errorMessage = ErrorMessages.email;
        } else if (rule === 'name') {
            isValid = ValidationRules.name(value);
            errorMessage = ErrorMessages.name;
        } else if (rule === 'studentId') {
            isValid = ValidationRules.studentId(value);
            errorMessage = ErrorMessages.studentId;
        } else if (typeof rule === 'object' && rule.type) {
            // Custom rule object: { type: 'minLength', value: 3 }
            if (rule.type === 'minLength') {
                isValid = ValidationRules.minLength(rule.value)(value);
                errorMessage = ErrorMessages.minLength(rule.value);
            } else if (rule.type === 'maxLength') {
                isValid = ValidationRules.maxLength(rule.value)(value);
                errorMessage = ErrorMessages.maxLength(rule.value);
            } else if (rule.type === 'pattern') {
                isValid = ValidationRules.pattern(rule.value)(value);
                errorMessage = ErrorMessages.pattern;
            }
        }
        
        if (!isValid) {
            showFieldError(field, errorMessage);
            return false;
        }
    }
    
    // If all validations pass, show success
    if (value) {
        showFieldSuccess(field);
    }
    
    return true;
}

/**
 * Validate entire form
 */
function validateForm(form, fieldRules = {}) {
    let isValid = true;
    const fields = form.querySelectorAll('input, select, textarea');
    
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        
        // Skip hidden fields and buttons
        if (field.type === 'hidden' || field.type === 'submit' || field.type === 'button') {
            continue;
        }
        
        // Get rules for this field
        const fieldId = field.id;
        const fieldName = field.name;
        const rules = fieldRules[fieldId] || fieldRules[fieldName] || [];
        
        // Add required rule if field has required attribute
        if (field.hasAttribute('required') && !rules.includes('required')) {
            rules.push('required');
        }
        
        // Validate field
        if (!validateField(field, rules)) {
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Show form-level success message
 */
function showFormSuccess(form, message) {
    // Remove existing success message
    const existingSuccess = form.querySelector('.form-success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    // Create and show success message
    const successElement = createSuccessMessage(message);
    successElement.className = 'form-success-message';
    form.insertBefore(successElement, form.firstChild);
    
    // Scroll to success message
    successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (successElement.parentNode) {
            successElement.remove();
        }
    }, 5000);
}

/**
 * Show form-level error message
 */
function showFormError(form, message) {
    // Remove existing error message
    const existingError = form.querySelector('.form-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create and show error message
    const errorElement = createErrorMessage(message);
    errorElement.className = 'form-error-message';
    form.insertBefore(errorElement, form.firstChild);
    
    // Scroll to error message
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Initialize real-time validation for a form
 */
function initRealTimeValidation(form, fieldRules = {}) {
    const fields = form.querySelectorAll('input, select, textarea');
    
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        
        // Skip hidden fields and buttons
        if (field.type === 'hidden' || field.type === 'submit' || field.type === 'button') {
            continue;
        }
        
        // Validate on blur (when user leaves field)
        field.addEventListener('blur', function() {
            const fieldId = this.id;
            const fieldName = this.name;
            const rules = fieldRules[fieldId] || fieldRules[fieldName] || [];
            
            // Add required rule if field has required attribute
            if (this.hasAttribute('required') && !rules.includes('required')) {
                rules.push('required');
            }
            
            validateField(this, rules);
        });
        
        // Clear error on input (for better UX)
        field.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                // Re-validate on input
                const fieldId = this.id;
                const fieldName = this.name;
                const rules = fieldRules[fieldId] || fieldRules[fieldName] || [];
                
                if (this.hasAttribute('required') && !rules.includes('required')) {
                    rules.push('required');
                }
                
                validateField(this, rules);
            }
        });
    }
}

/**
 * Clear all form errors
 */
function clearFormErrors(form) {
    const fields = form.querySelectorAll('input, select, textarea');
    
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        clearFieldError(field);
        clearFieldSuccess(field);
    }
    
    const formError = form.querySelector('.form-error-message');
    if (formError) {
        formError.remove();
    }
    
    const formSuccess = form.querySelector('.form-success-message');
    if (formSuccess) {
        formSuccess.remove();
    }
}
