const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { cloudinary, isCloudinaryConfigured } = require('../utils/upload');

// Delete all images from a specific Cloudinary folder
// This endpoint is for admin use only to clean up old/test images
router.delete('/cloudinary/folder/:folderName', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { folderName } = req.params;

    if (!isCloudinaryConfigured()) {
      return res.status(400).json({ 
        error: 'Cloudinary is not configured',
        message: 'Cannot delete images without Cloudinary configuration'
      });
    }

    console.log(`[Admin] Deleting all images from Cloudinary folder: ${folderName}`);

    // First, get all resources in the folder
    let resources = [];
    let nextCursor = null;
    
    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderName,
        max_results: 100,
        next_cursor: nextCursor
      });
      
      resources = [...resources, ...result.resources];
      nextCursor = result.next_cursor;
    } while (nextCursor);

    if (resources.length === 0) {
      return res.json({
        message: `No images found in folder: ${folderName}`,
        deletedCount: 0
      });
    }

    console.log(`[Admin] Found ${resources.length} images to delete`);

    // Delete all resources
    const deletePromises = resources.map(resource => 
      cloudinary.uploader.destroy(resource.public_id)
    );
    
    const results = await Promise.allSettled(deletePromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`[Admin] Deleted ${successful} images, ${failed} failed`);

    res.json({
      message: `Deleted images from folder: ${folderName}`,
      folderName: folderName,
      totalFound: resources.length,
      deletedCount: successful,
      failedCount: failed,
      errors: failed > 0 ? results.filter(r => r.status === 'rejected').map(r => r.reason.message) : []
    });

  } catch (error) {
    console.error('[Admin] Error deleting Cloudinary folder:', error);
    res.status(500).json({ 
      error: 'Failed to delete Cloudinary folder',
      message: error.message 
    });
  }
});

// Delete a specific image by public ID
router.delete('/cloudinary/image/:publicId', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!isCloudinaryConfigured()) {
      return res.status(400).json({ 
        error: 'Cloudinary is not configured',
        message: 'Cannot delete image without Cloudinary configuration'
      });
    }

    console.log(`[Admin] Deleting Cloudinary image: ${publicId}`);

    const result = await cloudinary.uploader.destroy(publicId);

    res.json({
      message: 'Image deleted successfully',
      publicId: publicId,
      result: result
    });

  } catch (error) {
    console.error('[Admin] Error deleting Cloudinary image:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      message: error.message 
    });
  }
});

module.exports = router;
