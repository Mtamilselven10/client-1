import { useCallback } from 'react';

/**
 * Custom hook to trigger Fly-to-Cart or Fly-to-Wishlist portal animations.
 * Decoupled from state: executes in parallel without delaying cart/wishlist logic.
 */
export function useFlyToCart() {
  const triggerFlyToCart = useCallback((element, product, type = 'card') => {
    if (!element || typeof window === 'undefined') return;
    const rect = element.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent('fly-to-cart', {
        detail: {
          rect,
          product,
          type,
          targetType: 'cart'
        }
      })
    );
  }, []);

  const triggerFlyToWishlist = useCallback((element, product) => {
    if (!element || typeof window === 'undefined') return;
    const rect = element.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent('fly-to-wishlist', {
        detail: {
          rect,
          product,
          type: 'heart',
          targetType: 'wishlist'
        }
      })
    );
  }, []);

  return {
    triggerFlyToCart,
    triggerFlyToWishlist
  };
}

export default useFlyToCart;
