import express from 'express';
import { CartController } from '../controllers/cartController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication (using your existing protect middleware)
router.use(protect);

// GET /api/cart - Get user's cart
router.get('/', CartController.getCart);

// POST /api/cart/add - Add item to cart
router.post('/add', CartController.addToCart);

// PUT /api/cart/update/:productId - Update item quantity
router.put('/update/:productId', CartController.updateQuantity);

// DELETE /api/cart/remove/:productId - Remove item from cart
router.delete('/remove/:productId', CartController.removeFromCart);

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', CartController.clearCart);

// POST /api/cart/sync - Sync local cart with server
router.post('/sync', CartController.syncCart);

export default router;