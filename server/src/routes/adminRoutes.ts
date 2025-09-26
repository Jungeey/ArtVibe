import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth';
import { getPendingVendors,getSuspendedVendors,getVerifiedVendors,verifyVendor,suspendVendor,reactivateVendor } from '../controllers/adminController';

const router = express.Router();

router.get('/vendors/pending', protect, authorizeRoles('admin'), getPendingVendors);
router.get('/vendors/verified', protect, authorizeRoles('admin'), getVerifiedVendors);
router.get('/vendors/suspended', protect, authorizeRoles('admin'), getSuspendedVendors);
router.patch('/vendor/:id/verify', protect, authorizeRoles('admin'), verifyVendor);
router.patch('/vendor/:id/suspend', protect, authorizeRoles('admin'), suspendVendor);
router.patch('/vendor/:id/reactivate', protect, authorizeRoles('admin'), reactivateVendor);


export default router;
