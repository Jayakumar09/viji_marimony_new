import api from './api';

const API_URL = '/verification';
const API_BASE_URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/$/, '') + '/api' : 'https://viji-marimony-new.onrender.com/api';

// Wake up backend before OTP request (to handle Render sleep issue)
async function wakeUpBackend() {
  try {
    await api.get(`${API_BASE_URL}/ping`, { timeout: 10000 });
    console.log('Backend wake-up ping successful');
  } catch (err) {
    console.warn('Backend wake-up ping failed (this is normal if server is starting):', err.message);
  }
}

// Send email OTP
export const sendEmailOTP = async (email) => {
  // Wake up backend first (handles Render free tier sleeping)
  await wakeUpBackend();
  
  try {
    const response = await api.post(`${API_URL}/email/send-otp`, { email }, { timeout: 30000 });
    return response.data;
  } catch (error) {
    console.error('Send email OTP error:', error);
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw { error: 'Server is taking too long to respond. Please try again (backend may be waking up).' };
    }
    const errorData = error.response?.data;
    throw errorData || { error: error.message || 'Failed to send OTP' };
  }
};

// Verify email OTP
export const verifyEmailOTP = async (email, otp) => {
  // Wake up backend first (handles Render free tier sleeping)
  await wakeUpBackend();
  
  try {
    const response = await api.post(`${API_URL}/email/verify`, { email, otp }, { timeout: 30000 });
    return response.data;
  } catch (error) {
    console.error('Verify email OTP error:', error);
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw { error: 'Server is taking too long to respond. Please try again.' };
    }
    const errorData = error.response?.data;
    throw errorData || { error: error.message || 'Failed to verify OTP' };
  }
};

// Send phone OTP (with fallback email option)
export const sendPhoneOTP = async (phone, fallbackEmail) => {
  // Wake up backend first (handles Render free tier sleeping)
  await wakeUpBackend();
  try {
    const response = await api.post(`${API_URL}/phone/send-otp`, { phone, fallbackEmail }, { timeout: 30000 });
    return response.data;
  } catch (error) {
    console.error('Send phone OTP error:', error);
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw { error: 'Server is taking too long to respond. Please try again (backend may be waking up).' };
    }
    const errorData = error.response?.data;
    throw errorData || { error: error.message || 'Failed to send OTP' };
  }
};

// Verify phone OTP (with fallback email option)
export const verifyPhoneOTP = async (phone, otp, fallbackEmail) => {
  // Wake up backend first (handles Render free tier sleeping)
  await wakeUpBackend();
  
  try {
    const response = await api.post(`${API_URL}/phone/verify`, { phone, otp, fallbackEmail }, { timeout: 30000 });
    return response.data;
  } catch (error) {
    console.error('Verify phone OTP error:', error);
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw { error: 'Server is taking too long to respond. Please try again.' };
    }
    const errorData = error.response?.data;
    throw errorData || { error: error.message || 'Failed to verify OTP' };
  }
};

// Get verification status
export const getVerificationStatus = async () => {
  try {
    const response = await api.get(`${API_URL}/status`);
    return response.data;
  } catch (error) {
    console.error('Get verification status error:', error);
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw { error: 'Server is taking too long to respond. Please try again.' };
    }
    const errorData = error.response?.data;
    throw errorData || { error: error.message || 'Failed to get status' };
  }
};

export default {
  sendEmailOTP,
  verifyEmailOTP,
  sendPhoneOTP,
  verifyPhoneOTP,
  getVerificationStatus
};
