# Enterprise Custom Merchandise E-Commerce & Order Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v19.x-blue.svg)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

A production-ready, full-stack MERN (MongoDB, Express, React, Node.js) platform designed for custom merchandise businesses. Features an interactive 2D artwork canvas customizer, dynamic pricing calculations, strict sequential order printing lifecycle state machine, integrated Mock & Razorpay payment verification, real-time tracking timeline UI, and an executive Admin Control Panel.

---

## 📸 Key Capabilities & Features

1. **User Authentication & RBAC**: Short-lived JWT Access Tokens, 7-day Refresh Tokens, password salt hashing (`bcryptjs`), and Role-Based Access Controls (`customer` vs `admin`).
2. **Catalog & Product Management**: Full Product CRUD, multi-image upload via Cloudinary, SKU uniqueness checks, stock management, and garment sizing/color options.
3. **Interactive 2D Customization Engine**: Select print technique (Screen, DTF, Embroidery, UV, Sublimation), placement (Front, Back, Both), upload custom logos, and recalculate unit prices dynamically.
4. **Persistent Shopping Cart**: Deduplication signature hashing based on custom configuration parameters.
5. **Payment Gateway Integration**: Mock Payment Engine + Razorpay signature verification with cryptographic HMAC SHA256 validation.
6. **Strict Sequential Order Workflow State Machine**: Programmatically enforced state transitions:
   `Pending` ➔ `Payment Confirmed` ➔ `Production` ➔ `Quality Check` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`
7. **Live Order Tracking Timeline**: Visual milestone stepper UI with date/time stamps.
8. **Admin Control Panel**: Executive revenue analytics, order queue manager, low stock alerts.
9. **DevOps Ready**: Production Docker Compose configuration with Nginx reverse proxy.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router v6, Axios with Interceptors, React Hook Form, Context API.
- **Backend**: Node.js, Express.js (MVC + Repository-Service Pattern), Mongoose ORM, JWT, Bcryptjs, Multer, Cloudinary SDK.
- **Database**: MongoDB (Mongoose ORM) with local JSON file fallback for offline execution.
- **DevOps**: Docker, Docker Compose, Nginx, Helmet Security Headers, Express Rate Limiting.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/custom-merchandise-platform.git
cd custom-merchandise-platform

# Install root, backend, and frontend dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` inside `backend/`:
```env
PORT=8000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/custom_merchandise
ACCESS_TOKEN_SECRET=merch_secret_jwt_key_983749823749823
REFRESH_TOKEN_SECRET=merch_refresh_secret_jwt_key_88472910384729
CORS_ORIGIN=*
```

### 3. Run Development Servers
```bash
# Start backend server (Port 8000)
npm run dev

# Start frontend Vite server (Port 3000 / 3001) in a separate terminal
npm run dev:frontend
```

---

## 🐳 Docker Deployment

Run the complete production stack using Docker Compose:
```bash
docker-compose up --build -d
```
- **Frontend App**: `http://localhost`
- **Backend API**: `http://localhost/api`
- **Health Check**: `http://localhost/health`

---

## 📁 Repository Structure

```
.
├── Product-Management/         # PRD specifications and user stories
│   └── PRD.md
├── docs/                       # System Architecture & Design System specifications
│   ├── Architecture.md
│   └── DesignSystem.md
├── docker/                     # Docker containers & Nginx proxy setup
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── backend/                    # Node.js & Express REST API Server
│   ├── src/
│   │   ├── config/             # DB connection & fallbacks
│   │   ├── controllers/        # Request & Response logic
│   │   ├── middlewares/        # Auth, JWT, Error Handling & Uploads
│   │   ├── models/             # Mongoose DB Schemas
│   │   ├── repositories/       # Data Access Abstraction Layer
│   │   ├── routes/             # API Router definitions
│   │   ├── services/           # Core Business Logic & State Machines
│   │   └── validators/         # Express-validator input schemas
│   └── data/                   # Local JSON database storage
├── frontend/                   # React + Vite Single Page Application
│   ├── src/
│   │   ├── components/         # Reusable UI Primitives & Customizer Canvas
│   │   ├── context/            # AuthContext & CartContext stores
│   │   ├── layouts/            # ClientLayout & AdminLayout wrappers
│   │   ├── pages/              # Storefront, Customizer, Cart, Checkout, Orders, Admin
│   │   └── services/           # Axios API Client with interceptors
├── TASKS.md                    # Completed Feature Execution Tracker
├── docker-compose.yml          # Container orchestration manifest
└── README.md
```

---

## 📡 API Reference Overview

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new user account |
| `/api/auth/login` | `POST` | Public | Authenticate user & issue JWT tokens |
| `/api/auth/me` | `GET` | JWT | Get current user profile |
| `/api/products` | `GET` | Public | Search, filter, and paginate catalog |
| `/api/products` | `POST` | Admin | Create product with image upload |
| `/api/orders` | `POST` | JWT | Place order & calculate server-side totals |
| `/api/orders/my-orders` | `GET` | JWT | Fetch customer order history |
| `/api/orders/:id/status` | `PATCH` | Admin | Transition order status with sequential verification |

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
