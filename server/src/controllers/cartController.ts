import { Response } from 'express';
import { Types } from 'mongoose';
import Cart, { ICart } from '../models/Cart';
import Product, { IProduct } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export class CartController {
  /**
   * Get user's cart
   */
  public static getCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('Getting cart for user:', req.user?._id);
      
      let cart = await Cart.findOne({ user: req.user!._id })
        .populate('items.product', 'name price images primaryImage stockQuantity status');

      if (!cart) {
        console.log('No cart found, creating new one');
        cart = new Cart({ user: req.user!._id, items: [] });
        await cart.save();
      }

      // Filter out unavailable products
      const validItems = cart.items.filter(item => {
        const product = item.product as IProduct;
        const isValid = product && product.status === 'active' && product.stockQuantity > 0;
        if (!isValid) {
          console.log(`Removing invalid product from cart: ${item.product}`);
        }
        return isValid;
      });

      if (validItems.length !== cart.items.length) {
        console.log(`Filtered ${cart.items.length - validItems.length} invalid items`);
        cart.items = validItems;
        await cart.save();
      }

      console.log(`Returning cart with ${cart.items.length} items`);
      res.json(cart);
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  /**
   * Add item to cart
   */
  public static addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { productId, quantity = 1 } = req.body;
      console.log('Add to cart request:', { productId, quantity, user: req.user?._id });

      if (!Types.ObjectId.isValid(productId)) {
        console.log('Invalid product ID:', productId);
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const product = await Product.findOne({ 
        _id: productId, 
        status: 'active' 
      });

      if (!product) {
        console.log('Product not found or inactive:', productId);
        res.status(404).json({ error: 'Product not found or unavailable' });
        return;
      }

      if (product.stockQuantity < quantity) {
        console.log(`Insufficient stock: requested ${quantity}, available ${product.stockQuantity}`);
        res.status(400).json({ 
          error: `Only ${product.stockQuantity} items available in stock` 
        });
        return;
      }

      let cart = await Cart.findOne({ user: req.user!._id });

      if (!cart) {
        console.log('Creating new cart for user');
        cart = new Cart({ user: req.user!._id, items: [] });
      }

      const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        
        if (newQuantity > product.stockQuantity) {
          console.log(`Exceeds stock: ${newQuantity} > ${product.stockQuantity}`);
          res.status(400).json({ 
            error: `Cannot add more than ${product.stockQuantity} items` 
          });
          return;
        }
        
        cart.items[existingItemIndex].quantity = newQuantity;
        console.log(`Updated quantity for existing item: ${newQuantity}`);
      } else {
        cart.items.push({
          product: product._id,
          quantity,
          price: product.price,
          name: product.name,
          image: product.primaryImage || product.images[0] || '/images/placeholder.jpg'
        });
        console.log('Added new item to cart');
      }

      await cart.save();
      await cart.populate('items.product', 'name price images primaryImage stockQuantity status');

      console.log(`Cart saved with ${cart.items.length} items, total: $${cart.total}`);
      res.json(cart);
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  /**
   * Update item quantity
   */
  public static updateQuantity = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      console.log('Update quantity request:', { productId, quantity, user: req.user?._id });

      if (!Types.ObjectId.isValid(productId)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      if (!quantity || quantity < 1) {
        res.status(400).json({ error: 'Quantity must be at least 1' });
        return;
      }

      const product = await Product.findOne({ 
        _id: productId, 
        status: 'active' 
      });

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      if (quantity > product.stockQuantity) {
        res.status(400).json({ 
          error: `Only ${product.stockQuantity} items available` 
        });
        return;
      }

      const cart = await Cart.findOne({ user: req.user!._id });

      if (!cart) {
        res.status(404).json({ error: 'Cart not found' });
        return;
      }

      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex === -1) {
        res.status(404).json({ error: 'Item not found in cart' });
        return;
      }

      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      await cart.populate('items.product', 'name price images primaryImage stockQuantity status');

      console.log(`Updated quantity for product ${productId} to ${quantity}`);
      res.json(cart);
    } catch (error) {
      console.error('Update cart error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  /**
   * Remove item from cart
   */
  public static removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      console.log('Remove from cart request:', { productId, user: req.user?._id });

      if (!Types.ObjectId.isValid(productId)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const cart = await Cart.findOne({ user: req.user!._id });

      if (!cart) {
        res.status(404).json({ error: 'Cart not found' });
        return;
      }

      const initialCount = cart.items.length;
      cart.items = cart.items.filter(
        item => item.product.toString() !== productId
      );

      if (cart.items.length === initialCount) {
        console.log('Item not found in cart, nothing removed');
        res.status(404).json({ error: 'Item not found in cart' });
        return;
      }

      await cart.save();
      await cart.populate('items.product', 'name price images primaryImage stockQuantity status');

      console.log(`Removed product ${productId} from cart`);
      res.json(cart);
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  /**
   * Clear entire cart
   */
  public static clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('Clear cart request for user:', req.user?._id);

      const cart = await Cart.findOne({ user: req.user!._id });

      if (!cart) {
        res.status(404).json({ error: 'Cart not found' });
        return;
      }

      const clearedCount = cart.items.length;
      cart.items = [];
      await cart.save();

      console.log(`Cleared ${clearedCount} items from cart`);
      res.json(cart);
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  /**
   * Sync local cart with server (cross-device)
   */
  public static syncCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { items } = req.body;
      console.log('Sync cart request:', { itemCount: items?.length, user: req.user?._id });

      if (!Array.isArray(items)) {
        res.status(400).json({ error: 'Items must be an array' });
        return;
      }

      const productIds = items.map(item => item.productId).filter(Boolean);
      console.log(`Syncing ${productIds.length} products`);

      const validProducts = await Product.find({
        _id: { $in: productIds },
        status: 'active'
      });

      const validProductIds = new Set(validProducts.map(p => p._id.toString()));

      const validItems = await Promise.all(
        items.map(async (item) => {
          if (!validProductIds.has(item.productId)) {
            console.log(`Invalid product skipped: ${item.productId}`);
            return null;
          }

          const product = validProducts.find(p => p._id.toString() === item.productId);
          if (!product || item.quantity > product.stockQuantity) {
            console.log(`Product unavailable or insufficient stock: ${item.productId}`);
            return null;
          }

          return {
            product: product._id,
            quantity: Math.min(item.quantity, product.stockQuantity),
            price: product.price,
            name: product.name,
            image: product.primaryImage || product.images[0] || '/images/placeholder.jpg'
          };
        })
      );

      const filteredItems = validItems.filter(Boolean) as any;
      console.log(`After validation: ${filteredItems.length} valid items`);

      let cart = await Cart.findOne({ user: req.user!._id });

      if (!cart) {
        cart = new Cart({ user: req.user!._id, items: filteredItems });
        console.log('Created new cart during sync');
      } else {
        cart.items = filteredItems;
        console.log('Updated existing cart during sync');
      }

      await cart.save();
      await cart.populate('items.product', 'name price images primaryImage stockQuantity status');

      console.log(`Sync completed: ${cart.items.length} items in cart`);
      res.json(cart);
    } catch (error) {
      console.error('Sync cart error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
}
