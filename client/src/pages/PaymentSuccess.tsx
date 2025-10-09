import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder, getOrderByPidx, OrderStatusDisplay } from '../services/orderService';
import { getToken, getUser } from '../utils/auth';

interface OrderData {
  _id: string;
  pidx: string;
  transactionId: string;
  product: {
    _id: string;
    name: string;
    price: number;
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
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState<string>('');
  
  // Add ref to track if processing has already started
  const isProcessing = useRef(false);
  const processedPidx = useRef<string | null>(null);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      const searchParams = new URLSearchParams(location.search);
      
      const pidx = searchParams.get('pidx');
      const status = searchParams.get('status');
      const transactionId = searchParams.get('transaction_id');
      const amount = searchParams.get('amount');
      const purchaseOrderId = searchParams.get('purchase_order_id');

      console.log('URL Parameters:', {
        pidx,
        status,
        transactionId,
        amount,
        purchaseOrderId
      });

      // Prevent duplicate processing
      if (!pidx) {
        setVerificationStatus('failed');
        setError('Payment reference not found');
        return;
      }

      // Check if we're already processing this pidx
      if (isProcessing.current || processedPidx.current === pidx) {
        console.log('🛑 Already processing or processed this payment:', pidx);
        return;
      }

      // Mark as processing
      isProcessing.current = true;
      processedPidx.current = pidx;

      try {
        console.log('Making lookup request for pidx:', pidx);

        // 1. Verify payment with Khalti
        const lookupResponse = await fetch('http://localhost:5000/api/payments/khalti/lookup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pidx }),
        });

        console.log('Lookup response status:', lookupResponse.status);

        if (!lookupResponse.ok) {
          if (lookupResponse.status === 404) {
            throw new Error('Payment verification service not found. Please contact support.');
          }
          const errorText = await lookupResponse.text();
          throw new Error(`Payment verification failed: ${errorText}`);
        }

        const lookupData = await lookupResponse.json();
        console.log('Lookup response data:', lookupData);
        
        if (lookupData.status !== 'Completed') {
          setVerificationStatus('failed');
          setError(`Payment status: ${lookupData.status || 'Unknown'}`);
          return;
        }

        // Check if user is authenticated
        const token = getToken();
        const user = getUser();
        
        if (!token || !user) {
          setVerificationStatus('failed');
          setError('Please login to complete your order');
          return;
        }

        if (status === 'Completed' && transactionId) {
          console.log('Payment already confirmed via URL parameters');
          
          // Extract product ID from purchase_order_id
          const productId = extractProductIdFromOrderId(purchaseOrderId);
          const quantity = getStoredQuantity();
          
          if (!productId) {
            throw new Error('Could not identify purchased product');
          }

          // UPDATED: Include shipping address in order payload
          const orderPayload = {
            pidx: pidx,
            transactionId: transactionId,
            productId: productId,
            quantity: quantity,
            totalAmount: parseInt(amount || '0') / 100,
            customerInfo: {
              name: user.name || "Customer",
              email: user.email,
              phone: "9800000000"
            },
            shippingAddress: {
              fullName: user.name || "Customer",
              street: getStoredShippingAddress().street || "123 Main St",
              city: getStoredShippingAddress().city || "Kathmandu",
              state: getStoredShippingAddress().state || "Bagmati",
              zipCode: getStoredShippingAddress().zipCode || "44600",
              country: getStoredShippingAddress().country || "Nepal",
              phone: "9800000000"
            }
          };

          console.log('Creating order with payload:', orderPayload);

          try {
            // Try to create order
            const orderResult = await createOrder(orderPayload);
            setOrderData({
              ...orderResult.order,
              transactionId: orderResult.order.transactionId ?? '',
            });
            setVerificationStatus('success');
          } catch (orderError: any) {
            // Handle 409 conflict gracefully - order already exists
            if (orderError.message.includes('already exists') || orderError.message.includes('409')) {
              console.log('✅ Order already exists, fetching existing order...');
              
              // Try to fetch the existing order by pidx using our service
              try {
                const existingOrderData = await getOrderByPidx(pidx);
                setOrderData({
                  ...existingOrderData.order,
                  transactionId: existingOrderData.order.transactionId ?? '',
                });
                setVerificationStatus('success');
              } catch (fetchError) {
                // If fetching fails, still show success
                console.log('Could not fetch existing order, but payment was successful');
                setVerificationStatus('success');
              }
            } else {
              throw orderError; // Re-throw other errors
            }
          }
          
        } else {
          setVerificationStatus('failed');
          setError('Payment not confirmed');
        }

      } catch (error: any) {
        console.error('Payment processing error:', error);
        setVerificationStatus('failed');
        setError(error.message || 'Failed to process payment. Please contact support.');
      } finally {
        // Reset processing flag
        isProcessing.current = false;
      }
    };

    processPaymentSuccess();
  }, [location]);

  // Helper function to extract product ID from purchase_order_id
  const extractProductIdFromOrderId = (orderId: string | null): string => {
    if (!orderId) {
      const storedProductId = localStorage.getItem('purchase_product_id');
      return storedProductId || '';
    }
    
    const parts = orderId.split('_');
    return parts[1] || '';
  };

  const getStoredQuantity = (): number => {
    const storedQuantity = localStorage.getItem('purchase_quantity');
    return storedQuantity ? parseInt(storedQuantity) : 1;
  };

  // Helper function to get stored shipping address
  const getStoredShippingAddress = (): any => {
    const storedAddress = localStorage.getItem('shipping_address');
    return storedAddress ? JSON.parse(storedAddress) : {};
  };

  // Clean up localStorage
  useEffect(() => {
    return () => {
      localStorage.removeItem('purchase_quantity');
      localStorage.removeItem('purchase_product_id');
      localStorage.removeItem('shipping_address');
    };
  }, []);

  if (verificationStatus === 'verifying') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing your payment...</p>
        <p className="text-sm text-gray-500">This may take a few moments</p>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="text-xl font-bold mb-2">Payment Processing Issue</h2>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            {error.includes('login') ? (
              <button 
                onClick={() => navigate('/login')}
                className="text-blue-600 underline"
              >
                Click here to login and complete your order
              </button>
            ) : (
              'Your payment was received but we encountered an issue confirming it. Please contact support with transaction ID.'
            )}
          </p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <h2 className="text-xl font-bold mb-2">Payment Successful! 🎉</h2>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
        
        {orderData && (
          <div className="mt-4 text-left bg-white p-4 rounded">
            <h3 className="font-semibold mb-2">Order Details:</h3>
            <p><strong>Order ID:</strong> {orderData._id}</p>
            <p><strong>Transaction ID:</strong> {orderData.transactionId}</p>
            <p><strong>Product:</strong> {orderData.product.name}</p>
            <p><strong>Quantity:</strong> {orderData.quantity}</p>
            <p><strong>Total Amount:</strong> Rs. {orderData.totalAmount.toFixed(2)}</p>
            <p><strong>Status:</strong> {OrderStatusDisplay[orderData.status as keyof typeof OrderStatusDisplay] || orderData.status}</p>
            <p><strong>Payment Status:</strong> {orderData.paymentStatus === 'completed' ? 'Paid' : 'Refunded'}</p>
            
            {/* Shipping Address Section */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-semibold mb-2">Shipping Address:</h4>
              <p>{orderData.shippingAddress.fullName}</p>
              <p>{orderData.shippingAddress.street}</p>
              <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}</p>
              <p>{orderData.shippingAddress.country}</p>
              <p>Phone: {orderData.shippingAddress.phone}</p>
            </div>
          </div>
        )}
        
        {!orderData && (
          <div className="mt-4 text-sm text-green-600">
            <p>Your payment was successful! Redirecting to orders...</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 space-x-4">
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Continue Shopping
        </button>
        <button 
          onClick={() => navigate('/orders')}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-50"
        >
          View Orders
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;