const request = require('supertest');
const app = require('../src/app');
const EventModel = require('../src/models/event.model');
const UserModel = require('../src/models/user.model');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/event.model');
jest.mock('../src/models/user.model');

describe('Event Routes API', () => {
  const userId = '507f1f77bcf86cd799439011';
  const eventId = '507f1f77bcf86cd799439012';
  const JWT_SECRET = 'test-secret-key-12345'; // Use hardcoded value that matches .env.test
  let token;
  const mockUser = {
    _id: userId,
    email: 'user@example.com',
    role: 'organizer',
    name: 'Test User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure JWT_SECRET is set for verification
    process.env.JWT_SECRET = JWT_SECRET;
    token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
    
    // Set up auth middleware mock GLOBALLY for all tests
    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
  });

  // ===== GET ALL EVENTS =====
  it('GET /api/events - should return all events', async () => {
    const mockEvents = [
      { _id: eventId, title: 'Conference', date: '2025-06-15', time: '10:00' },
      { _id: '507f1f77bcf86cd799439013', title: 'Workshop', date: '2025-07-20', time: '14:00' }
    ];

    EventModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockEvents)
    });

    const res = await request(app).get('/api/events');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/events - should return empty array', async () => {
    EventModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([])
    });

    const res = await request(app).get('/api/events');
    
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  // ===== GET EVENT BY ID =====
  it('GET /api/events/:id - should return event details', async () => {
    const mockEvent = {
      _id: eventId,
      title: 'Tech Conference',
      date: '2025-06-15',
      time: '10:00',
      organizer: userId
    };

    EventModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockEvent)
    });

    const res = await request(app).get(`/api/events/${eventId}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(eventId);
  });

  it('GET /api/events/:id - should return 404 for nonexistent event', async () => {
    EventModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null)
    });

    const res = await request(app).get(`/api/events/${eventId}`);
    
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // ===== CREATE EVENT =====
  it('POST /api/events - should create event with valid data', async () => {
    const eventData = {
      title: 'New Conference',
      date: '2025-08-10',
      time: '09:00',
      description: 'Amazing event'
    };

    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    EventModel.create.mockResolvedValue({
      _id: eventId,
      ...eventData,
      organizer: userId
    });

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(eventData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/events - should require authentication', async () => {
    const eventData = {
      title: 'New Conference',
      date: '2025-08-10',
      time: '09:00'
    };

    const res = await request(app).post('/api/events').send(eventData);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/events - should reject incomplete data', async () => {
    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Incomplete' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ===== UPDATE EVENT =====
  it('PUT /api/events/:id - should update event', async () => {
    const mockEvent = {
      _id: eventId,
      title: 'Old Title',
      organizer: userId,
      toString: () => userId
    };

    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    EventModel.findById.mockResolvedValue(mockEvent);
    EventModel.findByIdAndUpdate.mockResolvedValue({
      ...mockEvent,
      title: 'Updated Title'
    });

    const res = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/events/:id - should return 404 for nonexistent event', async () => {
    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    EventModel.findById.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });

  // ===== DELETE EVENT =====
  it('DELETE /api/events/:id - should delete event', async () => {
    const mockEvent = {
      _id: eventId,
      organizer: userId,
      deleteOne: jest.fn().mockResolvedValue(true),
      toString: () => userId
    };

    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    EventModel.findById.mockResolvedValue(mockEvent);

    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/events/:id - should return 404 for nonexistent event', async () => {
    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    EventModel.findById.mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // ===== REGISTER FOR EVENT =====
  it('POST /api/events/:id/register - should register user', async () => {
    const mockEvent = {
      _id: eventId,
      title: 'Conference',
      participants: []
    };

    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    EventModel.findByIdAndUpdate.mockResolvedValue(mockEvent);

    const res = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/events/:id/register - should return 404 for nonexistent event', async () => {
    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    EventModel.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // ===== GET PARTICIPANTS =====
  it('GET /api/events/:id/participants - should return participants', async () => {
    const mockEvent = {
      _id: eventId,
      participants: [userId]
    };

    const mockParticipants = [
      { _id: userId, name: 'User Name', email: 'user@example.com' }
    ];

    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    EventModel.findById.mockResolvedValue(mockEvent);
    UserModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockParticipants)
    });

    const res = await request(app)
      .get(`/api/events/${eventId}/participants`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/events/:id/participants - should return 404 for nonexistent event', async () => {
    UserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    EventModel.findById.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/events/${eventId}/participants`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
