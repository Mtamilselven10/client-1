import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Menu,
  X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitch from '../common/LanguageSwitch';

export default function Sidebar() {
  const location = useLocation();
  const { getItemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { t } = useLanguage();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartWiggle, setCartWiggle] = useState(false);
  const [cartBadgePop, setCartBadgePop] = useState(false);
  const [wishlistWiggle, setWishlistWiggle] = useState(false);
  const [wishlistBadgePop, setWishlistBadgePop] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  // Track scroll position for dynamic styling while staying fixed/parallel with scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cartCount = getItemCount();

  const navItems = [
    { label: t('nav.home') || 'Home', path: '/', icon: Home },
    { label: t('nav.products') || 'Products', path: '/products', icon: ShoppingBag },
    { label: t('nav.reviews') || 'Customer Ratings', path: '/reviews', icon: Star },
    { label: t('nav.about') || 'About Us', path: '/about', icon: Info },
    { label: t('nav.faqs') || 'FAQs', path: '/faqs', icon: HelpCircle },
    { label: t('nav.customerCare') || 'Customer Care', path: '/customer-care', icon: Headphones },
    { label: t('nav.privacyPolicy') || 'Privacy Policy', path: '/privacy-policy', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Fixed Header that stays strictly pinned and moves in parallel with page scroll */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${
          scrolled 
            ? 'bg-cream-deep/98 shadow-olive-md backdrop-blur-lg border-b border-olive/30 py-2 sm:py-2.5' 
            : 'bg-cream-deep/92 shadow-olive-xs backdrop-blur-md border-b border-olive/20 py-2.5 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-3">
          {/* Brand Name */}
          <NavLink 
            to="/" 
            className="text-olive font-serif text-xl sm:text-2xl font-extrabold tracking-tight hover:opacity-90 transition-opacity shrink-0 select-none flex items-center gap-2"
          >
            <span>{t('brand.name')}</span>
          </NavLink>

          {/* Desktop Top Navigation Bar (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-1.5 rounded-btn text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-olive text-cream shadow-olive-xs font-bold'
                      : 'text-olive hover:bg-olive/10 hover:text-olive-dark'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Actions: Language Switch, Wishlist, Cart + Mobile Menu Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Inline Language switch on tablet/desktop */}
            <div className="hidden sm:block">
              <LanguageSwitch isInline={true} />
            </div>

            {/* Quick Wishlist */}
            <NavLink
              to="/wishlist"
              data-nav-target="wishlist"
              className="relative p-2 text-olive hover:bg-olive/10 active:bg-olive/20 rounded-full transition-colors"
              aria-label={t('nav.wishlist') || 'Wishlist'}
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
              className="relative p-2 text-olive hover:bg-olive/10 active:bg-olive/20 rounded-full transition-colors"
              aria-label={t('nav.cart') || 'Cart'}
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

            {/* Mobile Menu Icon Button (Visible on screens < lg) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-olive hover:bg-olive/10 active:bg-olive/20 rounded-btn transition-colors flex items-center justify-center cursor-pointer ml-0.5 focus-visible:ring-2 focus-visible:ring-olive"
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="w-6 h-6 text-olive" />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer element preventing initial content from hiding under the fixed header */}
      <div className="h-[56px] sm:h-[64px]" aria-hidden="true" />

      {/* Mobile View: Right Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            key="mobile-drawer-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop Overlay */}
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-xs cursor-pointer"
              aria-hidden="true"
            />

            {/* Right-Side Drawer Panel */}
            <motion.aside
              key="mobile-drawer-aside"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 right-0 bottom-0 w-[84vw] max-w-sm bg-cream-light border-l border-olive/25 shadow-2xl flex flex-col overflow-hidden z-10"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Drawer"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-olive/15 flex items-center justify-between bg-cream-deep/80">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-olive/80">
                    Menu
                  </span>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-olive">
                    {t('brand.name')}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-olive hover:bg-olive/15 active:scale-95 rounded-full transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-olive"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Options List */}
              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/' && location.pathname.startsWith(item.path));

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-btn text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-olive text-cream font-bold shadow-olive-xs'
                          : 'text-ink/80 hover:bg-olive/10 hover:text-olive'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cream' : 'text-olive'}`} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}

                {/* Quick Store Links */}
                <div className="pt-3 mt-3 border-t border-olive/15 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-olive/70 px-3.5 block mb-1">
                    Store Shortcuts
                  </span>

                  <NavLink
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-btn text-sm font-semibold text-ink/80 hover:bg-olive/10 hover:text-olive transition-all"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-olive shrink-0" />
                      <span>{t('nav.wishlist') || 'Wishlist'}</span>
                    </span>
                    {wishlistCount > 0 && (
                      <span className="bg-olive text-cream text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </NavLink>

                  <NavLink
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-btn text-sm font-semibold text-ink/80 hover:bg-olive/10 hover:text-olive transition-all"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingCart className="w-4 h-4 text-olive shrink-0" />
                      <span>{t('nav.cart') || 'Cart'}</span>
                    </span>
                    {cartCount > 0 && (
                      <span className="bg-olive text-cream text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </NavLink>
                </div>
              </div>

              {/* Drawer Footer with Language Switcher */}
              <div className="p-4 border-t border-olive/15 bg-cream-deep/60 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-ink/75">Language / மொழி:</span>
                <LanguageSwitch isInline={true} />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
