import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';

export const createOrderAndUpdateStock = async (req: Request, res: Response) => {
  try {
    const { pidx, transactionId, productId, quantity, totalAmount, customerInfo } = req.body;

    console.log('📦 Creating order request:', {
      pidx, 
      productId, 
      quantity, 
      totalAmount
    });

    // Validate required fields
    const requiredFields = ['pidx', 'productId', 'quantity', 'totalAmount'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // 1. Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        productId 
      });
    }

    // 2. Check if order with this pidx already exists
    const existingOrder = await Order.findOne({ pidx });
    if (existingOrder) {
      console.log('⚠️ Order already exists with pidx:', pidx);
      return res.status(409).json({ 
        error: 'Order already exists',
        orderId: existingOrder._id
      });
    }

    // 3. Check if sufficient stock is available
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock available',
        availableStock: product.stockQuantity,
        requestedQuantity: quantity,
        productName: product.name
      });
    }

    // 4. Create order
    const orderData = {
      pidx,
      transactionId,
      product: productId,
      quantity,
      totalAmount,
      customerInfo: customerInfo || {
        name: "Customer",
        email: "customer@example.com",
        phone: "9800000000"
      },
      status: 'completed' as const,
      paymentStatus: 'completed' as const
    };

    const order = new Order(orderData);
    await order.save();

    // 5. Update product stock
    const oldStock = product.stockQuantity;
    product.stockQuantity -= quantity;
    
    // If stock becomes 0, update product status
    if (product.stockQuantity === 0) {
      product.status = 'unlisted';
      console.log(`🔄 Product ${product.name} marked as unlisted due to zero stock`);
    }
    
    await product.save();

    // Populate product details for response
    await order.populate('product');

    console.log('✅ Order created successfully:', {
      orderId: order._id,
      product: product.name,
      quantity,
      totalAmount,
      stockUpdate: `${oldStock} → ${product.stockQuantity}`
    });

    res.status(201).json({
      success: true,
      message: 'Order created and stock updated successfully',
      order: {
        _id: order._id,
        pidx: order.pidx,
        transactionId: order.transactionId,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price
        },
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      },
      stockUpdate: {
        productId: product._id,
        productName: product.name,
        oldStock,
        newStock: product.stockQuantity
      }
    });

  } catch (error: any) {
    console.error('❌ Error creating order:', error);
    
    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Order with this pidx already exists',
        details: 'Duplicate pidx detected'
      });
    }
    
    // MongoDB validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.message
      });
    }

    res.status(500).json({ 
      error: 'Failed to create order',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getOrderByPidx = async (req: Request, res: Response) => {
  try {
    const { pidx } = req.params;
    
    if (!pidx) {
      return res.status(400).json({ error: 'pidx parameter is required' });
    }

    const order = await Order.findOne({ pidx })
      .populate('product', 'name price images primaryImage')
      .select('-__v');
    
    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found',
        pidx 
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
    });
  }
};

export const getOrdersByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ product: productId })
      .populate('product', 'name price')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select('-__v');

    const total = await Order.countDocuments({ product: productId });

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching product orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
    });
  }
};