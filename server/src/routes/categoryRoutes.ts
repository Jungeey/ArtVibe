import express from 'express';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { protect, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Admin only for create/update/delete
router.post('/', protect, authorizeRoles('admin'), createCategory);
router.put('/:id', protect, authorizeRoles('admin'), updateCategory);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCategory);


// Public
router.get('/', getCategories);

export default router;
