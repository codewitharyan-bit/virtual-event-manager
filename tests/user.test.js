const request = require('supertest');
const app = require('../src/app');
const UserModel = require('../src/models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock models and libraries
jest.mock('../src/models/user.model');
jest.mock('bcryptjs');

describe('User Routes API', () => {
  const userId = '507f1f77bcf86cd799439011';
  const JWT_SECRET = 'test-secret-key-12345'; // Match .env.test value
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    bcrypt.hash.mockResolvedValue('hashed_password');
    bcrypt.compare.mockResolvedValue(true);
    
    // Ensure JWT_SECRET is set
    process.env.JWT_SECRET = JWT_SECRET;
    token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
    
    // Set up auth middleware mock for tests that need authentication
    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: userId,
        email: 'test@example.com',
        role: 'attendee',
        save: jest.fn().mockResolvedValue(true)
      })
    });
  });


  // ===== REGISTER TESTS =====
  it('POST /api/users/register - should register user with all fields', async () => {
    const userData = {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'SecurePass123!',
      phone: '9876543210'
    };

    UserModel.findOne.mockResolvedValue(null);
    UserModel.create.mockResolvedValue({ _id: userId, ...userData });

    const res = await request(app).post('/api/users/register').send(userData);
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(userId);
  });

  it('POST /api/users/register - should reject duplicate email', async () => {
    const userData = {
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'Pass123!',
      phone: '5551234567'
    };

    UserModel.findOne.mockResolvedValue({ email: 'bob@example.com' });

    const res = await request(app).post('/api/users/register').send(userData);
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/users/register - should reject missing fields', async () => {
    const res = await request(app).post('/api/users/register').send({
      name: 'Charlie'
    });
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ===== LOGIN TESTS =====
  it('POST /api/users/login - should login with correct credentials', async () => {
    const mockUser = {
      _id: userId,
      email: 'test@example.com',
      password: 'hashed_password',
      role: 'attendee',
      generateAccessToken: jest.fn().mockReturnValue('token123'),
      generateRefreshToken: jest.fn().mockReturnValue('refresh123'),
      save: jest.fn().mockResolvedValue(true)
    };

    UserModel.findOne.mockResolvedValue(mockUser);
    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const res = await request(app).post('/api/users/login').send({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/users/login - should reject nonexistent user', async () => {
    UserModel.findOne.mockResolvedValue(null);

    const res = await request(app).post('/api/users/login').send({
      email: 'noone@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/users/login - should reject wrong password', async () => {
    UserModel.findOne.mockResolvedValue({
      _id: userId,
      email: 'test@example.com',
      password: 'hashed_password'
    });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app).post('/api/users/login').send({
      email: 'test@example.com',
      password: 'wrongpass'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // ===== LOGOUT TESTS =====
  it('POST /api/users/logout - should require token', async () => {
    const res = await request(app).post('/api/users/logout');
    
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // ===== CHANGE PASSWORD TESTS =====
  it('POST /api/users/change-password - should require token', async () => {
    const res = await request(app).post('/api/users/change-password').send({
      oldPassword: 'old',
      newPassword: 'new'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/users/change-password - should reject wrong old password', async () => {
    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: userId,
        password: 'hashed_password',
        save: jest.fn()
      })
    });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        oldPassword: 'wrong',
        newPassword: 'NewPass123!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
