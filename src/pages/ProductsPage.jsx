import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { loadProductsCatalog } from '../utils/excelParser';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import SearchBar from '../components/products/SearchBar';
import { useLanguage } from '../context/LanguageContext';

// PAGE_SIZE: Number of products displayed per page (default: 10)
const PAGE_SIZE = 10;

export default function ProductsPage() {
  const { t, translateCategory } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState(2000);
  const [maxPriceLimit, setMaxPriceLimit] = useState(2000);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync category and page from URL searchParams
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('All');
    }

    const pageParam = parseInt(searchParams.get('page'), 10);
    if (!isNaN(pageParam) && pageParam >= 1) {
      setCurrentPage(pageParam);
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Load Excel File on mount
  const loadCatalog = () => {
    setLoading(true);
    setError(null);
    loadProductsCatalog()
      .then(data => {
        setProducts(data);
        const highestPrice = Math.max(...data.map(p => p.price), 400);
        setMaxPriceLimit(highestPrice);
        setPriceRange(highestPrice);
      })
      .catch(err => {
        setError(err.message || "Failed to load product catalog from Excel spreadsheet.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Handle Search Input Change (stable reference, only resets page if query actually changed)
  const handleSearchChange = useCallback((val) => {
    setSearchQuery((prev) => {
      if (prev !== val) {
        setCurrentPage(1);
        return val;
      }
      return prev;
    });
  }, []);

  // Handle Category Selection
  const handleSelectCategory = (cat) => {
    if (cat === selectedCategory) return;
    setSelectedCategory(cat);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('page');
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  // Handle Price Change
  const handlePriceChange = (val) => {
    setPriceRange((prev) => {
      if (prev !== val) {
        setCurrentPage(1);
        return val;
      }
      return prev;
    });
  };

  // Handle Sort Change
  const handleSortChange = (val) => {
    setSortBy((prev) => {
      if (prev !== val) {
        setCurrentPage(1);
        return val;
      }
      return prev;
    });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceRange(maxPriceLimit);
    setSortBy('featured');
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || priceRange < maxPriceLimit || sortBy !== 'featured';

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter (name, category, description)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.details && p.details.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Price filter
    result = result.filter(p => p.price <= priceRange);

    // Sorting
    switch (sortBy) {
      case 'price-low-high':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-high':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name-a-z':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        // maintain original catalog order
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  // Pagination calculation using PAGE_SIZE (10 products per page)
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  // Ensure currentPage does not exceed totalPages when filters reduce result count
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (newPage) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
    const newParams = new URLSearchParams(searchParams);
    if (validPage === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', String(validPage));
    }
    setSearchParams(newParams);

    // Smooth scroll to top of product grid on page change
    const gridEl = document.getElementById('products-grid');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Compact pagination helper: e.g. [1, '...', 4, 5, 6, '...', 30]
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    pages.push(1);
    if (left > 2) {
      pages.push('...');
    }
    for (let p = left; p <= right; p++) {
      pages.push(p);
    }
    if (right < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="py-6 sm:py-8 px-3 sm:px-8 max-w-7xl mx-auto bg-cream w-full max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="mb-6 sm:mb-8 space-y-2">
        <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
          {t('products.catalogTag')}
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold text-ink">
          {t('products.catalogTitle')}
        </h1>
        <p className="text-sm text-ink/75 max-w-2xl">
          {t('products.catalogSubtitle')}
        </p>
      </div>

      {/* Top Search Bar & Mobile Filter Trigger */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1">
          <SearchBar 
            value={searchQuery}
            placeholder={t('products.searchPlaceholder')}
            onChange={handleSearchChange}
          />
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden px-4 py-3.5 rounded-btn bg-cream-deep border border-olive/30 text-olive font-bold text-sm flex items-center gap-2 shadow-olive-sm shrink-0"
          aria-label={t('products.filtersBtn')}
        >
          <Filter className="w-4 h-4" />
          <span>{t('products.filtersBtn')}</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-olive" />
          )}
        </button>
      </div>

      {/* Category Pills Slider / Filter Strip */}
      <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => handleSelectCategory('All')}
            className={`px-4 py-2 rounded-btn text-xs font-bold transition-all shadow-xs ${
              selectedCategory === 'All'
                ? 'bg-olive text-cream shadow-olive-sm scale-102'
                : 'bg-cream-light text-ink hover:bg-olive-soft border border-olive/20'
            }`}
          >
            {t('common.allCategories')}
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`px-4 py-2 rounded-btn text-xs font-bold transition-all shadow-xs ${
                selectedCategory === cat
                  ? 'bg-olive text-cream shadow-olive-sm scale-102'
                  : 'bg-cream-light text-ink hover:bg-olive-soft border border-olive/20'
              }`}
            >
              {translateCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Layout: Filters + Product Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-4 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-lg text-ink/70">{t('products.loading')}</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center max-w-md mx-auto bg-cream-light p-8 rounded-card border border-olive/20">
          <p className="text-red-700 font-semibold mb-4">{error}</p>
          <button 
            onClick={loadCatalog}
            className="px-6 py-2.5 bg-olive text-cream rounded-btn font-bold text-xs shadow-olive-sm"
          >
            {t('products.retry')}
          </button>
        </div>
      ) : (
        <div id="products-grid" className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24 bg-cream-light p-6 rounded-card border border-olive/20 shadow-olive-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-olive/15">
              <span className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-olive" />
                {t('products.filtersTitle')}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-olive font-bold hover:underline"
                >
                  {t('products.clearAll')}
                </button>
              )}
            </div>

            <ProductFilters 
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              priceRange={priceRange}
              maxPriceLimit={maxPriceLimit}
              onChangePrice={handlePriceChange}
              sortBy={sortBy}
              onChangeSort={handleSortChange}
            />
          </aside>

          {/* Mobile Filter Drawer Overlay */}
          <AnimatePresence>
            {mobileFilterOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileFilterOpen(false)}
                  className="fixed inset-0 bg-ink/40 z-50 backdrop-blur-xs lg:hidden"
                />
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 right-0 w-full max-w-xs bg-cream-light z-50 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between lg:hidden"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-olive/15">
                      <span className="font-serif font-bold text-lg text-ink">
                        {t('products.filtersTitle')}
                      </span>
                      <button 
                        onClick={() => setMobileFilterOpen(false)}
                        className="p-1 rounded-btn hover:bg-olive-soft text-ink/70"
                        aria-label="Close filters"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <ProductFilters 
                      categories={categories}
                      selectedCategory={selectedCategory}
                      onSelectCategory={handleSelectCategory}
                      priceRange={priceRange}
                      maxPriceLimit={maxPriceLimit}
                      onChangePrice={handlePriceChange}
                      sortBy={sortBy}
                      onChangeSort={handleSortChange}
                    />
                  </div>

                  <div className="pt-6 border-t border-olive/15 mt-6 flex gap-3">
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="flex-1 py-3 rounded-btn border border-olive/30 text-olive font-bold text-xs"
                      >
                        {t('products.clearAll')}
                      </button>
                    )}
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="flex-1 py-3 rounded-btn bg-olive text-cream font-bold text-xs shadow-olive-sm"
                    >
                      {t('products.showResults', { count: filteredProducts.length })}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products Grid Area */}
          <main className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between text-xs text-ink/70">
              <span className="font-medium">
                {t('products.showingCount', {
                  count: paginatedProducts.length,
                  total: filteredProducts.length
                })}
              </span>
              {totalPages > 1 && (
                <span className="font-semibold text-olive">
                  {t('products.pageIndicator', { current: currentPage, total: totalPages })}
                </span>
              )}
            </div>

            {paginatedProducts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center bg-cream-light rounded-card border border-olive/20 p-8 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-olive-soft flex items-center justify-center mx-auto text-olive">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink">{t('products.noProductsFound')}</h3>
                <p className="text-xs text-ink/70 max-w-sm mx-auto">
                  {t('products.noProductsDesc')}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-btn bg-olive text-cream text-xs font-bold shadow-olive-sm hover:bg-olive-dark transition-all"
                >
                  {t('products.resetFilters')}
                </button>
              </motion.div>
            ) : (
              /* Amazon/Flipkart Responsive Grid with Fluid Layout Animation */
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                <AnimatePresence mode="popLayout">
                  {paginatedProducts.map((product, idx) => (
                    <ProductCard key={product.id} product={product} index={idx} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 sm:pt-8 border-t border-olive/15 flex items-center justify-between gap-2 sm:gap-4 w-full">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-btn border border-olive/30 text-xs font-bold text-olive hover:bg-olive-soft disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-colors shrink-0"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('products.previous')}</span>
                </button>

                {/* Mobile compact page indicator */}
                <div className="sm:hidden text-xs font-bold text-olive px-2 text-center">
                  {currentPage} / {totalPages}
                </div>

                {/* Desktop numbered page buttons */}
                <div className="hidden sm:flex items-center gap-1">
                  {getPageNumbers().map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1 text-ink/40 font-bold select-none">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={`page-${item}`}
                        type="button"
                        onClick={() => handlePageChange(item)}
                        className={`w-9 h-9 rounded-btn text-xs font-bold transition-all ${
                          currentPage === item
                            ? 'bg-olive text-cream shadow-olive-sm'
                            : 'bg-cream-light text-ink hover:bg-olive-soft'
                        }`}
                        aria-label={`Page ${item}`}
                        aria-current={currentPage === item ? 'page' : undefined}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-btn border border-olive/30 text-xs font-bold text-olive hover:bg-olive-soft disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-colors shrink-0"
                  aria-label="Next Page"
                >
                  <span className="hidden sm:inline">{t('products.next')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
