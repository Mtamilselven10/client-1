import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { ShoppingListProvider } from './context/ShoppingListContext';
import { OrderHistoryProvider } from './context/OrderHistoryContext';

import IntroVideo from './components/intro/IntroVideo';

import Sidebar from './components/layout/Sidebar';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import LanguageSwitch from './components/common/LanguageSwitch';
import FlyLayer from './animations/FlyLayer';
import CinematicLogo3DCanvas from './components/about/CinematicLogo3DCanvas';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import AboutUsPage from './pages/AboutUsPage';
import FAQsPage from './pages/FAQsPage';
import CustomerCarePage from './pages/CustomerCarePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ReviewsPage from './pages/ReviewsPage';
import ShoppingListPage from './pages/ShoppingListPage';
import OrdersPage from './pages/OrdersPage';
import NotFoundPage from './pages/NotFoundPage';

// Scroll restoration helper
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col antialiased w-full max-w-full relative">
      <ScrollToTop />

      {/* Global 3D Logo & Cart Canvas that smoothly rotates and travels when scrolling across ALL pages */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <CinematicLogo3DCanvas opacity={0.22} />
      </div>

      {/* Subtle ambient 2D logo watermark on bottom right, suitable for all backgrounds */}
      <div className="fixed -bottom-10 -right-10 pointer-events-none z-0 opacity-[0.06] select-none w-72 h-72 sm:w-96 sm:h-96" aria-hidden="true">
        <img 
          src={`${import.meta.env.BASE_URL}logo.png`} 
          alt="" 
          className="w-full h-full object-contain filter drop-shadow-sm" 
        />
      </div>

      {/* Navigation Header and Slide-out Sidebar Drawer */}
      <div className="relative z-40">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen w-full max-w-full">
        <main className="flex-1 flex flex-col relative w-full max-w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex-1 flex flex-col w-full"
            >
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/faqs" element={<FAQsPage />} />
                <Route path="/customer-care" element={<CustomerCarePage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/lists" element={<ShoppingListPage />} />
                <Route path="/shopping-list" element={<ShoppingListPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/buy-again" element={<OrdersPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Persistent Floating WhatsApp Icon on all pages */}
      <FloatingWhatsApp />

      {/* High-Performance 60fps Fly-to-Cart Portal Layer */}
      <FlyLayer />
    </div>
  );
}

export default function App() {
  const [introDone, setIntroDone] = useState(() => {
    try {
      const hasSeen = sessionStorage.getItem('gandhi_intro_seen');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return Boolean(hasSeen || prefersReduced);
    } catch {
      return false;
    }
  });

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem('gandhi_intro_seen', 'true');
    } catch {}
    setIntroDone(true);
  };

  return (
    <LanguageProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <ReviewsProvider>
              <RecentlyViewedProvider>
                <ShoppingListProvider>
                  <OrderHistoryProvider>
                    <HashRouter>
                      <MainLayout />
                    </HashRouter>
                    {!introDone && (
                      <IntroVideo onComplete={handleIntroComplete} />
                    )}
                  </OrderHistoryProvider>
                </ShoppingListProvider>
              </RecentlyViewedProvider>
            </ReviewsProvider>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
