import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, cancelOrder, requestRefund } from '../services/orderService';
import type { Order } from '../services/orderService';
import { 
  isLoggedIn, 
  getUser, 
  verifyAuth, 
  validateAuth,
  getUserDisplayName,
  isOrderOwner,
  logout 
} from '../utils/auth';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [refundingOrder, setRefundingOrder] = useState<string | null>(null);

  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    console.log('🔐 OrdersPage mounted - checking authentication');
    
    // Enhanced auth check
    const authState = verifyAuth();
    
    if (!authState.isAuthenticated) {
      console.log('🚫 User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    console.log('✅ User authenticated:', authState.user?.email);
    fetchOrders();
  }, [filter, paymentFilter, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate auth before making request
      if (!validateAuth()) {
        setError('Authentication issue. Please login again.');
        return;
      }

      console.log('🔄 Fetching orders for user:', user?.email);
      
      const params: any = { page, limit: 10 };
      if (filter !== 'all') params.status = filter;
      if (paymentFilter !== 'all') params.paymentStatus = paymentFilter;

      const response = await getUserOrders(params);
      console.log('📦 Orders received:', response.orders.length);
      
      // Filter orders to only show those belonging to current user
      const userOrders = response.orders.filter(order => 
        isOrderOwner(order.customerInfo.email)
      );
      
      console.log('👤 Filtered user orders:', userOrders.length);
      
      setOrders(userOrders);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('❌ Failed to fetch orders:', err);
      
      if (err.message.includes('Authentication failed') || err.message.includes('401')) {
        setError('Session expired. Please login again.');
        logout();
      } else {
        setError(err.message || 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancellingOrder(orderId);
      await cancelOrder(orderId, 'Customer requested cancellation');
      await fetchOrders(); // Refresh orders
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancellingOrder(null);
    }
  };

  const handleRequestRefund = async (orderId: string) => {
    const reason = prompt('Please provide a reason for refund:');
    if (!reason) return;

    try {
      setRefundingOrder(orderId);
      await requestRefund(orderId, reason);
      await fetchOrders(); // Refresh orders
    } catch (err: any) {
      alert(err.message || 'Failed to request refund');
    } finally {
      setRefundingOrder(null);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      case 'refunded': return '💸';
      default: return '📦';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
            <p className="text-sm text-gray-500">User: {user?.email}</p>
            <p className="text-sm text-gray-500">Role: {user?.role}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">
                Welcome back, {getUserDisplayName()}! Track and manage your purchases
              </p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-gray-500">Email: {user?.email}</p>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error: </strong> {error}
            {error.includes('Session expired') && (
              <button 
                onClick={() => navigate('/login')}
                className="ml-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Login Again
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Order Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">⏳ Pending</option>
                <option value="completed">✅ Completed</option>
                <option value="failed">❌ Failed</option>
                <option value="refunded">💸 Refunded</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="pending">⏳ Pending</option>
                <option value="completed">✅ Completed</option>
                <option value="failed">❌ Failed</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
            {(filter !== 'all' || paymentFilter !== 'all') && ' with selected filters'}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {filter !== 'all' || paymentFilter !== 'all' 
                ? 'Try adjusting your filters to see more orders.' 
                : "You haven't placed any orders yet."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {(filter !== 'all' || paymentFilter !== 'all') && (
                <button
                  onClick={() => {
                    setFilter('all');
                    setPaymentFilter('all');
                    setPage(1);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
              {filter === 'all' && paymentFilter === 'all' && (
                <button
                  onClick={() => navigate('/products')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Shopping
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                      <div className="text-2xl">{getStatusIcon(order.status)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.pidx}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <img
                          src={order.product.primaryImage || order.product.images[0] || '/images/placeholder.jpg'}
                          alt={order.product.name}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer"
                              onClick={() => navigate(`/product/${order.product._id}`)}>
                            {order.product.name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-2">
                            Quantity: {order.quantity}
                          </p>
                          <p className="text-lg font-semibold text-green-600">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 lg:w-48">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingOrder === order._id}
                          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {cancellingOrder === order._id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                      
                      {order.status === 'completed' && (
                        <button
                          onClick={() => handleRequestRefund(order._id)}
                          disabled={refundingOrder === order._id}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {refundingOrder === order._id ? 'Processing...' : 'Request Refund'}
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/product/${order.product._id}`)}
                        className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Product
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Footer */}
                <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Transaction ID: {order.transactionId || 'N/A'}</span>
                    <span>Last updated: {formatDate(order.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;