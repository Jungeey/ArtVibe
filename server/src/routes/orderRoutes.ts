import express from 'express';
import { 
  createOrderAndUpdateStock, 
  getOrderByPidx, 
  getOrdersByProduct 
} from '../controllers/orderController';

const router = express.Router();

// Create new order and update stock
router.post('/orders', createOrderAndUpdateStock);

// Get order by Khalti pidx
router.get('/orders/pidx/:pidx', getOrderByPidx);

// Get orders by product ID
router.get('/orders/product/:productId', getOrdersByProduct);

export default router;