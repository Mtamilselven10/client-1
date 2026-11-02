import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Plus, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { formatCurrency, getProductImageUrl } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFlyToCart } from '../../animations/useFlyToCart';

export default function OftenPairedTogether({ currentProduct, pairedProducts = [] }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const { triggerFlyToCart } = useFlyToCart();

  // All bundle items = [currentProduct, ...pairedProducts]
  const allBundleItems = useMemo(() => {
    if (!currentProduct) return [];
    return [currentProduct, ...pairedProducts];
  }, [currentProduct, pairedProducts]);

  // Selected state: Map of productId -> boolean. Initially all items in bundle are selected (true)
  const [selectedIds, setSelectedIds] = useState(() => {
    const initial = {};
    if (currentProduct) initial[currentProduct.id] = true;
    pairedProducts.forEach(p => {
      initial[p.id] = true;
    });
    return initial;
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectedItems = useMemo(() => {
    return allBundleItems.filter(p => selectedIds[p.id]);
  }, [allBundleItems, selectedIds]);

  const combinedTotal = useMemo(() => {
    return selectedItems.reduce((acc, p) => acc + (p.price || 0), 0);
  }, [selectedItems]);

  const combinedMrp = useMemo(() => {
    return selectedItems.reduce((acc, p) => acc + (p.mrp || p.price || 0), 0);
  }, [selectedItems]);

  const totalSavings = combinedMrp > combinedTotal ? combinedMrp - combinedTotal : 0;

  if (!pairedProducts || pairedProducts.length === 0) {
    return null;
  }

  const handleAddBundleToCart = (e) => {
    if (selectedItems.length === 0) return;

    // Trigger visual fly animation from button
    triggerFlyToCart(e.currentTarget, selectedItems[0], 'card');

    // Add each selected item to cart
    selectedItems.forEach(item => {
      addToCart(item, 1);
    });

    const msg = t('recommendations.bundleAddedToast') || 
      `Added ${selectedItems.length} paired items to your cart!`;
    addToast(msg, 'success');
  };

  return (
    <section className="w-full bg-cream-light rounded-2xl border border-olive/20 p-4 sm:p-6 shadow-olive-sm my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-olive/15">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-olive/10 text-olive border border-olive/20 mb-1">
            <Sparkles className="w-3 h-3 text-olive" />
            <span>{t('recommendations.oftenPairedBadge') || 'Pantry Combinations'}</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-ink">
            {t('recommendations.oftenPairedTitle') || 'Often Paired Together'}
          </h3>
          <p className="text-xs text-ink/70">
            {t('recommendations.oftenPairedSubtitle') || 'Traditional kitchen staples frequently cooked and used in harmony.'}
          </p>
        </div>
      </div>

      {/* Visual Product Bundle Row with '+' connector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Products Visual Group */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {allBundleItems.map((prod, idx) => {
            const isSelected = Boolean(selectedIds[prod.id]);
            const isMain = prod.id === currentProduct.id;

            return (
              <React.Fragment key={prod.id}>
                {idx > 0 && (
                  <div className="w-7 h-7 rounded-full bg-cream-deep border border-olive/20 flex items-center justify-center text-olive font-bold shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                )}

                <div 
                  data-testid="bundle-item-card"
                  onClick={() => toggleSelect(prod.id)}
                  className={`relative flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none bg-cream ${
                    isSelected 
                      ? 'border-olive shadow-olive-xs bg-cream' 
                      : 'border-ink/15 opacity-60 bg-cream-deep/40'
                  }`}
                >
                  {/* Custom Checkbox */}
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                    isSelected ? 'bg-olive border-olive text-cream' : 'border-ink/30 bg-cream-light'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-cream-deep p-1 shrink-0 overflow-hidden border border-olive/10">
                    <img 
                      src={getProductImageUrl(prod.image)} 
                      alt={prod.name}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        if (prod.fallbackImage && e.currentTarget.src !== prod.fallbackImage) {
                          e.currentTarget.src = prod.fallbackImage;
                        }
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 max-w-[150px] sm:max-w-[180px]">
                    <div className="text-[10px] font-bold text-olive uppercase tracking-wider truncate">
                      {isMain ? (t('recommendations.thisItem') || 'This Item') : (prod.category || 'Pantry')}
                    </div>
                    <div className="text-xs font-bold text-ink truncate leading-tight">
                      {prod.name}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-serif text-xs sm:text-sm font-extrabold text-olive">
                        {formatCurrency(prod.price)}
                      </span>
                      {prod.unit && (
                        <span className="text-[10px] text-ink/60">({prod.unit})</span>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Bundle Summary & Add All Button Box */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 p-4 rounded-xl bg-cream border border-olive/20 shrink-0 w-full lg:w-72">
          <div>
            <div className="text-xs text-ink/70">
              {t('recommendations.totalForSelected') || 'Total for'} <strong>{selectedItems.length}</strong> {t('recommendations.items') || 'items'}:
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-serif text-xl sm:text-2xl font-black text-olive">
                {formatCurrency(combinedTotal)}
              </span>
              {totalSavings > 0 && (
                <span className="text-xs text-ink/50 line-through">
                  {formatCurrency(combinedMrp)}
                </span>
              )}
            </div>
            {totalSavings > 0 && (
              <div className="text-[11px] font-bold text-emerald-700">
                {t('recommendations.bundleSave') || 'You save'} {formatCurrency(totalSavings)}
              </div>
            )}
          </div>

          <button
            type="button"
            data-testid="add-bundle-btn"
            onClick={handleAddBundleToCart}
            disabled={selectedItems.length === 0}
            className={`w-full sm:w-auto lg:w-full px-5 py-2.5 rounded-btn font-bold text-xs sm:text-sm shadow-olive-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              selectedItems.length > 0
                ? 'bg-olive text-cream hover:bg-olive-dark active:scale-95'
                : 'bg-ink/20 text-ink/40 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {t('recommendations.addSelectedBtn', { count: selectedItems.length }) || `Add Selected (${selectedItems.length}) to Cart`}
            </span>
          </button>
        </div>

      </div>
    </section>
  );
}
