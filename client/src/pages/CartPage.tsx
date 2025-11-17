import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { isVendor, isAdmin } from '../utils/auth';

const CartPage: React.FC = () => {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const navigate = useNavigate();

    const handleContinueShopping = () => {
        navigate('/products');
    };

    if (cart.isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading cart...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        // If is vendor or admin navigate to /
        (isVendor() || isAdmin()) && navigate('/'),

        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                {cart.items.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="text-gray-400 text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
                        <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
                        <button
                            onClick={handleContinueShopping}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Cart Items ({cart.itemCount})</h2>
                                    <button
                                        onClick={() => clearCart()}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Clear Cart
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {cart.items.map((item) => (
                                        <div
                                            key={item.product}
                                            className="group flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer relative"
                                            onClick={() => navigate(`/product/${item.product}`)}
                                        >
                                            {/* Clickable overlay indicator */}
                                            <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-200 pointer-events-none"></div>

                                            {/* View product hint */}
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </div>

                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-20 h-20 object-cover rounded z-10 relative"
                                            />
                                            <div
                                                className="flex-1 min-w-0 z-10 relative"
                                                onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking on controls
                                            >
                                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                                                    {item.name}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-2">${item.price}</p>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center space-x-2 bg-white rounded-lg p-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.product, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center font-medium text-gray-700">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.product)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200 bg-white px-3 py-1 rounded-lg hover:bg-red-50"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                            <div
                                                className="text-right z-10 relative"
                                                onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking on price
                                            >
                                                <p className="text-lg font-semibold text-green-600">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Click to view product</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Items ({cart.itemCount})</span>
                                    <span>${cart.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                {/* <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span>Calculated at checkout</span>
                                </div> */}
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span>${cart.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to="/products"
                                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition duration-200 font-medium text-center block"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;