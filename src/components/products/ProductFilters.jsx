import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';

export default function ProductFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  priceRange,
  maxPriceLimit,
  onChangePrice,
  sortBy,
  onChangeSort,
  onResetFilters,
  hasActiveFilters,
  totalResults
}) {
  const { t, translateCategory } = useLanguage();

  return (
    <div className="p-5 rounded-card bg-cream-deep border border-olive/20 shadow-olive-sm space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-olive/15 pb-4">
        <div className="flex items-center gap-2 text-olive font-serif text-lg font-bold">
          <SlidersHorizontal className="w-5 h-5" />
          <span>{t('products.filterTitle')}</span>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-olive hover:text-olive-dark underline underline-offset-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('products.resetFilters')}</span>
          </button>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="space-y-2">
        <label htmlFor="sort-select" className="text-xs font-bold uppercase tracking-wider text-ink/80 block">
          {t('products.sortBy')}
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => onChangeSort(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-btn bg-cream-light border border-olive/25 text-sm font-semibold text-ink focus:border-olive focus:ring-1 focus:ring-olive transition-all cursor-pointer"
        >
          <option value="featured">{t('products.sortFeatured')}</option>
          <option value="price-low-high">{t('products.sortPriceAsc')}</option>
          <option value="price-high-low">{t('products.sortPriceDesc')}</option>
          <option value="rating-high">{t('products.sortRating')}</option>
          <option value="name-a-z">{t('products.sortName')}</option>
        </select>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-ink">
          <span className="uppercase tracking-wider text-ink/80">{t('products.priceRange')}</span>
          <span className="text-olive font-serif font-extrabold text-sm">
            {t('products.underPrice')} {formatCurrency(priceRange)}
          </span>
        </div>
        <input
          type="range"
          min="40"
          max={maxPriceLimit || 2000}
          step="20"
          value={priceRange}
          onChange={(e) => onChangePrice(Number(e.target.value))}
          className="w-full h-2 bg-cream-light rounded-lg appearance-none cursor-pointer accent-olive"
          aria-label="Filter maximum price"
        />
        <div className="flex items-center justify-between text-[11px] text-ink/60 font-medium">
          <span>{formatCurrency(40)}</span>
          <span>{formatCurrency(maxPriceLimit || 2000)}</span>
        </div>
      </div>

      {/* Category Chips */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-ink/80 block">
          {t('products.categories')}
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'All'
                ? 'bg-olive text-cream shadow-olive-sm'
                : 'bg-cream-light text-ink/85 border border-olive/20 hover:border-olive hover:text-olive'
            }`}
          >
            {t('products.allCategories')}
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all text-left ${
                  isSelected
                    ? 'bg-olive text-cream shadow-olive-sm'
                    : 'bg-cream-light text-ink/85 border border-olive/20 hover:border-olive hover:text-olive'
                }`}
              >
                {translateCategory(cat)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Total Results Summary */}
      <div className="pt-2 border-t border-olive/15 text-xs font-medium text-ink/70 flex items-center justify-between">
        <span>{t('products.showingProducts', { count: totalResults })}</span>
      </div>
    </div>
  );
}
