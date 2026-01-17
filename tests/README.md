# Unit Tests

This directory contains unit tests for the Club Hub application using Jest and jsdom.

## Test Files

- `setup.js` - Test environment configuration and global mocks
- `navigation.test.js` - Tests for mobile menu toggle and smooth scrolling
- `formValidation.test.js` - Tests for inline form validation helpers
- `sanitizer.test.js` - Tests for HTML sanitization (XSS prevention)

## Setup

### Install Dependencies

```bash
npm install
```

This will install:
- `jest` - JavaScript testing framework
- `jest-environment-jsdom` - DOM simulation for testing
- `@testing-library/jest-dom` - Custom DOM matchers

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npx jest navigation.test.js
```

## Test Coverage

The test suite covers:

### Navigation (`navigation.test.js`)
- ✅ Mobile menu toggle functionality
- ✅ Hamburger icon animation
- ✅ Smooth scrolling to sections
- ✅ Auto-close menu after navigation
- ✅ Graceful handling of missing elements

### Form Validation (`formValidation.test.js`)
- ✅ showFieldError() function
  - Error class application
  - Error message display
  - ARIA alert roles
  - Multiple error handling
- ✅ clearFieldError() function
  - Error class removal
  - Error message cleanup
- ✅ showFormSuccess() function
  - Success message display
  - ARIA status roles
  - Auto-dismiss behavior
- ✅ clearFormErrors() function
  - Clear all form errors
  - Clear success messages
- ✅ Integration scenarios

### HTML Sanitization (`sanitizer.test.js`)
- ✅ Script tag injection prevention
- ✅ Event handler injection (onerror, onclick, onload)
- ✅ JavaScript protocol exploitation
- ✅ SVG with embedded scripts
- ✅ DOM clobbering attacks
- ✅ Special character escaping (&, <, >, ", ')
- ✅ Edge cases (empty strings, non-strings)
- ✅ Real-world XSS scenarios

## Test Results

All tests are designed to:
- Pass in CI/CD pipelines
- Run in isolated environments
- Mock browser APIs (localStorage, scrollTo)
- Use jsdom for DOM manipulation

## CI/CD Integration

Tests are configured to run in continuous integration environments. The Jest configuration in `package.json` includes:

```json
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
  "collectCoverageFrom": ["app.js"]
}
```

## Writing New Tests

When adding new tests:

1. Create a new file: `tests/yourFeature.test.js`
2. Import functions from app.js:
   ```javascript
   const { yourFunction } = require('../app.js');
   ```
3. Use describe blocks for grouping:
   ```javascript
   describe('Feature Name', () => {
       test('should do something', () => {
           // Test code
       });
   });
   ```
4. Set up DOM in beforeEach:
   ```javascript
   beforeEach(() => {
       document.body.innerHTML = `<div>...</div>`;
   });
   ```

## Best Practices

- ✅ Clear test names describing what they test
- ✅ One assertion per test when possible
- ✅ Clean up after each test (handled by setup.js)
- ✅ Test edge cases and error conditions
- ✅ Use meaningful variable names
- ✅ Keep tests focused and simple

## Troubleshooting

### Tests not found
- Ensure test files end with `.test.js`
- Check jest configuration in package.json

### Module not found
- Run `npm install` to install dependencies
- Check import paths are correct

### DOM manipulation fails
- Ensure setup.js is loaded
- Check document.body is populated in beforeEach
