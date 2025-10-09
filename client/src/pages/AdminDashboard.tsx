import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

interface Vendor {
  _id: string;
  name: string;
  email: string;
  businessName?: string;
  businessLicense?: string;
  verificationStatus: string;
  vendorVerified?: boolean;
}

interface Order {
  _id: string;
  pidx: string;
  transactionId: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    primaryImage?: string;
    vendor?: string;
  };
  user: {
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
  shipping: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
  timeline: {
    orderedAt: string;
    confirmedAt?: string;
    processingAt?: string;
    readyToShipAt?: string;
    shippedAt?: string;
    outForDeliveryAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
  };
  notes?: string;
  cancellationReason?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderStats {
  totalRevenue: number;
  totalOrders: number;
  todayRevenue: number;
  todayOrders: number;
  weeklyRevenue: number;
  weeklyOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  recentOrders: number;
  statusCounts: Record<string, number>;
}

const vendorTabs = ['pending', 'verified', 'suspended'];
const orderTabs = ['all', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminDashboard() {
  const [activeMainTab, setActiveMainTab] = useState<'vendors' | 'orders'>('vendors');
  const [activeVendorTab, setActiveVendorTab] = useState('pending');
  const [activeOrderTab, setActiveOrderTab] = useState('all');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const token = localStorage.getItem('token');

  // Fetch vendors
  const fetchVendors = async (status: string) => {
    try {
      const res = await api.get(`/admin/vendors/${status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error fetching vendors');
    }
  };

  // Fetch orders with filters
  const fetchOrders = async (status: string = 'all') => {
    setLoading(true);
    try {
      const params: any = {};
      if (status !== 'all') params.status = status;
      if (searchTerm) params.search = searchTerm;
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const res = await api.get('/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setOrders(res.data.orders || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch order statistics
  const fetchOrderStats = async () => {
    try {
      const res = await api.get('/admin/orders/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderStats(res.data.stats);
    } catch (err: any) {
      console.error('Error fetching order stats:', err);
    }
  };

  // Vendor actions
  const handleVendorAction = async (id: string, action: 'verify' | 'suspend' | 'reactivate') => {
    try {
      await api.patch(`/admin/vendor/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Vendor ${action}d successfully`);
      fetchVendors(activeVendorTab);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Error performing ${action}`);
    }
  };

  // Order actions
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    setUpdatingOrderId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order status updated successfully');
      fetchOrders(activeOrderTab);
      setShowOrderModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: 'completed' | 'refunded') => {
    setUpdatingOrderId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/payment-status`, 
        { paymentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Payment status updated successfully');
      fetchOrders(activeOrderTab);
      setShowOrderModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating payment status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdateShippingInfo = async (orderId: string, shippingInfo: { carrier: string; trackingNumber: string }) => {
    setUpdatingOrderId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/shipping`, 
        shippingInfo,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Shipping information updated successfully');
      fetchOrders(activeOrderTab);
      setShowOrderModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating shipping info');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleAddNotes = async (orderId: string, notes: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/notes`, 
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Notes added successfully');
      fetchOrders(activeOrderTab);
      setShowOrderModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error adding notes');
    }
  };

  // Effects
  useEffect(() => {
    if (activeMainTab === 'vendors') {
      fetchVendors(activeVendorTab);
    }
  }, [activeVendorTab, activeMainTab]);

  useEffect(() => {
    if (activeMainTab === 'orders') {
      fetchOrders(activeOrderTab);
      fetchOrderStats();
    }
  }, [activeOrderTab, activeMainTab]);

  // Helper functions
  const getStatusColor = (status: Order['status']) => {
    const statusColors = {
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      ready_to_ship: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link
            to="/admin/categories"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Manage Categories
          </Link>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeMainTab === 'vendors'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveMainTab('vendors')}
        >
          Vendor Management
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeMainTab === 'orders'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveMainTab('orders')}
        >
          Order Management
        </button>
      </div>

      {/* Vendor Management Tab */}
      {activeMainTab === 'vendors' && (
        <>
          {/* Vendor Tabs */}
          <div className="flex space-x-4 mb-6">
            {vendorTabs.map(tab => (
              <button
                key={tab}
                className={`px-4 py-2 rounded ${
                  activeVendorTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => setActiveVendorTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Vendors Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Business Name</th>
                  <th className="border px-4 py-2">License</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      No vendors found
                    </td>
                  </tr>
                )}
                {vendors.map(vendor => (
                  <tr key={vendor._id}>
                    <td className="border px-4 py-2">{vendor.name}</td>
                    <td className="border px-4 py-2">{vendor.email}</td>
                    <td className="border px-4 py-2">{vendor.businessName || '-'}</td>
                    <td className="border px-4 py-2">{vendor.businessLicense || '-'}</td>
                    <td className="border px-4 py-2 capitalize">{vendor.verificationStatus}</td>
                    <td className="border px-4 py-2 space-x-2">
                      {activeVendorTab === 'pending' && (
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                          onClick={() => handleVendorAction(vendor._id, 'verify')}
                        >
                          Verify
                        </button>
                      )}
                      {activeVendorTab !== 'suspended' && (
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                          onClick={() => handleVendorAction(vendor._id, 'suspend')}
                        >
                          Suspend
                        </button>
                      )}
                      {activeVendorTab === 'suspended' && (
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                          onClick={() => handleVendorAction(vendor._id, 'reactivate')}
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Order Management Tab */}
      {activeMainTab === 'orders' && (
        <>
          {/* Order Statistics */}
          {orderStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold">Total Revenue</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(orderStats.totalRevenue)}
                </p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold">Total Orders</h3>
                <p className="text-2xl font-bold text-blue-600">{orderStats.totalOrders}</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold">Today's Revenue</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(orderStats.todayRevenue)}
                </p>
                <p className="text-sm text-gray-600">{orderStats.todayOrders} orders</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold">Monthly Revenue</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(orderStats.monthlyRevenue)}
                </p>
                <p className="text-sm text-gray-600">{orderStats.monthlyOrders} orders</p>
              </div>
            </div>
          )}

          {/* Order Filters */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => fetchOrders(activeOrderTab)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Order Tabs */}
            <div className="flex flex-wrap gap-2">
              {orderTabs.map(tab => (
                <button
                  key={tab}
                  className={`px-3 py-1 rounded text-sm ${
                    activeOrderTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setActiveOrderTab(tab)}
                >
                  {tab.replace(/_/g, ' ').toUpperCase()}
                  {orderStats?.statusCounts[tab] && ` (${orderStats.statusCounts[tab]})`}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No orders found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Order #: {order.pidx}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Qty: {order.quantity}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customerInfo.name}</div>
                          <div className="text-sm text-gray-500">{order.customerInfo.email}</div>
                          <div className="text-sm text-gray-500">{order.customerInfo.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            order.paymentStatus === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.paymentStatus.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                            {order.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <p><strong>Order ID:</strong> {selectedOrder.pidx}</p>
                  <p><strong>Transaction ID:</strong> {selectedOrder.transactionId || 'N/A'}</p>
                  <p><strong>Product:</strong> {selectedOrder.product.name}</p>
                  <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                  <p><strong>Total Amount:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                  <p><strong>Ordered:</strong> {formatDate(selectedOrder.createdAt)}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customerInfo.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customerInfo.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerInfo.phone}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <p>{selectedOrder.shippingAddress.fullName}</p>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                <p>{selectedOrder.shippingAddress.country}</p>
                <p>Phone: {selectedOrder.shippingAddress.phone}</p>
              </div>

              {/* Status Management */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Update Order Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['confirmed', 'processing', 'ready_to_ship', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'] as Order['status'][])
                      .map(status => (
                        <button
                          key={status}
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, status)}
                          disabled={updatingOrderId === selectedOrder._id}
                          className={`px-3 py-1 rounded text-sm ${
                            selectedOrder.status === status 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {status.replace(/_/g, ' ')}
                        </button>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Update Payment Status</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdatePaymentStatus(selectedOrder._id, 'completed')}
                      disabled={updatingOrderId === selectedOrder._id}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedOrder.paymentStatus === 'completed' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => handleUpdatePaymentStatus(selectedOrder._id, 'refunded')}
                      disabled={updatingOrderId === selectedOrder._id}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedOrder.paymentStatus === 'refunded' 
                          ? 'bg-gray-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Mark as Refunded
                    </button>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Shipping Information</h3>
                <div className="flex gap-4 mb-2">
                  <input
                    type="text"
                    placeholder="Carrier"
                    defaultValue={selectedOrder.shipping.carrier}
                    id="carrier-input"
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Tracking Number"
                    defaultValue={selectedOrder.shipping.trackingNumber}
                    id="tracking-input"
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                  <button
                    onClick={() => {
                      const carrier = (document.getElementById('carrier-input') as HTMLInputElement).value;
                      const trackingNumber = (document.getElementById('tracking-input') as HTMLInputElement).value;
                      if (carrier && trackingNumber) {
                        handleUpdateShippingInfo(selectedOrder._id, { carrier, trackingNumber });
                      } else {
                        toast.error('Please enter both carrier and tracking number');
                      }
                    }}
                    disabled={updatingOrderId === selectedOrder._id}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Update Shipping
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="font-semibold mb-2">Admin Notes</h3>
                <textarea
                  defaultValue={selectedOrder.notes}
                  placeholder="Add admin notes..."
                  rows={3}
                  id="notes-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                />
                <button
                  onClick={() => {
                    const notes = (document.getElementById('notes-input') as HTMLTextAreaElement).value;
                    handleAddNotes(selectedOrder._id, notes);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}