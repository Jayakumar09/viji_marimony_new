/**
 * AI Verification Module - Lightweight Stub for Vercel
 * AI features disabled for Vercel free tier deployment
 * 
 * To enable AI features, deploy on Railway or upgrade to Vercel Pro
 */

let documentValidationService;
let faceMatchService;
let tamperDetectionService;
let aiRecommendationService;

try {
  documentValidationService = require('./documentValidationService');
  faceMatchService = require('./faceMatchService');
  tamperDetectionService = require('./tamperDetectionService');
  aiRecommendationService = require('./aiRecommendationService');
} catch (e) {
  console.log('AI Verification modules not available - using stub');
}

/**
 * Process complete ID verification
 * Returns stub response when AI modules not available
 */
const processVerification = async (params) => {
  if (!documentValidationService) {
    return {
      success: false,
      message: 'AI verification is currently unavailable. Please try again later.',
      error: 'AI_VERIFICATION_DISABLED'
    };
  }
  return documentValidationService.validateDocument(params);
};

/**
 * Verify face match between selfie and ID
 */
const verifyFaceMatch = async (selfiePath, idImagePath) => {
  if (!faceMatchService) {
    return {
      success: false,
      message: 'Face matching is currently unavailable',
      error: 'AI_VERIFICATION_DISABLED'
    };
  }
  return faceMatchService.compareFaces(selfiePath, idImagePath);
};

/**
 * Detect if ID document is tampered
 */
const detectTamper = async (imagePath) => {
  if (!tamperDetectionService) {
    return {
      success: false,
      message: 'Tamper detection is currently unavailable',
      error: 'AI_VERIFICATION_DISABLED'
    };
  }
  return tamperDetectionService.detectTamper(imagePath);
};

/**
 * Get AI recommendation based on profile
 */
const getAIRecommendation = async (profileData) => {
  if (!aiRecommendationService) {
    return {
      recommendation: 'neutral',
      confidence: 0,
      message: 'AI recommendations unavailable'
    };
  }
  return aiRecommendationService.getRecommendation(profileData);
};

module.exports = {
  processVerification,
  verifyFaceMatch,
  detectTamper,
  getAIRecommendation
};
