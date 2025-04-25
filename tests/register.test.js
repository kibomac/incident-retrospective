import request from 'supertest';
import app from '../app.js'; // Import your Express app
import { createUser } from '../src/controllers.js';
import bcrypt from 'bcrypt';

// Mock the dependencies
jest.mock('../src/controllers.js', () => ({
    createUser: jest.fn(),
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));

describe('POST /register', () => {
    it('should register a new user with valid data and redirect to /login', async () => {
        // Mock bcrypt to simulate password hashing
        bcrypt.hash.mockResolvedValue('hashedpassword');

        // Mock the createUser function to simulate successful user creation
        createUser.mockResolvedValue();

        // Send a POST request to the /register route
        const response = await request(app)
            .post('/register')
            .send({
                username: 'newuser',
                password: 'password123',
                role: 'admin_user',
            });

        // Assertions
        expect(response.status).toBe(302); // Redirect status
        expect(response.headers.location).toBe('/login'); // Redirect to /login
    });

    it('should return 400 if required fields are missing', async () => {
        // Send a POST request with missing fields
        const response = await request(app)
            .post('/register')
            .send({
                username: '',
                password: '',
                role: '',
            });

        // Assertions
        expect(response.status).toBe(400);
        expect(response.text).toBe('All fields are required.');
    });

    it('should return 400 if the role is invalid', async () => {
        // Send a POST request with an invalid role
        const response = await request(app)
            .post('/register')
            .send({
                username: 'newuser',
                password: 'password123',
                role: 'invalid_role',
            });

        // Assertions
        expect(response.status).toBe(400);
        expect(response.text).toBe('Invalid role.');
    });

    it('should return 400 if the username already exists', async () => {
        // Mock the createUser function to throw a duplicate entry error
        createUser.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

        // Send a POST request with a duplicate username
        const response = await request(app)
            .post('/register')
            .send({
                username: 'existinguser',
                password: 'password123',
                role: 'admin_user',
            });

        // Assertions
        expect(response.status).toBe(400);
        expect(response.text).toBe('Username already exists.');
    });

    it('should handle server errors gracefully', async () => {
        // Mock the createUser function to throw a generic error
        createUser.mockRejectedValue(new Error('Database error'));

        // Send a POST request to the /register route
        const response = await request(app)
            .post('/register')
            .send({
                username: 'newuser',
                password: 'password123',
                role: 'admin_user',
            });

        // Assertions
        expect(response.status).toBe(500); // Internal server error
    });
});