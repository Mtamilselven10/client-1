import React from 'react';
import FlipkartBannerMarquee from '../components/home/FlipkartBannerMarquee';
import FeaturedCategories from '../components/home/FeaturedCategories';
import RecommendedForYouSection from '../components/recommendations/RecommendedForYouSection';
import BuyAgainSection from '../components/buyAgain/BuyAgainSection';
import TrendingProductsSection from '../components/recommendations/TrendingProductsSection';
import SmartListBanner from '../components/shoppingList/SmartListBanner';
import RecentlyViewedSection from '../components/recentlyViewed/RecentlyViewedSection';
import StoreStoryPreview from '../components/home/StoreStoryPreview';
import CustomerReviews from '../components/home/CustomerReviews';
import StoreFooter from '../components/home/StoreFooter';

/**
 * PlayingCard:
 * A stacked card container that pins into place ("one page laa break aaganum")
 * while the subsequent card slides UP directly OVER it ("then next page athukku mela scroll aaganum like playing cards animation").
 */
function PlayingCard({
  children,
  zIndex = 10,
  topOffset = "top-[56px] sm:top-[64px]",
  bgColor = "bg-cream",
  showNotch = true,
  className = ""
}) {
  return (
    <section
      style={{ zIndex }}
      className={`sticky ${topOffset} w-full ${bgColor} rounded-t-[28px] sm:rounded-t-[38px] shadow-[0_-16px_36px_rgba(44,30,26,0.16)] border-t-2 border-olive/20 will-change-transform ${className}`}
    >
      {/* Playing Card Header Notch Handle */}
      {showNotch && (
        <div className="w-full flex items-center justify-center pt-2.5 pb-1 select-none pointer-events-none">
          <div className="w-12 h-1 bg-olive/25 rounded-full" />
        </div>
      )}

      {/* Card Body */}
      <div className="w-full">
        {children}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="bg-cream min-h-screen relative w-full overflow-visible">
      {/* Card 1: Flipkart-Style Banner Carousel & Infinite Marquee with User Videos & Photos */}
      <div className="sticky top-[56px] sm:top-[64px] z-10 w-full bg-cream">
        <FlipkartBannerMarquee />
      </div>

      {/* Playing Cards Stacking Deck */}
      <div className="relative w-full overflow-visible">
        {/* Card 2: Featured Categories */}
        <PlayingCard 
          zIndex={20} 
          topOffset="top-[56px] sm:top-[64px]" 
          bgColor="bg-cream"
        >
          <FeaturedCategories />
        </PlayingCard>

        {/* Card 3: Buy Again (Regularly Ordered Essentials) */}
        <PlayingCard 
          zIndex={30} 
          topOffset="top-[58px] sm:top-[68px]" 
          bgColor="bg-cream-light"
        >
          <BuyAgainSection />
        </PlayingCard>

        {/* Card 4: Personalized Product Recommendations */}
        <PlayingCard 
          zIndex={40} 
          topOffset="top-[60px] sm:top-[72px]" 
          bgColor="bg-cream"
        >
          <RecommendedForYouSection />
        </PlayingCard>

        {/* Card 5: Trending Grocery Staples */}
        <PlayingCard 
          zIndex={50} 
          topOffset="top-[62px] sm:top-[76px]" 
          bgColor="bg-cream-light"
        >
          <TrendingProductsSection />
        </PlayingCard>

        {/* Card 6: Smart Shopping List Planner Entry Banner */}
        <PlayingCard 
          zIndex={60} 
          topOffset="top-[64px] sm:top-[80px]" 
          bgColor="bg-cream"
        >
          <div className="py-2 sm:py-4">
            <SmartListBanner />
          </div>
        </PlayingCard>

        {/* Card 7: Recently Viewed Products (conditionally rendered in context) */}
        <PlayingCard 
          zIndex={70} 
          topOffset="top-[66px] sm:top-[84px]" 
          bgColor="bg-cream-light"
        >
          <RecentlyViewedSection />
        </PlayingCard>

        {/* Card 8: Heritage Store Story */}
        <PlayingCard 
          zIndex={80} 
          topOffset="top-[68px] sm:top-[88px]" 
          bgColor="bg-cream-deep"
        >
          <StoreStoryPreview />
        </PlayingCard>

        {/* Card 9: Customer Reviews & Testimonials */}
        <PlayingCard 
          zIndex={90} 
          topOffset="top-[70px] sm:top-[92px]" 
          bgColor="bg-cream"
        >
          <CustomerReviews />
        </PlayingCard>

        {/* Card 10: Store Footer & Guarantees */}
        <PlayingCard 
          zIndex={100} 
          topOffset="top-[72px] sm:top-[96px]" 
          bgColor="bg-olive-dark" 
          showNotch={false}
        >
          <StoreFooter />
        </PlayingCard>
      </div>
    </div>
  );
}

