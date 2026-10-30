import React from 'react';
import { motion } from 'framer-motion';
import FlipkartBannerMarquee from '../components/home/FlipkartBannerMarquee';
import FeaturedCategories from '../components/home/FeaturedCategories';
import StoreStoryPreview from '../components/home/StoreStoryPreview';
import CustomerReviews from '../components/home/CustomerReviews';

export default function HomePage() {
  return (
    <div className="bg-cream min-h-screen">
      {/* Flipkart-Style Banner Carousel & Infinite Marquee with User Videos & Photos */}
      <FlipkartBannerMarquee />

      {/* Website Content with Smooth Scroll-Reveal Animations */}
      <div id="explore-section" className="relative z-20 bg-cream space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <FeaturedCategories />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <StoreStoryPreview />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <CustomerReviews />
        </motion.div>
      </div>
    </div>
  );
}
