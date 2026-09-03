# 🛒 E-Commerce Backend & Multi-Database Engine

A production-ready, clean-architecture E-Commerce REST API written in TypeScript/Node.js with support for **PostgreSQL** and **MySQL**, designed to seamlessly power modern **React** and **Angular** applications.

---

## 🌟 Key Features

- **Dual-Database Support**: Switch between **PostgreSQL 16** and **MySQL 8.0** simply by changing `DB_CLIENT=postgres` or `DB_CLIENT=mysql` in `.env`.
- **Complete E-Commerce Domains**:
  - **Auth & Users**: JWT authentication, bcrypt hashing, addresses, roles (`CUSTOMER`, `ADMIN`).
  - **Catalog**: Hierarchical categories, brands, products with SKU/stock, image galleries, price ranges, search, and sorting.
  - **Shopping Cart**: Guest session tokens, authenticated user carts, and automatic guest cart merging on login.
  - **Orders & Checkout**: Order numbers, transactional stock reservation, tax & shipping calculation.
  - **Payments**: Mock/Stripe/PayPal payment intents and status webhooks.
  - **Reviews**: Verified purchase reviews, star ratings, and automatic product rating aggregate recalculation.
- **Frontend-Ready**: Pre-configured CORS for React (`:3000`, `:5173`) and Angular (`:4200`).
- **Interactive Documentation**: Swagger UI mounted at `/api/docs`.

---

## 📁 Project Structure

```
ecommerce-backend/
├── database/
│   ├── schema-mysql.sql          # MySQL 8.0 DDL & seed data
│   └── schema-postgres.sql       # PostgreSQL 16 DDL & seed data
├── docs/
│   ├── ARCHITECTURE.md           # Architecture design & database strategy
│   ├── LOCAL_SETUP.md            # Step-by-step local development & Docker guide
│   ├── WEB_HOSTING.md            # Cloud deployment (Render, Railway, Neon, etc.)
│   └── FRONTEND_INTEGRATION_GUIDE.md # Copy-paste React & Angular integration code
├── src/
│   ├── config/                   # Type-safe environment variables
│   ├── database/                 # Dynamic Knex client & schema initializers
│   ├── middlewares/              # JWT auth, Zod validation, global error handling
│   ├── modules/
│   │   ├── auth/                 # Authentication (register, login, profile)
│   │   ├── users/                # User management & addresses
│   │   ├── products/             # Product catalog, categories, brands
│   │   ├── cart/                 # Shopping cart & guest session merging
│   │   ├── orders/               # Checkout, inventory locking, order tracking
│   │   ├── payments/             # Payment intents & webhooks
│   │   └── reviews/              # Product reviews & ratings
│   ├── routes/                   # Central API router
│   ├── types/                    # Unified domain TypeScript interfaces
│   ├── utils/                    # Password hashing, JWT, standard response helpers
│   ├── app.ts                    # Express application configuration
│   └── server.ts                 # Server entrypoint
├── docker-compose.yml            # Postgres, MySQL, and Adminer web GUI
├── package.json
└── tsconfig.json
```

---

## 🚀 Quick Start

### 1. Start the Databases (Docker)
```bash
docker-compose up -d
```
*PostgreSQL runs on `:5432`, MySQL on `:3306`, and Adminer Web GUI on `:8080`.*

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Install & Run
```bash
npm install
npm run dev
```

Open [http://localhost:5000/api/docs](http://localhost:5000/api/docs) to explore all endpoints in Swagger UI.

---

## 📚 Documentation Links
- [Architecture & Design Details](docs/ARCHITECTURE.md)
- [Local Setup Guide](docs/LOCAL_SETUP.md)
- [Web Hosting & Cloud Deployment](docs/WEB_HOSTING.md)
- [React & Angular Integration Guide](docs/FRONTEND_INTEGRATION_GUIDE.md)
