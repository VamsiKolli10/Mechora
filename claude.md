# Mechora E-Commerce Platform - AI Agent Documentation

## Project Overview

Mechora is a full-stack e-commerce platform for luxury watches, built with modern technologies and designed for production deployment. This documentation provides comprehensive information for AI agents to understand, modify, and extend the system.

## Project Structure

### Root Level

- **`watchs_co_be/`** - Backend API service (Express.js + PostgreSQL)
- **`watchs_co_fe/`** - Frontend React application (Vite + React + Redux)
- **`API_DOCUMENTATION.md`** - Complete API reference
- **`README.md`** - Developer setup and deployment guide

## Technology Stack

### Backend (watchs_co_be)

- **Runtime**: Node.js with Express.js (v5.1.0)
- **Database**: PostgreSQL with db-migrate for schema management
- **Authentication**: JWT with HttpOnly cookies, bcrypt for password hashing
- **Security**: Helmet, CORS, rate limiting, input validation with Zod
- **Testing**: Jest with integration and unit tests
- **Logging**: Morgan with custom logger
- **MFA**: OTP support with otplib
- **Package Manager**: npm

### Frontend (watchs_co_fe)

- **Framework**: React 19 with Vite build tool
- **State Management**: Redux Toolkit with RTK Query
- **UI Library**: Material-UI (MUI) v7
- **Routing**: React Router v7
- **HTTP Client**: Axios with automatic cookie handling
- **Testing**: Vitest for unit tests
- **Styling**: CSS-in-JS with emotion
- **Animations**: Framer Motion

## Architecture Patterns

### Backend Architecture

- **RESTful API** with resource-based endpoints
- **Middleware Pattern** for authentication, validation, and error handling
- **Repository Pattern** for database operations
- **Migration-based Database** schema evolution
- **Environment-based Configuration** with dotenv

### Frontend Architecture

- **Component-based Architecture** with React
- **Redux Store** for global state management
- **Feature-based Organization** for scalability
- **API Layer** abstraction with Axios interceptors
- **Theme System** for consistent styling

## Key Features

### E-commerce Core

- **Product Catalog** - Watches with brands, collections, and assets
- **Shopping Cart** - Guest and authenticated user carts with merge capability
- **Wishlist** - User wishlists with persistence
- **Order Management** - Complete order lifecycle with status tracking
- **Search** - Full-text search with suggestions

### Authentication & Security

- **JWT-based Auth** with HttpOnly cookies
- **Refresh Token Rotation** for enhanced security
- **Guest Token System** for anonymous users
- **Password Validation** with middleware
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins

### User Experience

- **Recently Viewed** products tracking
- **Responsive Design** with Material-UI
- **Dark/Light Theme** toggle
- **Real-time Cart** updates
- **Form Validation** with user feedback

## Database Schema

### Core Entities

- **Users** - Customer accounts with authentication
- **Brands** - Watch manufacturers
- **Collections** - Brand collections
- **Watches** - Individual watch products with pricing
- **Assets** - Images and media for products
- **Carts** - User shopping carts
- **Wishlists** - User saved items
- **Orders** - Purchase orders with status tracking
- **Payments** - Payment processing
- **Shipments** - Order fulfillment

### Relationships

- Brands have many Collections
- Collections have many Watches
- Watches have many Assets
- Users have one Cart, Wishlist, and many Orders
- Orders contain many Order Items

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Products

- `GET /api/watches` - List watches with filtering
- `GET /api/watches/:id` - Get specific watch
- `GET /api/watches/slug/:slug` - Get watch by slug
- `GET /api/watches/featured` - Featured products
- `GET /api/products` - List products (alias of watches)
- `GET /api/products/:id` - Get specific product
- `GET /api/products/slug/:slug` - Get product by slug
- `GET /api/products/featured` - Featured products
- `GET /api/products/suggestions` - Product search suggestions

### Shopping

- `GET /api/cart` - Get current cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item

### Payments

- `POST /api/payments/intent` - Create Stripe payment intent for an order
- `POST /api/payments/webhook` - Stripe webhook endpoint

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order

### Search & Discovery

- `GET /api/search?q=term` - Full-text search
- `GET /api/search/suggestions?q=term` - Search suggestions
- `GET /api/recently-viewed` - Recently viewed items

## Environment Configuration

### Required Environment Variables

#### Backend

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mechora
DB_USER=postgres
DB_PASSWORD=password

# Authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
GUEST_TOKEN_SECRET=guest-secret
COOKIE_SECRET=cookie-secret
COOKIE_SECURE=false
COOKIE_SAMESITE=lax

# Application
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

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CURRENCY=usd
STRIPE_API_VERSION=2023-10-16
```

#### Frontend

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Development Workflow

### Starting the Development Environment

```bash
# From project root
npm install
npm run dev  # Starts both backend and frontend

# Or individually
npm run dev:be  # Backend only
npm run dev:fe  # Frontend only
```

### Backend Development

```bash
cd watchs_co_be
npm run migrate    # Run database migrations
npm run maintenance # Run background jobs
npm test          # Run test suite
npm run dev       # Start development server
```

### Frontend Development

```bash
cd watchs_co_fe
npm run dev       # Start development server
npm run build     # Build for production
npm run test      # Run unit tests
```

## Testing Strategy

### Backend Tests (Jest)

- **Unit Tests** - Individual function testing
- **Integration Tests** - API endpoint testing
- **Coverage Reports** - Code coverage analysis
- **Setup Files** - Test environment configuration

### Frontend Tests (Vitest)

- **Component Tests** - React component testing
- **Slice Tests** - Redux state management testing
- **API Tests** - HTTP client testing

## Deployment Considerations

### Production Requirements

1. **Database** - PostgreSQL instance with proper credentials
2. **Environment Variables** - All required secrets configured
3. **SSL/TLS** - HTTPS for production security
4. **CORS** - Proper origin configuration
5. **Static Assets** - Frontend build deployment

### CI/CD Pipeline

- Backend tests must pass before deployment
- Frontend tests must pass before deployment
- Database migrations should run automatically
- Environment-specific configurations

## Security Features

### Authentication Security

- **HttpOnly Cookies** - Prevent XSS token theft
- **Token Rotation** - Refresh tokens rotate on each use
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Zod schema validation

### Application Security

- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Controlled cross-origin access
- **Helmet.js** - Security headers
- **SQL Injection Protection** - Parameterized queries

## Performance Optimizations

### Backend

- **Connection Pooling** - Database connection management
- **Caching** - Strategic caching for frequently accessed data
- **Pagination** - Large dataset handling
- **Compression** - Response compression

### Frontend

- **Code Splitting** - Route-based chunking
- **Lazy Loading** - Component lazy loading
- **Image Optimization** - Asset optimization
- **State Management** - Efficient Redux patterns

## Troubleshooting Guide

### Common Issues

#### Database Connection

```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify database exists
psql -U postgres -l | grep mechora
```

#### CORS Errors

- Verify `CLIENT_ORIGIN` environment variable
- Check frontend origin matches allowed origins
- Ensure cookies are being sent with requests

#### Authentication Issues

- Check JWT secret configuration
- Verify cookie settings (secure, samesite)
- Ensure proper token rotation

### Debug Commands

```bash
# Backend logs
npm run dev  # Shows server logs

# Database status
npm run migrate:status

# Test coverage
npm run test:coverage
```

## Extension Points

### Adding New Features

1. **Database Changes** - Create migration files
2. **API Endpoints** - Add routes and controllers
3. **Frontend Components** - Create React components
4. **State Management** - Extend Redux store
5. **Tests** - Add comprehensive test coverage

### API Extensions

- Follow existing REST patterns
- Use Zod for input validation
- Implement proper error handling
- Add comprehensive tests

### Frontend Extensions

- Follow component organization patterns
- Use Redux for state management
- Implement proper TypeScript types
- Add unit tests for new functionality

## Code Quality Standards

### Backend

- **ESLint** configuration for code style
- **Jest** for comprehensive testing
- **Prettier** for code formatting
- **Commit conventions** for Git history

### Frontend

- **ESLint** with React-specific rules
- **TypeScript** for type safety
- **Vitest** for component testing
- **Component documentation** with PropTypes

## Monitoring & Observability

### Logging

- **Structured logging** with Morgan
- **Error tracking** with detailed stack traces
- **Performance metrics** for API endpoints

### Health Checks

- **Health endpoint** at `/health`
- **Database connectivity** monitoring
- **Application status** reporting

## Support & Maintenance

### Regular Maintenance

- **Database backups** and recovery procedures
- **Security updates** for dependencies
- **Performance monitoring** and optimization
- **Test suite maintenance**

### Support Channels

- **GitHub Issues** for bug reports
- **Documentation** for self-service
- **Code comments** for developer guidance

This documentation provides a comprehensive overview for AI agents to understand, work with, and extend the Mechora e-commerce platform effectively.
