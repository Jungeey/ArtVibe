import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';

// INTERFACES
interface Category {
  _id: string;
  name: string;
}

interface Vendor {
  _id: string;
  name: string;
  email: string;
  businessName?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  status: 'active' | 'unlisted';
  images: string[];
  thumbnails?: string[];
  primaryImage?: string;
  category: Category;
  vendor: Vendor;
  createdAt: string;
}

interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
}

interface KhaltiLookupResponse {
  pidx: string;
  total_amount: number;
  status: 'Completed' | 'Pending' | 'Initiated' | 'Refunded' | 'Expired' | 'User canceled' | 'Partially Refunded';
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
}

const PurchasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');

        if (!id) {
          throw new Error('Product ID is required');
        }

        const response = await getProductById(id);
        let productData = response.data;

        // Handle different API response structures
        if (response.data && response.data.product) {
          productData = response.data.product;
        }

        if (Array.isArray(productData)) {
          productData = productData[0];
        }

        setProduct(productData);
      } catch (error: any) {
        console.error('Failed to fetch product:', error);
        setError(error.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && product && value <= product.stockQuantity) {
      setQuantity(value);
    }
  };

  // Initiate Khalti payment using the new ePayment API
  const initiateKhaltiPayment = async () => {
    if (!product) return;

    try {
      setProcessing(true);
      setError('');

      const amount = product.price * quantity * 100; // Convert to paisa

      // Validate amount (Khalti requires minimum 1000 paisa = 10 NPR)
      if (amount < 1000) {
        setError('Amount must be at least NPR 10');
        setProcessing(false);
        return;
      }

      // Store quantity for use in success page
      localStorage.setItem('purchase_quantity', quantity.toString());
      localStorage.setItem('purchase_product_id', product._id);

      // Generate unique purchase order ID
      const purchaseOrderId = `order_${product._id}_${Date.now()}`;

      // Prepare payment payload according to new Khalti API
      const payload = {
        return_url: `${window.location.origin}/payment/success`,
        website_url: window.location.origin,
        amount: amount,
        purchase_order_id: purchaseOrderId,
        purchase_order_name: product.name,
        customer_info: {
          name: "Customer", // You can get this from user context if available
          email: "customer@example.com", // You can get this from user context if available
          phone: "9800000000" // You can get this from user context if available
        },
        amount_breakdown: [
          {
            label: "Product Price",
            amount: amount
          }
        ],
        product_details: [
          {
            identity: product._id,
            name: product.name,
            total_price: amount,
            quantity: quantity,
            unit_price: product.price * 100
          }
        ]
      };

      console.log('Initiating Khalti payment:', payload);

      // ✅ FIX: Use axios instead of fetch to use the baseURL
      const response = await fetch('http://localhost:5000/api/payments/khalti/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // ✅ FIX: Better error handling
      if (!response.ok) {
        let errorMessage = 'Failed to initiate payment';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data: KhaltiInitiateResponse = await response.json();

      console.log('Khalti payment initiated successfully:', data);

      // Redirect to Khalti payment page
      window.location.href = data.payment_url;

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setError(error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Verify payment status (to be called after redirect from Khalti)
  const verifyPayment = async (pidx: string): Promise<boolean> => {
    try {
      // ✅ FIX: Use full URL for lookup too
      const response = await fetch('http://localhost:5000/api/payments/khalti/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pidx }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data: KhaltiLookupResponse = await response.json();

      return data.status === 'Completed';
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  };

  const getProductImage = () => {
    if (!product || !product.images || product.images.length === 0) {
      return '/placeholder-image.jpg';
    }
    return product.images[0];
  };

  const getProductName = () => {
    return product?.name || 'Unnamed Product';
  };

  const getStockQuantity = () => {
    return product?.stockQuantity || 0;
  };

  const isOutOfStock = () => {
    return getStockQuantity() === 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
          {error || 'Product not found'}
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const subtotal = product.price * quantity;
  const shipping = 0; // Free shipping for now
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Complete Your Purchase</h1>

      {/* Payment Method Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
        <div className="flex items-center space-x-3 p-3 border border-blue-300 rounded-lg bg-blue-50">
          <img
            src="https://khalti.com/static/images/khalti-logo.svg"
            alt="Khalti"
            className="w-8 h-8"
          />
          <span className="font-medium">Khalti Digital Wallet</span>
          <span className="ml-auto text-sm text-gray-500">Recommended</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={getProductImage()}
            alt={getProductName()}
            className="w-20 h-20 object-cover rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
            }}
          />
          <div>
            <h2 className="text-lg font-semibold">{getProductName()}</h2>
            <p className="text-gray-600">Rs. {product.price.toFixed(2)} each</p>
            <p className={`text-sm ${getStockQuantity() > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {getStockQuantity() > 0 ? `${getStockQuantity()} in stock` : 'Out of stock'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <input
            type="number"
            min="1"
            max={product.stockQuantity}
            value={quantity}
            onChange={handleQuantityChange}
            className="w-20 px-3 py-2 border rounded"
            disabled={isOutOfStock()}
          />
          {getStockQuantity() > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Maximum: {getStockQuantity()} units
            </p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({quantity} items):</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>Rs. {shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2 text-lg">
              <span>Total:</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={initiateKhaltiPayment}
            disabled={isOutOfStock() || processing || total < 10}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              `Pay Rs. ${total.toFixed(2)} with Khalti`
            )}
          </button>

          {total < 10 && (
            <p className="text-red-500 text-sm text-center">
              Amount must be at least Rs. 10
            </p>
          )}

          <button
            onClick={() => navigate(-1)}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          By completing this purchase, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;