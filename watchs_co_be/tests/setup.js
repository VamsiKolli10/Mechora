// Test setup file
require("dotenv").config({ path: ".env.test" });

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
process.env.GUEST_TOKEN_SECRET = "test_guest_secret";
process.env.COOKIE_SECRET = "test_cookie_secret";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.SUPABASE_URL = "";
process.env.SUPABASE_ANON_KEY = "";
process.env.STRIPE_SECRET_KEY = "";
process.env.STRIPE_WEBHOOK_SECRET = "";
process.env.EMAIL_DELIVERY = "log";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
