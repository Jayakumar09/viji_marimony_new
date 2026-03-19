# Cloudflare Migration Plan

## Executive Summary

This document outlines the complete migration strategy for moving the Vijayalakshmi Boyar Matrimony application from Vercel/Render/PostgreSQL to Cloudflare's ecosystem.

### Current Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │     │   Render        │     │   AWS RDS       │
│   (Frontend)    │────▶│   (Express.js)  │────▶│   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   External      │
                        │   Services      │
                        │   - Cloudinary  │
                        │   - Twilio      │
                        │   - AWS         │
                        │   - Razorpay    │
                        └─────────────────┘
```

### Target Architecture
```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│   Cloudflare Pages  │     │   Cloudflare        │     │   Cloudflare D1 │
│   (React Frontend)  │────▶│   Workers           │────▶│   (SQLite)      │
└─────────────────────┘     │   (Hono Backend)    │     └─────────────────┘
                            └─────────────────────┘
                                       │
                                       ▼
                                ┌─────────────────┐
                                │   External      │
                                │   Services      │
                                │   - Cloudinary  │
                                │   - Twilio      │
                                │   - AWS         │
                                │   - Razorpay    │
                                └─────────────────┘
```

---

## Phase 1: Cloudflare D1 Database Setup

### 1.1 Prerequisites
- Cloudflare account with D1 enabled
- Wrangler CLI installed (`npm install -g wrangler`)
- Access to existing PostgreSQL database for data export

### 1.2 D1 Configuration

Cloudflare D1 is PostgreSQL-compatible but uses SQLite at the core. We'll use the libSQL driver with Prisma.

**Key Changes to Prisma Schema:**
```prisma
// Before (postgresql)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// After (libSQL for D1)
datasource db {
  provider = "sqlite"  // D1 uses SQLite API
  url      = env("DATABASE_URL")
}
```

**Note:** D1 has some limitations:
- Maximum database size: 50GB (Free), 150GB (Paid)
- No foreign key constraints enforced (need to handle in application code)
- Some PostgreSQL features not available (e.g., JSONB, Array types)

### 1.3 Data Migration Strategy

1. **Export from PostgreSQL**: Use pg_dump or Prisma's migrate to export
2. **Transform Data**: Convert PostgreSQL-specific types to SQLite-compatible
3. **Import to D1**: Use wrangler d1 execute or import SQL file

---

## Phase 2: Cloudflare Workers Backend

### 2.1 Framework Selection

We'll use **Hono** framework instead of Express.js because:
- Native TypeScript support
- Extremely lightweight (~15KB)
- Works seamlessly in Cloudflare Workers, Deno, Bun, Node.js
- Similar API to Express (easy migration)

### 2.2 Architecture Changes

| Express.js | Hono/Workers |
|------------|--------------|
| `app.get()` | `app.get('/', (c) => c.text('Hello'))` |
| `req, res` | `c.req, c.text(), c.json()` |
| `res.json()` | `c.json({ data: 'test' })` |
| Middleware | `app.use('*', middleware)` |

### 2.3 Key Challenges & Solutions

#### Challenge 1: SSE (Server-Sent Events)
**Problem:** Cloudflare Workers have a 30-second timeout for request/response cycles.

**Solution:** Use Cloudflare Durable Objects or implement WebSocket-style polling. For MVP, we'll use shorter polling intervals as an alternative.

#### Challenge 2: Node.js Dependencies
**Problem:** Some packages don't work in Workers environment.

**Solution:**
- Replace `nodemailer` → Use Cloudflare Email Workers or external SMTP API
- Replace `pdfkit` → Generate PDFs client-side or use external service
- Replace `better-sqlite3` → Use `@libsql/client` for D1

#### Challenge 3: File Uploads
**Current:** Local filesystem (`/uploads` folder)

**Solution:** Already using Cloudinary - no changes needed. All uploads go directly to Cloudinary.

### 2.4 Worker Configuration (wrangler.toml)

```toml
name = "viji-matrimony-backend"
main = "src/index.ts"
compatibility_date = "2024-01-01"
node_compat = true

[[d1_databases]]
binding = "DB"
database_name = "viji-matrimony-db"
database_id = "<your-database-id>"

[env.production]
vars = { ENVIRONMENT = "production" }

[secrets]
# These will be added via wrangler secret put
# JWT_SECRET, TWILIO_AUTH_TOKEN, etc.
```

---

## Phase 3: Cloudflare Pages Frontend

### 3.1 Build Configuration

Current: Create React App (CRA)
Target: Cloudflare Pages with React build

**Configuration:**
- Build command: `npm run build`
- Build output: `build/`
- Node version: 18

### 3.2 SPA Routing (_redirects)

Create `public/_redirects`:
```
/*    /index.html   200
```

### 3.3 API URL Update

Update `frontend/src/services/api.js`:
```javascript
// Before
const API_BASE_URL = 'https://viji-marimony-new.onrender.com/api';

// After (Workers URL)
const API_BASE_URL = 'https://viji-matrimony-backend.<your-account>.workers.dev/api';
```

---

## Phase 4: External Services Integration

All existing external services continue to work with Cloudflare Workers:

| Service | Status | Action Required |
|---------|--------|-----------------|
| Cloudinary | ✅ Works | No changes |
| Twilio | ✅ Works | No changes |
| AWS Rekognition | ✅ Works | No changes |
| Razorpay | ✅ Works | No changes |
| PhonePe | ✅ Works | No changes |

---

## Phase 5: Testing Checklist

### Functional Tests
- [ ] User registration with email verification
- [ ] User login with JWT authentication
- [ ] Profile creation and editing
- [ ] Photo upload to Cloudinary
- [ ] Search with filters
- [ ] Send/receive interests
- [ ] Send/receive messages
- [ ] Payment initiation (Razorpay/PhonePe)
- [ ] Admin login
- [ ] Admin dashboard
- [ ] Profile verification workflow
- [ ] PDF profile generation

### Non-Functional Tests
- [ ] Response time under load
- [ ] API error handling
- [ ] File upload size limits
- [ ] Mobile responsiveness

---

## Implementation Order

1. **Set up D1 database** and verify connection
2. **Export/import data** from PostgreSQL to D1
3. **Create Hono backend** with basic routes
4. **Test backend locally** with `wrangler dev`
5. **Deploy backend** to Cloudflare Workers
6. **Configure Cloudflare Pages** for frontend
7. **Deploy frontend** to Cloudflare Pages
8. **Update environment variables** in Cloudflare dashboard
9. **Run full test suite**
10. **Switch DNS** (if changing domain)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| D1 cold starts | Use D1's built-in caching, upgrade to Pro for more CPU |
| Worker timeout | Implement request queuing for long operations |
| Migration data loss | Keep old database running until verification complete |
| External API limits | Monitor Cloudflare and external service usage |

---

## Estimated Timeline

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1 | D1 Setup + Data Migration | Medium |
| Phase 2 | Backend Migration | High |
| Phase 3 | Frontend Deployment | Low |
| Phase 4 | External Services | Low |
| Phase 5 | Testing | Medium |

---

## Next Steps

1. **Approve this plan** ✅
2. **Run `npx wrangler login`** to authenticate with Cloudflare
3. **Create D1 database**: `wrangler d1 create viji-matrimony-db`
4. **Begin Phase 1** - Set up database schema

---

*Document Version: 1.0*
*Created: 2026-03-19*
