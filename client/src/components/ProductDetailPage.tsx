import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

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
    const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError('');

                if (!id) {
                    throw new Error('Product ID is required');
                }

                console.log('Fetching product with ID:', id);
                const response = await getProductById(id);
                
                let productData = response.data;
                
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

    // Check if product is in cart and get quantity
    const getCartItem = () => {
        if (!product || !cart.items) return null;
        return cart.items.find(item => item.product === product._id);
    };

    const isInCart = () => {
        return !!getCartItem();
    };

    const getCartQuantity = () => {
        const cartItem = getCartItem();
        return cartItem ? cartItem.quantity : 0;
    };

    const handlePurchase = () => {
        if (!id) return;
        navigate(`/purchase/${id}`);
    };

    const handleAddToCart = async () => {
        if (!product) return;
        
        setAddingToCart(true);
        try {
            await addToCart(product);
            toast.success(`${product.name} added to cart!`);
        } catch (error: any) {
            console.error('Failed to add to cart:', error);
            toast.error(error.message || 'Failed to add item to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleRemoveFromCart = async () => {
        if (!product) return;
        
        setAddingToCart(true);
        try {
            await removeFromCart(product._id);
            toast.success(`${product.name} removed from cart!`);
        } catch (error: any) {
            console.error('Failed to remove from cart:', error);
            toast.error(error.message || 'Failed to remove item from cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleIncreaseQuantity = async () => {
        if (!product) return;
        
        const currentQuantity = getCartQuantity();
        setAddingToCart(true);
        try {
            await updateQuantity(product._id, currentQuantity + 1);
            toast.success(`Increased quantity to ${currentQuantity + 1}`);
        } catch (error: any) {
            console.error('Failed to update quantity:', error);
            toast.error(error.message || 'Failed to update quantity');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleDecreaseQuantity = async () => {
        if (!product) return;
        
        const currentQuantity = getCartQuantity();
        if (currentQuantity <= 1) {
            await handleRemoveFromCart();
            return;
        }
        
        setAddingToCart(true);
        try {
            await updateQuantity(product._id, currentQuantity - 1);
            toast.success(`Decreased quantity to ${currentQuantity - 1}`);
        } catch (error: any) {
            console.error('Failed to update quantity:', error);
            toast.error(error.message || 'Failed to update quantity');
        } finally {
            setAddingToCart(false);
        }
    };

    // Image carousel functions
    const nextImage = () => {
        if (!product?.images) return;
        setSelectedImageIndex((prev) => 
            prev === product.images.length - 1 ? 0 : prev + 1
        );
        setImageLoading(true);
    };

    const prevImage = () => {
        if (!product?.images) return;
        setSelectedImageIndex((prev) => 
            prev === 0 ? product.images.length - 1 : prev - 1
        );
        setImageLoading(true);
    };

    const selectImage = (index: number) => {
        setSelectedImageIndex(index);
        setImageLoading(true);
    };

    // SAFE ACCESSOR FUNCTIONS
    const getProductImages = () => {
        if (!product || !product.images || product.images.length === 0) {
            return ['/placeholder-image.jpg'];
        }
        return product.images;
    };

    const getCategoryName = () => {
        return product?.category?.name || 'Uncategorized';
    };

    const getVendorName = () => {
        return product?.vendor?.businessName || product?.vendor?.name || 'Vendor';
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

    const images = getProductImages();
    const cartItem = getCartItem();
    const cartQuantity = getCartQuantity();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading product details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center max-w-2xl mx-auto">
                        {error || 'Product not found'}
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 block mx-auto"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="hover:text-blue-600 transition duration-200 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                    <span>/</span>
                    <span>Products</span>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{getProductName()}</span>
                </nav>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Product Images - Modern Carousel */}
                        <div className="space-y-4">
                            {/* Main Image Container */}
                            <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square">
                                {imageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                                <img
                                    src={images[selectedImageIndex]}
                                    alt={getProductName()}
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                                        imageLoading ? 'opacity-0' : 'opacity-100'
                                    }`}
                                    onLoad={() => setImageLoading(false)}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                        setImageLoading(false);
                                    }}
                                />
                                
                                {/* Navigation Arrows */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                                
                                {/* Image Counter */}
                                {images.length > 1 && (
                                    <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                                        {selectedImageIndex + 1} / {images.length}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {images.length > 1 && (
                                <div className="flex space-x-3 overflow-x-auto pb-2">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => selectImage(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                                selectedImageIndex === index 
                                                    ? 'border-blue-500 ring-2 ring-blue-200' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${getProductName()} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Information */}
                        <div className="space-y-6">
                            {/* Category & Vendor */}
                            <div className="flex items-center justify-between">
                                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                                    {getCategoryName()}
                                </span>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">
                                            {getVendorName().charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span>Sold by {getVendorName()}</span>
                                </div>
                            </div>

                            {/* Product Title */}
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                {getProductName()}
                            </h1>

                            {/* Price */}
                            <div className="flex items-baseline space-x-2">
                                <span className="text-4xl font-bold text-green-600">
                                    ${getProductPrice()}
                                </span>
                            </div>

                            {/* Stock Status */}
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                                isOutOfStock() 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-green-100 text-green-800'
                            }`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                    isOutOfStock() ? 'bg-red-500' : 'bg-green-500'
                                }`}></div>
                                {isOutOfStock() ? 'Out of stock' : `${getStockQuantity()} in stock`}
                            </div>

                            {/* Description */}
                            <div className="prose prose-gray max-w-none">
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {getProductDescription()}
                                </p>
                            </div>

                            {/* Cart Status */}
                            {isInCart() && (
                                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-green-800 font-semibold">Added to cart</p>
                                                <p className="text-green-600 text-sm">{cartQuantity} item{cartQuantity > 1 ? 's' : ''} in your cart</p>
                                            </div>
                                        </div>
                                        <span className="text-green-600 font-bold text-lg">{cartQuantity}</span>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                {/* Buy Now Button */}
                                <button
                                    onClick={handlePurchase}
                                    disabled={isOutOfStock() || addingToCart}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none disabled:cursor-not-allowed"
                                >
                                    {isOutOfStock() ? 'Out of Stock' : 'Buy Now'}
                                </button>

                                {/* Cart Controls */}
                                {!isInCart() ? (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isOutOfStock() || addingToCart}
                                        className="w-full border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-700 py-4 rounded-xl font-semibold text-lg transition-all duration-200 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {addingToCart ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                <span>Add to Cart</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={handleDecreaseQuantity}
                                                disabled={addingToCart}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-red-300 disabled:transform-none flex items-center justify-center"
                                            >
                                                {addingToCart ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                ) : (
                                                    '-'
                                                )}
                                            </button>
                                            
                                            <div className="flex-1 text-center py-4 bg-gray-100 rounded-xl font-semibold text-lg">
                                                {addingToCart ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                                                ) : (
                                                    `${cartQuantity} in Cart`
                                                )}
                                            </div>
                                            
                                            <button
                                                onClick={handleIncreaseQuantity}
                                                disabled={isOutOfStock() || addingToCart || cartQuantity >= getStockQuantity()}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-green-300 disabled:transform-none flex items-center justify-center"
                                            >
                                                {addingToCart ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                ) : (
                                                    '+'
                                                )}
                                            </button>
                                        </div>
                                        
                                        <button
                                            onClick={handleRemoveFromCart}
                                            disabled={addingToCart}
                                            className="w-full text-red-600 border-2 border-red-300 hover:border-red-500 hover:bg-red-50 py-3 rounded-xl font-medium transition-all duration-200 disabled:border-gray-200 disabled:text-gray-400"
                                        >
                                            {addingToCart ? 'Removing...' : 'Remove from Cart'}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Additional Info */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Added {getCreatedDate()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span>Secure checkout</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;