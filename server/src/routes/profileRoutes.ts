import express from 'express';
import { protect } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();
// Change password route
router.put('/change-password', protect, async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Check if new password is different
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: 'New password must be different from current password'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// Get current user profile
router.get('/me', protect, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      ...user.toObject()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', protect, async (req: any, res: any) => {
  try {
    const {
      name,
      phone,
      address,
      businessName,
      website,
      socialMedia,
      businessDescription,
      taxId
    } = req.body;

    // Fields that can be updated
    const updateFields: any = {
      name,
      phone,
      address,
      website,
      socialMedia,
      businessDescription,
      taxId
    };

    // Only update businessName for vendors
    if (req.user.role === 'vendor') {
      updateFields.businessName = businessName;
    }

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toObject()
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Business license already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

export default router;