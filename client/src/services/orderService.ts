import api from './api';

export interface OrderProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  primaryImage?: string;
  description?: string;
  vendor?: any;
}

export interface Order {
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
  // UPDATED: Simplified status system
  status: 'confirmed' | 'processing' | 'ready_to_ship' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded' | 'failed';
  // UPDATED: Simplified payment status
  paymentStatus: 'completed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Order status display mapping
export const OrderStatusDisplay = {
  confirmed: 'Order Confirmed',
  processing: 'Processing',
  ready_to_ship: 'Ready to Ship',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  failed: 'Failed'
};

// Payment status display mapping
export const PaymentStatusDisplay = {
  completed: 'Paid',
  refunded: 'Refunded'
};

// Get status color classes
export const getStatusColor = (status: string): string => {
  const colorMap: { [key: string]: string } = {
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
    ready_to_ship: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    shipped: 'bg-orange-100 text-orange-800 border-orange-200',
    out_for_delivery: 'bg-pink-100 text-pink-800 border-pink-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-gray-100 text-gray-800 border-gray-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Get payment status color classes
export const getPaymentStatusColor = (status: string): string => {
  const colorMap: { [key: string]: string } = {
    completed: 'bg-green-100 text-green-800 border-green-200',
    refunded: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Get status icon
export const getStatusIcon = (status: string): string => {
  const iconMap: { [key: string]: string } = {
    confirmed: '✅',
    processing: '📦',
    ready_to_ship: '🚚',
    shipped: '✈️',
    out_for_delivery: '🏍️',
    delivered: '🎁',
    cancelled: '❌',
    refunded: '💸',
    failed: '⚠️'
  };
  return iconMap[status] || '📦';
};

// Check if order can be cancelled
export const canCancelOrder = (order: Order): boolean => {
  const cancellableStatuses = ['confirmed', 'processing'];
  return cancellableStatuses.includes(order.status);
};

// Check if order can be refunded
export const canRefundOrder = (order: Order): boolean => {
  return order.status === 'delivered' && order.paymentStatus === 'completed';
};

// Get next expected status (for progress tracking)
export const getNextStatus = (currentStatus: string): string | null => {
  const statusFlow = [
    'confirmed', 'processing', 'ready_to_ship', 
    'shipped', 'out_for_delivery', 'delivered'
  ];
  const currentIndex = statusFlow.indexOf(currentStatus);
  return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
};

// Calculate progress percentage for order tracking
export const getOrderProgress = (status: string): number => {
  const statusWeights: { [key: string]: number } = {
    confirmed: 20,
    processing: 40,
    ready_to_ship: 60,
    shipped: 75,
    out_for_delivery: 90,
    delivered: 100,
    cancelled: 0,
    refunded: 0,
    failed: 0
  };
  return statusWeights[status] || 0;
};

// Get user's orders with pagination and filtering
export const getUserOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
}): Promise<OrdersResponse> => {
  try {
    console.log('📦 Fetching orders with params:', params);
    
    const response = await api.get('/orders/my-orders', { params });
    console.log('✅ Orders fetched successfully:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching user orders:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }
    
    if (error.response?.status === 404) {
      // For development, return mock data
      console.log('📋 Using mock data for development');
      return getMockOrders();
    }
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to server. Please check if backend is running.');
    }
    
    throw new Error(error.response?.data?.error || 'Failed to fetch orders');
  }
};

// Mock data for development - UPDATED with new status system
const getMockOrders = (): OrdersResponse => {
  return {
    success: true,
    orders: [
      {
        _id: "68e4d3babf4589db41e1a4e2",
        pidx: "q3Cv6ZPmuWHx42WbMnkgRg",
        transactionId: "H2HstoCm8eigy6yH3z74N4",
        product: {
          _id: "68d60e12639d695e49c46b90",
          name: "Wireless Bluetooth Headphones",
          price: 100,
          images: ["/images/headphones.jpg"],
          primaryImage: "/images/headphones.jpg",
          description: "High-quality wireless headphones with noise cancellation",
          vendor: { name: "TechGadgets Inc." }
        },
        quantity: 1,
        totalAmount: 100,
        customerInfo: {
          name: "John Doe",
          email: "user1@gmail.com",
          phone: "9800000000"
        },
        shippingAddress: {
          fullName: "John Doe",
          street: "123 Main St",
          city: "Kathmandu",
          state: "Bagmati",
          zipCode: "44600",
          country: "Nepal",
          phone: "9800000000"
        },
        status: "confirmed", // UPDATED: New status
        paymentStatus: "completed", // UPDATED: New payment status
        createdAt: "2025-10-07T08:47:54.579+00:00",
        updatedAt: "2025-10-07T08:47:54.579+00:00"
      }
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1
  };
};

// Get single order by ID
export const getOrderById = async (orderId: string): Promise<{ success: boolean; order: Order }> => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch order');
  }
};

// Cancel an order
export const cancelOrder = async (orderId: string, reason?: string): Promise<{ success: boolean; order: Order }> => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    throw new Error(error.response?.data?.error || 'Failed to cancel order');
  }
};

// Request refund for an order
export const requestRefund = async (orderId: string, reason: string): Promise<{ success: boolean; order: Order }> => {
  try {
    const response = await api.put(`/orders/${orderId}/refund`, { reason });
    return response.data;
  } catch (error: any) {
    console.error('Error requesting refund:', error);
    throw new Error(error.response?.data?.error || 'Failed to request refund');
  }
};

// Create a new order - UPDATED with shipping address
export const createOrder = async (orderData: {
  pidx: string;
  transactionId?: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
}): Promise<{
  success: boolean;
  message: string;
  order: Order;
  stockUpdate: {
    productId: string;
    productName: string;
    oldStock: number;
    newStock: number;
  };
}> => {
  try {
    // Add default shipping address if not provided
    const orderPayload = {
      ...orderData,
      shippingAddress: orderData.shippingAddress || {
        fullName: orderData.customerInfo?.name || "Customer",
        street: "123 Main St",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
        country: "Nepal",
        phone: orderData.customerInfo?.phone || "9800000000"
      }
    };

    const response = await api.post('/orders', orderPayload);
    return response.data;
  } catch (error: any) {
    console.error('Error creating order:', error);
    
    // Handle specific error cases
    if (error.response?.status === 409) {
      throw new Error('Order already exists with this payment ID');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Invalid order data');
    }
    if (error.response?.status === 404) {
      throw new Error('Product not found');
    }
    
    throw new Error(error.response?.data?.error || 'Failed to create order');
  }
};

// Get order by pidx (Khalti payment ID)
export const getOrderByPidx = async (pidx: string): Promise<{ success: boolean; order: Order }> => {
  try {
    const response = await api.get(`/orders/pidx/${pidx}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order by pidx:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch order');
  }
};

// Export all utility functions
export const OrderService = {
  getStatusDisplay: (status: string): string => OrderStatusDisplay[status as keyof typeof OrderStatusDisplay] || status,
  getPaymentStatusDisplay: (status: string): string => PaymentStatusDisplay[status as keyof typeof PaymentStatusDisplay] || status,
  getStatusColor,
  getPaymentStatusColor,
  getStatusIcon,
  canCancelOrder,
  canRefundOrder,
  getNextStatus,
  getOrderProgress
};

export default {
  getUserOrders,
  getOrderById,
  cancelOrder,
  requestRefund,
  createOrder,
  getOrderByPidx,
  OrderService
};