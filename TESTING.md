# Testing Guide

This document provides comprehensive information about testing the Event Management Platform API.

## Test Structure

Tests are organized in the `tests/` directory:

```
tests/
├── setup.js           # Test setup and environment configuration
├── user.test.js       # User authentication and profile tests
└── event.test.js      # Event management tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test user.test.js
npm test event.test.js
```

### Run tests with coverage report
```bash
npm test -- --coverage
```

### Run tests verbosely
```bash
npm test -- --verbose
```

## Test Configuration

The project uses **Jest** as the testing framework and **Supertest** for HTTP assertion.

- **Test Timeout**: 15 seconds per test
- **Test Environment**: Node.js
- **Coverage Threshold**: 50% for all metrics

Configuration is in `jest.config.js`

## Test Files Overview

### User Tests (`user.test.js`)

Tests for user-related endpoints:

#### Registration Tests
- ✅ Register a new user successfully
- ✅ Return error if user already exists
- ✅ Return error if required fields are missing

#### Login Tests
- ✅ Login user successfully with correct credentials
- ✅ Return error if user not found
- ✅ Return error if password is incorrect

#### Logout Tests
- ✅ Logout user successfully with valid token
- ✅ Return 401 if no token provided

#### Change Password Tests
- ✅ Change password successfully
- ✅ Return error if old password is incorrect

**Total User Tests**: 10

### Event Tests (`event.test.js`)

Tests for event-related endpoints:

#### Get All Events Tests
- ✅ Get all events
- ✅ Return empty array when no events exist

#### Get Event by ID Tests
- ✅ Get event by ID
- ✅ Return 404 if event not found

#### Create Event Tests
- ✅ Create a new event with valid data
- ✅ Return 401 if no token provided
- ✅ Return 400 if required fields are missing

#### Update Event Tests
- ✅ Update event with valid data
- ✅ Return 404 if event not found

#### Delete Event Tests
- ✅ Delete event successfully
- ✅ Return 404 if event not found

#### Register for Event Tests
- ✅ Register user for event successfully
- ✅ Return 404 if event not found

#### Get Event Participants Tests
- ✅ Get event participants
- ✅ Return 404 if event not found

**Total Event Tests**: 16

## Mocking

The tests use Jest mocking for:
- **UserModel**: Database operations for users
- **EventModel**: Database operations for events

This allows tests to run without a real database connection.

Example mock:
```javascript
UserModel.findOne.mockResolvedValue({ email: 'test@example.com' });
EventModel.find.mockResolvedValue([{ title: 'Event' }]);
```

## Test Environment

Tests use environment variables from `.env.test`:

```
NODE_ENV=test
PORT=5000
JWT_SECRET=test-secret-key-12345
MONGODB_URI=mongodb://localhost:27017/event-management-test
```

## Writing New Tests

### Basic Test Structure

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    const testData = { /* ... */ };
    const mockResult = { /* ... */ };
    Model.method.mockResolvedValue(mockResult);

    // Act
    const response = await request(app)
      .post('/api/endpoint')
      .send(testData);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### Testing HTTP Endpoints

```javascript
// GET request
await request(app)
  .get('/api/events')
  .set('Authorization', `Bearer ${token}`);

// POST request
await request(app)
  .post('/api/users/login')
  .send({ email: 'user@example.com', password: 'password' });

// PUT request
await request(app)
  .put('/api/events/123')
  .set('Authorization', `Bearer ${token}`)
  .send({ title: 'Updated Title' });

// DELETE request
await request(app)
  .delete('/api/events/123')
  .set('Authorization', `Bearer ${token}`);
```

### Common Assertions

```javascript
// Status codes
expect(response.status).toBe(200);

// Response structure
expect(response.body.success).toBe(true);
expect(response.body.data).toBeDefined();

// Data validation
expect(response.body.data._id).toBe(eventId);
expect(Array.isArray(response.body.data)).toBe(true);

// Error handling
expect(response.status).toBe(404);
expect(response.body.success).toBe(false);
```

## CI/CD Integration

To integrate tests with CI/CD:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## Troubleshooting

### Tests timeout
- Increase `testTimeout` in `jest.config.js`
- Check for unresolved promises or async operations

### Mocks not working
- Ensure `jest.clearAllMocks()` is called in `beforeEach`
- Check mock implementation matches the actual function signature

### Import errors
- Verify file paths are correct (relative to test file)
- Check `moduleNameMapper` in `jest.config.js` if using path aliases

## Best Practices

1. ✅ Use descriptive test names
2. ✅ Follow AAA pattern (Arrange, Act, Assert)
3. ✅ Mock external dependencies
4. ✅ Test both success and error cases
5. ✅ Keep tests isolated and independent
6. ✅ Use setup/teardown functions appropriately
7. ✅ Aim for high code coverage
8. ✅ Test edge cases and boundary conditions

## Coverage Report

After running tests with coverage:
```bash
npm test -- --coverage
```

Coverage report is generated in `coverage/` directory with:
- `coverage/index.html` - Interactive coverage report
- `coverage/lcov.info` - LCOV format (for CI/CD integration)

View the report:
```bash
open coverage/lcov-report/index.html
```

## Useful Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Node.js Testing Best Practices](https://nodejs.org/en/docs/guides/testing/)
