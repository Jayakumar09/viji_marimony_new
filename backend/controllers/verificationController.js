const { prisma } = require('../utils/database');
const { setOTP, verifyOTP } = require('../utils/otp');
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Log email config on startup (without password)
console.log('📧 Email transporter configured with:', process.env.EMAIL_USER || 'NO EMAIL SET');

// Configure Twilio (optional)
let twilioClient = null;
console.log('📱 Twilio config check - SID:', process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'NOT SET', '| Token:', process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET');

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio client initialized successfully');
  } catch (err) {
    console.warn('❌ Twilio not configured:', err.message);
  }
} else {
  console.warn('⚠️ Twilio credentials not found in environment');
}

// Helper function to check if user should be marked for admin review
const checkAndSetVerification = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true, phoneVerified: true, profileVerificationStatus: true }
  });
  
  // When both email and phone are verified, set status to "Under Admin Review"
  if (user.emailVerified && user.phoneVerified) {
    // Only update if not already verified or under review
    if (user.profileVerificationStatus !== 'Profile Verified' && user.profileVerificationStatus !== 'Under Admin Review') {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          profileVerificationStatus: 'Under Admin Review'
        }
      });
      
      // Log for admin notification
      console.log(`User ${userId} is now under admin review for profile verification`);
    }
    return { needsAdminReview: true, status: 'Under Admin Review' };
  }
  return { needsAdminReview: false, status: 'Pending' };
};

// ============ EMAIL VERIFICATION ============

// Send OTP email
const sendOTPEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found with this email' });
    }
    
    const otp = setOTP(email, 'email');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@boyarmatrimony.com',
      to: email,
      subject: 'Email Verification OTP - Vijayalakshmi Boyar Matrimony',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B5CF6;">Email Verification</h2>
          <p>Your OTP for email verification is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `
    };
    
    try {
      // Send email asynchronously (don't wait for it to complete)
      transporter.sendMail(mailOptions)
        .then(() => console.log('✅ Email sent successfully to:', mailOptions.to))
        .catch(err => console.error('❌ Email send error:', err.message, err.code));
    } catch (emailError) {
      console.error('❌ Email send exception:', emailError);
    }
    
    // Return success immediately - don't wait for email
    res.json({ 
      message: 'OTP sent to your email',
      // Always include OTP in response for debugging
      debugOtp: otp,
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
    
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Verify Email OTP
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
    
    const result = verifyOTP(email, otp, 'email');
    
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true }
    });
    
    // Check if both email and phone are verified
    const verificationResult = await checkAndSetVerification(user.id);
    
    res.json({ 
      message: 'Email verified successfully',
      profileVerificationStatus: verificationResult.status,
      needsAdminReview: verificationResult.needsAdminReview
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

// ============ PHONE VERIFICATION ============

// ============ PHONE VERIFICATION ============

// Send OTP to phone (or email fallback)
const sendPhoneOTP = async (req, res) => {
  try {
    const { phone, fallbackEmail } = req.body;
    
    console.log('[sendPhoneOTP] Request:', { phone: phone ? 'provided' : 'not provided', fallbackEmail: fallbackEmail ? 'provided' : 'not provided', userId: req.user?.id });
    
    if (!phone && !fallbackEmail) {
      console.log('[sendPhoneOTP] Error: No phone or fallback email provided');
      return res.status(400).json({ error: 'Phone number or fallback email is required' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      console.log('[sendPhoneOTP] Error: User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('[sendPhoneOTP] User found, phone:', user.phone);
    
    // Use user's saved phone if not provided in request
    const phoneToUse = phone || user.phone;
    const emailToUse = fallbackEmail || user.email;
    
    if (!phoneToUse && !emailToUse) {
      console.log('[sendPhoneOTP] Error: No phone or email available');
      return res.status(400).json({ error: 'No phone number or email available for verification' });
    }
    
    const otp = setOTP(phoneToUse || emailToUse, 'phone');
    console.log('[sendPhoneOTP] OTP generated for:', phoneToUse || emailToUse);
    
    // Try sending via Twilio SMS first
    let smsSent = false;
    console.log('[sendPhoneOTP] Twilio client:', twilioClient ? 'EXISTS' : 'NOT CONFIGURED');
    console.log('[sendPhoneOTP] Phone to use:', phoneToUse);
    
    if (twilioClient && phoneToUse) {
      try {
        await twilioClient.messages.create({
          body: `Your Vijayalakshmi Boyar Matrimony OTP is: ${otp}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneToUse
        });
        smsSent = true;
        console.log('[sendPhoneOTP] ✅ SMS sent successfully');
      } catch (twilioError) {
        console.error('❌ Twilio error:', twilioError.message);
      }
    } else if (!twilioClient) {
      console.log('⚠️ Twilio client not configured - will use email fallback');
    }
    
    // Fallback to email if SMS not sent or phone not provided
    if (!smsSent) {
      const emailToSend = emailToUse;
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@boyarmatrimony.com',
        to: emailToSend,
        subject: 'Phone Verification OTP - Vijayalakshmi Boyar Matrimony',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8B5CF6;">Phone Verification</h2>
            <p>Your OTP for phone verification is:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 20px 0;">
              ${otp}
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 12px;">Sent as fallback because SMS was not delivered to your phone.</p>
          </div>
        `
      };
      
      try {
        // Send email asynchronously (don't wait for it to complete)
        transporter.sendMail(mailOptions)
          .then(() => console.log('[sendPhoneOTP] Email sent successfully'))
          .catch(err => console.error('Email fallback error (background):', err.message));
      } catch (emailError) {
        console.error('Email fallback error:', emailError);
      }
      
      // Development mode - log OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Phone OTP (fallback email) for ${emailToSend}: ${otp}`);
      }
    } else {
      // Development mode - log SMS OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Phone OTP (SMS) for ${phoneToUse}: ${otp}`);
      }
    }
    
    res.json({ 
      message: smsSent ? 'OTP sent to your phone' : 'OTP sent to your email (SMS unavailable)',
      sentVia: smsSent ? 'sms' : 'email',
      // Always include OTP in response for debugging
      debugOtp: otp,
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
    
  } catch (error) {
    console.error('Send phone OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Verify Phone OTP
const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp, fallbackEmail } = req.body;
    
    if (!otp) {
      return res.status(400).json({ error: 'OTP is required' });
    }
    
    // Try phone first, fallback to email if phone not provided
    const identifier = phone || fallbackEmail;
    
    if (!identifier) {
      return res.status(400).json({ error: 'Phone or fallback email is required' });
    }
    
    const result = verifyOTP(identifier, otp, 'phone');
    
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { phoneVerified: true }
    });
    
    // Check if both email and phone are verified
    const verificationResult = await checkAndSetVerification(req.user.id);
    
    res.json({ 
      message: 'Phone verified successfully',
      profileVerificationStatus: verificationResult.status,
      needsAdminReview: verificationResult.needsAdminReview
    });
    
  } catch (error) {
    console.error('Verify phone OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

// ============ VERIFICATION STATUS ============

const getVerificationStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        emailVerified: true, 
        phoneVerified: true, 
        isVerified: true,
        email: true,
        phone: true,
        profileVerificationStatus: true,
        profileVerified: true
      }
    });
    
    // Pending verification message for users who haven't completed verification
    const pendingMessage = (!user.emailVerified || !user.phoneVerified) 
      ? `Dear Member,

Your Email and/or Phone verification is still pending.

Please complete verification to unlock profile visibility and start receiving matches.

Verification is required to ensure secure and trusted matchmaking.

Thank you,
Vijayalakshmi Boyar Matrimony Team`
      : null;
    
    res.json({ 
      email: user.email,
      emailVerified: user.emailVerified,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      profileVerificationStatus: user.profileVerificationStatus || 'Pending',
      profileVerified: user.profileVerified || user.isVerified,
      pendingMessage
    });
    
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
};

module.exports = {
  sendOTPEmail,
  verifyEmailOTP,
  sendPhoneOTP,
  verifyPhoneOTP,
  getVerificationStatus
};
