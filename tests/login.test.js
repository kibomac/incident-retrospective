import request from 'supertest';
import app from '../app.js';

import { getUserByUsername } from '../src/controllers.js';
import bcrypt from 'bcrypt';

// Mock the dependencies
jest.mock('../src/controllers.js', () => ({
    getUserByUsername: jest.fn(),
}));

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));

describe('POST /login', () => {
    beforeEach(() => {
        jest.clearAllMocks(); 
      });

    it('should log in a user with valid credentials and redirect to /dashboard', async () => {
        // Mock the database query to return a user
        getUserByUsername.mockResolvedValue({
            id: 1,
            username: 'admin',
            password: 'hashedpassword',
            role: 'admin_user',
        });
  
        // Mock bcrypt to simulate successful password comparison
        bcrypt.compare.mockResolvedValue(true);
  
        // Send a POST request to the /login route
        const response = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'hashedpassword' });
  
        // Assertions
        expect(response.status).toBe(302); // Redirect status
        expect(response.headers.location).toBe('/dashboard'); // Redirect to /dashboard
    });
  
    it('should return an error if the user does not exist', async () => {
        // Mock the database query to return no user
        getUserByUsername.mockResolvedValue(null);
  
        // Send a POST request to the /login route
        const response = await request(app)
            .post('/login')
            .send({ username: 'nonexistent', password: 'password' });
  
        // Assertions
        expect(response.status).toBe(200); // Render login page
        expect(response.text).toContain('Invalid username or password');
    });
  
    it('should return an error if the password is incorrect', async () => {
        // Mock the database query to return a user
        getUserByUsername.mockResolvedValue({
            id: 1,
            username: 'admin',
            password: 'hashedpassword',
            role: 'admin_user',
        });
  
        // Mock bcrypt to simulate failed password comparison
        bcrypt.compare.mockResolvedValue(false);
  
        // Send a POST request to the /login route
        const response = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'wrongpassword' });
  
        // Assertions
        expect(response.status).toBe(200); // Render login page
        expect(response.text).toContain('Invalid username or password');
    });
  
    it('should handle server errors gracefully', async () => {
        // Mock the database query to throw an error
        getUserByUsername.mockRejectedValue(new Error('Database error'));
  
        // Send a POST request to the /login route
        const response = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'hashedpassword' });
  
        // Assertions
        expect(response.status).toBe(500); // Internal server error
    });
  });