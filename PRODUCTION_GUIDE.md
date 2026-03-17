# Production Deployment Guide - Vijayalakshmi Boyar Matrimony

## 🚀 Quick Start for Production

### Prerequisites
- Node.js 16+ installed
- PostgreSQL database (AWS RDS, Neon, Supabase, or local)
- Domain name (optional, for production URL)

---

## Step 1: Database Setup

### Option A: AWS RDS (Already Configured)
The database is already configured in `backend/.env`:
```
DATABASE_URL="postgresql://vijiadmindb:%234d%23Eyb%5EEX%28b%29@viji-postgres-db.czmeo4s8s2e.ap-south-2.rds.amazonaws.com:5432/postgres?sslmode=require"
```

### Option B: Neon (Free Cloud PostgreSQL)
1. Go to https://neon.tech
2. Create free account and project
3. Copy connection string
4. Update `backend/.env`

### Option C: Supabase (Free Cloud PostgreSQL)
1. Go to https://supabase.com
2. Create new project
3. Get connection string from settings
4. Update `backend/.env`

---

## Step 2: Initialize Database

```bash
# Navigate to backend
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data (optional)
npm run db:seed
```

---

## Step 3: Configure Environment Variables

Create or update `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Server Port
PORT=5001
```

---

## Step 4: Start Backend Server

### Development Mode:
```bash
cd backend
npm run dev
# Backend runs at http://localhost:5001
```

### Production Mode:
```bash
cd backend
npm start
# Or with PM2 for auto-restart:
pm2 start server.js --name matrimony-backend
```

---

## Step 5: Build & Start Frontend

### Development:
```bash
cd frontend
npm start
# Frontend runs at http://localhost:3000
```

### Production Build:
```bash
cd frontend
npm run build
# Creates optimized build in frontend/build/

# Serve with Nginx or similar
```

---

## Step 6: Production Deployment Options

### Option A: VPS (DigitalOcean, AWS EC2, etc.)
1. Upload project files to server
2. Install Node.js and PostgreSQL
3. Configure Nginx as reverse proxy
4. Set up SSL with Let's Encrypt
5. Use PM2 to run Node.js process

### Option B: Vercel + Railway (Easiest)
1. **Frontend**: Deploy `frontend/` to Vercel
2. **Backend**: Deploy `backend/` to Railway/Render
3. **Database**: Use Railway PostgreSQL or Neon

### Option C: Heroku (Simple)
1. Connect GitHub repo to Heroku
2. Add PostgreSQL add-on
3. Deploy with automatic build

---

## Step 7: Verify Production

1. ✅ Backend API responds at `/api/profile/test`
2. ✅ Frontend loads without errors
3. ✅ User registration works
4. ✅ Login/logout works
5. ✅ Profile creation works
6. ✅ Search returns results

---

## Test Credentials (After Seed)

| Role | Email | Password |
|------|-------|----------|
| User | rama.krishna@example.com | password123 |
| User | sowmya.reddy@example.com | password123 |
| Admin | info@vijayalakshmiboyarmatrimony.com | admin123456 |

---

## Phase 2: AI Verification (Optional)

The AI verification is ready in the backend:
- Document validation
- Face matching
- Tamper detection
- AI recommendations

To enable Phase 2, you need to:
1. Integrate frontend verification page
2. Set up ID document upload
3. Connect to AI services

---

## Support

- **Email**: info@vijayalakshmiboyarmatrimony.com
- **Phone**: +91 7639150271

---

## Project Summary

| Component | Technology | Status |
|-----------|------------|--------|
| Backend | Node.js + Express | ✅ Ready |
| Database | PostgreSQL + Prisma | ✅ Ready |
| Frontend | React + Material-UI | ✅ Ready |
| Auth | JWT | ✅ Ready |
| Payments | Razorpay + PhonePe | ✅ Ready |
| AI Verification | Backend Ready | 🚀 Phase 2 |

**Ready for production deployment!** 🎉
