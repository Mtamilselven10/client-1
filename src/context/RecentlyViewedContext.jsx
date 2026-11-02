import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const RECENTLY_VIEWED_KEY = 'gandhi_recently_viewed';
const MAX_RECENT_ITEMS = 10;

const RecentlyViewedContext = createContext(null);

export function RecentlyViewedProvider({ children }) {
  const [viewedItems, setViewedItems] = useState(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Validate items have an id and keep only valid string IDs up to MAX_RECENT_ITEMS
          return parsed
            .filter(item => item && (item.id || typeof item === 'string'))
            .map(item => (typeof item === 'string' ? { id: item, viewedAt: Date.now() } : item))
            .slice(0, MAX_RECENT_ITEMS);
        }
      }
    } catch (err) {
      console.warn('Failed to parse recently viewed items from localStorage:', err);
    }
    return [];
  });

  // Keep localStorage synchronized whenever viewedItems changes
  useEffect(() => {
    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(viewedItems));
    } catch (err) {
      console.warn('Failed to persist recently viewed items to localStorage:', err);
    }
  }, [viewedItems]);

  /**
   * Records a product view.
   * - Deduplicates: If product was previously viewed, moves it to the top (index 0).
   * - Enforces maximum of 10 products.
   * - Ready for future account-based backend synchronization.
   */
  const recordView = useCallback((productId) => {
    if (!productId) return;
    const cleanId = String(productId).trim();
    if (!cleanId) return;

    setViewedItems(prev => {
      const filtered = prev.filter(item => String(item.id).trim() !== cleanId);
      const updated = [{ id: cleanId, viewedAt: Date.now() }, ...filtered];
      return updated.slice(0, MAX_RECENT_ITEMS);
    });
  }, []);

  /**
   * Clears the entire browsing history.
   */
  const clearRecentlyViewed = useCallback(() => {
    setViewedItems([]);
    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch (err) {
      console.warn('Failed to clear recently viewed from localStorage:', err);
    }
  }, []);

  /**
   * Ordered list of recently viewed product IDs
   */
  const recentlyViewedIds = useMemo(() => {
    return viewedItems.map(item => item.id);
  }, [viewedItems]);

  /**
   * Hydrates the stored product IDs into full product objects using the current catalog.
   * Filters out missing/deleted products and optionally excludes the currently active product.
   */
  const getHydratedProducts = useCallback((catalog = [], excludeId = null) => {
    if (!Array.isArray(catalog) || catalog.length === 0 || viewedItems.length === 0) {
      return [];
    }

    const catalogMap = new Map();
    catalog.forEach(prod => {
      if (prod && prod.id) {
        catalogMap.set(String(prod.id).trim().toLowerCase(), prod);
      }
    });

    const cleanExclude = excludeId ? String(excludeId).trim().toLowerCase() : null;

    const result = [];
    for (const item of viewedItems) {
      const idKey = String(item.id).trim().toLowerCase();
      if (cleanExclude && idKey === cleanExclude) {
        continue;
      }
      const found = catalogMap.get(idKey);
      if (found) {
        result.push(found);
      }
    }

    return result;
  }, [viewedItems]);

  const value = useMemo(() => ({
    viewedItems,
    recentlyViewedIds,
    recordView,
    clearRecentlyViewed,
    getHydratedProducts,
    hasItems: viewedItems.length > 0
  }), [viewedItems, recentlyViewedIds, recordView, clearRecentlyViewed, getHydratedProducts]);

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}
