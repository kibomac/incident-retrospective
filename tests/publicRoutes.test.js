import request from 'supertest';
import http from 'http';
import app from '../app.js';
import db from '../db.js';
import bcrypt from 'bcrypt';
import { getUserByUsername } from '../src/controllers.js';

jest.mock('../src/middleware/auth.js', () => ({
  ensureAuthenticated: (req, res, next) => next(),
}));

jest.mock('../db.js', () => ({
  query: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

db.query.mockResolvedValueOnce([
  [[{ id: 1, username: 'admin', password: 'hashedpassword', role: 'admin_user' }]],
]);

db.query.mockResolvedValueOnce([[]]);

bcrypt.compare.mockResolvedValue(true);
bcrypt.compare.mockResolvedValue(false);

describe('Action Items API', () => {
  let server;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Public Routes', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(server).get('/non-existent-route');
      expect(response.status).toBe(404);
      expect(response.text).toContain('404 Not Found');
    });

    it('should return 403 for forbidden routes', async () => {
      const response = await request(server).get('/forbidden');
      expect(response.status).toBe(403);
      expect(response.text).toContain('403 Forbidden');
    });

    it('should return 401 for unauthorized access', async () => {
      const response = await request(server).get('/unauthorized');
      expect(response.status).toBe(401);
      expect(response.text).toContain('401 Unauthorized');
    });

    it('should return 400 for bad requests', async () => {
      const response = await request(server).get('/bad-request');
      expect(response.status).toBe(400);
      expect(response.text).toContain('400 Bad Request');
    });

    it('should return 405 for method not allowed', async () => {
      const response = await request(server).post('/method-not-allowed');
      expect(response.status).toBe(405);
      expect(response.text).toContain('405 Method Not Allowed');
    });

    it('should return 500 for server errors', async () => {
      db.query.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(server).get('/error');
      expect(response.status).toBe(500);
      expect(response.text).toContain('500 Internal Server Error');
    });

    it('should return 200 for valid routes', async () => {
      const response = await request(server).get('/valid-route');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Valid Route');
    });

    it('should render the home page', async () => {
      const response = await request(server).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Home');
    });

    it('should render the login page', async () => {
      const response = await request(server).get('/login');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Login');
    });

    it('should render the registration page', async () => {
      const response = await request(server).get('/register');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Register');
    });
  });
});

