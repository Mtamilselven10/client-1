import React, { useState } from 'react';
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
  Menu, 
  X,
  Sprout
} from 'lucide-react';
import { SHOP_NAME, SHOP_TAGLINE } from '../../config';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { getItemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const cartCount = getItemCount();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Products', path: '/products', icon: ShoppingBag },
    { label: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlistCount },
    { label: 'Cart', path: '/cart', icon: ShoppingCart, badge: cartCount },
    { label: 'About Us', path: '/about', icon: Info },
    { label: 'FAQs', path: '/faqs', icon: HelpCircle },
    { label: 'Customer Care', path: '/customer-care', icon: Headphones },
    { label: 'Privacy & Policy', path: '/privacy-policy', icon: ShieldCheck },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3.5 bg-cream-deep border-b border-olive/20 shadow-olive-sm">
        <NavLink to="/" className="flex items-center gap-2 text-olive font-serif text-xl font-bold tracking-tight">
          <Sprout className="w-6 h-6 text-olive" />
          <span>{SHOP_NAME}</span>
        </NavLink>
        <div className="flex items-center gap-2">
          {/* Quick Cart on Mobile Header */}
          <NavLink
            to="/cart"
            className="relative p-2 text-olive hover:bg-olive/10 rounded-full transition-colors"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-olive text-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </NavLink>

          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-olive hover:bg-olive/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-olive"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={closeMobile}
          className="lg:hidden fixed inset-0 z-40 bg-ink/40 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop Persistent + Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-cream-deep border-r border-olive/20 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-olive/15 flex items-center justify-between">
          <NavLink 
            to="/" 
            onClick={closeMobile}
            className="flex flex-col group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-btn bg-olive flex items-center justify-center text-cream shadow-olive-sm">
                <Sprout className="w-5 h-5" />
              </div>
              <h1 className="font-serif text-2xl font-extrabold text-olive tracking-tight group-hover:text-olive-dark transition-colors">
                {SHOP_NAME}
              </h1>
            </div>
            <p className="mt-1 text-xs text-ink/75 font-medium tracking-wide">
              {SHOP_TAGLINE}
            </p>
          </NavLink>

          {/* Mobile Close Button */}
          <button
            onClick={closeMobile}
            className="lg:hidden p-1.5 text-olive hover:bg-olive/10 rounded-btn transition-colors focus-visible:ring-2 focus-visible:ring-olive"
            aria-label="Close navigation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 8 Navigation Buttons */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className={`relative flex items-center justify-between px-4 py-3 rounded-btn text-sm font-semibold transition-colors duration-200 group ${
                  isActive
                    ? 'text-cream'
                    : 'text-olive hover:bg-olive/10 hover:text-olive-dark'
                }`}
              >
                {/* Smooth sliding pill active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-olive rounded-btn shadow-olive-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-cream' : 'text-olive'
                  }`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>

                {/* Live Count Badge (olive badge, cream number) with pop spring */}
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    key={item.badge}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className={`relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full transition-colors ${
                      isActive
                        ? 'bg-cream text-olive'
                        : 'bg-olive text-cream'
                    }`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info box in sidebar */}
        <div className="p-4 m-3 rounded-card bg-cream-light border border-olive/15 text-xs text-ink/80 space-y-2">
          <div className="flex items-center gap-2 text-olive font-semibold">
            <span className="w-2 h-2 rounded-full bg-olive animate-pulse" />
            <span>Store Open Today</span>
          </div>
          <p className="leading-relaxed">
            Fresh harvest batches updated daily. 100% natural and unadulterated.
          </p>
          <div className="text-[11px] text-ink/60 pt-1 border-t border-olive/10">
            © 2026 {SHOP_NAME}.
          </div>
        </div>
      </aside>
    </>
  );
}
