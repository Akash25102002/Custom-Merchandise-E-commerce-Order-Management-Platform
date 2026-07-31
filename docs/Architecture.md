# System Architecture Specification
## Custom Merchandise E-Commerce & Order Management Platform

---

## 1. High-Level Architecture (HLA)

```
                                  +---------------------------------------+
                                  |            Client Browser             |
                                  | React 19 + Vite + TailwindCSS + State |
                                  +---------------------------------------+
                                                      |
                                           HTTPS / REST API / Axios
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |         Nginx Reverse Proxy           |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |            Node.js / Express          |
                                  |  Security / Middleware / Controllers  |
                                  +---------------------------------------+
                                                      |
                   +----------------------------------+----------------------------------+
                   |                                  |                                  |
                   v                                  v                                  v
        +----------------------+          +----------------------+          +----------------------+
        |     MongoDB Atlas    |          |    Cloudinary SDK    |          |  Razorpay / Shiprocket|
        |  Mongoose ORM Store  |          | Artwork Image Storage|          | Payment & Logistics  |
        +----------------------+          +----------------------+          +----------------------+
```

---

## 2. Low-Level Architecture (LLA)

### Backend Pattern: Repository-Service-Controller (RSC)
```
  Client Request ---> Express Route ---> Middleware (JWT/Validation) ---> Controller Layer
                                                                                |
                                                                                v
  MongoDB Database <--- Mongoose Model <--- Repository Layer <--- Service Layer (Business Logic)
```

1. **Routes Layer**: Defines URI endpoints and attaches middlewares.
2. **Middleware Layer**: Performs JWT verification, RBAC role validation, rate limiting, and request sanitization.
3. **Controller Layer**: Handles HTTP requests/responses, extracts params/body, and delegates business logic to services.
4. **Service Layer**: Implements core business logic, workflow state checks, price calculations, and calls repositories.
5. **Repository Layer**: Encapsulates Mongoose database operations (`User`, `Product`, `Order`, `Payment`).

---

## 3. Frontend Architecture

### Structure:
- **Routing**: `React Router v6` with protected routes (`ProtectedRoute.jsx`, `AdminRoute.jsx`).
- **State Management**: `Context API` stores (`AuthContext.jsx`, `CartContext.jsx`).
- **HTTP Client**: `Axios` singleton with Request & Response Interceptors (`api.js`).
- **UI Components**: Modular components organized into `common/`, `product/`, `cart/`, `checkout/`, `admin/`.

---

## 4. Backend Architecture

- **Framework**: Express.js with custom centralized error handling (`ApiError.js`, `error.middleware.js`).
- **Security Protocols**:
  - `Helmet`: Sets HTTP security headers.
  - `Cors`: Restricts cross-origin requests to configured whitelist origins.
  - `Rate Limiting`: 100 requests per 15-minute window per IP.
  - `Password Hashing`: `Bcryptjs` with 10 salt rounds.
  - `Token Signing`: HMAC SHA256 signed JWTs with expiration settings.

---

## 5. Database Architecture (Mongoose Models & ERD)

### Entity Relationship Mapping
```
  [User] 1 ------- * [Order] 1 ------- * [OrderItem] * ------- 1 [Product]
    |                  |                   |                         |
    | 1              1 |                 1 |                       1 |
    v                  v                   v                         v
  [Wishlist]        [Payment]         [ProductVariant]          [Category]
                       |
                     1 |
                       v
                   [Shipment]
```

### Models Summary:
1. `User`: `_id`, `name`, `email`, `password`, `role`, `phone`, `address`, `refreshToken`.
2. `Category`: `_id`, `name`, `slug`, `allowedPrintTypes`.
3. `Product`: `_id`, `name`, `description`, `category`, `basePrice`, `sku`, `allowedSizes`, `allowedColors`, `allowedPrintTypes`, `images`.
4. `ProductVariant`: `_id`, `productId`, `size`, `color`, `stock`, `priceAdjustment`.
5. `Cart`: `_id`, `userId`, `items` [{ `productId`, `variantId`, `customization`, `quantity`, `price` }], `totalPrice`.
6. `Order`: `_id`, `orderNumber`, `userId`, `items`, `shippingAddress`, `billingAddress`, `pricing` (`subtotal`, `tax`, `shippingFee`, `discount`, `grandTotal`), `status`, `timeline` [{ `status`, `timestamp`, `updatedBy` }].
7. `Payment`: `_id`, `orderId`, `userId`, `paymentMethod`, `paymentId`, `signature`, `amount`, `status`, `logs`.
8. `Shipping`: `_id`, `orderId`, `courierName`, `trackingNumber`, `status`, `estimatedDelivery`.

---

## 6. Authentication & Authorization Flow

### JWT Authentication Sequence:
```
  Client                     Express API                  User Service                 MongoDB
    |                            |                             |                          |
    |--- 1. POST /login -------->|                             |                          |
    |                            |--- 2. Find by Email ------->|------------------------->|
    |                            |<-- 3. Return User Data -----|<-------------------------|
    |                            |--- 4. Compare Bcrypt Pass ->|                          |
    |                            |--- 5. Issue JWT Token ------>|                          |
    |<-- 6. Return Token & User -|                             |                          |
    |                            |                             |                          |
```

1. Customer/Admin sends credentials to `POST /api/auth/login`.
2. Server validates password with `bcrypt.compare`.
3. Server generates `accessToken` (expiring in 15m/1d) and `refreshToken` (expiring in 7d).
4. `verifyJWT` middleware intercepts protected requests, verifies signature, decodes payload, and attaches `req.user`.
5. `isAdmin` middleware enforces `req.user.role === 'admin'`.

---

## 7. Sequential Order Workflow State Machine

```
 [Order Placed] ---> [Payment Verified] ---> [Design Approved] ---> [Printing In Progress]
                                                                             |
                                                                             v
 [Delivered] <--- [Out For Delivery] <--- [Shipped] <--- [Shipment Created] <--- [Quality Check] <--- [Packed]
```

### State Machine Transition Rules:
- Transition from `Order Placed` ONLY allowed to `Payment Verified` or `Cancelled`.
- Transition to `Printing In Progress` MUST be preceded by `Design Approved`.
- Transition to `Delivered` MUST be preceded by `Out For Delivery`.
- Violations trigger an `ApiError(400, "Invalid order status transition")`.

---

## 8. Payment Processing & Webhooks

```
  Client Browser               Express API                Razorpay Gateway
    |                              |                             |
    |-- 1. Create Order Request -->|                             |
    |                              |-- 2. Init Gateway Order --->|
    |<-- 3. Return Gateway ID -----|<-- Return razorpay_order_id-|
    |                              |                             |
    |-- 4. User Completes Pay ---->|---------------------------->|
    |                              |<-- 5. Return Payment ID ----|
    |-- 6. POST /verify-payment -->|                             |
    |   (Verify HMAC Signature)    |                             |
    |<-- 7. Payment Confirmed -----|                             |
```

---

## 9. File Upload Architecture (Multer + Cloudinary)
1. Customer/Admin uploads artwork or product image.
2. `Multer` buffers file in memory/temp directory.
3. `uploadToCloudinary` utility streams image to Cloudinary storage bucket.
4. Cloudinary returns secure HTTPS URL, width, height, and public_id.
5. URL is persisted in MongoDB schema.

---

## 10. Deployment & Infrastructure Architecture
- **Docker Compose**: Orchestrates Node.js Backend service (port 8000), Vite Frontend build Nginx container (port 80), and MongoDB database container.
- **Reverse Proxy**: Nginx handles SSL termination, static file serving, and proxies `/api` requests to Express.
