import express from 'express';
import { 
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  updateShippingInfo,
  addOrderNotes,
  adminCancelOrder,
  processRefund,
  getOrderStats
} from '../controllers/adminOrderController';
import { protect, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// All routes require admin role
router.use(protect, authorizeRoles('admin'));

// Get order statistics for dashboard
router.get('/orders/stats', getOrderStats);

// Get all orders with filtering and pagination
router.get('/orders', getAllOrders);

// Get specific order by ID
router.get('/orders/:id', getAdminOrderById);

// Update order status
router.put('/orders/:id/status', updateOrderStatus);

// Update payment status
router.put('/orders/:id/payment-status', updatePaymentStatus);

// Update shipping information
router.put('/orders/:id/shipping', updateShippingInfo);

// Add/admin order notes
router.put('/orders/:id/notes', addOrderNotes);

// Cancel order
router.put('/orders/:id/cancel', adminCancelOrder);

// Process refund
router.put('/orders/:id/refund', processRefund);

export default router;