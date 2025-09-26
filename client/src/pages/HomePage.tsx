import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { ImgaePath } from '../services/api';

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
  category: Category;
  vendor: Vendor;
  createdAt: string;
}

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('newest');

  // Fetch all products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch products
        const productsResponse = await getAllProducts();
        const activeProducts = productsResponse.data.products?.filter((product: Product) => 
          product.status === 'active'
        ) || [];
        setProducts(activeProducts);

        // Fetch categories
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

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || product.category._id === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Products
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse through products from our verified vendors. Find exactly what you're looking for!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by product name, description, or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="price">Price (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAndSortedProducts.length} of {products.length} products
          </div>
        </div>

        {/* Products Grid */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filters to find more products.' 
                : 'No products available at the moment. Please check back later.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-200">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={`${ImgaePath}${product.images[0]}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                  
                  {/* Stock Status Badge */}
                  {product.stockQuantity === 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Out of Stock
                    </span>
                  )}
                  
                  {/* New Badge */}
                  {new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      New
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Category */}
                  <div className="mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {product.category.name}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description || 'No description available.'}
                  </p>

                  {/* Vendor Info */}
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-purple-600 text-xs font-bold">
                        {product.vendor.businessName?.charAt(0) || product.vendor.name?.charAt(0) || 'V'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {product.vendor.businessName || product.vendor.name || 'Vendor'}
                    </span>
                  </div>

                  {/* Price and Stock */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    <span className={`text-sm ${
                      product.stockQuantity > 10 ? 'text-green-600' : 
                      product.stockQuantity > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                      disabled={product.stockQuantity === 0}
                    >
                      {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Add to Wishlist"
                    >
                      ♡
                    </button>
                  </div>

                  {/* Added Date */}
                  <div className="mt-2 text-xs text-gray-400 text-right">
                    Added {formatDate(product.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More (if needed in future) */}
        {filteredAndSortedProducts.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Load More Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;