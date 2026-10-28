import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

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
  return (
    <div className="p-5 rounded-card bg-cream-deep border border-olive/20 shadow-olive-sm space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-olive/15 pb-4">
        <div className="flex items-center gap-2 text-olive font-serif text-lg font-bold">
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filter & Refine</span>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-olive hover:text-olive-dark underline underline-offset-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="space-y-2">
        <label htmlFor="sort-select" className="text-xs font-bold uppercase tracking-wider text-ink/80 block">
          Sort Products By
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => onChangeSort(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-btn bg-cream-light border border-olive/25 text-sm font-semibold text-ink focus:border-olive focus:ring-1 focus:ring-olive transition-all cursor-pointer"
        >
          <option value="featured">Featured & Best Matches</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
          <option value="rating-high">Highest Rated</option>
          <option value="name-a-z">Name: A to Z</option>
        </select>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-ink">
          <span className="uppercase tracking-wider text-ink/80">Max Price</span>
          <span className="text-olive font-serif font-extrabold text-sm">
            {formatCurrency(priceRange)}
          </span>
        </div>
        <input
          type="range"
          min="15"
          max={maxPriceLimit || 500}
          step="5"
          value={priceRange}
          onChange={(e) => onChangePrice(Number(e.target.value))}
          className="w-full h-2 bg-cream-light rounded-lg appearance-none cursor-pointer accent-olive"
          aria-label="Filter maximum price"
        />
        <div className="flex items-center justify-between text-[11px] text-ink/60 font-medium">
          <span>{formatCurrency(15)}</span>
          <span>{formatCurrency(maxPriceLimit || 500)}</span>
        </div>
      </div>

      {/* Category Chips */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-ink/80 block">
          Categories
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
            All Products
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
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Total Results Summary */}
      <div className="pt-2 border-t border-olive/15 text-xs font-medium text-ink/70 flex items-center justify-between">
        <span>Showing:</span>
        <span className="font-bold text-olive">{totalResults} items found</span>
      </div>
    </div>
  );
}
