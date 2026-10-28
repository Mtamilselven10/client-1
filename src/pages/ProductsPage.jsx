import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  AlertCircle, 
  RefreshCw, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';
import { loadProductsCatalog } from '../utils/excelParser';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import SearchBar from '../components/products/SearchBar';

const ITEMS_PER_PAGE = 16;

export default function ProductsPage() {
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

  // Sync category from URL param
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
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

  // Handle Category Selection
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    if (cat === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceRange(maxPriceLimit);
    setSortBy('featured');
    setCurrentPage(1);
    searchParams.delete('category');
    setSearchParams(searchParams);
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

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto bg-cream">
      {/* Header Banner */}
      <div className="mb-8 space-y-2">
        <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
          Provisions Catalog
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink">
          Handpicked Grocery Showcase
        </h1>
        <p className="text-sm text-ink/75 max-w-2xl">
          Parsed directly from our live inventory spreadsheet with real-time stock, pricing, and origin details.
        </p>
      </div>

      {/* Top Search Bar & Mobile Filter Trigger */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1">
          <SearchBar 
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
          />
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden px-4 py-3.5 rounded-btn bg-cream-deep border border-olive/30 text-olive font-bold text-sm flex items-center gap-2 shadow-olive-sm shrink-0"
          aria-label="Open filter settings"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-olive" />
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-olive/20 border-t-olive rounded-full animate-spin" />
          <p className="font-serif text-lg font-bold text-olive">Reading inventory from products.xlsx...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="my-12 p-8 rounded-card bg-cream-light border-2 border-olive/30 text-center max-w-xl mx-auto space-y-4 shadow-olive-md">
          <div className="w-12 h-12 rounded-full bg-olive-soft flex items-center justify-center mx-auto text-olive">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-ink">Catalog Synchronization Issue</h2>
          <p className="text-sm text-ink/80 leading-relaxed">{error}</p>
          <p className="text-xs text-ink/60">
            Please verify that <code className="bg-cream-deep px-1.5 py-0.5 rounded text-ink font-semibold">/public/data/products.xlsx</code> exists and contains product columns.
          </p>
          <button
            onClick={loadCatalog}
            className="px-6 py-2.5 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-sm hover:bg-olive-dark transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Loading Spreadsheet</span>
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-6">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              priceRange={priceRange}
              maxPriceLimit={maxPriceLimit}
              onChangePrice={(p) => { setPriceRange(p); setCurrentPage(1); }}
              sortBy={sortBy}
              onChangeSort={(s) => { setSortBy(s); setCurrentPage(1); }}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
              totalResults={filteredProducts.length}
            />
          </aside>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex bg-ink/40 backdrop-blur-xs">
              <div className="w-full max-w-sm h-full bg-cream-deep p-6 overflow-y-auto ml-auto flex flex-col justify-between border-l border-olive/30 shadow-olive-lg">
                <div className="flex items-center justify-between pb-4 border-b border-olive/20 mb-4">
                  <h3 className="font-serif text-lg font-bold text-olive">Filters & Sorting</h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 text-olive hover:bg-olive-soft rounded-btn"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  <ProductFilters
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSelectCategory}
                    priceRange={priceRange}
                    maxPriceLimit={maxPriceLimit}
                    onChangePrice={(p) => { setPriceRange(p); setCurrentPage(1); }}
                    sortBy={sortBy}
                    onChangeSort={(s) => { setSortBy(s); setCurrentPage(1); }}
                    onResetFilters={handleResetFilters}
                    hasActiveFilters={hasActiveFilters}
                    totalResults={filteredProducts.length}
                  />
                </div>

                <div className="pt-4 border-t border-olive/20 mt-4">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-3 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-sm"
                  >
                    Apply & View Results ({filteredProducts.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid Area (9 cols) */}
          <main className="lg:col-span-9 space-y-8">
            {/* Active Filter Chips Bar */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap text-xs bg-cream-deep/70 p-3 rounded-btn border border-olive/15">
                <span className="font-bold text-ink/70">Active Filters:</span>
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-olive text-cream font-medium">
                    Category: {selectedCategory}
                    <button onClick={() => handleSelectCategory('All')}>×</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-olive text-cream font-medium">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}>×</button>
                  </span>
                )}
                {priceRange < maxPriceLimit && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-olive text-cream font-medium">
                    Under ₹{priceRange}
                    <button onClick={() => setPriceRange(maxPriceLimit)}>×</button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-olive hover:underline ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Empty State when no matches */}
            {paginatedProducts.length === 0 ? (
              <div className="py-16 text-center rounded-card bg-cream-light border border-olive/20 p-8 space-y-4">
                <h3 className="font-serif text-2xl font-bold text-ink">No Matching Grocery Items</h3>
                <p className="text-sm text-ink/75 max-w-md mx-auto">
                  We could not find any products matching your current search or filter criteria. Try expanding your price range or clearing filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-sm hover:bg-olive-dark transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Amazon/Flipkart Responsive Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 border-t border-olive/15 flex items-center justify-between gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2.5 rounded-btn border border-olive/30 text-xs font-bold text-olive hover:bg-olive-soft disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Show current page, first, last, and immediate neighbors
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-9 h-9 rounded-btn text-xs font-bold transition-all ${
                            currentPage === page
                              ? 'bg-olive text-cream shadow-olive-sm'
                              : 'bg-cream-light text-ink hover:bg-olive-soft'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 || 
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="px-1 text-ink/40">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2.5 rounded-btn border border-olive/30 text-xs font-bold text-olive hover:bg-olive-soft disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 transition-colors"
                >
                  <span>Next</span>
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
