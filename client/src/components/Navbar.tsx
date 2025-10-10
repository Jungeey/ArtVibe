import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getUserRole, isLoggedIn, logout, isUser } from '../utils/auth';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  ShoppingCartIcon as ShoppingCartSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid';

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [name, setName] = useState<string | null>(user.name || null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, removeFromCart, updateQuantity } = useCart();

  // Add refs for dropdowns
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Update auth state when location changes
  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setRole(getUserRole());
  }, [location]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setRole(null);
    setIsMenuOpen(false);
    setIsCartOpen(false);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleCartDropdown = () => {
    setIsCartOpen(!isCartOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsCartOpen(false);
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    setIsMenuOpen(false);
    navigate('/cart');
  };

  const handleMobileCartClick = () => {
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

  const handleCartIconClick = () => {
    toggleCartDropdown();
  };

  // Check if cart should be shown (only for non-logged in users and role 'user')
  const shouldShowCart = !loggedIn || role === 'user';

  // Get first 3 items for preview
  const previewItems = cart.items.slice(0, 3);
  const remainingItems = cart.items.length - 3;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-green-500 to-emerald-600';
      case 'vendor': return 'from-purple-500 to-indigo-600';
      case 'user': return 'from-blue-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-green-100 text-green-800';
      case 'vendor': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3"
            onClick={closeMobileMenu}
          >
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-10 h-10 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">AV</span>
            </div>
            <div>
              <span className="font-bold text-2xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Art Vibe
              </span>
              <div className="text-xs text-gray-500 -mt-1">Handmade Treasures</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                location.pathname === '/'
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/products"
              className={`font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                location.pathname === '/products'
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
              }`}
            >
              Products
            </Link>

            <Link
              to="/about"
              className={`font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                location.pathname === '/about'
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
              }`}
            >
              About
            </Link>

            {/* Shopping Cart - Only show for non-logged in users and role 'user' */}
            {shouldShowCart && (
              <div className="relative" ref={cartDropdownRef}>
                <button
                  onClick={handleCartIconClick}
                  className="relative p-2 text-gray-700 hover:text-amber-600 transition-all duration-200 hover:bg-amber-50 rounded-lg group"
                >
                  {cart.itemCount > 0 ? (
                    <ShoppingCartSolid className="w-6 h-6" />
                  ) : (
                    <ShoppingCartIcon className="w-6 h-6" />
                  )}
                  
                  {/* Cart item count badge */}
                  {cart.itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">
                      {cart.itemCount > 99 ? '99+' : cart.itemCount}
                    </span>
                  )}
                </button>

                {/* Cart Dropdown - Show for all users who can see cart */}
                {isCartOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
                    <div className="p-6">
                      {cart.items.length === 0 ? (
                        // Empty cart for all users
                        <div className="text-center py-8">
                          <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium mb-2">Your cart is empty</p>
                          <p className="text-gray-400 text-sm">Add some beautiful artworks to get started!</p>
                          {!loggedIn && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm text-gray-500 mb-3">Sign in to save your cart</p>
                              <div className="flex space-x-2">
                                <Link
                                  to="/login"
                                  onClick={() => setIsCartOpen(false)}
                                  className="flex-1 bg-amber-600 text-white py-2 px-3 rounded-lg hover:bg-amber-700 transition-all duration-200 font-medium text-center text-sm"
                                >
                                  Sign In
                                </Link>
                                <Link
                                  to="/register"
                                  onClick={() => setIsCartOpen(false)}
                                  className="flex-1 border border-amber-600 text-amber-600 py-2 px-3 rounded-lg hover:bg-amber-50 transition-all duration-200 font-medium text-center text-sm"
                                >
                                  Join
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Cart with items for all users
                        <>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-900">Shopping Cart</h3>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
                            </span>
                          </div>

                          <div className="max-h-80 overflow-y-auto space-y-3">
                            {previewItems.map((item) => (
                              <div
                                key={item.product}
                                className="flex items-center space-x-3 p-3 hover:bg-amber-50 rounded-xl cursor-pointer group border border-transparent hover:border-amber-200 transition-all duration-200"
                                onClick={() => {
                                  navigate(`/product/${item.product}`);
                                  setIsCartOpen(false);
                                }}
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-14 h-14 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate group-hover:text-amber-600">{item.name}</p>
                                  <p className="text-gray-600 text-sm">${item.price} × {item.quantity}</p>
                                  <p className="text-green-600 font-bold text-sm">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                                    <button
                                      onClick={(e) => handleQuantityChange(item.product, item.quantity - 1, e)}
                                      className="w-6 h-6 bg-white rounded text-xs flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm"
                                    >
                                      -
                                    </button>
                                    <span className="text-sm w-6 text-center font-medium">{item.quantity}</span>
                                    <button
                                      onClick={(e) => handleQuantityChange(item.product, item.quantity + 1, e)}
                                      className="w-6 h-6 bg-white rounded text-xs flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    onClick={(e) => handleRemoveItem(item.product, e)}
                                    className="w-7 h-7 bg-red-50 text-red-600 rounded-lg text-sm flex items-center justify-center hover:bg-red-100 transition-colors"
                                    title="Remove item"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* Show "View All" if more than 3 items */}
                            {remainingItems > 0 && (
                              <div
                                className="text-center py-3 border-t border-gray-200 cursor-pointer hover:bg-amber-50 rounded-xl transition-colors"
                                onClick={handleViewCart}
                              >
                                <span className="text-amber-600 font-semibold text-sm">
                                  View all {cart.items.length} items →
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex justify-between items-center mb-4">
                              <span className="font-semibold text-gray-900">Total:</span>
                              <span className="font-bold text-xl text-amber-600">${cart.total.toFixed(2)}</span>
                            </div>
                            <button
                              onClick={handleViewCart}
                              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                            >
                              {!loggedIn ? 'Continue to Cart' : 'View Cart & Checkout'}
                            </button>
                            
                            {!loggedIn && (
                              <div className="mt-3 text-center">
                                <p className="text-xs text-gray-500">
                                  <Link 
                                    to="/login" 
                                    onClick={() => setIsCartOpen(false)}
                                    className="text-amber-600 hover:text-amber-700 font-medium"
                                  >
                                    Sign in
                                  </Link> to save your cart
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loggedIn ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-amber-600 transition duration-200 font-medium px-4 py-2 rounded-lg hover:bg-amber-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-2 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Join Art Vibe
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Dashboard Links based on role */}
                {role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold text-sm shadow-md"
                  >
                    Admin Panel
                  </Link>
                )}
                {role === 'vendor' && (
                  <Link
                    to="/vendor-dashboard"
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 font-semibold text-sm shadow-md"
                  >
                    Vendor Panel
                  </Link>
                )}

                {/* User dropdown menu */}
                <div className="relative" ref={userDropdownRef}>
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-xl hover:bg-amber-50 transition-all duration-200 group"
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getRoleColor(role || 'user')} flex items-center justify-center shadow-sm`}>
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900 capitalize">{name}</div>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-gray-200 mb-2">
                          <div className="text-sm font-semibold text-gray-900">Welcome! <span>  </span>
                          <div className={`text-xs ${getRoleBadge(role || 'user')} px-2 py-1 rounded-full inline-block mt-1`}>
                            {name}
                          </div>
                        </div>
                      </div>

                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-amber-50 rounded-lg transition duration-200 mb-1"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>

                        {role === 'user' && (
                          <Link
                            to="/orders"
                            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-amber-50 rounded-lg transition duration-200 mb-1"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <ShoppingCartIcon className="w-4 h-4" />
                            <span>My Orders</span>
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200 border-t border-gray-200 mt-2 pt-2"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Mobile Cart Icon - Only show for non-logged in users and role 'user' */}
            {shouldShowCart && (
              <button
                onClick={handleMobileCartClick}
                className="relative p-2 text-gray-700 hover:text-amber-600 transition-all duration-200"
              >
                {cart.itemCount > 0 ? (
                  <ShoppingCartSolid className="w-6 h-6" />
                ) : (
                  <ShoppingCartIcon className="w-6 h-6" />
                )}
                {cart.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cart.itemCount > 99 ? '99+' : cart.itemCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition duration-200"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition duration-200 py-3 px-4 rounded-xl"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition duration-200 py-3 px-4 rounded-xl"
                onClick={closeMobileMenu}
              >
                Products
              </Link>
              <Link
                to="/about"
                className="font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition duration-200 py-3 px-4 rounded-xl"
                onClick={closeMobileMenu}
              >
                About Us
              </Link>

              {/* Mobile Cart Link - Show for all users who can see cart */}
              {shouldShowCart && (
                <button
                  onClick={handleMobileCartClick}
                  className="flex items-center justify-between font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition duration-200 py-3 px-4 rounded-xl text-left w-full"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCartIcon className="w-5 h-5" />
                    <span>Shopping Cart</span>
                  </div>
                  {cart.itemCount > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {cart.itemCount}
                      </span>
                      <span className="font-semibold text-amber-600">${cart.total.toFixed(2)}</span>
                    </div>
                  )}
                </button>
              )}

              {!loggedIn ? (
                <div className="border-t border-gray-200 pt-4 mt-2 space-y-2">
                  <Link
                    to="/login"
                    className="block font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition duration-200 py-3 px-4 rounded-xl text-center"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 px-4 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-semibold text-center shadow-lg"
                    onClick={closeMobileMenu}
                  >
                    Join Art Vibe
                  </Link>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-2 space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition duration-200 py-3 px-4 rounded-xl"
                    onClick={closeMobileMenu}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>My Profile</span>
                  </Link>

                  {role === 'user' && (
                    <Link
                      to="/orders"
                      className="flex items-center space-x-3 font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition duration-200 py-3 px-4 rounded-xl"
                      onClick={closeMobileMenu}
                    >
                      <ShoppingCartIcon className="w-5 h-5" />
                      <span>My Orders</span>
                    </Link>
                  )}

                  {role === 'admin' && (
                    <Link
                      to="/admin-dashboard"
                      className="block bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl text-center font-semibold shadow-md"
                      onClick={closeMobileMenu}
                    >
                      Admin Panel
                    </Link>
                  )}
                  {role === 'vendor' && (
                    <Link
                      to="/vendor-dashboard"
                      className="block bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl text-center font-semibold shadow-md"
                      onClick={closeMobileMenu}
                    >
                      Vendor Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 text-red-600 font-medium py-3 px-4 rounded-xl hover:bg-red-50 transition duration-200 border-t border-gray-200 mt-4 pt-4"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}