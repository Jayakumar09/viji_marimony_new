# Render + Vercel Deployment Guide

## Architecture

```
                    ┌─────────────────────┐
                    │   Frontend (Vercel) │
                    │  viji-marimony-bpagfyjkk-jayakumar09s-projects.vercel.app
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Backend (Render)  │
                    │   viji-marimony-backend.onrender.com
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Database (Render)  │
                    │   PostgreSQL        │
                    └─────────────────────┘
```

---

## Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Create a new Web Service

### 1.2 Configure Backend Service
1. **Build Command**: `npm install`
2. **Start Command**: `node server.js`
3. **Environment**: Node
4. **Plan**: Free (or paid as needed)

### 1.3 Add Environment Variables

Add these in Render dashboard:

```
NODE_ENV=production
PORT=10000

# Database - Create PostgreSQL in Render and get the URL
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Configuration - Generate secure secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend URL (Vercel)
FRONTEND_URL=https://viji-marimony-bpagfyjkk-jayakumar09s-projects.vercel.app
CORS_ORIGIN=https://viji-marimony-bpagfyjkk-jayakumar09s-projects.vercel.app

# Backend URL (this will be your Render URL after deployment)
BACKEND_URL=https://viji-marimony-backend.onrender.com
SERVER_URL=https://viji-marimony-backend.onrender.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=do6o1xqs1
CLOUDINARY_API_KEY=A3O6QFL4uzHeuSOs1eWC-z1zDuQ
CLOUDINARY_API_SECRET=your-actual-cloudinary-secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+17624726509

# PhonePe (if using)
PHONEPE_ENVIRONMENT=sandbox
PHONEPE_MERCHANT_ID=PGTESTPAYUAT86
PHONEPE_MERCHANT_KEY=96434309-7796-489d-8924-ab56988a6076

# AI Verification (optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=ap-south-1

# Encryption
ENCRYPTION_KEY=your-32-char-encryption-key
```

### 1.4 Get Your Render Backend URL
After deployment, Render will provide a URL like:
```
https://viji-marimony-backend.onrender.com
```

**Note**: For free tier, the service sleeps after 15 minutes of inactivity. First request after sleep will take ~30 seconds to wake up.

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Configure Vercel
1. Go to https://vercel.com
2. Import your repository
3. Configure:
   - **Framework Preset**: React (Create React App)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.2 Add Environment Variables

```
REACT_APP_API_URL=https://viji-marimony-backend.onrender.com
```

### 2.3 Deploy
Click Deploy! 🎉

---

## Step 3: Verify CORS Configuration

The backend server.js already includes:
- `/.vercel\.app$/` - Allows all Vercel frontends
- `/.render\.app$/` - Allows all Render backends
- `https://viji-marimony-bpagfyjkk-jayakumar09s-projects.vercel.app` - Your specific Vercel frontend

---

## Step 4: Test Production

Visit: https://viji-marimony-bpagfyjkk-jayakumar09s-projects.vercel.app

Test:
- [ ] Homepage loads
- [ ] Registration works
- [ ] Login works
- [ ] Profile creation works
- [ ] Photo upload works (check Cloudinary)
- [ ] Search works

---

## Important Notes

### Database
- For production, use Render's PostgreSQL (not SQLite)
- Update `DATABASE_URL` in Render environment variables
- Run migrations: `npx prisma migrate deploy`

### File Storage
- Images are stored in Cloudinary (already configured)
- Static files served from Render backend

### Cold Start (Free Tier)
- Render's free tier puts services to sleep after 15 min
- First request after sleep takes 30-60 seconds
- Consider upgrading to paid plan for production

---

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` and `CORS_ORIGIN` are set in Render
- Check that backend allowedOrigins includes your Vercel URL

### 502 Error on Render
- Check Render logs
- Verify `npm install` and `node server.js` commands work
- Ensure DATABASE_URL is correct

### Images Not Loading
- Verify Cloudinary keys in Render
- Check CLOUDINARY_URL or individual keys

### Database Connection Failed
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure migrations ran successfully

---

## Quick Commands

```bash
# Render CLI
npm install -g @render/cli

# Login
render login

# View logs
render logs --service viji-marimony-backend

# Open dashboard
render dashboard
```

---

## Cost Estimate

| Service | Free Tier | Paid |
|---------|-----------|------|
| Render PostgreSQL | 90 days, 512MB | $7/mo |
| Render Web Service | 750 hours | $7/mo |
| Vercel Frontend | 100GB bandwidth | $20/mo |

**Free Tier Total: ~$0/month (with limitations)**
**Production Total: ~$15-25/month**

---

**Ready to deploy!** 🚀
