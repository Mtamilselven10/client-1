import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const ProductPreviewContext = createContext(null);

export function ProductPreviewProvider({ children }) {
  const [activeProduct, setActiveProduct] = useState(null);
  const [triggerRect, setTriggerRect] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const currentTargetElRef = useRef(null);

  // Check if device supports fine hover (desktop vs touch)
  const isHoverSupported = useCallback(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  const closeImmediately = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIsOpen(false);
    setActiveProduct(null);
    setTriggerRect(null);
    currentTargetElRef.current = null;
  }, []);

  const showPreview = useCallback((product, element) => {
    if (!isHoverSupported() || !element) return;

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    currentTargetElRef.current = element;

    // If already open for another card, switch briskly; else use smooth hover-intent delay
    const delay = isOpen ? 90 : 220;

    if (showTimerRef.current) clearTimeout(showTimerRef.current);

    showTimerRef.current = setTimeout(() => {
      if (!currentTargetElRef.current) return;
      const rect = currentTargetElRef.current.getBoundingClientRect();
      setTriggerRect(rect);
      setActiveProduct(product);
      setIsOpen(true);
    }, delay);
  }, [isHoverSupported, isOpen]);

  const hidePreview = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    // Grace period allowing mouse transition from card to popover
    hideTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveProduct(null);
      setTriggerRect(null);
      currentTargetElRef.current = null;
    }, 180);
  }, []);

  const keepPreview = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Close on page scroll or Escape key
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) closeImmediately();
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) closeImmediately();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isOpen, closeImmediately]);

  return (
    <ProductPreviewContext.Provider
      value={{
        activeProduct,
        triggerRect,
        isOpen,
        showPreview,
        hidePreview,
        keepPreview,
        closeImmediately
      }}
    >
      {children}
    </ProductPreviewContext.Provider>
  );
}

export function useProductPreview() {
  const context = useContext(ProductPreviewContext);
  if (!context) {
    throw new Error('useProductPreview must be used within a ProductPreviewProvider');
  }
  return context;
}
