import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import { ReviewsProvider } from './context/ReviewsContext';

import IntroVideo from './components/intro/IntroVideo';

import Sidebar from './components/layout/Sidebar';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import LanguageSwitch from './components/common/LanguageSwitch';
import FlyLayer from './animations/FlyLayer';

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
    <div className="min-h-screen bg-cream text-ink flex flex-col antialiased">
      <ScrollToTop />
      {/* Navigation Header and Slide-out Sidebar Drawer */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col relative">
          <AnimatePresence mode="sync">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
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
              {!introDone ? (
                <IntroVideo onComplete={handleIntroComplete} />
              ) : (
                <HashRouter>
                  <MainLayout />
                </HashRouter>
              )}
            </ReviewsProvider>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
