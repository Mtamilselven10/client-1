import React from 'react';
import ScrollCanvasHero from '../components/home/ScrollCanvasHero';
import FeaturedCategories from '../components/home/FeaturedCategories';
import StoreStoryPreview from '../components/home/StoreStoryPreview';
import CustomerReviews from '../components/home/CustomerReviews';

export default function HomePage() {
  return (
    <div className="bg-cream">
      {/* Scroll-Driven Canvas Frame Scrubbing Hero */}
      <ScrollCanvasHero />

      {/* Unlocked sections below hero */}
      <div id="explore-section" className="relative z-20 bg-cream">
        <FeaturedCategories />
        <StoreStoryPreview />
        <CustomerReviews />
      </div>
    </div>
  );
}
