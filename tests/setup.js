// Test setup file - runs before all tests
require('dotenv').config({ path: '.env.test' });

// Mock environment variables for testing
process.env.PORT = process.env.PORT || 5000;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

// Suppress console logs during tests
global.console.log = jest.fn();
global.console.warn = jest.fn();
