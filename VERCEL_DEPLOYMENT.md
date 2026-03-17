# Vercel Deployment Guide

## Overview
This guide covers how to deploy the Vijayalakshmi Boyar Matrimony frontend to Vercel.

---

## Prerequisites
1. Vercel account (sign up at https://vercel.com)
2. GitHub repository with the project
3. Backend deployed (Railway, Render, or other)

---

## Step 1: Environment Variables

Before deploying, you need to set these environment variables in Vercel:

### Required Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend-url.up.railway.app/api` | Your backend API URL |

### How to Add Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: Your backend URL (e.g., `https://matrimony-backend-production.up.railway.app/api`)
4. Click **Save**

---

## Step 2: Deploy to Vercel

### Option A: Deploy from Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App (or React)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (or `react-scripts build`)
   - **Output Directory**: `build`
5. Add the environment variable (`REACT_APP_API_URL`)
6. Click **Deploy**

### Option B: Deploy from CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your team name
# - Want to override settings? No
```

---

## Step 3: Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain (e.g., `vijayalakshmiboyarmatrimony.com`)
3. Update DNS records as instructed by Vercel

---

## Step 4: Verify Deployment

1. Visit your Vercel URL
2. Check that:
   - Homepage loads correctly
   - Login/Register works
   - API calls are working (check browser console for errors)

---

## Common Issues & Solutions

### Issue 1: Blank Page After Deployment
**Cause**: React Router routing not configured properly
**Solution**: The `vercel.json` file handles this. Make sure it's in the `frontend` folder.

### Issue 2: API Calls Failing
**Cause**: `REACT_APP_API_URL` not set or incorrect
**Solution**: 
1. Check that the environment variable is set in Vercel
2. Verify the backend URL is correct and accessible
3. Check browser console for CORS errors

### Issue 3: Build Failed
**Cause**: Native dependencies (like `better-sqlite3`) in frontend
**Solution**: Already fixed - removed `better-sqlite3` from frontend dependencies

### Issue 4: Images Not Loading
**Cause**: Cloudinary configuration issues
**Solution**: Verify Cloudinary keys are set in the backend

---

## Architecture

```
                    ┌─────────────────────┐
                    │   Frontend (Vercel) │
                    │  your-app.vercel.app│
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Backend (Railway) │
                    │   your-backend      │
                    │   .railway.app      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Database (Railway) │
                    │   PostgreSQL        │
                    └─────────────────────┘
```

---

## Post-Deployment Checklist

- [ ] Homepage loads
- [ ] User registration works
- [ ] Login/logout works
- [ ] Profile creation works
- [ ] Photo upload works
- [ ] Search functionality works
- [ ] Mobile responsive design works

---

## Support

- Vercel Docs: https://vercel.com/docs
- Project Email: info@vijayalakshmiboyarmatrimony.com
