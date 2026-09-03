# Web Hosting & Cloud Deployment Guide

This guide details how to deploy both the **Database** (PostgreSQL / MySQL) and the **TypeScript Backend API** to popular cloud platforms.

---

## 1. Cloud Database Provisioning

### A. PostgreSQL Options (Serverless / Managed)
1. **Neon** (https://neon.tech) / **Supabase** (https://supabase.com) / **Railway**:
   - Create a free PostgreSQL database.
   - Obtain the connection URI (e.g., `postgresql://user:pass@ep-cool-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require`).
   - Run the SQL schema and seed data from `database/schema-postgres.sql` using the web SQL editor or psql:
     ```bash
     psql "<YOUR_POSTGRES_CONNECTION_URL>" -f database/schema-postgres.sql
     ```

### B. MySQL Options
1. **PlanetScale** (https://planetscale.com) / **Aiven** / **AWS RDS / Google Cloud SQL**:
   - Create a MySQL 8.0 instance.
   - Run `database/schema-mysql.sql` in your database client or web console.

---

## 2. Deploying the Backend API

### Option A: Render (https://render.com)
1. Push your repository to GitHub / GitLab.
2. Log into Render and click **New +** -> **Web Service**.
3. Connect your repository.
4. Set the build and start commands:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. In the **Environment Variables** tab, add:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `JWT_SECRET=your_super_strong_production_secret`
   - `CLIENT_ORIGINS=https://your-react-app.vercel.app,https://your-angular-app.web.app`
   - `DB_CLIENT=postgres`
   - `PG_HOST=ep-cool-xyz.us-east-1.aws.neon.tech`
   - `PG_PORT=5432`
   - `PG_DATABASE=neondb`
   - `PG_USER=your_db_user`
   - `PG_PASSWORD=your_db_password`

---

### Option B: Railway (https://railway.app)
1. Click **New Project** -> **Deploy from GitHub repo**.
2. Add a PostgreSQL plugin or attach existing external database variables.
3. Configure environment variables in Railway's dashboard.
4. Railway will automatically detect Node.js, run `npm run build`, and launch `npm start`.

---

### Option C: Docker Container Deployment (AWS ECS / GCP Cloud Run / DigitalOcean)
Build and push your Docker image:
```bash
docker build -t your-registry/ecommerce-backend:latest .
docker run -p 5000:5000 --env-file .env your-registry/ecommerce-backend:latest
```

---

## 3. Production Readiness Checklist
- [x] Set strong, unique `JWT_SECRET`.
- [x] Configure exact `CLIENT_ORIGINS` in production to avoid open CORS vulnerabilities.
- [x] Enforce SSL (`rejectUnauthorized: true` or cloud-trusted certs) for remote databases.
- [x] Set `NODE_ENV=production`.
- [x] Mount health check endpoint at `/api/health` for load balancer probes.
