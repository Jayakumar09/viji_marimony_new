require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const app = express();

/* =========================
   CONFIG
========================= */
const TEST_PORT = 5004;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.EMAIL_USER;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 min

/* =========================
   CHECK ENV
========================= */
if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("❌ EMAIL_USER or EMAIL_PASS missing in .env");
  process.exit(1);
}

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error("❌ Twilio env values missing in .env");
  process.exit(1);
}

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   IN-MEMORY OTP STORE
   emailStore: email => { otp, expiresAt }
   phoneStore: phone => { otp, expiresAt }
========================= */
const emailOtpStore = new Map();
const phoneOtpStore = new Map();

/* =========================
   SERVICES
========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/* =========================
   HELPERS
========================= */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Basic E.164 format check: + followed by 10 to 15 digits
function isValidPhone(phone) {
  return /^\+[1-9]\d{9,14}$/.test(phone);
}

function createOtpRecord() {
  return {
    otp: generateOTP(),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  };
}

function isOtpExpired(record) {
  return !record || Date.now() > record.expiresAt;
}

/* =========================
   ROUTES
========================= */

// Root
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// API health
app.get("/api", (req, res) => {
  res.json({
    message: "API running ✅",
    status: "ok",
  });
});

/* =========================
   EMAIL OTP
========================= */

// Send email OTP
app.post("/api/send-email-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const record = createOtpRecord();
    emailOtpStore.set(email, record);

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Your Email OTP Code",
      text: `Your OTP is: ${record.otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Email Verification OTP</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 4px;">${record.otp}</h1>
          <p>Expires in <b>5 minutes</b>.</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Email OTP sent successfully ✅",
      email,
    });
  } catch (error) {
    console.error("SEND EMAIL OTP ERROR:", error);
    return res.status(500).json({
      error: "Something went wrong!",
      message: error.message,
    });
  }
});

// Verify email OTP
app.post("/api/verify-email-otp", (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const saved = emailOtpStore.get(email);

    if (!saved) {
      return res.status(400).json({
        error: "OTP not found. Please request a new email OTP.",
      });
    }

    if (isOtpExpired(saved)) {
      emailOtpStore.delete(email);
      return res.status(400).json({
        error: "OTP expired. Please request a new email OTP.",
      });
    }

    if (saved.otp !== otp) {
      return res.status(400).json({ error: "Invalid email OTP ❌" });
    }

    emailOtpStore.delete(email);

    return res.status(200).json({
      message: "Email OTP verified successfully ✅",
      verified: true,
    });
  } catch (error) {
    console.error("VERIFY EMAIL OTP ERROR:", error);
    return res.status(500).json({
      error: "Something went wrong!",
      message: error.message,
    });
  }
});

// Resend email OTP
app.post("/api/resend-email-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const record = createOtpRecord();
    emailOtpStore.set(email, record);

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Your New Email OTP Code",
      text: `Your new OTP is: ${record.otp}. It expires in 5 minutes.`,
    });

    return res.status(200).json({
      message: "New email OTP sent successfully ✅",
      email,
    });
  } catch (error) {
    console.error("RESEND EMAIL OTP ERROR:", error);
    return res.status(500).json({
      error: "Something went wrong!",
      message: error.message,
    });
  }
});

/* =========================
   PHONE OTP
========================= */

// Send phone OTP
app.post("/api/send-phone-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        error: "Phone number must be in E.164 format, example: +918940735144",
      });
    }

    const record = createOtpRecord();
    phoneOtpStore.set(phone, record);

    const sms = await twilioClient.messages.create({
      body: `Your OTP is: ${record.otp}. It expires in 5 minutes.`,
      from: TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return res.status(200).json({
      message: "Phone OTP sent successfully ✅",
      phone,
      sid: sms.sid,
    });
  } catch (error) {
    console.error("SEND PHONE OTP ERROR:", error);

    return res.status(500).json({
      error: "Something went wrong!",
      message: error.message,
      twilioCode: error.code || null,
      moreInfo: error.moreInfo || null,
    });
  }
});

// Verify phone OTP
app.post("/api/verify-phone-otp", (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP are required" });
    }

    const saved = phoneOtpStore.get(phone);

    if (!saved) {
      return res.status(400).json({
        error: "OTP not found. Please request a new phone OTP.",
      });
    }

    if (isOtpExpired(saved)) {
      phoneOtpStore.delete(phone);
      return res.status(400).json({
        error: "OTP expired. Please request a new phone OTP.",
      });
    }

    if (saved.otp !== otp) {
      return res.status(400).json({ error: "Invalid phone OTP ❌" });
    }

    phoneOtpStore.delete(phone);

    return res.status(200).json({
      message: "Phone OTP verified successfully ✅",
      verified: true,
    });
  } catch (error) {
    console.error("VERIFY PHONE OTP ERROR:", error);
    return res.status(500).json({
      error: "Something went wrong!",
      message: error.message,
    });
  }
});

// Resend phone OTP
app.post("/api/resend-phone-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        error: "Phone number must be in E.164 format, example: +918940735144",
      });
    }

    const record = createOtpRecord();
    phoneOtpStore.set(phone, record);

    const sms = await twilioClient.messages.create({
      body: `Your new OTP is: ${record.otp}. It expires in 5 minutes.`,
      from: TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return res.status(200).json({
      message: "New phone OTP sent successfully ✅",
      phone,
      sid: sms.sid,
    });
  } catch (error) {
    console.error("RESEND PHONE OTP ERROR:", error);

    return res.status(500).json({
      error: "Something went wrong!",
      message: error.message,
      twilioCode: error.code || null,
      moreInfo: error.moreInfo || null,
    });
  }
});

/* =========================
   404
========================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* =========================
   START
========================= */
app.listen(TEST_PORT, () => {
  console.log(`✅ Server running on port ${TEST_PORT}`);
});
