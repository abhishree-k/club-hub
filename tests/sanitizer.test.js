/**
 * Unit Tests for HTML Sanitization
 * Tests the escapeHtml() function to ensure XSS prevention
 */

const { escapeHtml } = require('../app.js');

/**
 * Test Suite for escapeHtml()
 */
describe('escapeHtml Sanitizer', () => {
    
    test('should escape script tags', () => {
        const input = '<script>alert("XSS")</script>';
        const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
        expect(escapeHtml(input)).toBe(expected);
    });

    test('should escape img tags with onerror', () => {
        const input = '<img src=x onerror="alert(\'XSS\')">';
        const expected = '&lt;img src=x onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;';
        expect(escapeHtml(input)).toBe(expected);
    });

    test('should escape anchor tags with javascript:', () => {
        const input = '<a href="javascript:alert(1)">Click</a>';
        const expected = '&lt;a href=&quot;javascript:alert(1)&quot;&gt;Click&lt;/a&gt;';
        expect(escapeHtml(input)).toBe(expected);
    });

    test('should escape ampersands', () => {
        const input = 'Ben & Jerry\'s';
        const expected = 'Ben &amp; Jerry&#039;s';
        expect(escapeHtml(input)).toBe(expected);
    });

    test('should escape all special characters together', () => {
        const input = '<div class="test" data-value=\'123\'>Content & more</div>';
        const expected = '&lt;div class=&quot;test&quot; data-value=&#039;123&#039;&gt;Content &amp; more&lt;/div&gt;';
        expect(escapeHtml(input)).toBe(expected);
    });

    test('should handle empty string', () => {
        expect(escapeHtml('')).toBe('');
    });

    test('should handle plain text without special characters', () => {
        const input = 'Hello World 123';
        expect(escapeHtml(input)).toBe(input);
    });

    test('should handle non-string input gracefully', () => {
        expect(escapeHtml(123)).toBe(123);
        expect(escapeHtml(null)).toBe(null);
        expect(escapeHtml(undefined)).toBe(undefined);
        expect(escapeHtml({})).toEqual({});
    });

    test('should escape event handlers', () => {
        const input = '<button onclick="malicious()">Click</button>';
        const expected = '&lt;button onclick=&quot;malicious()&quot;&gt;Click&lt;/button&gt;';
        expect(escapeHtml(input)).toBe(expected);
    });

    test('should escape svg with embedded scripts', () => {
        const input = '<svg onload="alert(1)">';
        const expected = '&lt;svg onload=&quot;alert(1)&quot;&gt;';
        expect(escapeHtml(input)).toBe(expected);
    });

    test('should prevent DOM clobbering attacks', () => {
        const input = '<form name="test"><input name="action"></form>';
        const expected = '&lt;form name=&quot;test&quot;&gt;&lt;input name=&quot;action&quot;&gt;&lt;/form&gt;';
        expect(escapeHtml(input)).toBe(expected);
    });

    test('should escape multiple consecutive special characters', () => {
        const input = '<<>>';
        const expected = '&lt;&lt;&gt;&gt;';
        expect(escapeHtml(input)).toBe(expected);
    });

});

/**
 * Integration Tests - Real-world XSS scenarios
 */
describe('Real-world XSS Prevention', () => {
    
    test('should prevent stored XSS in user names', () => {
        const maliciousName = '<script>document.cookie</script>John';
        const safe = escapeHtml(maliciousName);
        expect(safe).not.toContain('<script>');
        expect(safe).toContain('&lt;script&gt;');
    });

    test('should prevent reflected XSS in search queries', () => {
        const maliciousQuery = '"><script>alert(document.domain)</script>';
        const safe = escapeHtml(maliciousQuery);
        expect(safe).not.toContain('<script>');
    });

    test('should prevent XSS in event names from localStorage', () => {
        const maliciousEvent = {
            name: '<img src=x onerror=alert(1)>',
            date: '2024-01-01',
            time: '10:00'
        };
        const safeName = escapeHtml(maliciousEvent.name);
        expect(safeName).toBe('&lt;img src=x onerror=alert(1)&gt;');
    });

    test('should prevent XSS in club names', () => {
        const maliciousClub = '<iframe src="javascript:alert(1)">';
        const safe = escapeHtml(maliciousClub);
        expect(safe).not.toContain('<iframe');
        expect(safe).toContain('&lt;iframe');
    });

});
