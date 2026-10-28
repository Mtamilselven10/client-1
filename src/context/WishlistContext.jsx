import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';

const WishlistContext = createContext(null);
const WISHLIST_STORAGE_KEY = 'gandhi_shop_wishlist_items';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Failed to load wishlist from localStorage", err);
      return [];
    }
  });

  const { addToast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (err) {
      console.error("Failed to persist wishlist to localStorage", err);
    }
  }, [wishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.id === productId);
  }, [wishlist]);

  const toggleWishlist = useCallback((product) => {
    const exists = wishlist.some(item => item.id === product.id);
    if (exists) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
      addToast(`Removed "${product.name}" from wishlist`, 'info');
    } else {
      setWishlist(prev => [...prev, product]);
      addToast(`Added "${product.name}" to wishlist`, 'success');
    }
  }, [wishlist, addToast]);

  const removeFromWishlist = useCallback((productId, showToast = true) => {
    setWishlist(prev => {
      const item = prev.find(i => i.id === productId);
      if (showToast && item) {
        addToast(`Removed "${item.name}" from wishlist`, 'info');
      }
      return prev.filter(i => i.id !== productId);
    });
  }, [addToast]);

  const moveToCart = useCallback((product) => {
    addToCart(product, 1, false);
    removeFromWishlist(product.id, false);
    addToast(`Moved "${product.name}" to cart`, 'success');
  }, [addToCart, removeFromWishlist, addToast]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      moveToCart,
      clearWishlist,
      itemCount: wishlist.length
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
}
