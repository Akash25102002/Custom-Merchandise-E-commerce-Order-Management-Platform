# ThreadCraft — Custom Merchandise E-commerce & Order Management Platform

A full-stack MERN application for a custom merchandise business. Customers
browse products, customize artwork/prints, pay, and track orders through a
real print-shop fulfillment workflow. Includes a separate admin panel for
product, order, and fulfillment management.

**Live app:** https://custom-merchandise-e-commerce-order.vercel.app

---

## Screenshots

| | |
|---|---|
| **Register** ![Register](./screenshots/01-register.png) | **Sign In (with one-click demo credentials)** ![Login](./screenshots/02-login.png) |
| **Catalog** ![Catalog](./screenshots/03-catalog.png) | **Design Studio — product customizer** ![Customizer](./screenshots/04-customizer.png) |
| **Cart — live server-recalculated totals** ![Cart](./screenshots/05-cart.png) | **Checkout** ![Checkout](./screenshots/06-checkout.png) |
| **Order tracking timeline** ![Order Tracking](./screenshots/07-order-tracking.png) | **Admin fulfillment & analytics dashboard** ![Admin Dashboard](./screenshots/08-admin-dashboard.png) |

---

## Tech Stack

**Frontend:** React.js, React Router, Tailwind CSS, Zustand
**Backend:** Node.js, Express.js
**Database:** MongoDB (Atlas) with Mongoose
**Auth:** JWT (access token + httpOnly refresh-token cookie)
**Payments:** Razorpay
**File uploads:** Multer (customer design/artwork uploads)
**Hosting:** Vercel (frontend) + Render (backend) + MongoDB Atlas (database)

---

## Features

### Customer
- Register / login
- Browse, search, and filter products by category, price, and print type
- View product detail pages
- Customize products: size, color, quantity, print type, print location,
  design/artwork upload
- Cart with live subtotal, tax, shipping, and total
- Checkout and payment via Razorpay
- Order history and real-time order status tracking (timeline view)
- Cancel an order — only available before printing begins

### Admin
- Manage products and categories (CRUD)
- View all customers
- View and filter all orders by status
- Advance order status through the fulfillment workflow (no skipping steps)
- View payment details per order
- Sales dashboard: revenue, order counts by status, low-stock alerts

### Product types
T-Shirts, Hoodies, Caps, Mugs, Bottles, Tote Bags, Stickers
Print types: Screen Printing, DTF Printing, Sublimation, Embroidery, UV Printing

### Order workflow
```
Order Placed → Payment Verified → Design Approved → Printing In Progress
→ Quality Check → Packed → Shipment Created → Shipped → Out for Delivery
→ Delivered
```
Transitions are enforced by a state machine — status can only move forward
one step at a time; customers can cancel only before "Printing In Progress."

---

## Project Structure

```
/client                 React frontend
  /src
    /components          Shared/reusable UI (Button, Modal, Card, Timeline...)
    /features             auth, products, cart, orders, admin
    /layouts               CustomerLayout, AdminLayout
    /routes                Route config, ProtectedRoute, AdminRoute
    /store                 Zustand slices (auth, cart)
    /api                   Axios instance + per-feature API calls

/server                  Express backend
  /config                 DB connection, service config
  /modules                auth, products, categories, cart, orders,
                          payments, shipping, admin
  /middleware              auth (JWT), role-check, error handler, upload
  /utils
  app.js
  server.js
```

---

## Getting Started (local setup)

### Prerequisites
- Node.js 18+
- A MongoDB Atlas connection string (or local MongoDB instance)
- A Razorpay account (test mode is fine) with API keys

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Backend setup
```bash
cd server
npm install
cp .env.example .env    # then fill in the values, see below
npm run dev
```

### 3. Frontend setup
```bash
cd client
npm install
cp .env.example .env    # then fill in the values, see below
npm run dev
```

The frontend runs on `http://localhost:5173` (Vite) and the backend on
`http://localhost:5000` by default — adjust as needed for your setup.

### 4. Seed the database (demo admin + sample products)
```bash
cd server
npm run seed
```

---

## Environment Variables

### `/server/.env`
| Variable | Description |
|---|---|
| `PORT` | Port the Express server runs on (e.g. `5000`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime (e.g. `7d`) |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (test or live — must match secret's mode) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret (same mode as Key ID above) |
| `CLIENT_URL` | Deployed frontend URL, used for CORS (e.g. the Vercel URL) |
| `COOKIE_SAMESITE` | `none` in production (cross-domain), `lax` in local dev |
| `COOKIE_SECURE` | `true` in production, `false` in local dev over http |

### `/client/.env`
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Deployed backend URL (Render), e.g. `https://your-backend.onrender.com/api` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay **public** Key ID only — never the secret |

> ⚠️ Never commit real `.env` files. Only `.env.example` (with placeholder
> values) should be checked into the repository.

---

## API Documentation

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new customer |
| POST | `/api/auth/login` | Public | Log in, returns access token + sets refresh cookie |
| POST | `/api/auth/refresh` | Refresh cookie | Issue a new access token |
| POST | `/api/auth/logout` | Auth required | Clear refresh cookie |
| GET | `/api/auth/me` | Auth required | Get current user |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Public | List products (search, filter, paginate) |
| GET | `/api/products/:id` | Public | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft-delete product |

### Categories
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | Public | List categories |
| POST | `/api/categories` | Admin | Create category |
| PUT / DELETE | `/api/categories/:id` | Admin | Update / remove category |

### Cart
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | Customer | Get current cart (server-recalculated totals) |
| POST | `/api/cart` | Customer | Add item (with customization) |
| PUT | `/api/cart/:itemId` | Customer | Update quantity/customization |
| DELETE | `/api/cart/:itemId` | Customer | Remove item |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | Customer | Create order from cart |
| GET | `/api/orders` | Customer/Admin | List own orders (customer) or all orders (admin) |
| GET | `/api/orders/:id` | Customer/Admin | Order detail |
| PATCH | `/api/orders/:id/status` | Admin | Advance order status (state-machine enforced) |
| PATCH | `/api/orders/:id/cancel` | Customer | Cancel (only before "Printing In Progress") |

### Payments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/create` | Customer | Create a Razorpay order |
| POST | `/api/payments/verify` | Customer | Verify signature, advance order status |

### Shipping
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/shipping/create` | Admin | Create shipment, generate tracking number |
| GET | `/api/shipping/:trackingId` | Public | Track a shipment |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard-stats` | Admin | Revenue, order counts, low-stock products |

---

## Sample Request/Response

**POST `/api/payments/verify`**
```json
// Request
{
  "razorpay_order_id": "order_XXXXXXXXXXXX",
  "razorpay_payment_id": "pay_XXXXXXXXXXXX",
  "razorpay_signature": "generated_signature_hash",
  "orderId": "665f1c2e8a1b2c0012a3f9d1"
}

// Response (200)
{
  "success": true,
  "orderStatus": "Payment Verified",
  "paymentStatus": "Successful"
}
```

---

## Demo Credentials

The live sign-in page includes **one-click demo login buttons** ("Demo Customer" /
"Demo Admin") that auto-fill credentials — a reviewer doesn't need to type
anything. Underlying seeded accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `<seeded admin email>` | `<seeded admin password>` |
| Customer | `customer@threadcraft.com` | `<seeded customer password>` |

> Fill in the actual seeded values from your `seed` script before sharing this README.

---

## Deployment

| Layer | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Root directory: `client` |
| Backend | Render | Root directory: `server` |
| Database | MongoDB Atlas | Network access must allow Render's outbound IPs |
| Payments | Razorpay | Test mode — Key ID/Secret pair must match dashboard mode |

After any environment variable change on Render or Vercel, trigger a
**manual redeploy** — env vars are picked up at build/start time, not live.

---

## License

This project was built as a technical assessment submission.
