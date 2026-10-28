import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { ANIMATION_CONFIG, isReducedMotion } from './animationConfig';
import { formatCurrency, getProductImageUrl } from '../utils/formatters';

export default function FlyLayer() {
  const [flights, setFlights] = useState([]);

  // Find visible destination element
  const getDestination = (targetType) => {
    if (targetType === 'wishlist') {
      const desktopWishlist = document.querySelector('[data-nav-target="wishlist"]');
      if (desktopWishlist && desktopWishlist.offsetParent !== null) return desktopWishlist;
      const mobileWishlist = document.querySelector('[data-nav-target="mobile-wishlist"]');
      if (mobileWishlist && mobileWishlist.offsetParent !== null) return mobileWishlist;
      return desktopWishlist || mobileWishlist;
    }

    // Default to cart target
    // Check desktop sidebar cart first if visible
    const desktopCart = document.querySelector('[data-nav-target="cart"]');
    if (desktopCart && desktopCart.offsetParent !== null) {
      return desktopCart;
    }
    // Check mobile top-header cart badge
    const mobileCart = document.querySelector('[data-nav-target="mobile-cart"]');
    if (mobileCart && mobileCart.offsetParent !== null) {
      return mobileCart;
    }
    return desktopCart || mobileCart;
  };

  const handleFlightStart = useCallback((event) => {
    if (!ANIMATION_CONFIG.animationsEnabled || !ANIMATION_CONFIG.flyToCartEnabled || isReducedMotion()) {
      // Trigger arrival event immediately without flying clone
      const targetType = event.detail?.targetType || 'cart';
      window.dispatchEvent(new CustomEvent('nav-target-arrived', { detail: { targetType } }));
      return;
    }

    const { rect, product, type = 'card', targetType = 'cart' } = event.detail || {};
    if (!rect) return;

    const destEl = getDestination(targetType);
    let destRect = destEl ? destEl.getBoundingClientRect() : null;

    if (!destRect) {
      // Fallback destination in top right
      destRect = {
        left: window.innerWidth - 60,
        top: 24,
        width: 32,
        height: 32
      };
    }

    const flightId = Date.now() + Math.random().toString(36).substring(2, 7);

    // Compute delta coordinates for arc trajectory
    const startX = rect.left;
    const startY = rect.top;
    const targetCenterX = destRect.left + destRect.width / 2;
    const targetCenterY = destRect.top + destRect.height / 2;

    const deltaX = targetCenterX - (startX + rect.width / 2);
    const deltaY = targetCenterY - (startY + rect.height / 2);

    // Dynamic upward arc curvature: lifts up before diving down
    const arcLift = -Math.max(45, Math.min(130, Math.abs(deltaX) * 0.22));

    const newFlight = {
      id: flightId,
      product,
      type,
      targetType,
      rect,
      deltaX,
      deltaY,
      arcLift
    };

    setFlights((prev) => {
      // Limit simultaneous flights to prevent frame drops
      const active = prev.slice(-(ANIMATION_CONFIG.maxSimultaneousFlights - 1));
      return [...active, newFlight];
    });

    // Schedule arrival trigger at 85% of flight duration
    const arrivalTime = ANIMATION_CONFIG.flyDuration * 850;
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('nav-target-arrived', { detail: { targetType } }));
    }, arrivalTime);
  }, []);

  const handleFlightComplete = useCallback((id) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
  }, []);

  useEffect(() => {
    window.addEventListener('fly-to-cart', handleFlightStart);
    window.addEventListener('fly-to-wishlist', handleFlightStart);
    return () => {
      window.removeEventListener('fly-to-cart', handleFlightStart);
      window.removeEventListener('fly-to-wishlist', handleFlightStart);
    };
  }, [handleFlightStart]);

  if (flights.length === 0) return null;

  return createPortal(
    <div 
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" 
      aria-hidden="true"
    >
      <AnimatePresence>
        {flights.map((flight) => {
          const { id, rect, product, type, deltaX, deltaY, arcLift } = flight;

          // Heart flight for wishlist adds
          if (type === 'heart') {
            return (
              <motion.div
                key={id}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 1,
                  opacity: 1
                }}
                animate={{
                  x: [0, deltaX * 0.45, deltaX],
                  y: [0, deltaY * 0.35 + arcLift, deltaY],
                  scale: [1, 1.4, 0.9, ANIMATION_CONFIG.targetScale * 2],
                  opacity: [1, 1, 0.9, 0]
                }}
                transition={{
                  duration: ANIMATION_CONFIG.flyDuration * 0.85,
                  ease: ANIMATION_CONFIG.flyEasing,
                  times: [0, 0.35, 0.85, 1]
                }}
                onAnimationComplete={() => handleFlightComplete(id)}
                style={{
                  position: 'fixed',
                  left: rect.left + rect.width / 2 - 16,
                  top: rect.top + rect.height / 2 - 16,
                  width: 32,
                  height: 32,
                  willChange: 'transform, opacity'
                }}
                className="rounded-full bg-cream-light border border-olive shadow-olive-md flex items-center justify-center text-olive"
              >
                <Heart className="w-5 h-5 fill-olive text-olive" />
              </motion.div>
            );
          }

          // Large image flight (from ProductDetailPage)
          if (type === 'image') {
            return (
              <motion.div
                key={id}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 1,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{
                  x: [0, deltaX * 0.4, deltaX],
                  y: [0, deltaY * 0.3 + arcLift, deltaY],
                  scale: [1, ANIMATION_CONFIG.liftScale, 0.5, ANIMATION_CONFIG.targetScale],
                  rotate: [0, ANIMATION_CONFIG.liftRotate, -ANIMATION_CONFIG.liftRotate * 1.5, 0],
                  opacity: [1, 1, 0.85, 0]
                }}
                transition={{
                  duration: ANIMATION_CONFIG.flyDuration,
                  ease: ANIMATION_CONFIG.flyEasing,
                  times: [0, 0.25, 0.85, 1]
                }}
                onAnimationComplete={() => handleFlightComplete(id)}
                style={{
                  position: 'fixed',
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  willChange: 'transform, opacity'
                }}
                className="rounded-card overflow-hidden bg-cream-deep border-2 border-olive shadow-olive-lg flex items-center justify-center p-3"
              >
                <img
                  src={getProductImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-md"
                />
              </motion.div>
            );
          }

          // Full product card clone flight (from ProductCard or WishlistCard)
          return (
            <motion.div
              key={id}
              initial={{
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
                opacity: 1
              }}
              animate={{
                x: [0, deltaX * 0.4, deltaX],
                y: [0, deltaY * 0.3 + arcLift, deltaY],
                scale: [1, ANIMATION_CONFIG.liftScale, 0.5, ANIMATION_CONFIG.targetScale],
                rotate: [0, ANIMATION_CONFIG.liftRotate, -ANIMATION_CONFIG.liftRotate * 1.5, 0],
                opacity: [1, 1, 0.85, 0]
              }}
              transition={{
                duration: ANIMATION_CONFIG.flyDuration,
                ease: ANIMATION_CONFIG.flyEasing,
                times: [0, 0.25, 0.85, 1]
              }}
              onAnimationComplete={() => handleFlightComplete(id)}
              style={{
                position: 'fixed',
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                willChange: 'transform, opacity'
              }}
              className="rounded-card overflow-hidden bg-cream-light border-2 border-olive shadow-olive-lg flex flex-col justify-between"
            >
              {/* Product Image Box */}
              <div className="relative aspect-square w-full bg-cream-deep p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={getProductImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>

              {/* Text content fades out early during flight */}
              <motion.div 
                animate={{ opacity: [1, 0.7, 0, 0] }}
                transition={{ duration: ANIMATION_CONFIG.flyDuration * 0.45 }}
                className="p-3 space-y-1 bg-cream-light"
              >
                <h4 className="font-serif font-bold text-ink text-xs line-clamp-1">
                  {product.name}
                </h4>
                <div className="font-serif text-xs font-extrabold text-olive">
                  {formatCurrency(product.price)}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
