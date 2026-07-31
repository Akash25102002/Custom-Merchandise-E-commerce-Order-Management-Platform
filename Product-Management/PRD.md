# Product Requirement Document (PRD)
## Enterprise Custom Merchandise E-Commerce & Order Management Platform

---

## 1. Executive Summary
The Custom Merchandise E-Commerce & Order Management Platform is an end-to-end digital merchandise solution designed to streamline the design, customization, ordering, payment, printing, and delivery of custom apparel and hard goods. By providing a real-time 2D artwork customization engine, automated pricing algorithms, and a strict sequential order workflow state machine, the platform bridges the gap between customer order placement and factory printing execution.

---

## 2. Project Vision
To become the premier enterprise e-commerce platform for custom merchandise, providing small businesses, content creators, event organizers, and corporate brands with a frictionless, transparent, and high-quality customization and fulfillment experience.

---

## 3. Problem Statement
Traditional custom merchandise ordering suffers from:
1. Manual quote generation and slow proof approval processes.
2. Inconsistent pricing based on artwork placement, size, and printing technique.
3. Lack of real-time status visibility during production (printing, quality check, packaging).
4. High rate of order errors due to miscommunication between customers and printing technicians.

---

## 4. Goals & Business Objectives
- **Automate Customization & Pricing**: Calculate precise cost based on garment base price, print technique (Screen, DTF, Embroidery, UV, Sublimation), placement location, and quantity.
- **Enforce Sequential Production Workflow**: Eliminate skipped steps in order manufacturing via a strict state machine.
- **Enhance Customer Transparency**: Provide real-time milestone tracking for order printing and shipping status.
- **Achieve 99.9% Fulfillment Accuracy**: Eliminate manual proof misinterpretation via automated digital artwork storage and metadata mapping.

---

## 5. Success Metrics (KPIs)
- **Customer Conversion Rate**: > 4.5% from product customization page to cart checkout.
- **Order Production Cycle Time**: Reduction of average fulfillment time from 7 days to 3 days.
- **Proof Approval Time**: Immediate digital preview rendering reducing proof approval delay to zero.
- **Customer Support Tickets**: < 2% of total orders regarding order status inquiries due to real-time tracking timeline.

---

## 6. User Personas

### Persona A: Corporate Event Organizer ("David")
- **Role**: HR Lead ordering 200 branded hoodies for a company retreat.
- **Needs**: Bulk pricing discounts, clear print location previews, transparent tax invoice generation, and reliable delivery estimates.
- **Pain Points**: Unexpected print setup fees and delayed updates on shipment delivery.

### Persona B: Independent Content Creator ("Maya")
- **Role**: Creator selling limited edition custom tote bags & t-shirts.
- **Needs**: Easy artwork upload (PNG/SVG), small minimum order quantities, high-resolution preview rendering.
- **Pain Points**: Complex ordering interfaces and poor print quality assurance.

### Persona C: Print Shop Production Manager ("Alex")
- **Role**: Admin managing printing machinery, design approvals, and shipping dispatch.
- **Needs**: Sequential workflow dashboard, clear artwork download links, stock level alerts, and shipment label generation.
- **Pain Points**: Skipping quality control steps, lost physical print job cards.

---

## 7. Functional Requirements

### 7.1 User Management & Authentication
- **Registration & Login**: Customer and Admin authentication via JWT Access and Refresh Tokens.
- **Role-Based Access Control (RBAC)**: Enforce strict role validation (`customer` vs `admin`).
- **Profile Management**: Saved shipping addresses, profile details, and account security.

### 7.2 Catalog & Product Management
- **Product Categories**: Support T-Shirts, Hoodies, Caps, Mugs, Bottles, Tote Bags, Stickers.
- **Product Variants**: Size (S, M, L, XL, XXL), Color, SKU, Stock, and Pricing.
- **Print Technique Assignment**: Assign permitted print techniques (Screen Printing, DTF, Embroidery, UV, Sublimation) per product category.

### 7.3 Product Customization Engine
- **Artwork Upload**: High-resolution PNG/SVG upload to Cloudinary.
- **Print Placement Selector**: Front, Back, Left Chest, Right Sleeve, Full Wrap.
- **2D Preview Canvas**: Real-time visual overlay of artwork on product mockup.
- **Dynamic Price Engine**: Base Price + (Print Technique Fee * Placement Count) * Quantity - Bulk Discount.

### 7.4 Shopping Cart & Checkout
- **Cart Engine**: Prevent duplicate items, calculate subtotal, estimated tax, shipping fee, and coupon discounts.
- **Checkout Engine**: Address selection, coupon code validation, order summary verification, and mock/Razorpay gateway launch.

### 7.5 Payment Processing
- **Mock Payment Engine**: Simulated transaction processing with Instant Success, Failure, and Pending states.
- **Razorpay Integration**: Cryptographic signature verification (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`) and Webhook listener.
- **Transaction Logs**: Audit log of all payment attempts and refund records.

### 7.6 Sequential Order Workflow Engine
- Enforce strict sequential status transitions:
  1. `Order Placed`
  2. `Payment Verified`
  3. `Design Approved`
  4. `Printing In Progress`
  5. `Quality Check`
  6. `Packed`
  7. `Shipment Created`
  8. `Shipped`
  9. `Out For Delivery`
  10. `Delivered`
- **Rules**: Skipping states is programmatically prevented. State transitions log timestamp and operator ID.

### 7.7 Shipping & Live Tracking Timeline
- **Shipment Generation**: Courier assignment (Shiprocket / Delhivery / Mock Provider), tracking number generation, estimated delivery date.
- **Tracking Timeline**: Visual visual stepper showing Completed, Current, and Upcoming milestones.

### 7.8 Admin Control Panel
- **Executive Dashboard**: Real-time revenue metrics, order status counters, low stock alerts, and production queue manager.
- **Customer & Inventory Control**: Product CRUD, stock adjustments, category management, coupon generation.

---

## 8. Non-Functional Requirements
- **Performance**: API response time < 200ms; page load speed < 1.5s.
- **Scalability**: Stateless JWT auth and MongoDB indexing supporting 10,000+ concurrent requests.
- **Security**: OWASP compliance, Password hashing via Bcrypt (salt round 10), Helmet security headers, Express Rate Limiting (100 req/15 min), CORS whitelist.
- **Availability**: 99.9% uptime architecture.
- **Data Integrity**: Acid compliant transactions for order placement and stock deduction.

---

## 9. Business Rules
1. **Cancellation Rule**: Customers may cancel an order ONLY BEFORE the status transitions to `Printing In Progress`.
2. **Artwork Resolution Rule**: Uploaded artwork files must not exceed 10MB and must be in image format (PNG, JPG, SVG, WEBP).
3. **Discount Rule**: Coupons cannot be stacked; maximum discount capped at 50% of subtotal.
4. **State Machine Rule**: Admins cannot move an order to `Delivered` without completing `Shipped` and `Out For Delivery`.

---

## 10. Assumptions & Constraints
- **Assumptions**: Users have modern browsers with HTML5 Canvas / WebGL capabilities for product preview.
- **Constraints**: Third-party payment gateways require valid API keys; production image storage depends on Cloudinary API quota.

---

## 11. User Stories & Acceptance Criteria

### US-1: Customer Registration & Authentication
- **As a** Customer, **I want to** create an account with my email and password **so that** I can track my orders and save customization preferences.
- **Acceptance Criteria**:
  - Email must be unique and properly validated.
  - Password must be hashed before storage.
  - Returns JWT Access Token and sets Refresh Token upon successful login.

### US-2: Interactive Product Customization
- **As a** Customer, **I want to** select my apparel size, color, upload custom artwork, and choose print locations **so that** I can see a preview and price before ordering.
- **Acceptance Criteria**:
  - Preview canvas instantly updates when color or placement changes.
  - Price dynamically updates based on placement count and print technique.
  - Customization details are saved cleanly inside the cart object.

### US-3: Order Printing Lifecycle Management
- **As an** Admin, **I want to** update order fulfillment states sequentially **so that** factory technicians follow strict quality guidelines.
- **Acceptance Criteria**:
  - System rejects out-of-order state transitions with HTTP 400.
  - Email notification and database audit trail triggered on state change.

---

## 12. MVP Scope vs Future Scope

### MVP Scope (Phases 1-18)
- Complete MERN stack implementation with full Product CRUD.
- Artwork upload and price calculation engine.
- Cart, Checkout, Coupon Engine, and Mock + Razorpay Payment.
- Sequential Order Workflow state machine and Tracking Timeline UI.
- Admin Analytics Dashboard and Inventory Management.
- Docker Compose, Jest unit tests, and OpenAPI/Swagger Documentation.

### Future Scope
- 3D WebGL Product Canvas Renderer.
- Automated AI Background Removal for uploaded artwork.
- Multi-vendor Print Shop Marketplace integration.

---

## 13. Milestones & Development Timeline

| Milestone | Deliverables | Target Completion |
| :--- | :--- | :--- |
| **M1: Foundation & Specs** | PRD, Architecture.md, DesignSystem.md, TASKS.md | Phase 1 - 4 |
| **M2: Database & Auth Engine** | MongoDB Mongoose schemas, JWT Refresh Token System, RBAC | Phase 5 - 6 |
| **M3: Frontend Design & Catalog** | Design tokens, Layouts, Product Catalog, Search & Filter | Phase 7 - 8 |
| **M4: Customization & Cart** | Artwork upload, Canvas preview, Dynamic pricing, Cart engine | Phase 9 |
| **M5: Payments & Orders** | Mock + Razorpay Gateway, Sequential Workflow State Engine | Phase 10 - 11 |
| **M6: Shipping & Admin** | Tracking Timeline, Admin Control Panel & Revenue Analytics | Phase 12 - 13 |
| **M7: DevOps & Delivery** | Docker Compose, API Tests, Swagger Docs, Final Verification | Phase 14 - 18 |

---

## 14. Risk Analysis & Mitigation Strategies
- **Risk 1**: Invalid State Transition by Admin Operators.
  - *Mitigation*: Programmatic state machine middleware verifying `ALLOWED_TRANSITIONS[currentStatus]`.
- **Risk 2**: Payment Webhook Fraud / Replay Attacks.
  - *Mitigation*: HMAC SHA256 signature verification on all incoming webhook payloads.
- **Risk 3**: Slow Image Rendering.
  - *Mitigation*: Cloudinary transformation URLs for thumbnail compression.

---

## 15. Testing & Deployment Strategy
- **Unit & Integration Testing**: Jest + Supertest for backend controllers and repositories.
- **Frontend Testing**: React Testing Library for Context state and Form validation.
- **Containerization**: Docker Compose orchestrating Node.js API container, MongoDB container, and Nginx frontend server.
