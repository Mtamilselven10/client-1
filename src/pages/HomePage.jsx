import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollCanvasHero from '../components/home/ScrollCanvasHero';
import FeaturedCategories from '../components/home/FeaturedCategories';
import StoreStoryPreview from '../components/home/StoreStoryPreview';
import CustomerReviews from '../components/home/CustomerReviews';

export default function HomePage() {
  return (
    <div className="bg-cream min-h-screen">
      {/* Scroll-Driven Canvas Frame Scrubbing Hero */}
      <ScrollCanvasHero />

      {/* Website Content Below Hero */}
      <div id="explore-section" className="relative z-20 bg-cream">
        <FeaturedCategories />
        <StoreStoryPreview />
        <CustomerReviews />
      </div>
    </div>
  );
}
