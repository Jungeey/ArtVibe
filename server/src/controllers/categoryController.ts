import { Request, Response } from 'express';
import Category from '../models/Category';
import { AuthRequest } from '../middleware/auth';

// Create category
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Update category
export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.name = name || category.name;
    category.description = description || category.description;
    await category.save();
    res.json(category);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Delete category
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.json({ message: 'Category deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
