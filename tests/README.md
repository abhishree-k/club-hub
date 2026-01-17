# Sanitizer Tests

This directory contains unit tests for the HTML sanitization functionality.

## Test File

- `sanitizer.test.js` - Unit tests for the `escapeHtml()` function

## Running Tests

### Browser Console Testing

1. Open your browser's developer console
2. Copy and paste the content of `sanitizer.test.js`
3. The tests will run automatically and display results

### Jest Testing (Future Enhancement)

To run these tests with Jest:

```bash
npm install --save-dev jest
npm test
```

## Test Coverage

The test suite covers:

- ✅ Script tag escaping
- ✅ Image tag with onerror attribute
- ✅ Anchor tags with javascript: protocol
- ✅ Special characters (&, <, >, ", ')
- ✅ Event handlers (onclick, onload, etc.)
- ✅ SVG with embedded scripts
- ✅ DOM clobbering prevention
- ✅ Edge cases (empty strings, non-string inputs)
- ✅ Real-world XSS scenarios

## Security Best Practices

The `escapeHtml()` function prevents XSS by:

1. Converting `<` and `>` to HTML entities (prevents tag injection)
2. Converting `"` and `'` to HTML entities (prevents attribute injection)
3. Converting `&` to HTML entities (prevents entity manipulation)

## Example Usage

```javascript
// Unsafe - vulnerable to XSS
element.innerHTML = userInput;

// Safe - prevents XSS
element.innerHTML = escapeHtml(userInput);

// Even safer - use textContent when possible
element.textContent = userInput;
```
