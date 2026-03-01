/**
 * Integration Tests for Event Routes
 * Tests /events/:id/register endpoint for param validation and registration
 */

const request = require('supertest');
const app = require('../app'); // your Express app

/**
 * Test Suite for /events/:id/register
 */
describe('Event Routes - /events/:id/register', () => {

    test('should fail with 400 if id param is missing', async () => {
        const res = await request(app)
            .post('/events//register') // missing ID
            .send({
                firstName: 'Wang',
                lastName: 'Lin',
                email: 'wang.lin@example.com',
                studentId: '10001'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Missing required route parameter/);
    });

    test('should fail with 400 if id param is not a number', async () => {
        const res = await request(app)
            .post('/events/abc/register')
            .send({
                firstName: 'Tang',
                lastName: 'San',
                email: 'tang.san@example.com',
                studentId: '10002'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/must be a number/);
    });

    test('should succeed with 201 when valid id and required fields are provided', async () => {
        const res = await request(app)
            .post('/events/1/register')
            .send({
                firstName: 'Lu',
                lastName: 'Fengxian',
                email: 'lu.fengxian@example.com',
                studentId: '10003'
            });
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Registered successfully');
        expect(res.body.registration.EventId).toBe(1);
    });

});