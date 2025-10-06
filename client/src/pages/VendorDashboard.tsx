import React, { useEffect, useState } from 'react';
import ProductForm from '../components/ProductForm';
import EditProductForm from '../components/EditProductForm';
import { getCategories } from '../services/categoryService';
import { createProduct, getVendorProducts, deleteProduct, updateProduct } from '../services/productService';
import { getUser, isVendorVerified } from '../utils/auth';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  status: 'active' | 'unlisted';
  images: string[];
  thumbnails?: string[]; // MAKE OPTIONAL
  primaryImage?: string; // MAKE OPTIONAL
  category: Category;
}

const VendorDashboard: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Check user status on component mount
  useEffect(() => {
    const checkUserStatus = () => {
      const user = getUser();
      console.log('Current user from localStorage:', user);
      console.log('Is vendor verified:', isVendorVerified());

      if (!user) {
        setError('Please log in to access vendor dashboard');
        return;
      }

      if (user.role !== 'vendor') {
        setError('Access denied. Vendor account required.');
        return;
      }

      if (!isVendorVerified()) {
        setError('Please complete vendor verification before creating products.');
        return;
      }
    };

    checkUserStatus();
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const res = await getCategories();
        setCategories(res.data);
        console.log('Categories loaded:', res.data.length);
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch vendor products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setError('');
    try {
      console.log('Fetching vendor products...');
      const res = await getVendorProducts();
      console.log('Products response:', res.data);
      setProducts(res.data.products || []);
      console.log('Products loaded:', (res.data.products || []).length);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load products';
      setError(errorMessage);

      if (err.response?.status === 403) {
        setError('Access denied. Please ensure you are logged in as a verified vendor.');
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle creating new product
  const handleCreateProduct = async (formData: FormData) => {
    setCreatingProduct(true);
    setError('');
    try {
      console.log('Creating product with form data...');
      const res = await createProduct(formData);
      console.log('Product creation response:', res.data);
      setSuccess('Product created successfully');
      fetchProducts(); // Refresh product list

      // Reset form
      const form = document.querySelector('form');
      if (form) form.reset();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Failed to create product:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create product';
      setError(errorMessage);
    } finally {
      setCreatingProduct(false);
    }
  };

  // Handle editing product
  const handleEditProduct = async (formData: FormData) => {
    if (!editingProduct) return;

    setCreatingProduct(true);
    setError('');
    try {
      console.log('Updating product:', editingProduct._id);
      const res = await updateProduct(editingProduct._id, formData);
      console.log('Product update response:', res.data);
      setSuccess('Product updated successfully');
      setEditingProduct(null);
      fetchProducts(); // Refresh product list

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Failed to update product:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update product';
      setError(errorMessage);
    } finally {
      setCreatingProduct(false);
    }
  };

  // Handle deleting product
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setDeletingProductId(productId);
    setError('');
    try {
      console.log('Deleting product:', productId);
      await deleteProduct(productId);
      setSuccess('Product deleted successfully');
      fetchProducts(); // Refresh product list

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete product';
      setError(errorMessage);
    } finally {
      setDeletingProductId(null);
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'unlisted' : 'active';

    setError('');
    try {
      const formData = new FormData();
      formData.append('status', newStatus);

      console.log('Toggling product status:', product._id, newStatus);
      await updateProduct(product._id, formData);
      setSuccess(`Product ${newStatus === 'active' ? 'activated' : 'unlisted'} successfully`);
      fetchProducts(); // Refresh product list

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Failed to update product status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update product status';
      setError(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold">Access Issue</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.href = '/profile'}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Complete Vendor Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Vendor Dashboard</h1>

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* User Status Info */}
      <div className="bg-blue-50 p-4 rounded">
        <p className="text-blue-700">
          Welcome! You are logged in as a {isVendorVerified() ? 'verified' : 'unverified'} vendor.
        </p>
      </div>

      {/* Product Creation Form */}
      {!editingProduct && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Product</h2>
          {loadingCategories ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-yellow-600">No categories available. Please contact admin.</p>
          ) : (
            <ProductForm
              categories={categories}
              onSubmit={handleCreateProduct}
              loading={creatingProduct}
            />
          )}
        </div>
      )}

      {/* Edit Product Form */}
      {editingProduct && (
        <div className="bg-white p-6 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Product</h2>
            <button
              onClick={() => setEditingProduct(null)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel Edit
            </button>
          </div>
          <EditProductForm
            product={editingProduct}
            categories={categories}
            onSubmit={handleEditProduct}
            loading={creatingProduct}
            onCancel={() => setEditingProduct(null)}
          />
        </div>
      )}

      {/* Vendor Products List */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Products ({products.length})</h2>
          <button
            onClick={fetchProducts}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>

        {loadingProducts ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No products found. Create your first product!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Image</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Category</th>
                  <th className="border px-4 py-2">Price</th>
                  <th className="border px-4 py-2">Stock</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.thumbnails?.[0] || product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="border px-4 py-2 font-medium">{product.name}</td>
                    <td className="border px-4 py-2">{product.category?.name || 'N/A'}</td>
                    <td className="border px-4 py-2">${product.price.toFixed(2)}</td>
                    <td className="border px-4 py-2">{product.stockQuantity}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${product.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          title="Edit Product"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`px-3 py-1 rounded text-sm ${product.status === 'active'
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          title={product.status === 'active' ? 'Unlist Product' : 'Activate Product'}
                        >
                          {product.status === 'active' ? 'Unlist' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={deletingProductId === product._id}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-red-300"
                          title="Delete Product"
                        >
                          {deletingProductId === product._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;