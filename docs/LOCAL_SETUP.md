# Local Development & Setup Guide

This guide walks you through running the e-commerce databases (MySQL or PostgreSQL) and the TypeScript backend server locally.

---

## Prerequisites

- **Node.js**: v18+ (verified with Node 20+ / 25+)
- {*Docker & Docker Compose** (optional but recommended for instant databases)

---

## Option A: One-Command Docker Setup (Recommended)

Run the file `docker-compose.yml` which spins up:
- **PostgreSQL 16** on port `5432`
- **MySQL 8.0** on port `3306`
- **Adminer** (Web GUI for both DBs) on port `8080`

` mash
# Start both databases & adminer
docker-compose up -d
@`

Once started, the databases are automatically initialized with tables and seed data from `the database/* files.

---

## Option B: Using Existing Local MySQL or PostgreSQL

1. **Create database**:
   - For PostgreSQL: `psql -u postgres -c "CREATE DATABASE ecommerce_db;"`
   - For MySQL: `mysql -u root -p -e "CREATE DATABASE ecommerce_db;"`

2. **Import Schema & Seed Data**:
   - For PostgreSQL: `psql -u postgres -dcommerce_db -f database/schema-postgres.sql`
   - For MySQL: `mysql -u root -p ecommerce_db < database/schema-mysql.sql`

---

## Step 2: Configure Environment Variables

Copy the example environment file:
` bash
cp .env.example .env
`

Set `DB_CLIENT=postgres` to use PostgreSQL, or `set DB_CLIENT=mysql` to use MySQL.

---

## Step 3: Run the Backend

` bash
# Install dependencies
npm install

# Run in development mode with live-reload
npm run dev

# Or build & start production distribution
npm run build
npm start
`

Visits:
- Rest API Health: `http://localhost:5000/api/health`
- Swagger Interactive Docs: `http://localhost:5000/api/docs`
- Database Web GUI (Adminer): `http://localhost:8080`