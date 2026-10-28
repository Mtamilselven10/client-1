import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  ShoppingBag, 
  Heart, 
  ShoppingCart, 
  Info, 
  HelpCircle, 
  Headphones, 
  ShieldCheck,
  Star, 
  X
} from 'lucide-react';
import { SHOP_NAME, SHOP_TAGLINE } from '../../config';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitch from '../common/LanguageSwitch';

const CATEGORIES_LIST = [
  "Aachi Masala & Podi",
  "Tea & Coffee",
  "Sugar & Sweeteners",
  "Cooking Oil",
  "Dishwash",
  "Laundry Detergent",
  "Bath Soap",
  "Laundry Soap Bar",
  "Sakthi & Other Cooking Masalas",
  "Rice",
  "Cleaning Products",
  "Personal Care & Shampoo",
  "Other Grocery Essentials",
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { t, language, translateCategory } = useLanguage();

  const [cartWiggle, setCartWiggle] = useState(false);
  const [cartBadgePop, setCartBadgePop] = useState(false);
  const [wishlistWiggle, setWishlistWiggle] = useState(false);
  const [wishlistBadgePop, setWishlistBadgePop] = useState(false);

  useEffect(() => {
    const handleArrival = (e) => {
      const targetType = e.detail?.targetType;
      if (targetType === 'wishlist') {
        setWishlistWiggle(true);
        setWishlistBadgePop(true);
        setTimeout(() => setWishlistWiggle(false), 500);
        setTimeout(() => setWishlistBadgePop(false), 400);
      } else {
        setCartWiggle(true);
        setCartBadgePop(true);
        setTimeout(() => setCartWiggle(false), 500);
        setTimeout(() => setCartBadgePop(false), 400);
      }
    };
    window.addEventListener('nav-target-arrived', handleArrival);
    return () => window.removeEventListener('nav-target-arrived', handleArrival);
  }, []);

  const cartCount = getItemCount();
  const logoUrl = `${import.meta.env.BASE_URL}logo.png`;
  const menuIconUrl = `${import.meta.env.BASE_URL}icons/menu-icon.png`;
  const chevronIconUrl = `${import.meta.env.BASE_URL}icons/chevron-dropdown.png`;

  // Parse current category from URL
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category');

  // Auto-expand categories if user is on the products page
  useEffect(() => {
    if (location.pathname.startsWith('/products')) {
      setCategoriesOpen(true);
    }
  }, [location.pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeSidebar = () => setIsOpen(false);

  const navItems = [
    { label: t('nav.home'), path: '/', icon: Home },
    { label: t('nav.products'), path: '/products', icon: ShoppingBag, isProducts: true },
    { label: t('nav.wishlist'), path: '/wishlist', icon: Heart, badge: wishlistCount },
    { label: t('nav.cart'), path: '/cart', icon: ShoppingCart, badge: cartCount },
    { label: t('nav.about'), path: '/about', icon: Info },
    { label: t('nav.faqs'), path: '/faqs', icon: HelpCircle },
    { label: t('nav.customerCare'), path: '/customer-care', icon: Headphones },
    { label: t('nav.privacyPolicy'), path: '/privacy-policy', icon: ShieldCheck },
    { label: t('nav.reviews') || 'Customer Ratings', path: '/reviews', icon: Star },
  ];

  return (
    <>
      {/* Universal Top Header (Desktop & Mobile) - Menu icon triggers sidebar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-cream-deep/95 backdrop-blur-md border-b border-olive/20 shadow-olive-sm">
        {/* Left: Menu Trigger Button + Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            data-testid="sidebar-menu-btn"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-btn bg-cream-light hover:bg-cream border border-olive/30 text-olive shadow-olive-xs hover:shadow-olive-sm transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-olive cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <img
              src={menuIconUrl}
              alt="Menu"
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold text-xs uppercase tracking-wider text-olive group-hover:text-olive-dark">
              {t('nav.menu') || 'MENU'}
            </span>
          </button>

          <NavLink 
            to="/" 
            className="flex items-center gap-2 text-olive font-serif text-lg sm:text-xl font-bold tracking-tight hover:opacity-90 transition-opacity"
          >
            <img
              src={logoUrl}
              alt={t('brand.name')}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
            />
            <span className="hidden xs:inline">{t('brand.name')}</span>
          </NavLink>
        </div>

        {/* Right: Language Switch, Wishlist, Quick Cart */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Bilingual Switch (Inline) */}
          <LanguageSwitch isInline={true} />

          {/* Quick Wishlist */}
          <NavLink
            to="/wishlist"
            data-nav-target="wishlist"
            data-nav-target-mobile="mobile-wishlist"
            className="relative p-2 text-olive hover:bg-olive/10 rounded-full transition-colors"
            aria-label={t('nav.wishlist')}
          >
            <motion.div
              animate={wishlistWiggle ? { rotate: [0, -14, 14, -8, 8, 0], scale: [1, 1.25, 1] } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.45 }}
            >
              <Heart className="w-5 h-5" />
            </motion.div>
            {wishlistCount > 0 && (
              <motion.span
                animate={wishlistBadgePop ? { scale: [1, 1.45, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-1 -right-1 bg-olive text-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
              >
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </motion.span>
            )}
          </NavLink>

          {/* Quick Cart */}
          <NavLink
            to="/cart"
            data-nav-target="cart"
            data-nav-target-mobile="mobile-cart"
            className="relative p-2 text-olive hover:bg-olive/10 rounded-full transition-colors"
            aria-label={t('nav.cart')}
          >
            <motion.div
              animate={cartWiggle ? { rotate: [0, -14, 14, -8, 8, 0], scale: [1, 1.25, 1] } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.45 }}
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.div>
            {cartCount > 0 && (
              <motion.span
                animate={cartBadgePop ? { scale: [1, 1.45, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-1 -right-1 bg-olive text-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </motion.span>
            )}
          </NavLink>
        </div>
      </header>

      {/* Backdrop Overlay (Click outside to close) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer (Only opens when Menu icon is clicked - no auto-open) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-cream-deep border-r border-olive/20 flex flex-col shadow-olive-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation Sidebar"
      >
        {/* Drawer Brand Header */}
        <div className="p-5 border-b border-olive/15 flex items-center justify-between bg-cream-light/60">
          <NavLink 
            to="/" 
            onClick={closeSidebar}
            className="flex flex-col group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-cream border border-olive/20 p-1 flex items-center justify-center shadow-olive-xs shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={logoUrl}
                  alt={t('brand.name')}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="font-serif text-xl font-extrabold text-olive tracking-tight group-hover:text-olive-dark transition-colors leading-tight">
                  {t('brand.name')}
                </h1>
                <p className="text-[11px] text-ink/70 font-medium tracking-wide">
                  {t('brand.tagline')}
                </p>
              </div>
            </div>
          </NavLink>

          {/* Close Button */}
          <button
            type="button"
            onClick={closeSidebar}
            data-testid="sidebar-close-btn"
            className="p-1.5 text-olive hover:bg-olive/10 rounded-btn transition-colors focus-visible:ring-2 focus-visible:ring-olive cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items with Categories Dropdown */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isBaseActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            const isCart = item.path === '/cart';
            const isWishlist = item.path === '/wishlist';
            const wiggle = isCart ? cartWiggle : isWishlist ? wishlistWiggle : false;
            const badgePop = isCart ? cartBadgePop : isWishlist ? wishlistBadgePop : false;
            const navTarget = isCart ? 'drawer-cart' : isWishlist ? 'drawer-wishlist' : undefined;

            // Regular Nav Item
            if (!item.isProducts) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  data-nav-target={navTarget}
                  onClick={closeSidebar}
                  className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-btn text-sm font-semibold transition-colors duration-200 group ${
                    isBaseActive
                      ? 'bg-olive text-cream shadow-olive-xs'
                      : 'text-olive hover:bg-olive/10 hover:text-olive-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={wiggle ? { rotate: [0, -14, 14, -8, 8, 0], scale: [1, 1.25, 1] } : { rotate: 0, scale: 1 }}
                      transition={{ duration: 0.45 }}
                    >
                      <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                        isBaseActive ? 'text-cream' : 'text-olive'
                      }`} />
                    </motion.div>
                    <span className="tracking-wide">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <motion.span
                      animate={badgePop ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full transition-colors ${
                        isBaseActive ? 'bg-cream text-olive' : 'bg-olive text-cream'
                      }`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.span>
                  )}
                </NavLink>
              );
            }

            // Products Nav Item WITH Categories Dropdown
            return (
              <div key={item.path} className="space-y-1">
                <div 
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-btn text-sm font-semibold transition-colors duration-200 group ${
                    isBaseActive
                      ? 'bg-olive text-cream shadow-olive-xs'
                      : 'text-olive hover:bg-olive/10 hover:text-olive-dark'
                  }`}
                >
                  <NavLink
                    to="/products"
                    onClick={() => {
                      setCategoriesOpen(true);
                      closeSidebar();
                    }}
                    className="flex-1 flex items-center gap-3"
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isBaseActive ? 'text-cream' : 'text-olive'
                    }`} />
                    <span className="tracking-wide">{item.label}</span>
                  </NavLink>

                  {/* Dropdown Toggle using User's Chevron Icon */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCategoriesOpen(prev => !prev);
                    }}
                    data-testid="categories-dropdown-toggle"
                    className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                      isBaseActive ? 'hover:bg-cream/20 text-cream' : 'hover:bg-olive/20 text-olive'
                    }`}
                    title={categoriesOpen ? "Hide categories" : "Show categories"}
                    aria-label="Toggle Categories Dropdown"
                    aria-expanded={categoriesOpen}
                  >
                    <img
                      src={chevronIconUrl}
                      alt="Toggle Categories"
                      style={{ filter: isBaseActive ? 'invert(1)' : 'brightness(0) invert(26%) sepia(18%) saturate(1487%) hue-rotate(44deg)' }}
                      className={`w-3.5 h-3.5 object-contain transition-transform duration-200 ${
                        categoriesOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Categories Dropdown Panel */}
                <AnimatePresence initial={false}>
                  {categoriesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden pl-3 pr-1 py-1 space-y-1 border-l-2 border-olive/20 ml-3"
                    >
                      {/* All Products Option */}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/products');
                          closeSidebar();
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-btn text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          location.pathname === '/products' && !currentCategory
                            ? 'bg-olive text-cream shadow-xs'
                            : 'text-olive/85 hover:bg-olive/10 hover:text-olive-dark'
                        }`}
                      >
                        <span>{t('nav.allProducts') || 'All Products'}</span>
                        <span className="text-[10px] font-mono opacity-70">120</span>
                      </button>

                      {/* 13 Categories */}
                      {CATEGORIES_LIST.map((category) => {
                        const isCatActive = location.pathname === '/products' && currentCategory === category;
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              navigate(`/products?category=${encodeURIComponent(category)}`);
                              closeSidebar();
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-btn text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                              isCatActive
                                ? 'bg-olive text-cream font-bold shadow-xs'
                                : 'text-olive/80 hover:bg-olive/10 hover:text-olive-dark'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isCatActive ? 'bg-cream' : 'bg-olive/40'
                            }`} />
                            <span className="truncate">{translateCategory(category)}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
