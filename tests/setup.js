/**
 * Jest Test Setup
 * Configures jsdom and global test utilities
 */

// Extend expect with DOM matchers
require('@testing-library/jest-dom');

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.scrollTo
global.scrollTo = jest.fn();

// Setup DOM before each test
beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
    
    // Clear document body
    document.body.innerHTML = '';
});

// Clean up after each test
afterEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
});