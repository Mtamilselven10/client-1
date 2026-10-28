import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollCanvasHero from '../components/home/ScrollCanvasHero';
import FeaturedCategories from '../components/home/FeaturedCategories';
import StoreStoryPreview from '../components/home/StoreStoryPreview';
import CustomerReviews from '../components/home/CustomerReviews';

export default function HomePage() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <div className="bg-cream min-h-screen">
      {/* Scroll-Driven Canvas Frame Scrubbing Hero with Breakpoint Gate */}
      <ScrollCanvasHero 
        isUnlocked={isUnlocked} 
        onComplete={() => setIsUnlocked(true)} 
        onRewind={() => setIsUnlocked(false)} 
      />

      {/* Website Below Hero - ONLY accessible and movable after animation completes 100% */}
      <AnimatePresence>
        {isUnlocked && (
          <motion.div 
            id="explore-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 bg-cream"
          >
            <FeaturedCategories />
            <StoreStoryPreview />
            <CustomerReviews />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
