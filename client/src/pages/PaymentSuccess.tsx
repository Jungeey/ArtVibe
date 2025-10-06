import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  status: string;
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processPaymentSuccess = async () => {
      const searchParams = new URLSearchParams(location.search);
      
      // ✅ FIX: Get the correct pidx (the Khalti one, not your custom one)
      const pidx = searchParams.get('pidx'); // This will get the LAST pidx in URL
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

      if (!pidx) {
        setVerificationStatus('failed');
        setError('Payment reference not found');
        return;
      }

      try {
        // ✅ FIX: Debug the lookup request
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

        // ✅ FIX: Better error handling for lookup
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

        // ✅ FIX: Check if we already have successful payment from URL parameters
        // If Khalti lookup fails but URL shows success, we can trust the URL
        if (status === 'Completed' && transactionId) {
          console.log('Payment already confirmed via URL parameters');
          
          // Extract product ID from purchase_order_id
          const productId = extractProductIdFromOrderId(purchaseOrderId);
          const quantity = getStoredQuantity();
          
          if (!productId) {
            throw new Error('Could not identify purchased product');
          }

          // Create order and update stock
          const orderPayload = {
            pidx: pidx,
            transactionId: transactionId,
            productId: productId,
            quantity: quantity,
            totalAmount: parseInt(amount || '0') / 100, // Convert from paisa to NPR
            customerInfo: {
              name: "Customer", // You can get this from context/auth
              email: "customer@example.com",
              phone: "9800000000"
            }
          };

          console.log('Creating order with payload:', orderPayload);

          const orderResponse = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderPayload),
          });

          if (!orderResponse.ok) {
            const errorText = await orderResponse.text();
            throw new Error(`Order creation failed: ${errorText}`);
          }

          const orderResult = await orderResponse.json();
          setOrderData(orderResult.order);
          setVerificationStatus('success');
          
        } else {
          setVerificationStatus('failed');
          setError('Payment not confirmed');
        }

      } catch (error: any) {
        console.error('Payment processing error:', error);
        setVerificationStatus('failed');
        setError(error.message || 'Failed to process payment. Please contact support.');
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
    
    // Your order ID format: order_68d619d6bd3018ab84b017f0_1759727967656
    const parts = orderId.split('_');
    return parts[1] || ''; // Returns product ID
  };

  const getStoredQuantity = (): number => {
    const storedQuantity = localStorage.getItem('purchase_quantity');
    return storedQuantity ? parseInt(storedQuantity) : 1;
  };

  // Clean up localStorage
  useEffect(() => {
    return () => {
      localStorage.removeItem('purchase_quantity');
      localStorage.removeItem('purchase_product_id');
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
            Your payment was received but we encountered an issue confirming it. 
            Please contact support with transaction ID.
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
            <p><strong>Status:</strong> {orderData.status}</p>
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