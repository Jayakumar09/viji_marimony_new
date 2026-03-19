import api from './api';

const API_URL = '/verification';

// Send email OTP
export const sendEmailOTP = async (email) => {
  try {
    const response = await api.post(`${API_URL}/email/send-otp`, { email });
    return response.data;
  } catch (error) {
    console.error('Send email OTP error:', error);
    const errorData = error.response?.data;
    throw errorData || { error: error.message || 'Failed to send OTP' };
  }
};

// Verify email OTP
export const verifyEmailOTP = async (email, otp) => {
  try {
    const response = await api.post(`${API_URL}/email/verify`, { email, otp });
    return response.data;
  } catch (error) {
    console.error('Verify email OTP error:', error);
    const errorData = error.response?.data;
    throw errorData || { error: error.message || 'Failed to verify OTP' };
  }
};

// Send phone OTP (with fallback email option)
export const sendPhoneOTP = async (phone, fallbackEmail) => {
  try {
    const response = await api.post(`${API_URL}/phone/send-otp`, { phone, fallbackEmail });
    return response.data;
  } catch (error) {
    console.error('Send phone OTP error:', error);
    const errorData = error.response?.data;
    throw errorData || { error: error.message || 'Failed to send OTP' };
  }
};

// Verify phone OTP (with fallback email option)
export const verifyPhoneOTP = async (phone, otp, fallbackEmail) => {
  try {
    const response = await api.post(`${API_URL}/phone/verify`, { phone, otp, fallbackEmail });
    return response.data;
  } catch (error) {
    console.error('Verify phone OTP error:', error);
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
