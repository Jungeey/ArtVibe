import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { isLoggedIn } from '../utils/auth';
import * as cartService from '../services/cartService';
import type { CartItem, CartResponse } from '../services/cartService';

// Types
export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  lastSynced: Date | null;
  error: string | null;
}

interface CartContextType {
  cart: CartState;
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: (items: CartItem[]) => Promise<void>;
  refreshCart: () => Promise<void>;
}

type CartAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SYNCED'; payload: Date }
  | { type: 'SET_ERROR'; payload: string | null };

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_CART':
      return { ...action.payload };

    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.product === action.payload.product);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product === action.payload.product
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return { ...state, items: updatedItems, total, itemCount, error: null };
      } else {
        const newItems = [...state.items, action.payload];
        const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return { ...state, items: newItems, total, itemCount, error: null };
      }

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.product !== action.payload);
      const filteredTotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const filteredCount = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { ...state, items: filteredItems, total: filteredTotal, itemCount: filteredCount, error: null };

    case 'UPDATE_QUANTITY':
      const quantityUpdatedItems = state.items.map(item =>
        item.product === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const quantityTotal = quantityUpdatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const quantityCount = quantityUpdatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { ...state, items: quantityUpdatedItems, total: quantityTotal, itemCount: quantityCount, error: null };

    case 'CLEAR_CART':
      return { 
        items: [], 
        total: 0, 
        itemCount: 0, 
        isLoading: false, 
        lastSynced: null,
        error: null 
      };

    case 'SET_SYNCED':
      return { ...state, lastSynced: action.payload, error: null };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
};

// Local storage helper functions
const CART_STORAGE_KEY = 'artVibe-cart';

const loadFromLocalStorage = (): CartState => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        lastSynced: parsed.lastSynced ? new Date(parsed.lastSynced) : null,
        isLoading: false,
        error: null
      };
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
  }
  return { items: [], total: 0, itemCount: 0, isLoading: false, lastSynced: null, error: null };
};

const saveToLocalStorage = (cart: CartState): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

// Convert API response to local cart state
const transformCartResponse = (cartData: CartResponse): CartState => {
  return {
    items: cartData.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      image: item.image,
      stockQuantity: item.product.stockQuantity
    })),
    total: cartData.total,
    itemCount: cartData.itemCount,
    isLoading: false,
    lastSynced: new Date(),
    error: null
  };
};

// Provider Component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    isLoading: true,
    lastSynced: null,
    error: null
  });

  // API calls using your existing service
  const fetchCartFromAPI = async (): Promise<CartState> => {
    try {
      const response = await cartService.getCart();
      return transformCartResponse(response.data);
    } catch (error: any) {
      console.error('Failed to fetch cart from API:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      
      throw new Error(error.response?.data?.error || 'Failed to fetch cart');
    }
  };

  const addToCartAPI = async (product: any): Promise<void> => {
    try {
      await cartService.addToCart(product._id, 1);
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      throw new Error(error.response?.data?.error || 'Failed to add item to cart');
    }
  };

  const removeFromCartAPI = async (productId: string): Promise<void> => {
    try {
      await cartService.removeFromCart(productId);
    } catch (error: any) {
      console.error('Failed to remove from cart:', error);
      throw new Error(error.response?.data?.error || 'Failed to remove item from cart');
    }
  };

  const updateQuantityAPI = async (productId: string, quantity: number): Promise<void> => {
    try {
      await cartService.updateCartItem(productId, quantity);
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      throw new Error(error.response?.data?.error || 'Failed to update quantity');
    }
  };

  const clearCartAPI = async (): Promise<void> => {
    try {
      await cartService.clearCart();
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      throw new Error(error.response?.data?.error || 'Failed to clear cart');
    }
  };

  const syncCartAPI = async (items: CartItem[]): Promise<void> => {
    try {
      await cartService.syncCart(
        items.map(item => ({
          productId: item.product,
          quantity: item.quantity
        }))
      );
    } catch (error: any) {
      console.error('Failed to sync cart:', error);
      throw new Error(error.response?.data?.error || 'Failed to sync cart');
    }
  };

  // Public methods
  const addToCart = async (product: any): Promise<void> => {
    const cartItem: CartItem = {
      product: product._id,
      quantity: 1,
      price: product.price,
      name: product.name,
      image: product.primaryImage || product.images[0] || '/images/placeholder.jpg',
      stockQuantity: product.stockQuantity
    };

    // Optimistic UI update
    dispatch({ type: 'ADD_ITEM', payload: cartItem });

    if (isLoggedIn()) {
      try {
        await addToCartAPI(product);
        dispatch({ type: 'SET_SYNCED', payload: new Date() });
      } catch (error) {
        // Revert on error
        dispatch({ type: 'REMOVE_ITEM', payload: product._id });
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        throw error;
      }
    } else {
      // Save to localStorage for guest users
      saveToLocalStorage(cart);
    }
  };

  const removeFromCart = async (productId: string): Promise<void> => {
    // Store item for potential revert
    const itemToRemove = cart.items.find(item => item.product === productId);
    
    // Optimistic UI update
    dispatch({ type: 'REMOVE_ITEM', payload: productId });

    if (isLoggedIn() && itemToRemove) {
      try {
        await removeFromCartAPI(productId);
        dispatch({ type: 'SET_SYNCED', payload: new Date() });
      } catch (error) {
        // Revert on error
        if (itemToRemove) {
          dispatch({ type: 'ADD_ITEM', payload: itemToRemove });
        }
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        throw error;
      }
    } else {
      saveToLocalStorage(cart);
    }
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<void> => {
    // Store old quantity for potential revert
    const oldItem = cart.items.find(item => item.product === productId);
    
    // Optimistic UI update
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });

    if (isLoggedIn() && oldItem) {
      try {
        await updateQuantityAPI(productId, quantity);
        dispatch({ type: 'SET_SYNCED', payload: new Date() });
      } catch (error) {
        // Revert on error
        if (oldItem) {
          dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity: oldItem.quantity } });
        }
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        throw error;
      }
    } else {
      saveToLocalStorage(cart);
    }
  };

  const clearCart = async (): Promise<void> => {
    // Store items for potential revert
    const itemsToClear = [...cart.items];
    
    // Optimistic UI update
    dispatch({ type: 'CLEAR_CART' });

    if (isLoggedIn() && itemsToClear.length > 0) {
      try {
        await clearCartAPI();
        dispatch({ type: 'SET_SYNCED', payload: new Date() });
      } catch (error) {
        // Revert on error
        dispatch({ type: 'LOAD_CART', payload: { ...cart, items: itemsToClear, isLoading: false } });
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        throw error;
      }
    } else {
      saveToLocalStorage(cart);
    }
  };

  const syncCart = async (items: CartItem[]): Promise<void> => {
    if (isLoggedIn()) {
      try {
        await syncCartAPI(items);
        dispatch({ type: 'SET_SYNCED', payload: new Date() });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        throw error;
      }
    }
  };

  const refreshCart = async (): Promise<void> => {
    if (isLoggedIn()) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const apiCart = await fetchCartFromAPI();
        dispatch({ type: 'LOAD_CART', payload: apiCart });
      } catch (error) {
        console.error('Failed to refresh cart:', error);
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      }
    }
  };

  // Load cart on mount and auth changes
  useEffect(() => {
    const loadCart = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (isLoggedIn()) {
        try {
          const apiCart = await fetchCartFromAPI();
          dispatch({ type: 'LOAD_CART', payload: apiCart });
          
          // Check if we have local cart data to merge
          const localCart = loadFromLocalStorage();
          if (localCart.items.length > 0 && apiCart.items.length === 0) {
            console.log('Merging local cart with server cart...');
            await syncCart(localCart.items);
            // Clear local storage after successful merge
            localStorage.removeItem(CART_STORAGE_KEY);
          }
        } catch (error) {
          console.error('Failed to load cart from API, falling back to local storage:', error);
          const localCart = loadFromLocalStorage();
          dispatch({ type: 'LOAD_CART', payload: localCart });
        }
      } else {
        // Guest user - load from localStorage only
        const localCart = loadFromLocalStorage();
        dispatch({ type: 'LOAD_CART', payload: localCart });
      }
    };

    loadCart();
  }, [isLoggedIn()]);

  // Save to localStorage whenever cart changes (for guest users and backup)
  useEffect(() => {
    if (!cart.isLoading) {
      saveToLocalStorage(cart);
    }
  }, [cart.items, cart.total, cart.isLoading]);

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};