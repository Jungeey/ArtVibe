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

interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

const PurchasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nepal',
    phone: ''
  });

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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateShippingAddress = (): boolean => {
    const { fullName, street, city, state, zipCode, phone } = shippingAddress;
    
    if (!fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!street.trim()) {
      setError('Street address is required');
      return false;
    }
    if (!city.trim()) {
      setError('City is required');
      return false;
    }
    if (!state.trim()) {
      setError('State is required');
      return false;
    }
    if (!zipCode.trim()) {
      setError('ZIP code is required');
      return false;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be 10 digits');
      return false;
    }

    return true;
  };

  // Initiate Khalti payment using the new ePayment API
  const initiateKhaltiPayment = async () => {
    if (!product) return;

    try {
      setProcessing(true);
      setError('');

      // Validate shipping address
      if (!validateShippingAddress()) {
        setProcessing(false);
        return;
      }

      const amount = product.price * quantity * 100; // Convert to paisa

      // Validate amount (Khalti requires minimum 1000 paisa = 10 NPR)
      if (amount < 1000) {
        setError('Amount must be at least NPR 10');
        setProcessing(false);
        return;
      }

      // Store data for use in success page
      localStorage.setItem('purchase_quantity', quantity.toString());
      localStorage.setItem('purchase_product_id', product._id);
      localStorage.setItem('shipping_address', JSON.stringify(shippingAddress));

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
          name: shippingAddress.fullName,
          email: "customer@example.com", // You can get this from user context if available
          phone: shippingAddress.phone
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

      const response = await fetch('http://localhost:5000/api/payments/khalti/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

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

      {/* Shipping Address Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={shippingAddress.fullName}
              onChange={handleAddressChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Street Address *</label>
            <input
              type="text"
              name="street"
              value={shippingAddress.street}
              onChange={handleAddressChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your street address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">City *</label>
            <input
              type="text"
              name="city"
              value={shippingAddress.city}
              onChange={handleAddressChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your city"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">State *</label>
            <input
              type="text"
              name="state"
              value={shippingAddress.state}
              onChange={handleAddressChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your state"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ZIP Code *</label>
            <input
              type="text"
              name="zipCode"
              value={shippingAddress.zipCode}
              onChange={handleAddressChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter ZIP code"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={shippingAddress.country}
              onChange={handleAddressChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your country"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={shippingAddress.phone}
              onChange={handleAddressChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="9800000000"
              pattern="[0-9]{10}"
              required
            />
            <p className="text-xs text-gray-500 mt-1">10-digit phone number without spaces or dashes</p>
          </div>
        </div>
      </div>

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

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

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