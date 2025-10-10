import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { useCart } from '../context/CartContext';
import { isLoggedIn, isUser } from '../utils/auth';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingCartIcon,
  HeartIcon,
  EyeIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  ShoppingCartIcon as ShoppingCartSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid';

interface Category {
  _id: string;
  name: string;
  slug?: string;
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
  rating?: number;
  reviewCount?: number;
}

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest' | 'popular'>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [cartAlerts, setCartAlerts] = useState<{ [key: string]: boolean }>({});
  const [viewAlerts, setViewAlerts] = useState<{ [key: string]: boolean }>({});
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const { addToCart, cart } = useCart();

  // Create URL-friendly slugs from category names
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Handle URL parameters on component mount
  useEffect(() => {
    if (categoryParam) {
      // Find category by slug/name
      const category = categories.find(
        cat => createSlug(cat.name) === categoryParam.toLowerCase()
      );
      if (category) {
        setSelectedCategory(category._id);
      }
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [categoryParam, searchParam, categories]);

  // Fetch all products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const productsResponse = await getAllProducts();
        const activeProducts = productsResponse.data.products?.filter((product: Product) =>
          product.status === 'active'
        ) || [];
        setProducts(activeProducts);

        const categoriesResponse = await getCategories();
        setCategories(categoriesResponse.data);

      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate direct category links using names
  const getCategoryLink = (categoryName: string) => {
    const slug = createSlug(categoryName);
    return `/products?category=${slug}`;
  };

  // Get current category name for display
  const getCurrentCategoryName = () => {
    if (!selectedCategory) return null;
    return categories.find(cat => cat._id === selectedCategory)?.name;
  };

  // Handle product click to navigate to product detail page
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Handle quick view
  const handleQuickView = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewAlerts(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setViewAlerts(prev => ({ ...prev, [productId]: false }));
    }, 1500);
    // Navigate to product page after alert
    setTimeout(() => navigate(`/product/${productId}`), 500);
  };

  // Handle purchase button click
  const handlePurchaseClick = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn()) {
      navigate('/login', { state: { returnUrl: `/purchase/${productId}` } });
      return;
    }
    navigate(`/purchase/${productId}`);
  };

  // Handle add to cart
  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();

    if (product.stockQuantity === 0) {
      alert('This product is out of stock!');
      return;
    }

    try {
      await addToCart(product);
      
      // Show alert for this specific product
      setCartAlerts(prev => ({ ...prev, [product._id]: true }));
      
      // Hide alert after 2 seconds
      setTimeout(() => {
        setCartAlerts(prev => ({ ...prev, [product._id]: false }));
      }, 2000);
      
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      alert(error.message || 'Failed to add item to cart. Please try again.');
    }
  };

  // Check if product is in cart
  const isProductInCart = (productId: string): boolean => {
    return cart.items.some(item => item.product === productId);
  };

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !selectedCategory || product.category._id === selectedCategory;
      
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'popular':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange([0, 1000]);
    setSortBy('newest');
    navigate('/products'); // Reset URL
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Discovering amazing products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Category Info */}
        <div className="text-center mb-12">
          {getCurrentCategoryName() ? (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {getCurrentCategoryName()}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore beautiful {getCurrentCategoryName()?.toLowerCase()} creations from our talented artisans.
              </p>
              <div className="mt-4">
                <Link 
                  to="/products" 
                  className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center"
                >
                  ← Back to all products
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Discover Handmade Treasures
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore unique creations from talented Nepali artisans. Each piece tells a story of tradition and craftsmanship.
              </p>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-8 text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Quick Category Links */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2 text-amber-600" />
            Browse Categories
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !selectedCategory 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Products
            </Link>
            {categories.map(category => (
              <Link
                key={category._id}
                to={getCategoryLink(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category._id
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Reset All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatPrice(0)}</span>
                  <span>{formatPrice(1000)}</span>
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="price">Price (Low to High)</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="text-amber-800 text-sm">
                  <div className="font-semibold mb-1">Products Found</div>
                  <div>{filteredAndSortedProducts.length} of {products.length} items</div>
                  {getCurrentCategoryName() && (
                    <div className="mt-1 text-amber-600">
                      in {getCurrentCategoryName()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredAndSortedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                <div className="text-amber-400 text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000
                    ? 'Try adjusting your search or filters to find more treasures.'
                    : 'No products available at the moment. Please check back later.'
                  }
                </p>
                {(searchTerm || selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000) && (
                  <button
                    onClick={resetFilters}
                    className="bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors duration-200"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAndSortedProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 group"
                      onClick={() => handleProductClick(product._id)}
                    >
                      {/* Product Image */}
                      <div className="relative h-64 bg-gray-100 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.thumbnails?.[0] || product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                            <span className="text-amber-600 text-lg font-medium">Art Vibe</span>
                          </div>
                        )}

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => handleQuickView(product._id, e)}
                            className="bg-white text-gray-900 p-3 rounded-full shadow-lg hover:scale-110 transform transition-all duration-200 mx-1"
                            title="Quick View"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col space-y-2">
                          {/* New Badge */}
                          {new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                              New
                            </span>
                          )}
                          
                          {/* In Cart Badge */}
                          {isProductInCart(product._id) && (
                            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                              In Cart
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        {product.stockQuantity === 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-5">
                        {/* Category and Vendor */}
                        <div className="flex justify-between items-start mb-3">
                          <span className="inline-block bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium">
                            {product.category.name}
                          </span>
                          <div className="flex items-center text-gray-500 text-sm">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {formatDate(product.createdAt)}
                          </div>
                        </div>

                        {/* Product Name */}
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description || 'Beautiful handmade creation from our artisan.'}
                        </p>

                        {/* Vendor Info */}
                        <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-bold">
                              {product.vendor.businessName?.charAt(0) || product.vendor.name?.charAt(0) || 'V'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.vendor.businessName || product.vendor.name || 'Vendor'}
                            </div>
                          </div>
                        </div>

                        {/* Price and Rating */}
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            <div className="text-sm text-gray-500">
                              {product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of stock'}
                            </div>
                          </div>
                          {product.rating && (
                            <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
                              <StarIcon className="w-4 h-4 text-amber-500 mr-1" />
                              <span className="text-sm font-medium text-amber-700">
                                {product.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Alerts */}
                        {cartAlerts[product._id] && (
                          <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-xl mb-3 text-sm text-center">
                            ✅ Added to cart successfully!
                          </div>
                        )}

                        {viewAlerts[product._id] && (
                          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 rounded-xl mb-3 text-sm text-center">
                            👀 Taking you to product details...
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          {/* Buy Now Button */}
                          {isUser() && (
                            <button
                              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 px-4 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium shadow-md"
                              disabled={product.stockQuantity === 0}
                              onClick={(e) => handlePurchaseClick(product._id, e)}
                            >
                              {product.stockQuantity === 0 ? 'Out of Stock' : 'Buy Now'}
                            </button>
                          )}

                          {/* Add to Cart Button */}
                          {isUser() && (
                            <button
                              className={`p-3 border-2 rounded-xl transition-all duration-200 ${
                                isProductInCart(product._id)
                                  ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                                  : 'border-amber-500 text-amber-600 hover:bg-amber-50'
                              } disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
                              title={isProductInCart(product._id) ? 'Already in Cart' : 'Add to Cart'}
                              disabled={product.stockQuantity === 0 || isProductInCart(product._id)}
                              onClick={(e) => handleAddToCart(product, e)}
                            >
                              {isProductInCart(product._id) ? (
                                <ShoppingCartSolid className="w-5 h-5" />
                              ) : (
                                <ShoppingCartIcon className="w-5 h-5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;