import api from './api';

export interface CartItem {
  product: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  stockQuantity: number;
}

export interface CartResponse {
  _id: string;
  user: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      images: string[];
      primaryImage?: string;
      stockQuantity: number;
      status: 'active' | 'unlisted';
    };
    quantity: number;
    price: number;
    name: string;
    image: string;
  }>;
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// Get user's cart
export const getCart = (): Promise<{ data: CartResponse }> => {
  return api.get('/cart');
};

// Add item to cart
export const addToCart = (productId: string, quantity: number = 1): Promise<{ data: CartResponse }> => {
  return api.post('/cart/add', { productId, quantity });
};

// Update item quantity
export const updateCartItem = (productId: string, quantity: number): Promise<{ data: CartResponse }> => {
  return api.put(`/cart/update/${productId}`, { quantity });
};

// Remove item from cart
export const removeFromCart = (productId: string): Promise<{ data: CartResponse }> => {
  return api.delete(`/cart/remove/${productId}`);
};

// Clear entire cart
export const clearCart = (): Promise<{ data: CartResponse }> => {
  return api.delete('/cart/clear');
};

// Sync local cart with server
export const syncCart = (items: Array<{ productId: string; quantity: number }>): Promise<{ data: CartResponse }> => {
  return api.post('/cart/sync', { items });
};