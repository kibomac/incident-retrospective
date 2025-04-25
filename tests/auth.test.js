import { ensureAuthenticated } from '../src/middleware/auth.js';

describe('ensureAuthenticated', () => {
  it('should call next() if the user is authenticated', () => {
    const req = { session: { user: { id: 1, username: 'testuser' } } };
    const res = {};
    const next = jest.fn();

    ensureAuthenticated(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should redirect to "/" if the user is not authenticated', () => {
    const req = { session: {} };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    ensureAuthenticated(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith('/');
    expect(next).not.toHaveBeenCalled();
  });
});