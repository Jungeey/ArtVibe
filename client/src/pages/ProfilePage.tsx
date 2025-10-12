import React, { useState, useEffect } from 'react';
import UserProfileForm from '../components/UserProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { getUser, isUser, VendorVerificationStatus } from '../utils/auth';
import type { User } from '../utils/auth'; 
import { toast } from 'react-toastify';
import { getUserOrders, OrderService } from '../services/orderService';

// Define Order interfaces locally since they're not exported from orderService
interface OrderProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  primaryImage?: string;
  description?: string;
  vendor?: any;
}

interface Order {
  _id: string;
  pidx: string;
  transactionId?: string;
  product: OrderProduct;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  quantity: number;
  totalAmount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  status: 'confirmed' | 'processing' | 'ready_to_ship' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded' | 'failed';
  paymentStatus: 'completed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Define a more complete user type for this component
interface AppUser extends User {
  verificationStatus?: 'pending' | 'approved' | 'suspended';
  vendorVerified?: boolean;
  businessName?: string;
}

// Analytics interfaces
interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  statusBreakdown: { [key: string]: number };
  paymentStatusBreakdown: { [key: string]: number };
  recentOrders: Order[];
  monthlyRevenue: number;
  weeklyRevenue: number;
  todayRevenue: number;
  todayOrders: number;
}

// Filter types
interface OrderFilters {
  searchTerm: string;
  status: string;
  paymentStatus: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  amountRange: {
    min: string;
    max: string;
  };
  sortBy: 'createdAt' | 'totalAmount' | 'customerName';
  sortOrder: 'asc' | 'desc';
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'orders'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Enhanced filters
  const [filters, setFilters] = useState<OrderFilters>({
    searchTerm: '',
    status: 'all',
    paymentStatus: 'all',
    dateRange: {
      startDate: '',
      endDate: ''
    },
    amountRange: {
      min: '',
      max: ''
    },
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const currentUser = getUser() as AppUser | null;

  const tabs: { id: string; name: string; icon: string }[] = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'password', name: 'Password', icon: '🔒' },
    // Only add the orders tab if not a regular user
    ...(!isUser() ? [{ id: 'orders', name: 'Orders Analytics', icon: '📊' }] : []),
  ];

  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'ready_to_ship', label: 'Ready to Ship' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'All Payment Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  // Fetch orders and analytics
  useEffect(() => {
    if (activeTab === 'orders' && (isVendor || isAdmin)) {
      fetchOrdersAndAnalytics();
    }
  }, [activeTab]);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  const fetchOrdersAndAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await getUserOrders({
        limit: 100, // Get more orders for better analytics
        page: 1
      });
      
      setOrders(response.orders);
      calculateAnalytics(response.orders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load order analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(order => 
        order.product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        order.customerInfo.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        order.pidx.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Payment status filter
    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === filters.paymentStatus);
    }

    // Date range filter
    if (filters.dateRange.startDate) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= new Date(filters.dateRange.startDate)
      );
    }
    if (filters.dateRange.endDate) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) <= new Date(filters.dateRange.endDate)
      );
    }

    // Amount range filter
    if (filters.amountRange.min) {
      filtered = filtered.filter(order => order.totalAmount >= parseFloat(filters.amountRange.min));
    }
    if (filters.amountRange.max) {
      filtered = filtered.filter(order => order.totalAmount <= parseFloat(filters.amountRange.max));
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'customerName':
          aValue = a.customerInfo.name;
          bValue = b.customerInfo.name;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  };

  const calculateAnalytics = (orders: Order[]) => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(order => order.paymentStatus === 'completed')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const completedOrders = orders.filter(order => 
      order.status === 'delivered' && order.paymentStatus === 'completed'
    ).length;
    
    const pendingOrders = orders.filter(order => 
      !['delivered', 'cancelled', 'refunded'].includes(order.status)
    ).length;
    
    const cancelledOrders = orders.filter(order => 
      ['cancelled', 'refunded'].includes(order.status)
    ).length;

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Status breakdown
    const statusBreakdown = orders.reduce((acc: { [key: string]: number }, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Payment status breakdown
    const paymentStatusBreakdown = orders.reduce((acc: { [key: string]: number }, order) => {
      acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
      return acc;
    }, {});

    // Recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Calculate time-based revenues
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const todayRevenue = orders
      .filter(order => new Date(order.createdAt) >= today && order.paymentStatus === 'completed')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const todayOrders = orders.filter(order => new Date(order.createdAt) >= today).length;

    const weeklyRevenue = orders
      .filter(order => new Date(order.createdAt) >= oneWeekAgo && order.paymentStatus === 'completed')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const monthlyRevenue = orders
      .filter(order => new Date(order.createdAt) >= oneMonthAgo && order.paymentStatus === 'completed')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    setAnalytics({
      totalOrders,
      totalRevenue,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      averageOrderValue,
      statusBreakdown,
      paymentStatusBreakdown,
      recentOrders,
      monthlyRevenue,
      weeklyRevenue,
      todayRevenue,
      todayOrders
    });
  };

  const handleProfileUpdate = (userData: any) => {
    console.log('Profile updated:', userData);
    toast.success('Profile updated successfully!');
  };

  const handlePasswordChangeSuccess = () => {
    toast.success('Password changed successfully!');
  };

  const handlePasswordChangeCancel = () => {
    setActiveTab('profile');
  };

  // Get verification status for vendors only
  const getVerificationStatus = () => {
    console.log('Current user:', currentUser);
    if (currentUser?.role !== 'vendor') {
      return null;
    }
    
    const status = VendorVerificationStatus();
    console.log('Vendor verification status:', status);
    
    switch (status) {
      case 'approved':
        return { status: 'approved', display: 'Approved', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'pending':
        return { status: 'pending', display: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'rejected':
        return { status: 'rejected', display: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'suspended':
        return { status: 'suspended', display: 'Suspended', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      default:
        return { status: 'pending', display: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    }
  };

  const verificationInfo = getVerificationStatus();
  const isVendor = currentUser?.role === 'vendor';
  const isAdmin = currentUser?.role === 'admin';

  // Safe user data access
  const userName = currentUser?.name || 'User';
  const userEmail = currentUser?.email || 'No email';
  const userRole = currentUser?.role || 'user';
  const userInitial = userName.charAt(0).toUpperCase();

  // Reset filters
  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      paymentStatus: 'all',
      dateRange: { startDate: '', endDate: '' },
      amountRange: { min: '', max: '' },
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Render enhanced order analytics dashboard
  const renderOrderAnalytics = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!analytics) {
      return (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {isVendor 
              ? 'You haven\'t received any orders yet. Start by adding products to your store.'
              : 'No order data available for analytics.'
            }
          </p>
          {isVendor && (
            <button
              onClick={() => window.location.href = '/vendor-dashboard'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
            >
              Manage Products
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Enhanced Analytics Header with Filters Toggle */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isVendor ? 'Vendor Sales Analytics' : 'Admin Order Analytics'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isVendor 
                  ? 'Track your sales performance and order analytics'
                  : 'Comprehensive overview of all orders and sales performance'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-200 font-medium flex items-center"
              >
                <span className="mr-2">🔍</span>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-lg">📊</span>
              </div>
            </div>
          </div>

          {/* Enhanced Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {paymentStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="createdAt">Order Date</option>
                    <option value="totalAmount">Total Amount</option>
                    <option value="customerName">Customer Name</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.dateRange.startDate}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, startDate: e.target.value } 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.dateRange.endDate}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, endDate: e.target.value } 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Amount Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount (Rs)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.amountRange.min}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      amountRange: { ...prev.amountRange, min: e.target.value } 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount (Rs)</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.amountRange.max}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      amountRange: { ...prev.amountRange, max: e.target.value } 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    onClick={resetFilters}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200 font-medium"
                  >
                    Reset Filters
                  </button>
                  <div className="text-sm text-gray-600">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-800">{analytics.totalOrders}</p>
                  <p className="text-xs text-blue-600 mt-1">{analytics.todayOrders} today</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-800">Rs {analytics.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">Rs {analytics.todayRevenue.toLocaleString()} today</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-orange-800">{analytics.completedOrders}</p>
                  <p className="text-xs text-orange-600 mt-1">
                    {analytics.totalOrders > 0 
                      ? ((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1) 
                      : '0'
                    }% success rate
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Avg. Order</p>
                  <p className="text-2xl font-bold text-purple-800">Rs {analytics.averageOrderValue.toFixed(2)}</p>
                  <p className="text-xs text-purple-600 mt-1">Rs {analytics.weeklyRevenue.toLocaleString()} this week</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">📈</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
              <div className="space-y-3">
                {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{OrderService.getStatusIcon(status)}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {OrderService.getStatusDisplay(status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${OrderService.getStatusColor(status)}`}>
                        {((count / analytics.totalOrders) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Status & Quick Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status & Quick Stats</h3>
              <div className="space-y-3">
                {/* Payment Status Breakdown */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Status</h4>
                  {Object.entries(analytics.paymentStatusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600 capitalize">{status}</span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">Pending Orders</span>
                    <span className="text-sm font-bold text-orange-600">{analytics.pendingOrders}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">Cancelled/Refunded</span>
                    <span className="text-sm font-bold text-red-600">{analytics.cancelledOrders}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">Monthly Revenue</span>
                    <span className="text-sm font-bold text-green-600">
                      Rs {analytics.monthlyRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">Total Products Sold</span>
                    <span className="text-sm font-bold text-blue-600">
                      {orders.reduce((sum, order) => sum + order.quantity, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Orders Table with Filtering */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Order History</h3>
              <p className="text-gray-600 mt-1">
                {filteredOrders.length} orders found {filters.searchTerm || filters.status !== 'all' ? '(filtered)' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                Sorted by: {filters.sortBy} ({filters.sortOrder})
              </span>
            </div>
          </div>

          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div 
                  key={order._id} 
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderModal(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {order.product.primaryImage ? (
                          <img 
                            src={order.product.primaryImage} 
                            alt={order.product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <span className="text-lg">📦</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.product.name}</p>
                        <p className="text-sm text-gray-500">
                          Order #: {order.pidx} • Qty: {order.quantity} • Rs {order.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Customer: {order.customerInfo.name} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${OrderService.getStatusColor(order.status)}`}>
                        {OrderService.getStatusDisplay(order.status)}
                      </span>
                      <p className={`text-xs font-medium px-2 py-1 rounded-full mt-1 ${
                        order.paymentStatus === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.paymentStatus === 'completed' ? 'Paid' : 'Refunded'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {orders.length === 0 ? 'No orders found' : 'No orders match your filters'}
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Order ID:</strong> {selectedOrder.pidx}</p>
                      <p><strong>Product:</strong> {selectedOrder.product.name}</p>
                      <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                      <p><strong>Total Amount:</strong> Rs {selectedOrder.totalAmount.toLocaleString()}</p>
                      <p><strong>Ordered:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedOrder.customerInfo.name}</p>
                      <p><strong>Email:</strong> {selectedOrder.customerInfo.email}</p>
                      <p><strong>Phone:</strong> {selectedOrder.customerInfo.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          {isVendor && (
            <button
              onClick={() => window.location.href = '/vendor-dashboard'}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition duration-200 font-medium flex items-center"
            >
              <span className="mr-2">🏪</span>
              Go to Vendor Dashboard
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => window.location.href = '/admin-dashboard'}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-medium flex items-center"
            >
              <span className="mr-2">⚙️</span>
              Admin Dashboard
            </button>
          )}
          <button
            onClick={fetchOrdersAndAnalytics}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center"
          >
            <span className="mr-2">🔄</span>
            Refresh Analytics
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userName}! Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="space-y-2">
                {tabs.filter(Boolean).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-medium border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'
                    }`}
                  >
                    <span className="text-lg mr-3">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* User Info Card */}
              <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">
                      {userInitial}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-600">{userEmail}</p>
                    <p className={`text-xs capitalize mt-1 bg-white px-2 py-1 rounded-full inline-block ${
                      isAdmin 
                        ? 'text-purple-600 border border-purple-200'
                        : isVendor
                        ? 'text-orange-600 border border-orange-200'
                        : 'text-blue-600 border border-blue-200'
                    }`}>
                      {userRole} Account
                    </p>
                  </div>
                </div>
                
                {/* Vendor-specific status - ONLY FOR VENDORS */}
                {isVendor && verificationInfo && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Verification Status:</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${verificationInfo.color}`}>
                          {verificationInfo.display}
                        </span>
                      </div>
                      
                      {/* Vendor verification badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Verified Vendor:</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                          currentUser?.vendorVerified
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {currentUser?.vendorVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin badge - ONLY FOR ADMINS */}
                {isAdmin && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Admin Access:</span>
                      <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full border border-purple-200">
                        Full Access
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics?.totalOrders || 0}
                  </div>
                  <div className="text-xs text-gray-500">Total Orders</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    Rs {analytics?.totalRevenue.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-gray-500">Revenue</div>
                </div>
              </div>

              {/* Role-specific quick actions */}
              <div className="mt-4 space-y-2">
                {isVendor && (
                  <button
                    onClick={() => window.location.href = '/vendor-dashboard'}
                    className="w-full bg-orange-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-600 transition duration-200 flex items-center justify-center"
                  >
                    <span className="mr-2">🏪</span>
                    Vendor Dashboard
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => window.location.href = '/admin-dashboard'}
                    className="w-full bg-purple-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-600 transition duration-200 flex items-center justify-center"
                  >
                    <span className="mr-2">⚙️</span>
                    Admin Panel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                      <p className="text-gray-600 mt-1">
                        {isVendor 
                          ? 'Manage your vendor profile and business information' 
                          : isAdmin
                          ? 'Manage your administrator profile'
                          : 'Manage your personal information'
                        }
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isVendor ? 'bg-orange-100' : isAdmin ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      <span className={`text-lg ${
                        isVendor ? 'text-orange-600' : isAdmin ? 'text-purple-600' : 'text-blue-600'
                      }`}>
                        {isVendor ? '🏪' : isAdmin ? '⚙️' : '👤'}
                      </span>
                    </div>
                  </div>
                  <UserProfileForm onUpdate={handleProfileUpdate} />
                </div>

                {/* Vendor-specific information */}
                {isVendor && verificationInfo && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Vendor Account Information
                    </h3>
                    <p className="text-orange-700 text-sm">
                      {verificationInfo.status === 'approved' 
                        ? '✅ Your vendor account is approved and active. You can now list products and manage orders.'
                        : verificationInfo.status === 'pending'
                        ? '⏳ Your vendor application is being reviewed. You will be notified once approved.'
                        : verificationInfo.status === 'rejected'
                        ? '❌ Your vendor application was rejected. Please contact support for more information.'
                        : '📝 Complete your vendor profile to get started with selling on our platform.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                      <p className="text-gray-600 mt-1">Secure your account with a new password</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">🔒</span>
                    </div>
                  </div>
                  <ChangePasswordForm 
                    onSuccess={handlePasswordChangeSuccess}
                    onCancel={handlePasswordChangeCancel}
                  />
                </div>
              </div>
            )}

            {/* Orders Analytics Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {renderOrderAnalytics()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;