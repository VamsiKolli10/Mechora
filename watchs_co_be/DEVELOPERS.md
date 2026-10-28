# Developer Documentation - Watch Sales Co Backend

## Project Setup

### Prerequisites

- **Node.js** (v22 or higher)
- **PostgreSQL** (v15 or higher)
- **Docker** (optional, for containerized deployment)

### Installing Dependencies

```bash
# Navigate to the backend directory
cd watchs_co_be

# Install all dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=watchs_co_db
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Guest + cookie configuration
GUEST_TOKEN_SECRET=your_guest_token_secret
COOKIE_SECRET=your_cookie_secret
COOKIE_DOMAIN=
COOKIE_SECURE=false
COOKIE_SAMESITE=lax

# Server Configuration
PORT=8000
CLIENT_ORIGIN=http://localhost:5173

# Email delivery (log | file | smtp)
EMAIL_DELIVERY=log
EMAIL_OUTBOX_PATH=./outbox
EMAIL_FROM=Mechora <no-reply@mechora.local>
APP_BASE_URL=http://localhost:5173
EMAIL_VERIFY_PATH=/verify-email
PASSWORD_RESET_PATH=/password-reset

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# Stripe payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CURRENCY=usd
STRIPE_API_VERSION=2023-10-16
```

**Required Environment Variables:**

- `DB_HOST` - PostgreSQL server host
- `DB_USER` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password
- `DB_NAME` - Database name
- `DB_PORT` - PostgreSQL port (default: 5432)
- `JWT_SECRET` - Secret key for access tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `GUEST_TOKEN_SECRET` - Secret key for guest cart tokens
- `COOKIE_SECRET` - Secret used to sign cookies
- `PORT` - Server port (default: 8000)

**Optional Email Variables:**

- `EMAIL_DELIVERY` - `log` (default), `file`, or `smtp`
- `EMAIL_OUTBOX_PATH` - Output path when `EMAIL_DELIVERY=file`
- `EMAIL_FROM` - From address for outbound mail
- `APP_BASE_URL` - Base URL for email links
- `EMAIL_VERIFY_PATH` - Verify email route path
- `PASSWORD_RESET_PATH` - Reset password route path
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` - SMTP settings

**Optional Stripe Variables:**

- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `STRIPE_CURRENCY` - Currency for Stripe payment intents (default `usd`)
- `STRIPE_API_VERSION` - Stripe API version override

### Database Setup

1. Create the PostgreSQL database:

```bash
createdb watchs_co_db
```

2. Run database migrations:

```bash
npm run migrate
```

## Directory Structure Overview

### Backend Structure (`watchs_co_be/`)

```
watchs_co_be/
├── controllers/          # Request handlers and business logic
│   ├── authController.js
│   ├── productsController.js
│   ├── userController.js
│   └── watchesController.js
├── models/              # Database models and query functions
│   ├── userModel.js
│   └── watchesModel.js
├── routes/              # API route definitions
│   ├── auth.js
│   ├── products.js
│   ├── users.js
│   └── watches.js
├── middleware/          # Custom middleware functions
│   └── authMiddleware.js
├── migrations_supabase/ # Current local and hosted database migrations
│   └── 00000000000000-bootstrap-schema.js
├── scripts/             # Utility and setup scripts
│   └── importWatches.js
├── config/              # Configuration files
├── app.js               # Express app configuration
├── server.js            # Server entry point
├── db.js                # Database connection setup
├── migrate-config.js    # Database migration configuration
└── package.json         # Project dependencies and scripts
```

### Frontend Structure (`watchs_co_fe/`)

```
watchs_co_fe/
├── src/
│   ├── components/      # Reusable React components
│   │   ├── AnimatedBackground.jsx
│   │   └── PrivateRoute.jsx
│   ├── pages/           # Page components
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Registration/
│   │   └── Layouts/
│   ├── hooks/           # Custom React hooks
│   │   └── useAuth.js
│   ├── store/           # Redux store configuration
│   ├── constants/       # Application constants
│   ├── utils/           # Utility functions
│   └── App.js           # Main React component
└── package.json         # Frontend dependencies and scripts
```

## Running the Application

### Backend

Start the backend server:

```bash
# Method 1: Using npm start
npm start

# Method 2: Using node directly
node server.js

# Method 3: Using nodemon for development (if installed)
npx nodemon server.js
```

The backend will run on `http://localhost:8000`

### Frontend

Navigate to the frontend directory and start:

```bash
cd watchs_co_fe
npm start
```

The frontend will run on `http://localhost:3000`

### Access URLs

- **Backend API**: `http://localhost:8000/api/`
- **Frontend Application**: `http://localhost:3000`

## Testing the API

### Authentication Endpoints

#### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

#### Signup

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "user@example.com", "password": "password123"}'
```

### Protected Endpoints

First, obtain a JWT token from the login endpoint, then use it in the Authorization header:

```bash
# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Use token in protected request
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

### Public Endpoints

#### Get All Watches

```bash
curl -X GET http://localhost:8000/api/watches
```

#### Search Watches

```bash
curl -X GET "http://localhost:8000/api/watches/search/rolex"
```

#### Get Watch by ID

```bash
curl -X GET http://localhost:8000/api/watches/1
```

### Example Test Script

Use the provided import script to populate the database with sample data:

```bash
node scripts/importWatches.js /absolute/path/to/watches.csv
```

## Adding New Features

### Adding a New Route

1. **Create the route file** (`routes/newFeature.js`):

```javascript
const express = require("express");
const router = express.Router();
const newFeatureController = require("../controllers/newFeatureController");

router.get("/", newFeatureController.getAll);
router.post("/", newFeatureController.create);
router.get("/:id", newFeatureController.getById);
router.put("/:id", newFeatureController.update);
router.delete("/:id", newFeatureController.delete);

module.exports = router;
```

2. **Create the controller** (`controllers/newFeatureController.js`):

```javascript
const newFeatureModel = require("../models/newFeatureModel");

exports.getAll = async (req, res) => {
  try {
    const result = await newFeatureModel.findAll();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await newFeatureModel.create(req.body);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add other controller methods...
```

3. **Create the model** (`models/newFeatureModel.js`):

```javascript
const { query } = require("../db");

exports.findAll = () => {
  return query("SELECT * FROM new_features ORDER BY id ASC");
};

exports.create = (data) => {
  return query(
    "INSERT INTO new_features (field1, field2) VALUES ($1, $2) RETURNING *",
    [data.field1, data.field2]
  );
};

// Add other model methods...
```

4. **Register the route in `app.js`**:

```javascript
const newFeatureRoute = require("./routes/newFeature");
app.use("/api/new-feature", newFeatureRoute);
```

### Controller Guidelines

- Use async/await pattern for all database operations
- Implement proper error handling with try-catch blocks
- Return appropriate HTTP status codes
- Use parameterized queries to prevent SQL injection
- Keep controllers focused on request/response handling

### Database Schema Changes

1. **Create a migration file**:

```bash
npx db-migrate create add-new-feature-table --env dev --config database.json --migrations-dir migrations_supabase
```

2. **Edit the migration file**:

```javascript
module.exports = {
  up: async (db) => {
    await db.createTable("new_features", {
      id: {
        type: "int",
        primaryKey: true,
        autoIncrement: true,
      },
      field1: {
        type: "string",
        notNull: true,
      },
      field2: {
        type: "text",
      },
      created_at: {
        type: "timestamp",
        defaultValue: "now()",
      },
    });
  },

  down: async (db) => {
    await db.dropTable("new_features");
  },
};
```

3. **Run the migration**:

```bash
npm run migrate
```

## Authentication Middleware

### How `requireAuth` Works

The authentication middleware (`middleware/authMiddleware.js`) validates JWT tokens:

```javascript
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
```

### Using Protected Routes

Add the middleware to routes that require authentication:

```javascript
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.get("/profile", requireAuth, userController.getProfile);
router.put("/profile", requireAuth, userController.updateProfile);
```

### Accessing User Data

In protected routes, access the authenticated user via `req.user`:

```javascript
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await UserModel.getUserById(userId);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## Common Pitfalls & Troubleshooting

### Missing Environment Variables

**Symptom**: 500 errors with "Cannot read property" messages

**Solution**: Ensure all required environment variables are set in `.env` file:

```bash
# Check if .env file exists
ls -la .env

# Verify all required variables are present
cat .env
```

### CORS Misconfiguration

**Symptom**: Frontend receives CORS errors when making API requests

**Solution**: Verify CORS configuration in `app.js`:

```javascript
app.use(
  cors({
    origin: "http://localhost:3000", // Match your frontend URL
    credentials: true,
  })
);
```

### JWT Secret Mismatch

**Symptom**: "Invalid or expired token" errors on valid requests

**Solution**: Ensure `JWT_SECRET` is consistent across all services and restart the server after changes.

### Database Connection Errors

**Symptom**: Connection refused or authentication failed errors

**Solutions**:

1. **Check database credentials**:

```bash
# Test database connection
psql -h localhost -U your_db_user -d watchs_co_db
```

2. **Verify database exists**:

```bash
createdb watchs_co_db
```

3. **Check PostgreSQL service is running**:

```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Migration Conflicts

**Symptom**: Migration errors about existing tables or constraints

**Solutions**:

1. **Check migration status**:

```bash
npx db-migrate up --check --env dev --config database.json --migrations-dir migrations_supabase
```

2. **Apply a corrective forward migration**. Current checkout/session migrations deliberately reject rollback to preserve retry records and session revocation.

3. **Clean database** (use with caution):

```bash
# Drop and recreate database
dropdb watchs_co_db
createdb watchs_co_db
npm run migrate
```

## Contribution Guidelines

### Code Style

This project uses standard JavaScript/Node.js best practices:

- Use `const` and `let` appropriately (prefer `const`)
- Use descriptive variable and function names
- Follow consistent indentation (2 spaces)
- Add JSDoc comments for complex functions
- Use async/await instead of callbacks

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test your changes thoroughly
4. Update documentation if needed
5. Submit a pull request with a clear description
6. Ensure all checks pass before merging

### Running Linting

If linting is configured in your project:

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Testing

Currently, the project uses basic testing. Add comprehensive tests for new features:

```bash
# Run tests (if configured)
npm test
```

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Documentation](https://jwt.io/)
- [db-migrate Documentation](https://db-migrate.readthedocs.io/)
