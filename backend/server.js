const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Database connection
const { testConnection } = require('./utils/database');

// AI Verification Module
const aiVerification = require('./ai-verification');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

/* -------------------- CORS -------------------- */

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  /\.vercel\.app$/,
  'https://viji-marimony-bpagfyjkk-jayakumar09s-projects.vercel.app',
  'https://vijayalakshmiboyarmatrimony.com',
  'https://www.vijayalakshmiboyarmatrimony.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed =>
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

/* -------------------- MIDDLEWARE -------------------- */

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  trustProxy: true,
  skipPreflightRequests: true
});
app.use(limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* -------------------- DB (LAZY CONNECT) -------------------- */

let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    await testConnection();
    isConnected = true;

    // Initialize AI only once
    try {
      const aiStatus = await aiVerification.initialize();
      console.log("🤖 AI Verification:", aiStatus.success ? "Initialized" : "Partial");
    } catch (err) {
      console.log("⚠️ AI Verification:", err.message);
    }
  }
}

// Run DB connect on every request (but executes only once)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

/* -------------------- CLOUDINARY -------------------- */

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudApiKey = process.env.CLOUDINARY_API_KEY;
const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && cloudApiKey && cloudApiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudApiKey,
    api_secret: cloudApiSecret,
  });
  console.log(`✅ Cloudinary configured`);
} else {
  console.log('⚠️ Cloudinary not configured');
}

/* -------------------- STATIC (NOT RECOMMENDED ON VERCEL) -------------------- */

const path = require('path');
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

/* -------------------- TEST ROUTE -------------------- */

// IMPORTANT: use /api prefix for Vercel
app.get('/api', (req, res) => {
  res.json({
    message: 'API running on Vercel 🚀',
    status: 'ok'
  });
});

/* -------------------- ROUTES -------------------- */

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/search', require('./routes/search'));
app.use('/api/message', require('./routes/message'));
app.use('/api/interest', require('./routes/interest'));
app.use('/api/lookup', require('./routes/lookup'));
app.use('/api/verification', require('./routes/verification'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin', require('./routes/adminFileServe'));
app.use('/api/admin', require('./routes/adminPhotos'));
app.use('/api/admin', require('./routes/adminVerification'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/profile-pdf', require('./routes/profilePdf'));
app.use('/api/shared-profile', require('./routes/generateSharedProfile'));

/* -------------------- SSE -------------------- */

const sseService = require('./services/sseService');

app.get('/api/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  sseService.addClient(res);

  req.on('close', () => {
    console.log('SSE client disconnected');
  });
});

/* -------------------- ERROR HANDLING -------------------- */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* -------------------- EXPORT FOR VERCEL -------------------- */

module.exports = app;