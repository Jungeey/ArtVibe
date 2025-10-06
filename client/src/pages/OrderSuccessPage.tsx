import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

interface OrderSuccessLocationState {
  product: any;
  quantity: number;
  total: number;
  transactionId: string;
}

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, quantity, total, transactionId } = location.state as OrderSuccessLocationState;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been confirmed.</p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h2 className="font-semibold mb-3">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Product:</span>
              <span>{product?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span>Rs. {total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span className="font-mono text-xs">{transactionId}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Link 
            to="/" 
            className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
          <button 
            onClick={() => navigate('/orders')}
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;