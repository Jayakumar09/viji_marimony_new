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

// Allow all origins for development
app.use(cors());

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

// Check if Cloudinary is properly configured with real values (not placeholders)
const isCloudinaryConfigured = () => {
  if (!cloudName || !cloudApiKey || !cloudApiSecret) return false;
  
  const isPlaceholder = cloudApiSecret.includes('your_') || 
                       cloudApiSecret.includes('_here') ||
                       cloudApiSecret.length < 10 ||
                       cloudName.includes('your_') ||
                       cloudName.includes('_here');
  
  return !isPlaceholder;
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudApiKey,
    api_secret: cloudApiSecret,
  });
  console.log(`✅ Cloudinary configured`);
} else {
  console.log('⚠️ Cloudinary NOT configured - File uploads will use local storage (not recommended for production)');
  console.log('⚠️ Please set CLOUDINARY_API_SECRET in environment variables for production use');
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

/* -------------------- KEEP-ALIVE ENDPOINT -------------------- */

// This endpoint can be pinged by external services (like cron-job.org) to keep the server awake
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Server is awake'
  });
});

// Note: For Render free tier, the server sleeps after 15 minutes of inactivity.
// To keep it awake, set up a free cron job at https://cron-job.org
// to ping this endpoint every 5 minutes:
// URL: https://your-backend-url.onrender.com/api/ping

/* -------------------- KEEP-ALIVE (Prevents Render from sleeping) -------------------- */

// Ping the server every 5 minutes to prevent it from sleeping on Render free tier
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

function startKeepAlive() {
  const backendUrl = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL;
  
  if (backendUrl) {
    console.log(`🔄 Starting keep-alive pings to: ${backendUrl}`);
    
    setInterval(async () => {
      try {
        const axios = require('axios');
        const response = await axios.get(`${backendUrl}/api/ping`, { 
          timeout: 10000,
          headers: { 'User-Agent': 'Keep-Alive-Ping/1.0' }
        });
        console.log(`✅ Keep-alive ping successful: ${response.status}`);
      } catch (error) {
        console.log(`⚠️ Keep-alive ping failed: ${error.message}`);
      }
    }, KEEP_ALIVE_INTERVAL);
    
    console.log(`⏰ Keep-alive enabled: Pinging every ${KEEP_ALIVE_INTERVAL/1000} seconds`);
  } else {
    console.log('⚠️ BACKEND_URL not set - keep-alive disabled');
    console.log('💡 To keep server awake on Render free tier:');
    console.log('   1. Go to https://cron-job.org and create free account');
    console.log('   2. Create a cron job to ping: https://your-backend.onrender.com/api/ping');
    console.log('   3. Set interval to every 5 minutes');
  }
}

// Start keep-alive after server is running
if (process.env.RENDER || process.env.RENDER_EXTERNAL_URL) {
  setTimeout(startKeepAlive, 10000); // Start 10 seconds after server starts
}

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

/* -------------------- SERVER LISTENING (for local/Render) -------------------- */

// Only start server if not in serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

if (!isServerless) {
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🏠 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  });
}

/* -------------------- EXPORT FOR VERCEL -------------------- */

module.exports = app;