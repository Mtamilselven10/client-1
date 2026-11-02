import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const SHOPPING_LISTS_STORAGE_KEY = 'gandhi_shopping_lists';
const ACTIVE_LIST_ID_KEY = 'gandhi_active_shopping_list_id';

const ShoppingListContext = createContext(null);

const INITIAL_DEFAULT_LISTS = [
  {
    id: 'list-monthly',
    name: 'Monthly Grocery',
    createdAt: Date.now(),
    items: []
  }
];

export function ShoppingListProvider({ children }) {
  const [lists, setLists] = useState(() => {
    try {
      const stored = localStorage.getItem(SHOPPING_LISTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to load shopping lists from localStorage:', err);
    }
    return INITIAL_DEFAULT_LISTS;
  });

  const [activeListId, setActiveListIdState] = useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_LIST_ID_KEY);
      if (stored && lists.some(l => l.id === stored)) {
        return stored;
      }
    } catch {}
    return lists[0]?.id || 'list-monthly';
  });

  // Sync lists to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SHOPPING_LISTS_STORAGE_KEY, JSON.stringify(lists));
    } catch (err) {
      console.warn('Failed to save shopping lists to localStorage:', err);
    }
  }, [lists]);

  // Sync activeListId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_LIST_ID_KEY, activeListId);
    } catch {}
  }, [activeListId]);

  const setActiveListId = useCallback((id) => {
    setActiveListIdState(id);
  }, []);

  const activeList = useMemo(() => {
    return lists.find(l => l.id === activeListId) || lists[0] || null;
  }, [lists, activeListId]);

  /**
   * Create a new shopping list
   */
  const createList = useCallback((name) => {
    const trimmed = String(name || '').trim();
    if (!trimmed) return null;

    const newList = {
      id: `list-${Date.now()}`,
      name: trimmed,
      createdAt: Date.now(),
      items: []
    };

    setLists(prev => [...prev, newList]);
    setActiveListIdState(newList.id);
    return newList;
  }, []);

  /**
   * Rename an existing list
   */
  const renameList = useCallback((listId, newName) => {
    const trimmed = String(newName || '').trim();
    if (!trimmed) return;

    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return { ...list, name: trimmed };
      }
      return list;
    }));
  }, []);

  /**
   * Delete a list. If deleted list was active, select another list.
   */
  const deleteList = useCallback((listId) => {
    setLists(prev => {
      const filtered = prev.filter(l => l.id !== listId);
      // Ensure at least 1 list always exists
      if (filtered.length === 0) {
        const fallback = {
          id: `list-${Date.now()}`,
          name: 'My Grocery List',
          createdAt: Date.now(),
          items: []
        };
        setActiveListIdState(fallback.id);
        return [fallback];
      }
      if (activeListId === listId) {
        setActiveListIdState(filtered[0].id);
      }
      return filtered;
    });
  }, [activeListId]);

  /**
   * Add a product to a specific list (defaults to activeList)
   */
  const addItemToList = useCallback((listId, product, quantity = 1) => {
    if (!product || !product.id) return;
    const targetListId = listId || activeListId;

    setLists(prev => prev.map(list => {
      if (list.id !== targetListId) return list;

      const prodId = String(product.id).trim();
      const existingIdx = list.items.findIndex(item => String(item.productId || item.id).trim() === prodId);

      let updatedItems;
      if (existingIdx > -1) {
        // Increment quantity of existing item, preserve completion status
        updatedItems = [...list.items];
        updatedItems[existingIdx] = {
          ...updatedItems[existingIdx],
          quantity: (updatedItems[existingIdx].quantity || 1) + quantity
        };
      } else {
        // Append new item
        updatedItems = [
          ...list.items,
          {
            productId: prodId,
            id: prodId,
            name: product.name,
            price: product.price,
            mrp: product.mrp,
            unit: product.unit,
            image: product.image,
            category: product.category,
            quantity: Math.max(1, quantity),
            completed: false,
            addedAt: Date.now()
          }
        ];
      }

      return { ...list, items: updatedItems };
    }));
  }, [activeListId]);

  /**
   * Remove item from list
   */
  const removeItemFromList = useCallback((listId, productId) => {
    const targetListId = listId || activeListId;
    const cleanId = String(productId).trim();

    setLists(prev => prev.map(list => {
      if (list.id !== targetListId) return list;
      return {
        ...list,
        items: list.items.filter(item => String(item.productId || item.id).trim() !== cleanId)
      };
    }));
  }, [activeListId]);

  /**
   * Update item quantity in list
   */
  const updateItemQuantity = useCallback((listId, productId, quantity) => {
    const targetListId = listId || activeListId;
    const cleanId = String(productId).trim();

    if (quantity <= 0) {
      removeItemFromList(targetListId, cleanId);
      return;
    }

    setLists(prev => prev.map(list => {
      if (list.id !== targetListId) return list;
      return {
        ...list,
        items: list.items.map(item => {
          if (String(item.productId || item.id).trim() === cleanId) {
            return { ...item, quantity };
          }
          return item;
        })
      };
    }));
  }, [activeListId, removeItemFromList]);

  /**
   * Toggle item completion (check off / uncheck)
   */
  const toggleItemCompleted = useCallback((listId, productId) => {
    const targetListId = listId || activeListId;
    const cleanId = String(productId).trim();

    setLists(prev => prev.map(list => {
      if (list.id !== targetListId) return list;
      return {
        ...list,
        items: list.items.map(item => {
          if (String(item.productId || item.id).trim() === cleanId) {
            return { ...item, completed: !item.completed };
          }
          return item;
        })
      };
    }));
  }, [activeListId]);

  /**
   * Clear all completed items from list
   */
  const clearCompletedItems = useCallback((listId) => {
    const targetListId = listId || activeListId;
    setLists(prev => prev.map(list => {
      if (list.id !== targetListId) return list;
      return {
        ...list,
        items: list.items.filter(item => !item.completed)
      };
    }));
  }, [activeListId]);

  /**
   * Check if a product is in a specific list or any list
   */
  const isProductInList = useCallback((listId, productId) => {
    const targetList = lists.find(l => l.id === (listId || activeListId));
    if (!targetList) return false;
    const cleanId = String(productId).trim();
    return targetList.items.some(item => String(item.productId || item.id).trim() === cleanId);
  }, [lists, activeListId]);

  const value = useMemo(() => ({
    lists,
    activeList,
    activeListId,
    setActiveListId,
    createList,
    renameList,
    deleteList,
    addItemToList,
    removeItemFromList,
    updateItemQuantity,
    toggleItemCompleted,
    clearCompletedItems,
    isProductInList
  }), [
    lists,
    activeList,
    activeListId,
    setActiveListId,
    createList,
    renameList,
    deleteList,
    addItemToList,
    removeItemFromList,
    updateItemQuantity,
    toggleItemCompleted,
    clearCompletedItems,
    isProductInList
  ]);

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }
  return context;
}
