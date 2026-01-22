const API_URL = 'http://localhost:3000/api';

const api = {
    async getEvents() {
        try {
            const response = await fetch(`${API_URL}/events`);
            if (!response.ok) throw new Error('Failed to fetch events');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    async login(email, password) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return response.json();
    },

    async register(userData) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        return response.json();
    },

    async registerEvent(eventId, token) {
        const response = await fetch(`${API_URL}/events/${eventId}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Event registration failed');
        }
        return response.json();
    }
};

window.api = api; // Expose globally
