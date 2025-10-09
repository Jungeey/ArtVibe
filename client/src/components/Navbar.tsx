import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getUserRole, isLoggedIn, logout } from '../utils/auth';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, removeFromCart, updateQuantity } = useCart();
  
  // Add ref for cart dropdown
  const cartDropdownRef = useRef<HTMLDivElement>(null);

  // Update auth state when location changes
  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setRole(getUserRole());
  }, [location]);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setRole(null);
    setIsMenuOpen(false);
    setIsCartOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleCartDropdown = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    setIsMenuOpen(false);
    navigate('/cart');
  };

  const handleRemoveItem = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId: string, newQuantity: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  // Close cart dropdown when clicking outside - FIXED VERSION
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get first 3 items for preview
  const previewItems = cart.items.slice(0, 3);
  const remainingItems = cart.items.length - 3;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={closeMobileMenu}
          >
            <span className="font-bold text-2xl text-gray-800 hover:text-blue-600 transition duration-200">
              Art Vibe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition duration-200 ${location.pathname === '/'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
                }`}
            >
              Home
            </Link>

            <Link
              to="/products"
              className={`font-medium transition duration-200 ${location.pathname === '/products'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
                }`}
            >
              Products
            </Link>

            {!loggedIn ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Shopping Cart Dropdown - FIXED */}
                <div className="relative" ref={cartDropdownRef}>
                  <button
                    onClick={toggleCartDropdown}
                    className="relative p-2 text-gray-700 hover:text-blue-600 transition duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {/* Cart item count badge */}
                    {cart.itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.itemCount > 99 ? '99+' : cart.itemCount}
                      </span>
                    )}
                  </button>

                  {/* Cart Dropdown */}
                  {isCartOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-lg">Shopping Cart</h3>
                          <span className="text-sm text-gray-500">{cart.itemCount} items</span>
                        </div>

                        {cart.items.length === 0 ? (
                          <div className="text-center py-8">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-gray-500">Your cart is empty</p>
                          </div>
                        ) : (
                          <>
                            <div className="max-h-64 overflow-y-auto space-y-3">
                              {previewItems.map((item) => (
                                <div
                                  key={item.product}
                                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                                  onClick={() => {
                                    navigate(`/product/${item.product}`);
                                    setIsCartOpen(false);
                                  }}
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate group-hover:text-blue-600">{item.name}</p>
                                    <p className="text-gray-600 text-sm">${item.price} × {item.quantity}</p>
                                    <p className="text-green-600 font-semibold text-sm">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={(e) => handleQuantityChange(item.product, item.quantity - 1, e)}
                                      className="w-6 h-6 bg-gray-200 rounded text-xs flex items-center justify-center hover:bg-gray-300"
                                    >
                                      -
                                    </button>
                                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                                    <button
                                      onClick={(e) => handleQuantityChange(item.product, item.quantity + 1, e)}
                                      className="w-6 h-6 bg-gray-200 rounded text-xs flex items-center justify-center hover:bg-gray-300"
                                    >
                                      +
                                    </button>
                                    <button
                                      onClick={(e) => handleRemoveItem(item.product, e)}
                                      className="w-6 h-6 bg-red-100 text-red-600 rounded text-xs flex items-center justify-center hover:bg-red-200 ml-1"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {/* Show "View All" if more than 3 items */}
                              {remainingItems > 0 && (
                                <div
                                  className="text-center py-2 border-t border-gray-200 cursor-pointer hover:bg-gray-50 rounded"
                                  onClick={handleViewCart}
                                >
                                  <span className="text-blue-600 text-sm font-medium">
                                    View all {cart.items.length} items
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="border-t border-gray-200 pt-4 mt-4">
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold">Total:</span>
                                <span className="font-bold text-lg">${cart.total.toFixed(2)}</span>
                              </div>
                              <button
                                onClick={handleViewCart}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                              >
                                View Cart & Checkout
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard Links based on role */}
                {role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium text-sm"
                  >
                    Admin Panel
                  </Link>
                )}
                {role === 'vendor' && (
                  <Link
                    to="/vendor-dashboard"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200 font-medium text-sm"
                  >
                    Vendor Panel
                  </Link>
                )}

                {/* User dropdown menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition duration-200">
                    <span className="font-medium capitalize">{role}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link
                      to="/user-dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200"
                    >
                      My Orders
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition duration-200 border-t border-gray-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="font-medium text-gray-700 hover:text-blue-600 transition duration-200 py-2"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="font-medium text-gray-700 hover:text-blue-600 transition duration-200 py-2"
                onClick={closeMobileMenu}
              >
                Products
              </Link>

              {!loggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="font-medium text-gray-700 hover:text-blue-600 transition duration-200 py-2"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-center"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  {/* Mobile Cart - Direct navigation to /cart */}
                  <button
                    onClick={handleViewCart}
                    className="font-medium text-gray-700 hover:text-blue-600 transition duration-200 py-2 flex items-center justify-between text-left w-full"
                  >
                    <span>Shopping Cart ({cart.itemCount} items)</span>
                    <span className="font-semibold">${cart.total.toFixed(2)}</span>
                  </button>

                  {role === 'admin' && (
                    <Link
                      to="/admin-dashboard"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium text-center"
                      onClick={closeMobileMenu}
                    >
                      Admin Panel
                    </Link>
                  )}
                  {role === 'vendor' && (
                    <Link
                      to="/vendor-dashboard"
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200 font-medium text-center"
                      onClick={closeMobileMenu}
                    >
                      Vendor Panel
                    </Link>
                  )}
                  {role === 'user' && (
                    <Link
                      to="/user-dashboard"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-center"
                      onClick={closeMobileMenu}
                    >
                      My Account
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="text-red-600 font-medium py-2 text-left hover:text-red-700 transition duration-200 border-t border-gray-200 pt-4"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}