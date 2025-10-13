import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth';
import Order from '../models/Order';
import Product from '../models/Product';

const router = express.Router();

// All routes require vendor role
router.use(protect, authorizeRoles('vendor'));

// Get vendor's orders
router.get('/orders', async (req: any, res: any) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      status, 
      paymentStatus, 
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log("🏪 Vendor fetching orders for user:", req.user._id);

    // First, get all product IDs for this vendor
    const vendorProducts = await Product.find({ vendor: req.user._id }).select('_id');
    const vendorProductIds = vendorProducts.map(product => product._id);

    // Build filter - only show orders for vendor's products
    const filter: any = {
      product: { $in: vendorProductIds }
    };

    if (status && status !== 'all') filter.status = status;
    if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { pidx: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { 'product.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configuration
    const sortConfig: any = {};
    sortConfig[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(filter)
      .populate('product', 'name price images primaryImage description vendor')
      .populate('user', 'name email')
      .sort(sortConfig)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select('-__v');

    const total = await Order.countDocuments(filter);

    // Get analytics for vendor
    const revenueStats = await Order.aggregate([
      { 
        $match: { 
          product: { $in: vendorProductIds },
          paymentStatus: 'completed'
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        } 
      }
    ]);

    const statusCounts = await Order.aggregate([
      { 
        $match: { product: { $in: vendorProductIds } } 
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const paymentStatusCounts = await Order.aggregate([
      { 
        $match: { product: { $in: vendorProductIds } } 
      },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log(`✅ Vendor found ${orders.length} orders out of ${total} total`);

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      analytics: {
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        totalOrders: total,
        statusCounts: statusCounts.reduce((acc: any, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        paymentStatusCounts: paymentStatusCounts.reduce((acc: any, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('❌ Vendor get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor orders',
    });
  }
});

// Get vendor order statistics
router.get('/orders/stats', async (req: any, res: any) => {
  try {
    console.log("🏪 Vendor fetching order statistics for user:", req.user._id);

    // Get vendor's product IDs
    const vendorProducts = await Product.find({ vendor: req.user._id }).select('_id');
    const vendorProductIds = vendorProducts.map(product => product._id);

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
        $match: { product: { $in: vendorProductIds } }
      },
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
        $match: { product: { $in: vendorProductIds } }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalRevenue: totalStats[0]?.totalRevenue[0]?.total || 0,
      totalOrders: totalStats[0]?.totalOrders[0]?.total || 0,
      todayRevenue: totalStats[0]?.todayStats[0]?.revenue || 0,
      todayOrders: totalStats[0]?.todayStats[0]?.orders || 0,
      weeklyRevenue: totalStats[0]?.weeklyStats[0]?.revenue || 0,
      weeklyOrders: totalStats[0]?.weeklyStats[0]?.orders || 0,
      monthlyRevenue: totalStats[0]?.monthlyStats[0]?.revenue || 0,
      monthlyOrders: totalStats[0]?.monthlyStats[0]?.orders || 0,
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
    console.error('❌ Vendor get order stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor order statistics',
    });
  }
});

export default router;