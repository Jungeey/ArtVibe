import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth';
import { getPendingVendors,getSuspendedVendors,getVerifiedVendors,verifyVendor,suspendVendor,reactivateVendor } from '../controllers/adminController';

const router = express.Router();

router.get('/vendors/pending', getPendingVendors, protect, authorizeRoles('admin'));
router.get('/vendors/verified', getVerifiedVendors, protect, authorizeRoles('admin'));
router.get('/vendors/suspended', getSuspendedVendors, protect, authorizeRoles('admin'));
router.patch('/vendor/:id/verify', verifyVendor, protect, authorizeRoles('admin'));
router.patch('/vendor/:id/suspend', suspendVendor, protect, authorizeRoles('admin'));
router.patch('/vendor/:id/reactivate', reactivateVendor, protect, authorizeRoles('admin'));

export default router;
