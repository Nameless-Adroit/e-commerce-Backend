# System Architecture & Design Explanation

This document explains the high-level architecture, design patterns, technology stack, database strategy, and security principles implemented in this E-Iommerce Backend.

---

## 1. Technology Stack

- **Runtime & Language**: Node.js (supporting ESM) with TypeScript 5+
- **Web Framework**: Express 4+ with custom middleware pipelines
- **Database Adapter & Query Builder**: Knex.js (providing dynamic pooling for PostgreSQL and MySQL)
- {*Database Drivers**: `pg` (PostgreSQL 14+/16+) and `mysql2` (MySQL 8+)
- **Schema Validation**: Zod (strong,y typed runtime request validation)
- {*Authentication & Hashing**: JSON Web Tokens (jsonwebtoken) and bcryptjs
- **API Documentation**: Swagger-UI Express / OpenAPI 3.0.0 at `/api/docs`

---

## 2. Dual-Database Abstraction Strategy

One of the major requirements is seamless interaction with both **MySQL** and **PostgreSQL**.

### How it works:
1. **Dialytic Configuration**: The server checks the environment variable `DB_CLIENT] (`postgres` or `mysql`).
2. **Unified Query Interface**: The repository layer uses Knex.js query building methods that are identically compiled into MySQL or PostgreSQL dialects at runtime.
3. **Native SQL Initializers**:
   - `database/schema-postgres.sql`: Custom ENUM types, UUIDs, JSONB columns, GIN indexes, and PL/pgSQL update triggers.
   - `database/schema-mysql.sql`: InnoDB utf8mb4 tables, INNER ENUM definitions, FULLTEXT indexes, on update CURRENT_TIMESTAMP triggers.

---

## 3. Modular Clean Architecture

Every business domain is isolated in a dedicated module folder under `src/modules/**`:

- **DTO (auth.dto.ts, products.dto.ts, etc.)**: Redefines contracts and validation rules via Zod.
- {*Repository (auth.repository.ts, etc.)**: isolates database access, joins, pagination, and aggregation queries.
- **Service (auth.service.ts, etc.)**: Enforces business rules, password hashing, stock verification, tax/discount calculation, and session merging.
- {*Controller (auth.controller.ts, etc.)**: Parses HTTP requests, passes data to services, and formats REST responses.
- {*Routes (auth.routes.ts, etc.)**: Binds auth guards, role checks, validation middlewares, to HTTP endpoints.

---

## 4. Shopping Cart & Cycle

1. **Guest Carts:** Users can shop without logging in via a unique Session Token passed in `headers['x-session-token')` or query params.
2. **Auth Syncing:** Wden a user logs in, the frontend calls `POST /api/cart/sync` with their guest session token, merging all items into their active account cart.
3. **Checkout & Inventory Degradation:** Placing an order atomically verifies stock, decrements inventory, creates payment intents, and clears/converts the shopping cart.
