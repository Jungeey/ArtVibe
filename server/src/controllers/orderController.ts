import { Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { Request } from 'express';

export const createOrderAndUpdateStock = async (req: AuthRequest, res: Response) => {
  try {
    const { pidx, transactionId, productId, quantity, totalAmount, customerInfo, shippingAddress } = req.body;

    console.log('📦 Creating order request:', {
      pidx, 
      productId, 
      quantity, 
      totalAmount,
      user: req.user?.id
    });

    // Validate required fields
    const requiredFields = ['pidx', 'productId', 'quantity', 'totalAmount'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: 'Authentication required to create order'
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

    // 4. Create order with user ID - UPDATED STATUSES
    const orderData = {
      pidx,
      transactionId,
      product: productId,
      user: req.user.id,
      quantity,
      totalAmount,
      customerInfo: customerInfo || {
        name: req.user.name || "Customer",
        email: req.user.email || "customer@example.com",
        phone: "9800000000"
      },
      shippingAddress: shippingAddress || {
        fullName: req.user.name || "Customer",
        street: "123 Main St",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
        country: "Nepal",
        phone: "9800000000"
      },
      status: 'confirmed' as const, // UPDATED: Start with 'confirmed'
      paymentStatus: 'completed' as const // UPDATED: Payment is completed
    };

    const order = new Order(orderData);
    await order.save();

    // 5. Update product stock
    const oldStock = product.stockQuantity;
    product.stockQuantity -= quantity;
    
    if (product.stockQuantity === 0) {
      product.status = 'unlisted';
      console.log(`🔄 Product ${product.name} marked as unlisted due to zero stock`);
    }
    
    await product.save();

    // Get populated order
    const populatedOrder = await Order.findById(order._id)
      .populate('product', 'name price images primaryImage')
      .populate('user', 'name email');

    if (!populatedOrder) {
      return res.status(500).json({
        error: 'Failed to retrieve created order'
      });
    }

    console.log('✅ Order created successfully:', {
      orderId: populatedOrder._id,
      userId: (populatedOrder as any).user?._id,
      product: (populatedOrder as any).product?.name,
      quantity,
      totalAmount,
      stockUpdate: `${oldStock} → ${product.stockQuantity}`
    });

    // Use type assertion for populated fields
    const populatedOrderAny = populatedOrder as any;

    res.status(201).json({
      success: true,
      message: 'Order created and stock updated successfully',
      order: {
        _id: populatedOrder._id,
        pidx: populatedOrder.pidx,
        transactionId: populatedOrder.transactionId,
        user: populatedOrderAny.user ? {
          _id: populatedOrderAny.user._id,
          name: populatedOrderAny.user.name,
          email: populatedOrderAny.user.email
        } : null,
        product: populatedOrderAny.product ? {
          _id: populatedOrderAny.product._id,
          name: populatedOrderAny.product.name,
          price: populatedOrderAny.product.price,
          images: populatedOrderAny.product.images,
          primaryImage: populatedOrderAny.product.primaryImage
        } : null,
        quantity: populatedOrder.quantity,
        totalAmount: populatedOrder.totalAmount,
        customerInfo: populatedOrder.customerInfo,
        shippingAddress: populatedOrder.shippingAddress,
        status: populatedOrder.status,
        paymentStatus: populatedOrder.paymentStatus,
        createdAt: populatedOrder.createdAt
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
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Order with this pidx already exists',
        details: 'Duplicate pidx detected'
      });
    }
    
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

export const getOrderByPidx = async (req: AuthRequest, res: Response) => {
  try {
    const { pidx } = req.params;
    
    if (!pidx) {
      return res.status(400).json({ error: 'pidx parameter is required' });
    }

    const order = await Order.findOne({ pidx })
      .populate('product', 'name price images primaryImage')
      .populate('user', 'name email')
      .select('-__v');
    
    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found',
        pidx 
      });
    }

    // FIX: Use type assertion for populated fields
    const orderAny = order as any;

    res.json({
      success: true,
      order: {
        _id: order._id,
        pidx: order.pidx,
        transactionId: order.transactionId,
        user: orderAny.user ? {
          _id: orderAny.user._id,
          name: orderAny.user.name,
          email: orderAny.user.email
        } : null,
        product: orderAny.product ? {
          _id: orderAny.product._id,
          name: orderAny.product.name,
          price: orderAny.product.price,
          images: orderAny.product.images,
          primaryImage: orderAny.product.primaryImage
        } : null,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        customerInfo: order.customerInfo,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
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
      .populate('product', 'name price images primaryImage')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select('-__v');

    const total = await Order.countDocuments({ product: productId });

    // FIX: Transform orders with proper populated fields
    const transformedOrders = orders.map(order => {
      const orderAny = order as any;
      return {
        _id: order._id,
        pidx: order.pidx,
        transactionId: order.transactionId,
        user: orderAny.user ? {
          _id: orderAny.user._id,
          name: orderAny.user.name,
          email: orderAny.user.email
        } : null,
        product: orderAny.product ? {
          _id: orderAny.product._id,
          name: orderAny.product.name,
          price: orderAny.product.price,
          images: orderAny.product.images,
          primaryImage: orderAny.product.primaryImage
        } : null,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        customerInfo: order.customerInfo,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });

    res.json({
      success: true,
      orders: transformedOrders,
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