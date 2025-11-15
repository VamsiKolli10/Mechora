# AI Agent Documentation for WatchSalesCo

## Project Overview

WatchSalesCo is a full-stack e-commerce application for selling watches, consisting of:

- **Backend**: Node.js/Express RESTful API server
- **Frontend**: React application with Material-UI, Redux, and React Router
- **Database**: PostgreSQL with db-migrate for schema management

### Directory Layout

```
watchs_co_be/
├── app.js                 # Express app configuration and routes
├── server.js              # Server startup file
├── db.js                  # Database connection pool
├── database.json          # Database configuration for migrations
├── migrate-config.js      # Migration configuration
├── package.json           # Dependencies and scripts
├── config/                # Configuration files
├── controllers/           # Route handlers
│   ├── authController.js
│   ├── userController.js
│   └── watchesController.js
├── middleware/            # Express middleware
│   └── authMiddleware.js
├── models/                # Database models and queries
│   ├── userModel.js
│   └── watchesModel.js
├── routes/                # API route definitions
│   ├── auth.js
│   ├── users.js
│   ├── watches.js
│   └── products.js
├── migrations/            # Database migration files
└── scripts/               # Utility scripts
    └── importWatches.js

watchs_co_fe/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable React components
│   ├── constants/         # Application constants
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── App.js             # Main App component
│   ├── index.js           # Entry point
│   └── setupTests.js      # Test setup
├── package.json
└── README.md
```

## Getting Started

### Backend Setup

1. **Install dependencies**:

   ```bash
   cd watchs_co_be
   npm install
   ```

2. **Environment variables**:
   Create a `.env` file in the `watchs_co_be` directory:

   ```
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=watchs_co
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret_key
   PORT=8000
   ```

3. **Database setup**:

   ```bash
   # Run migrations
   npm run migrate

   # Rollback migrations if needed
   npm run rollback
   ```

4. **Start the backend**:

   ```bash
   # Development mode with nodemon
   npm start

   # Or use node directly
   node server.js
   ```

The backend will run on `http://localhost:8000` by default.

### Frontend Setup

1. **Install dependencies**:

   ```bash
   cd watchs_co_fe
   npm install
   ```

2. **Start the frontend**:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000` by default.

## API Testing

### Running Tests

The backend currently has no test suite configured. To add tests:

1. Install a testing framework (e.g., Jest, Supertest):

   ```bash
   npm install --save-dev jest supertest
   ```

2. Create test files in a `__tests__` directory

3. Add test scripts to `package.json`:
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch"
   }
   ```

### API Endpoints

#### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

#### Users

- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current user (requires auth)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Watches

- `GET /api/watches` - Get all watches
- `GET /api/watches/:id` - Get watch by ID
- `POST /api/watches` - Create new watch
- `PUT /api/watches/:id` - Update watch
- `DELETE /api/watches/:id` - Delete watch
- `GET /api/watches/search/:query` - Search watches

#### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Example API Calls

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get all watches (no auth required)
curl http://localhost:8000/api/watches

# Create watch (requires auth)
curl -X POST http://localhost:8000/api/watches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"brand":"Rolex","model":"Submariner","price":"10000"}'
```

## Development Guide

### Adding New Routes

1. **Create route file** in `routes/` directory:

   ```javascript
   // routes/example.js
   const express = require("express");
   const exampleController = require("../controllers/exampleController");
   const router = express.Router();

   router.get("/", exampleController.getAll);
   router.post("/", exampleController.create);
   router.get("/:id", exampleController.getById);
   router.put("/:id", exampleController.update);
   router.delete("/:id", exampleController.delete);

   module.exports = router;
   ```

2. **Add route to app.js**:
   ```javascript
   const exampleRoute = require("./routes/example");
   app.use("/api/example", exampleRoute);
   ```

### Adding New Models

1. **Create model file** in `models/` directory:

   ```javascript
   // models/exampleModel.js
   const { query } = require("../db");

   const getAll = () => {
     return query("SELECT * FROM examples ORDER BY id ASC");
   };

   const getById = (id) => {
     return query("SELECT * FROM examples WHERE id = $1", [id]);
   };

   module.exports = { getAll, getById };
   ```

2. **Create database migration**:
   ```bash
   db-migrate create create_examples_table --env dev
   ```

### Adding New Controllers

1. **Create controller file** in `controllers/` directory:

   ```javascript
   // controllers/exampleController.js
   const ExampleModel = require("../models/exampleModel");

   const getAll = async (req, res) => {
     try {
       const result = await ExampleModel.getAll();
       res.json(result.rows);
     } catch (err) {
       res.status(500).json({ error: "Failed to fetch examples" });
     }
   };

   module.exports = { getAll };
   ```

## Authentication

### Using Authentication Middleware

The `requireAuth` middleware protects routes that require authentication:

```javascript
const { requireAuth } = require("../middleware/authMiddleware");

// Apply to specific routes
router.get("/protected", requireAuth, protectedController.get);

// Apply to all routes in router
router.use(requireAuth);
```

### JWT Token Format

- **Header**: `Authorization: Bearer <token>`
- **Token structure**: JSON Web Token with user ID and email
- **Expiration**: 1 hour by default

### Authentication Flow

1. User logs in via `/api/auth/login`
2. Server returns JWT token
3. Client includes token in Authorization header for protected routes
4. Middleware validates token and attaches user to request

## Common Pitfalls & Troubleshooting

### Database Issues

**Problem**: Connection errors

- **Solution**: Check database credentials in `.env` file
- **Verify**: PostgreSQL is running and accessible

**Problem**: Migration failures

- **Solution**: Run `npm run rollback` then `npm run migrate`
- **Check**: Database user has proper permissions

### CORS Issues

**Problem**: Frontend cannot connect to backend

- **Solution**: Verify CORS configuration in `app.js`
- **Current setup**: Only allows `http://localhost:3000`

### Authentication Issues

**Problem**: "Invalid or expired token" errors

- **Solution**: Check JWT secret consistency between requests
- **Verify**: Token is properly formatted with "Bearer " prefix

**Problem**: Password hashing errors

- **Solution**: Ensure bcrypt is properly installed
- **Check**: Password is being hashed with salt rounds (currently 10)

### Environment Variables

**Problem**: Undefined environment variables

- **Solution**: Create `.env` file in `watchs_co_be` directory
- **Required variables**: `DB_*`, `JWT_SECRET`, `PORT`

### Port Conflicts

**Problem**: Port already in use

- **Solution**: Change port in `.env` or kill existing process
- **Default ports**: Backend 8000, Frontend 3000

### Development Tips

1. **Always run migrations** after schema changes
2. **Use environment variables** for sensitive data
3. **Test API endpoints** with curl or Postman
4. **Check console logs** for error details
5. **Verify database connections** before starting server
6. **Use proper error handling** in controllers
7. **Follow REST conventions** for API design

### File Structure Best Practices

- Keep models focused on database operations
- Controllers handle HTTP requests/responses
- Routes define endpoint paths and methods
- Middleware handles cross-cutting concerns
- Separate business logic from presentation logic
