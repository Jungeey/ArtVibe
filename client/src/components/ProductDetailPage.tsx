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

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError('');

                if (!id) {
                    throw new Error('Product ID is required');
                }

                console.log('Fetching product with ID:', id); // DEBUG
                const response = await getProductById(id);
                
                // DEBUG: Log the entire response
                console.log('Full API Response:', response);
                console.log('Response data:', response.data);
                console.log('Response data type:', typeof response.data);
                
                // Handle different API response structures
                let productData = response.data;
                
                // If response has nested product property
                if (response.data && response.data.product) {
                    productData = response.data.product;
                }
                
                // If response is an array, take first item
                if (Array.isArray(productData)) {
                    productData = productData[0];
                }
                
                console.log('Final product data to set:', productData); // DEBUG
                
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

    const handlePurchase = () => {
        if (!id) return;
        navigate(`/purchase/${id}`);
    };

    const handleAddToCart = () => {
        if (!product) return;
        console.log('Added to cart:', product);
    };

    // SAFE ACCESSOR FUNCTIONS
    const getProductImage = () => {
        if (!product || !product.images || product.images.length === 0) {
            return '/placeholder-image.jpg';
        }
        return product.images[0];
    };

    const hasMultipleImages = () => {
        return product && product.images && product.images.length > 1;
    };

    const getCategoryName = () => {
        return product?.category?.name || 'Uncategorized';
    };

    const getVendorName = () => {
        return product?.vendor?.businessName || product?.vendor?.name || 'Vendor';
    };

    const getVendorInitial = () => {
        const vendorName = getVendorName();
        return vendorName.charAt(0).toUpperCase();
    };

    const getProductName = () => {
        return product?.name || 'Unnamed Product';
    };

    const getProductDescription = () => {
        return product?.description || 'No description available.';
    };

    const getProductPrice = () => {
        return product?.price ? product.price.toFixed(2) : '0.00';
    };

    const getStockQuantity = () => {
        return product?.stockQuantity || 0;
    };

    const getCreatedDate = () => {
        return product?.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Unknown date';
    };

    const isOutOfStock = () => {
        return getStockQuantity() === 0;
    };

    // DEBUG: Log the current product state
    useEffect(() => {
        if (product) {
            console.log('Current product state:', product);
            console.log('Product name:', product.name);
            console.log('Product category:', product.category);
            console.log('Product vendor:', product.vendor);
            console.log('Product images:', product.images);
        }
    }, [product]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-8">
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

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
            >
                ← Back to Products
            </button>

            {/* DEBUG INFO - Remove after testing */}
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                <strong>Debug Info:</strong> Product ID: {id}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Images */}
                <div>
                    <img
                        src={getProductImage()}
                        alt={getProductName()}
                        className="w-full h-96 object-cover rounded-lg"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                        }}
                    />
                    
                    {hasMultipleImages() && product.images && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                            {product.images.slice(1).map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`${getProductName()} ${index + 2}`}
                                    className="w-full h-20 object-cover rounded cursor-pointer"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <div className="mb-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {getCategoryName()}
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold">{getProductName()}</h1>

                    <div className="flex items-center mt-2 mb-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-purple-600 text-sm font-bold">
                                {getVendorInitial()}
                            </span>
                        </div>
                        <span className="text-sm text-gray-500">
                            Sold by: {getVendorName()}
                        </span>
                    </div>

                    <p className="text-2xl font-bold mt-4 text-green-600">
                        ${getProductPrice()}
                    </p>

                    <p className="text-gray-600 mt-4 leading-relaxed">
                        {getProductDescription()}
                    </p>

                    <div className="mt-4">
                        <p className={`text-lg ${isOutOfStock() ? 'text-red-600' : 'text-green-600'}`}>
                            {isOutOfStock() ? 'Out of stock' : `${getStockQuantity()} in stock`}
                        </p>
                    </div>

                    <div className="mt-6 space-y-4">
                        <button
                            onClick={handlePurchase}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={isOutOfStock()}
                        >
                            {isOutOfStock() ? 'Out of Stock' : 'Buy Now'}
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={isOutOfStock()}
                        >
                            Add to Cart
                        </button>
                    </div>

                    <div className="mt-6 text-sm text-gray-500">
                        <p>Product added on {getCreatedDate()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;