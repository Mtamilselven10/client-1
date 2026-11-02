import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  ShoppingCart, 
  Sparkles, 
  ArrowRight,
  ListPlus,
  ShoppingBag,
  Search,
  Check
} from 'lucide-react';
import { useShoppingList } from '../../context/ShoppingListContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency, getProductImageUrl } from '../../utils/formatters';
import { calculateListMetrics, hydrateListItems } from '../../utils/shoppingListUtils';
import { loadProductsCatalog } from '../../utils/excelParser';
import ShoppingListItem from './ShoppingListItem';

export default function ShoppingListDashboard({ className = '' }) {
  const {
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
    clearCompletedItems
  } = useShoppingList();

  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Modal / Inline input states
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleVal, setEditTitleVal] = useState('');

  // Quick Catalog Add search state
  const [quickSearch, setQuickSearch] = useState('');
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);

  useEffect(() => {
    let isMounted = true;
    loadProductsCatalog()
      .then(data => {
        if (isMounted) {
          setCatalog(data || []);
          setLoadingCatalog(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingCatalog(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const catalogMap = useMemo(() => {
    const map = new Map();
    catalog.forEach(p => {
      if (p && p.id) map.set(String(p.id).toLowerCase(), p);
    });
    return map;
  }, [catalog]);

  const activeItems = useMemo(() => {
    return activeList?.items || [];
  }, [activeList]);

  // Hydrate with current catalog prices and availability
  const hydratedItems = useMemo(() => {
    return hydrateListItems(activeItems, catalog);
  }, [activeItems, catalog]);

  const metrics = useMemo(() => {
    return calculateListMetrics(activeItems, catalogMap);
  }, [activeItems, catalogMap]);

  // Handle Add All Available to Cart
  const handleAddAllToCart = () => {
    const availableItems = hydratedItems.filter(item => (item.product?.inStock !== false));
    if (availableItems.length === 0) {
      addToast(t('shoppingList.noAvailableToAdd') || 'No in-stock items available to add.', 'warning');
      return;
    }

    availableItems.forEach(item => {
      addToCart(item.product, item.quantity || 1, false);
    });

    addToast(
      t('shoppingList.addedAllSuccess', { count: availableItems.length }) ||
      `Added ${availableItems.length} provisions to your shopping cart!`,
      'success'
    );
  };

  // Handle Add Only Remaining (Uncompleted) to Cart
  const handleAddRemainingToCart = () => {
    const remaining = hydratedItems.filter(item => !item.completed && (item.product?.inStock !== false));
    if (remaining.length === 0) {
      addToast(t('shoppingList.noRemainingToAdd') || 'All items are already marked completed!', 'info');
      return;
    }

    remaining.forEach(item => {
      addToCart(item.product, item.quantity || 1, false);
    });

    addToast(
      t('shoppingList.addedRemainingSuccess', { count: remaining.length }) ||
      `Added ${remaining.length} remaining items to your cart!`,
      'success'
    );
  };

  const handleCreateListSubmit = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createList(newListName.trim());
    setNewListName('');
    setIsCreatingList(false);
    addToast(t('shoppingList.listCreated') || 'New shopping list created', 'success');
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (!editTitleVal.trim()) return;
    renameList(activeListId, editTitleVal.trim());
    setIsEditingTitle(false);
    addToast(t('shoppingList.listRenamed') || 'List renamed successfully', 'info');
  };

  const handleDeleteActiveList = () => {
    if (lists.length <= 1) {
      addToast(t('shoppingList.cannotDeleteLast') || 'Cannot delete the only remaining list', 'warning');
      return;
    }
    const name = activeList?.name;
    deleteList(activeListId);
    addToast(t('shoppingList.listDeleted', { name }) || `Deleted list "${name}"`, 'info');
  };

  // Filter catalog for quick add dropdown
  const filteredCatalog = useMemo(() => {
    if (!quickSearch.trim()) return catalog.slice(0, 8);
    const q = quickSearch.toLowerCase();
    return catalog.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.category?.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [catalog, quickSearch]);

  return (
    <div className={`w-full space-y-6 ${className}`}>
      
      {/* 1. List Selector Tabs + New List Button */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pb-2 border-b border-olive/15">
        <div className="flex items-center gap-2">
          {lists.map(list => {
            const isActive = list.id === activeListId;
            const count = list.items?.length || 0;

            return (
              <button
                key={list.id}
                type="button"
                onClick={() => setActiveListId(list.id)}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-olive text-cream shadow-olive-sm'
                    : 'bg-cream-light text-ink/75 hover:bg-cream-deep border border-olive/20'
                }`}
              >
                <span>{list.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-cream/20 text-cream' : 'bg-olive/10 text-olive'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Create New List Button */}
        <button
          type="button"
          onClick={() => {
            setIsCreatingList(true);
            setNewListName('');
          }}
          className="px-3 py-2 rounded-xl text-xs font-bold text-olive bg-olive/10 hover:bg-olive/20 border border-olive/25 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('shoppingList.newListBtn') || 'New List'}</span>
        </button>
      </div>

      {/* Inline Create List Form */}
      {isCreatingList && (
        <form onSubmit={handleCreateListSubmit} className="flex items-center gap-2 p-3 bg-cream-light rounded-xl border border-olive/30 shadow-olive-xs">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder={t('shoppingList.newListNamePlaceholder') || "Enter list name (e.g. Festival Shopping)"}
            className="flex-1 px-3 py-1.5 rounded-lg border border-olive/30 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-olive"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-olive text-cream text-xs font-bold hover:bg-olive-dark transition-colors cursor-pointer"
          >
            {t('shoppingList.save') || 'Create'}
          </button>
          <button
            type="button"
            onClick={() => setIsCreatingList(false)}
            className="px-3 py-1.5 rounded-lg text-ink/60 hover:text-ink text-xs font-semibold cursor-pointer"
          >
            {t('shoppingList.cancel') || 'Cancel'}
          </button>
        </form>
      )}

      {/* 2. Active List Header & Smart Metrics Bar */}
      <div className="bg-cream-light rounded-2xl border border-olive/20 p-4 sm:p-6 shadow-olive-sm space-y-4">
        
        {/* Title Row + Rename & Delete controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-olive/15">
          {isEditingTitle ? (
            <form onSubmit={handleRenameSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={editTitleVal}
                onChange={(e) => setEditTitleVal(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-olive/30 text-base font-serif font-bold text-ink"
                autoFocus
              />
              <button type="submit" className="px-3 py-1 rounded bg-olive text-cream text-xs font-bold">
                {t('shoppingList.save') || 'Save'}
              </button>
              <button type="button" onClick={() => setIsEditingTitle(false)} className="text-xs text-ink/60">
                {t('shoppingList.cancel') || 'Cancel'}
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-xl sm:text-2xl font-black text-ink">
                {activeList?.name || 'Shopping List'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditTitleVal(activeList?.name || '');
                  setIsEditingTitle(true);
                }}
                className="p-1 rounded text-ink/40 hover:text-olive transition-colors cursor-pointer"
                title={t('shoppingList.rename') || 'Rename List'}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {metrics.completedCount > 0 && (
              <button
                type="button"
                onClick={() => clearCompletedItems(activeListId)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-ink/70 hover:text-red-700 bg-cream-deep/60 hover:bg-red-50 border border-olive/15 transition-colors cursor-pointer"
              >
                {t('shoppingList.clearCompleted') || 'Clear Completed'} ({metrics.completedCount})
              </button>
            )}

            {lists.length > 1 && (
              <button
                type="button"
                onClick={handleDeleteActiveList}
                className="p-2 rounded-lg text-ink/40 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                title={t('shoppingList.deleteList') || 'Delete this list'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar (% Completed) */}
        {metrics.totalProducts > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-ink/75 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-olive" />
                <span>
                  {t('shoppingList.progressLabel', { completed: metrics.completedCount, total: metrics.totalProducts }) ||
                    `${metrics.completedCount} of ${metrics.totalProducts} items checked`}
                </span>
              </span>
              <span className="font-extrabold text-olive">{metrics.progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-cream-deep overflow-hidden">
              <div 
                className="h-full bg-olive rounded-full transition-all duration-300"
                style={{ width: `${metrics.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 3. Summary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-cream border border-olive/15">
            <div className="text-[10px] font-bold text-ink/60 uppercase tracking-wider">
              {t('shoppingList.totalProducts') || 'Provisions'}
            </div>
            <div className="font-serif text-lg font-black text-ink mt-0.5">
              {metrics.totalProducts} <span className="text-xs font-normal text-ink/60">({metrics.totalQuantity} units)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cream border border-olive/15">
            <div className="text-[10px] font-bold text-ink/60 uppercase tracking-wider">
              {t('shoppingList.estimatedBudget') || 'Estimated Total'}
            </div>
            <div className="font-serif text-lg font-black text-olive mt-0.5">
              {formatCurrency(metrics.estimatedCost)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cream border border-olive/15">
            <div className="text-[10px] font-bold text-ink/60 uppercase tracking-wider">
              {t('shoppingList.potentialSavings') || 'Estimated Savings'}
            </div>
            <div className="font-serif text-lg font-black text-emerald-700 mt-0.5">
              {formatCurrency(metrics.potentialSavings)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cream border border-olive/15">
            <div className="text-[10px] font-bold text-ink/60 uppercase tracking-wider">
              {t('shoppingList.stockAvailable') || 'In-Stock Items'}
            </div>
            <div className="font-serif text-lg font-black text-ink mt-0.5">
              {metrics.availableCount} / {metrics.totalProducts}
            </div>
          </div>
        </div>

        {/* 4. Batch Actions Row */}
        {metrics.totalProducts > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-olive/15">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="px-4 py-2.5 rounded-btn bg-olive text-cream font-bold text-xs sm:text-sm shadow-olive-sm hover:bg-olive-dark active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('shoppingList.addAllToCart') || 'Add All Available to Cart'}</span>
              </button>

              {metrics.remainingCount > 0 && metrics.completedCount > 0 && (
                <button
                  type="button"
                  onClick={handleAddRemainingToCart}
                  className="px-4 py-2.5 rounded-btn bg-cream-light border border-olive text-olive font-bold text-xs sm:text-sm hover:bg-olive-soft transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('shoppingList.addRemainingToCart') || 'Add Remaining to Cart'} ({metrics.remainingCount})</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowCatalogDropdown(!showCatalogDropdown)}
              className="px-3.5 py-2 rounded-btn text-xs font-bold text-olive bg-cream border border-olive/30 hover:border-olive transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('shoppingList.addFromCatalog') || 'Quick Add Provision'}</span>
            </button>
          </div>
        )}

      </div>

      {/* Quick Add Catalog Search Bar */}
      {showCatalogDropdown && (
        <div className="p-4 bg-cream-light rounded-2xl border border-olive/30 shadow-olive-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-olive uppercase tracking-wider">
              {t('shoppingList.quickSearchTitle') || 'Search & Add Provisions to this List'}
            </span>
            <button
              type="button"
              onClick={() => setShowCatalogDropdown(false)}
              className="text-xs text-ink/60 hover:text-ink"
            >
              ✕ Close
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder={t('shoppingList.quickSearchPlaceholder') || "Type to search rice, dal, spices, oils..."}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-olive/30 text-xs sm:text-sm bg-cream focus:outline-none focus:ring-1 focus:ring-olive"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar">
            {filteredCatalog.map(p => {
              const alreadyInList = activeItems.some(i => String(i.productId || i.id).trim() === String(p.id).trim());

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-cream border border-olive/15 gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={getProductImageUrl(p.image)}
                      alt={p.name}
                      className="w-8 h-8 rounded object-cover bg-cream-deep shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-ink truncate">{p.name}</div>
                      <div className="font-serif text-[11px] font-extrabold text-olive">
                        {formatCurrency(p.price)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addItemToList(activeListId, p, 1);
                      addToast(t('shoppingList.itemAddedToast', { name: p.name }) || `Added ${p.name} to list`, 'success');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                      alreadyInList
                        ? 'bg-cream-deep text-olive border border-olive/30'
                        : 'bg-olive text-cream hover:bg-olive-dark'
                    }`}
                  >
                    {alreadyInList ? '+1 More' : '+ Add'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Shopping List Items List */}
      {hydratedItems.length > 0 ? (
        <div className="space-y-2.5">
          {hydratedItems.map(item => (
            <ShoppingListItem
              key={item.productId || item.id}
              item={item}
              onToggleComplete={(prodId) => toggleItemCompleted(activeListId, prodId)}
              onUpdateQuantity={(prodId, qty) => updateItemQuantity(activeListId, prodId, qty)}
              onRemove={(prodId) => removeItemFromList(activeListId, prodId)}
            />
          ))}
        </div>
      ) : (
        /* Empty List State */
        <div className="text-center py-12 px-4 rounded-2xl bg-cream-light border border-dashed border-olive/30 space-y-4">
          <div className="w-14 h-14 rounded-full bg-olive/10 text-olive flex items-center justify-center mx-auto">
            <ListPlus className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-ink">
              {t('shoppingList.emptyTitle') || 'Your shopping list is empty'}
            </h3>
            <p className="text-xs sm:text-sm text-ink/70 mt-1 max-w-sm mx-auto">
              {t('shoppingList.emptySubtitle') || 'Plan your monthly provisions or festival shopping by adding products from the catalog.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCatalogDropdown(true)}
              className="px-4 py-2 rounded-btn bg-olive text-cream font-bold text-xs shadow-olive-xs hover:bg-olive-dark transition-colors cursor-pointer"
            >
              {t('shoppingList.quickAddBtn') || 'Quick Add Provisions'}
            </button>
            <NavLink
              to="/products"
              className="px-4 py-2 rounded-btn bg-cream border border-olive/30 text-olive font-bold text-xs hover:bg-olive-soft transition-colors inline-flex items-center gap-1.5"
            >
              <span>{t('shoppingList.browseCatalog') || 'Browse Catalog'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      )}

    </div>
  );
}
