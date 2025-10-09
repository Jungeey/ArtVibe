import { Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentStatus, 
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log("👑 Admin fetching all orders");

    // Build filter
    const filter: any = {};

    if (status && status !== 'all') filter.status = status;
    if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    // Search filter (by order ID, pidx, transactionId, customer name/email)
    if (search) {
      filter.$or = [
        { pidx: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configuration
    const sortConfig: any = {};
    sortConfig[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(filter)
      .populate('product', 'name price images primaryImage vendor')
      .populate('user', 'name email')
      .sort(sortConfig)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select('-__v');

    const total = await Order.countDocuments(filter);

    // Get status counts for dashboard
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const paymentStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total revenue (only completed payments)
    const revenueStats = await Order.aggregate([
      {
        $match: { paymentStatus: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    console.log(`✅ Admin found ${orders.length} orders out of ${total} total`);

    // Transform orders with proper populated fields
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
          primaryImage: orderAny.product.primaryImage,
          vendor: orderAny.product.vendor
        } : null,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        customerInfo: order.customerInfo,
        shippingAddress: order.shippingAddress,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shipping: order.shipping,
        timeline: order.timeline,
        notes: order.notes,
        cancellationReason: order.cancellationReason,
        refundReason: order.refundReason,
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
      },
      analytics: {
        statusCounts: statusCounts.reduce((acc: any, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        paymentStatusCounts: paymentStatusCounts.reduce((acc: any, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        totalCompletedOrders: revenueStats[0]?.totalOrders || 0
      }
    });

  } catch (error) {
    console.error('❌ Admin get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
};

export const getAdminOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product', 'name price images primaryImage description vendor stockQuantity')
      .populate('user', 'name email phone address');

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    const orderAny = order as any;

    const transformedOrder = {
      _id: order._id,
      pidx: order.pidx,
      transactionId: order.transactionId,
      user: orderAny.user ? {
        _id: orderAny.user._id,
        name: orderAny.user.name,
        email: orderAny.user.email,
        phone: orderAny.user.phone,
        address: orderAny.user.address
      } : null,
      product: orderAny.product ? {
        _id: orderAny.product._id,
        name: orderAny.product.name,
        price: orderAny.product.price,
        images: orderAny.product.images,
        primaryImage: orderAny.product.primaryImage,
        description: orderAny.product.description,
        vendor: orderAny.product.vendor,
        stockQuantity: orderAny.product.stockQuantity
      } : null,
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      customerInfo: order.customerInfo,
      shippingAddress: order.shippingAddress,
      status: order.status,
      paymentStatus: order.paymentStatus,
      shipping: order.shipping,
      timeline: order.timeline,
      notes: order.notes,
      cancellationReason: order.cancellationReason,
      refundReason: order.refundReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    res.json({
      success: true,
      order: transformedOrder,
    });
  } catch (error) {
    console.error('❌ Admin get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
    });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, notes } = req.body;
    const { id } = req.params;

    console.log(`👑 Admin updating order ${id} status to:`, status);

    // Validate status
    const validStatuses = [
      'confirmed', 'processing', 'ready_to_ship', 'shipped', 
      'out_for_delivery', 'delivered', 'cancelled', 'refunded', 'failed'
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Invalid status',
        validStatuses
      });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    // Update order status
    order.status = status;
    
    // Add notes if provided
    if (notes) {
      order.notes = notes;
    }

    await order.save();

    // Get updated order with populated fields
    const updatedOrder = await Order.findById(id)
      .populate('product', 'name price images primaryImage vendor')
      .populate('user', 'name email');

    const orderAny = updatedOrder as any;

    console.log(`✅ Order ${id} status updated to: ${status}`);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        _id: updatedOrder!._id,
        status: updatedOrder!.status,
        timeline: updatedOrder!.timeline,
        user: orderAny.user ? {
          _id: orderAny.user._id,
          name: orderAny.user.name,
          email: orderAny.user.email
        } : null,
        product: orderAny.product ? {
          _id: orderAny.product._id,
          name: orderAny.product.name
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Admin update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
    });
  }
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentStatus } = req.body;
    const { id } = req.params;

    console.log(`👑 Admin updating order ${id} payment status to:`, paymentStatus);

    // Validate payment status
    const validPaymentStatuses = ['completed', 'refunded'];

    if (!validPaymentStatuses.includes(paymentStatus)) {
      res.status(400).json({
        success: false,
        error: 'Invalid payment status',
        validPaymentStatuses
      });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    // Update payment status
    order.paymentStatus = paymentStatus;

    // If refunding payment status, also update order status
    if (paymentStatus === 'refunded') {
      order.status = 'refunded';
    }

    await order.save();

    console.log(`✅ Order ${id} payment status updated to: ${paymentStatus}`);

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      order: {
        _id: order._id,
        paymentStatus: order.paymentStatus,
        status: order.status
      }
    });

  } catch (error) {
    console.error('❌ Admin update payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment status',
    });
  }
};

export const updateShippingInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { carrier, trackingNumber, estimatedDelivery } = req.body;
    const { id } = req.params;

    console.log(`👑 Admin updating shipping info for order ${id}`);

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    // Update shipping information
    if (carrier) order.shipping.carrier = carrier;
    if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.shipping.estimatedDelivery = new Date(estimatedDelivery);

    // If adding tracking info and order is not yet shipped, update status
    if (trackingNumber && order.status === 'ready_to_ship') {
      order.status = 'shipped';
    }

    await order.save();

    console.log(`✅ Order ${id} shipping info updated`);

    res.json({
      success: true,
      message: 'Shipping information updated successfully',
      shipping: order.shipping,
      status: order.status
    });

  } catch (error) {
    console.error('❌ Admin update shipping info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update shipping information',
    });
  }
};

export const addOrderNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notes } = req.body;
    const { id } = req.params;

    if (!notes) {
      res.status(400).json({
        success: false,
        error: 'Notes are required',
      });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    // Append new notes or replace based on your requirement
    order.notes = notes; // This replaces existing notes
    // If you want to append: order.notes = order.notes ? `${order.notes}\n${notes}` : notes;

    await order.save();

    console.log(`✅ Notes added to order ${id}`);

    res.json({
      success: true,
      message: 'Notes added successfully',
      notes: order.notes
    });

  } catch (error) {
    console.error('❌ Admin add notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add notes',
    });
  }
};

export const adminCancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cancellationReason } = req.body;
    const { id } = req.params;

    console.log(`👑 Admin cancelling order ${id}`);

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    // Check if order can be cancelled (not already delivered or cancelled)
    if (order.status === 'delivered') {
      res.status(400).json({
        success: false,
        error: 'Cannot cancel delivered order',
      });
      return;
    }

    if (order.status === 'cancelled') {
      res.status(400).json({
        success: false,
        error: 'Order is already cancelled',
      });
      return;
    }

    // Update order status and reason
    order.status = 'cancelled';
    order.cancellationReason = cancellationReason;
    await order.save();

    console.log(`✅ Order ${id} cancelled by admin`);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        _id: order._id,
        status: order.status,
        cancellationReason: order.cancellationReason
      }
    });

  } catch (error) {
    console.error('❌ Admin cancel order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel order',
    });
  }
};

export const processRefund = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refundReason } = req.body;
    const { id } = req.params;

    console.log(`👑 Admin processing refund for order ${id}`);

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    // Update both status and payment status
    order.status = 'refunded';
    order.paymentStatus = 'refunded';
    order.refundReason = refundReason;
    await order.save();

    console.log(`✅ Refund processed for order ${id}`);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      order: {
        _id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        refundReason: order.refundReason
      }
    });

  } catch (error) {
    console.error('❌ Admin process refund error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund',
    });
  }
};

export const getOrderStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log("👑 Admin fetching order statistics");

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Get this month's date range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Total statistics
    const totalStats = await Order.aggregate([
      {
        $facet: {
          totalRevenue: [
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ],
          totalOrders: [
            { $group: { _id: null, total: { $sum: 1 } } }
          ],
          todayStats: [
            { 
              $match: { 
                createdAt: { $gte: today, $lt: tomorrow },
                paymentStatus: 'completed'
              } 
            },
            { 
              $group: { 
                _id: null, 
                revenue: { $sum: '$totalAmount' },
                orders: { $sum: 1 }
              } 
            }
          ],
          weeklyStats: [
            { 
              $match: { 
                createdAt: { $gte: startOfWeek, $lt: endOfWeek },
                paymentStatus: 'completed'
              } 
            },
            { 
              $group: { 
                _id: null, 
                revenue: { $sum: '$totalAmount' },
                orders: { $sum: 1 }
              } 
            }
          ],
          monthlyStats: [
            { 
              $match: { 
                createdAt: { $gte: startOfMonth, $lt: endOfMonth },
                paymentStatus: 'completed'
              } 
            },
            { 
              $group: { 
                _id: null, 
                revenue: { $sum: '$totalAmount' },
                orders: { $sum: 1 }
              } 
            }
          ]
        }
      }
    ]);

    // Status counts
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent orders (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    const stats = {
      totalRevenue: totalStats[0]?.totalRevenue[0]?.total || 0,
      totalOrders: totalStats[0]?.totalOrders[0]?.total || 0,
      todayRevenue: totalStats[0]?.todayStats[0]?.revenue || 0,
      todayOrders: totalStats[0]?.todayStats[0]?.orders || 0,
      weeklyRevenue: totalStats[0]?.weeklyStats[0]?.revenue || 0,
      weeklyOrders: totalStats[0]?.weeklyStats[0]?.orders || 0,
      monthlyRevenue: totalStats[0]?.monthlyStats[0]?.revenue || 0,
      monthlyOrders: totalStats[0]?.monthlyStats[0]?.orders || 0,
      recentOrders,
      statusCounts: statusCounts.reduce((acc: any, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Admin get order stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order statistics',
    });
  }
};