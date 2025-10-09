import express from 'express';
import { 
  createOrderAndUpdateStock, 
  getOrderByPidx, 
  getOrdersByProduct 
} from '../controllers/orderController';
import { protect, authorizeRoles } from '../middleware/auth';
import { getUserOrders, getOrderById, cancelOrder, requestRefund } from '../controllers/userOrderController';

const router = express.Router();

// Public routes (no authentication required)
router.get('/orders/pidx/:pidx', getOrderByPidx);
router.get('/orders/product/:productId', getOrdersByProduct);

// Protected user routes (require authentication)
router.post('/orders', protect, createOrderAndUpdateStock);
router.get('/orders/my-orders', protect, getUserOrders);
router.get('/orders/:id', protect, getOrderById);
router.put('/orders/:id/cancel', protect, cancelOrder);
router.put('/orders/:id/refund', protect, requestRefund);

export default router;