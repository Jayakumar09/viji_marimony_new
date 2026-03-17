# Vercel + Railway Deployment Guide
## Domain: vijayalakshmiboyarmatrimony.com

---

## Architecture

```
                    ┌─────────────────────┐
                    │   Frontend (Vercel) │
                    │  vijayalakshmiboyarmatrimony.com
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Backend (Railway) │
                    │   matrimony-backend  │
                    │   .railway.app       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Database (Railway) │
                    │   PostgreSQL        │
                    └─────────────────────┘
```

---

## Step 1: Prepare for Deployment

### Update Backend for Railway

1. **Create Railway.json** (optional but helpful):
```bash
# In backend folder, create railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Update CORS in server.js**:
```javascript
// Allow Vercel frontend
const corsOptions = {
  origin: [
    'https://vijayalakshmiboyarmatrimony.com',
    'https://www.vijayalakshmiboyarmatrimony.com',
    /\.vercel\.app$/
  ],
  credentials: true
};
```

3. **Update .env for Railway**:
```env
# Database - Railway will provide this
DATABASE_URL="railway-provided-url"

# Generate new secrets
JWT_SECRET=super-secret-$(openssl rand -hex 32)
JWT_REFRESH_SECRET=refresh-secret-$(openssl rand -hex 32)

# Frontend URL
FRONTEND_URL=https://vijayalakshmiboyarmatrimony.com
CORS_ORIGIN=https://vijayalakshmiboyarmatrimony.com

# Keep Cloudinary, SMTP, etc.
```

---

## Step 2: Deploy to Railway

### 2.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project

### 2.2 Add PostgreSQL Database
1. In Railway dashboard → New Project
2. Select "Provision PostgreSQL"
3. Wait for database to be ready

### 2.3 Deploy Backend
1. In Railway dashboard → New Project
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Select the `backend` folder or configure root
5. Add environment variables:
   - `DATABASE_URL` (from PostgreSQL service)
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `FRONTEND_URL`
   - `CORS_ORIGIN`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
6. Click Deploy

### 2.4 Get Backend URL
After deployment, Railway provides a URL like:
```
https://matrimony-backend-production.up.railway.app
```

---

## Step 3: Deploy to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your repository

### 3.2 Configure Frontend
1. In Vercel dashboard → Import Project
2. Select your repository
3. Configure:
   - **Framework Preset**: React (or Create React App)
   - **Root Directory**: `frontend` (or `.` if monorepo)
   - **Build Command**: `npm run build` or `react-scripts build`
   - **Output Directory**: `build` or `dist`

### 3.3 Add Environment Variables
```
REACT_APP_API_URL=https://matrimony-backend-production.up.railway.app
```

### 3.4 Deploy
Click Deploy! 🎉

---

## Step 4: Configure Domain

### 4.1 Add Domain to Vercel
1. In Vercel dashboard → Project → Settings → Domains
2. Add: `vijayalakshmiboyarmatrimony.com`
3. Follow Vercel's DNS instructions

### 4.2 Update DNS Records
Add these records to your domain registrar (GoDaddy, Namecheap, etc.):

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | cname.vercel-dns.com |
| CNAME | www | cname.vercel-dns.com |

### 4.3 Wait for Propagation
DNS changes can take up to 24 hours (usually minutes).

---

## Step 5: Update Backend Environment

After getting your domain, update Railway:
```
FRONTEND_URL=https://vijayalakshmiboyarmatrimony.com
CORS_ORIGIN=https://vijayalakshmiboyarmatrimony.com
```

Redeploy backend to apply changes.

---

## Step 6: Test Production

Visit: https://vijayalakshmiboyarmatrimony.com

Test:
- [ ] Homepage loads
- [ ] Registration works
- [ ] Login works
- [ ] Profile creation works
- [ ] Photo upload works
- [ ] Search works

---

## Cost Estimate (Railway + Vercel)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway PostgreSQL | 500MB storage | $5/mo |
| Railway Backend | 500MB RAM, 1GB disk | $5/mo |
| Vercel Frontend | 100GB bandwidth | $20/mo |

**Total: ~$10-25/month**

---

## Troubleshooting

### Backend 502 Error
- Check Railway logs
- Verify DATABASE_URL is correct
- Ensure all env variables are set

### CORS Errors
- Update CORS_ORIGIN in Railway
- Redeploy backend

### Images Not Loading
- Check Cloudinary keys in Railway
- Verify CLOUDINARY_URL or individual keys

### Database Connection Failed
- Check DATABASE_URL format
- Verify PostgreSQL is running

---

## Quick Commands

```bash
# Railway CLI install
npm install -g railway

# Login
railway login

# Link project
railway init

# View logs
railway logs

# Open dashboard
railway open
```

---

## Support

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Email: info@vijayalakshmiboyarmatrimony.com

---

**Ready to deploy!** 🚀
