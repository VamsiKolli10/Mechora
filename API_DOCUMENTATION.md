# API Documentation - Mechora E-Commerce Platform

## Base URL
```
http://localhost:8000/api
```

## Authentication

Most endpoints support two authentication methods:
1. **Bearer Token** (for authenticated users): `Authorization: Bearer <token>`
2. **Guest Token** (for guest users): `x-guest-token: <token>` header or `?guest_token=<token>` query param

---

## Cart Endpoints

### Get Cart
```
GET /api/cart
```
Get current user's cart or guest cart.

**Headers:**
- `Authorization: Bearer <token>` (optional, for authenticated users)
- `x-guest-token: <token>` (optional, for guest users)

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "items": [
    {
      "id": 1,
      "watch_id": 1,
      "quantity": 2,
      "price_at_added": 5000.00,
      "brand": "Rolex",
      "model": "Submariner",
      "slug": "rolex-submariner-12345"
    }
  ],
  "subtotal": 10000.00,
  "item_count": 2,
  "guest_token": null
}
```

### Add Item to Cart
```
POST /api/cart/items
```
Add a watch to the cart.

**Body:**
```json
{
  "watch_id": 1,
  "quantity": 1
}
```

### Update Cart Item
```
PUT /api/cart/items/:itemId
```
Update quantity of a cart item.

**Body:**
```json
{
  "quantity": 3
}
```

### Remove Item from Cart
```
DELETE /api/cart/items/:itemId
```

### Clear Cart
```
DELETE /api/cart
```

### Merge Guest Cart
```
POST /api/cart/merge
```
Merge guest cart into user cart after login.

**Body:**
```json
{
  "guest_token": "abc123..."
}
```

---

## Wishlist Endpoints

### Get Wishlist
```
GET /api/wishlist
```
**Requires:** Authentication

### Add to Wishlist
```
POST /api/wishlist/items
```
**Requires:** Authentication

**Body:**
```json
{
  "watch_id": 1
}
```

### Remove from Wishlist
```
DELETE /api/wishlist/items/:watchId
```
**Requires:** Authentication

### Check if in Wishlist
```
GET /api/wishlist/items/:watchId/check
```

**Response:**
```json
{
  "in_wishlist": true
}
```

---

## Recently Viewed Endpoints

### Add to Recently Viewed
```
POST /api/recently-viewed
```

**Body:**
```json
{
  "watch_id": 1
}
```

### Get Recently Viewed
```
GET /api/recently-viewed?limit=10
```

### Clear Recently Viewed
```
DELETE /api/recently-viewed
```

---

## Order Endpoints

### Create Order
```
POST /api/orders
```
Create an order from the current cart.

**Body:**
```json
{
  "guest_email": "guest@example.com",
  "shipping_address": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  },
  "billing_address": { ... },
  "tax_amount": 800.00,
  "shipping_amount": 50.00,
  "notes": "Please handle with care"
}
```

### Get Order
```
GET /api/orders/:orderId
```

### Get Order by Order Number
```
GET /api/orders/number/:orderNumber
```

### Get User Orders
```
GET /api/orders?page=1&limit=20&status=pending
```
**Requires:** Authentication

**Query Params:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status (optional)

### Update Order Status
```
PUT /api/orders/:orderId/status
```
**Requires:** Authentication (Admin)

**Body:**
```json
{
  "status": "shipped",
  "notes": "Shipped via FedEx"
}
```

---

## Payment Endpoints

### Create Payment Intent
```
POST /api/payments/intent
```
Create a Stripe Payment Intent for an order.

**Body:**
```json
{
  "order_id": 123,
  "guest_email": "guest@example.com",
  "payment_method": "card"
}
```

**Response:**
```json
{
  "client_secret": "pi_123_secret_abc",
  "payment_intent_id": "pi_123",
  "payment_id": 55,
  "order_id": 123,
  "amount": 120000,
  "currency": "usd",
  "status": "requires_payment_method"
}
```

### Stripe Webhook
```
POST /api/payments/webhook
```
Stripe webhook endpoint (server-to-server). The request must include a valid `Stripe-Signature` header.

---

## Watch Endpoints

### Get All Watches
```
GET /api/watches?page=1&limit=20&brand_id=1&min_price=1000&max_price=10000&sort_by=sale_price&sort_order=ASC
```

**Query Params:**
- `page` - Page number
- `limit` - Items per page
- `brand_id` - Filter by brand
- `collection_id` - Filter by collection
- `min_price` - Minimum price
- `max_price` - Maximum price
- `stock_status` - Filter by stock status
- `condition` - Filter by condition (new, used, etc.)
- `is_active` - Filter by active status
- `is_featured` - Filter featured watches
- `sort_by` - Sort field (created_at, sale_price, etc.)
- `sort_order` - ASC or DESC
- `search` - Search term

**Response:**
```json
{
  "watches": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Get Featured Watches
```
GET /api/watches/featured?limit=10
```

### Get Watch by Slug
```
GET /api/watches/slug/:slug
```

**Response includes:**
- Watch details
- Assets (images, videos)
- Recommended watches

### Get Watch by ID
```
GET /api/watches/:id
```

### Search Watches
```
GET /api/watches/search/:query?page=1&limit=20
```

---

## Product Endpoints

Products mirror the watch catalog and share the same schema and filters.

### Get All Products
```
GET /api/products?page=1&limit=20&brand_id=1&min_price=1000&max_price=10000&sort_by=sale_price&sort_order=ASC
```

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Get Featured Products
```
GET /api/products/featured?limit=10
```

### Get Product by Slug
```
GET /api/products/slug/:slug
```

**Response includes:**
- Product details
- Assets (images, videos)
- Recommended products

### Get Product by ID
```
GET /api/products/:id
```

### Search Products
```
GET /api/products/search/:query?page=1&limit=20
```

### Product Search Suggestions
```
GET /api/products/suggestions?q=rol&limit=10
```

### Create Product
```
POST /api/products
```
**Requires:** Authentication (Admin)

**Body:**
```json
{
  "brand_id": 1,
  "collection_id": 2,
  "brand": "Rolex",
  "model": "Submariner",
  "reference": "124060",
  "sku": "ROLEX-124060",
  "sale_price": 9800,
  "msrp": 10500,
  "stock_status": "in_stock",
  "stock_quantity": 3,
  "condition": "new",
  "description": "41mm no-date diver",
  "is_active": true,
  "is_featured": false
}
```

### Update Product
```
PUT /api/products/:id
```
**Requires:** Authentication (Admin)

### Delete Product
```
DELETE /api/products/:id
```
**Requires:** Authentication (Admin)

---

## Search Endpoints

### Full-Text Search
```
GET /api/search?q=rolex&page=1&limit=20
```

### Search Suggestions
```
GET /api/search/suggestions?q=rol&limit=10
```

---

## Brand Endpoints

### Get All Brands
```
GET /api/brands?include_inactive=false
```

### Get Brand by ID
```
GET /api/brands/:id
```

### Get Brand by Slug
```
GET /api/brands/slug/:slug
```

### Create Brand
```
POST /api/brands
```
**Requires:** Authentication

**Body:**
```json
{
  "name": "Rolex",
  "slug": "rolex",
  "description": "Swiss luxury watch manufacturer",
  "logo_url": "https://...",
  "website_url": "https://rolex.com",
  "is_active": true
}
```

---

## Collection Endpoints

### Get All Collections
```
GET /api/collections?include_inactive=false
```

### Get Collection by ID
```
GET /api/collections/:id
```

### Get Collection by Slug
```
GET /api/collections/slug/:slug
```

### Create Collection
```
POST /api/collections
```
**Requires:** Authentication

---

## Asset Endpoints

### Get Assets by Watch ID
```
GET /api/assets/watch/:watchId
```

### Get Asset by ID
```
GET /api/assets/:id
```

### Create Asset
```
POST /api/assets
```
**Requires:** Authentication

**Body:**
```json
{
  "watch_id": 1,
  "url": "https://...",
  "type": "image",
  "alt_text": "Rolex Submariner front view",
  "sort_order": 0,
  "width": 1920,
  "height": 1080,
  "file_size": 500000,
  "mime_type": "image/jpeg"
}
```

---

## Authentication Endpoints

### Login
```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Signup
```
POST /api/auth/signup
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

### Refresh Session
```
POST /api/auth/refresh
```

**Body (optional):**
```json
{
  "refresh_token": "optional_refresh_token"
}
```

### Logout
```
POST /api/auth/logout
```
**Requires:** Authentication

### Request Password Reset
```
POST /api/auth/password-reset/request
```

**Body:**
```json
{
  "email": "user@example.com"
}
```

### Reset Password
```
POST /api/auth/password-reset
```

**Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "newpassword123"
}
```

### Verify Email
```
POST /api/auth/verify-email
```

**Body:**
```json
{
  "token": "verification_token_from_email"
}
```

---

## Health Check

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-15T18:30:00.000Z"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
