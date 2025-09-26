import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth';
import upload from '../middleware/upload';
import {
  createProduct,
  getVendorProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllActiveProducts
} from '../controllers/productController';

const router = express.Router();

// Create a product (vendor only)
router.post(
  '/',
  protect,
  authorizeRoles('vendor'),
  upload.array('images', 5),
  createProduct
);

// Get all products by logged-in vendor
router.get(
  '/',
  protect,
  authorizeRoles('vendor'),
  getVendorProducts
);

// Update product (vendor or admin)
router.put(
  '/:id',
  protect,
  authorizeRoles('vendor', 'admin'),
  upload.array('images', 5),
  updateProduct
);

// Delete product (vendor or admin)
router.delete(
  '/:id',
  protect,
  authorizeRoles('vendor', 'admin'),
  deleteProduct
);

// Public: Get single product by ID
router.get('/:id', getProductById);

// Public: Get all active products
router.get('/public/all', getAllActiveProducts);

export default router;