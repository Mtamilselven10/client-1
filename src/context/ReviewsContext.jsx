import React, { createContext, useContext, useState, useEffect } from 'react';
import { SEED_REVIEWS } from '../data/seedReviews';

const STORAGE_KEY = 'gandhi_shop_customer_reviews';

const ReviewsContext = createContext();

export function ReviewsProvider({ children }) {
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read reviews from localStorage:', e);
    }
    return SEED_REVIEWS;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.warn('Could not save reviews to localStorage:', e);
    }
  }, [reviews]);

  /**
   * Add a new review submitted by a customer
   */
  const addReview = (reviewData) => {
    const delivery = Number(reviewData.deliveryRating) || 5;
    const quality = Number(reviewData.qualityRating) || 5;
    const service = Number(reviewData.serviceRating) || 5;
    const website = Number(reviewData.websiteRating) || 3;

    // Calculate composite overall rating out of 5.0
    // Quality (35%), Delivery (30%), Customer Service (25%), Website Friendliness (10%)
    const websiteNormalized = (website / 3) * 5;
    const overall = (quality * 0.35) + (delivery * 0.30) + (service * 0.25) + (websiteNormalized * 0.10);
    const overallRating = Math.round(overall * 10) / 10;

    const newReview = {
      id: `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerName: reviewData.customerName.trim(),
      customerContact: reviewData.customerContact.trim(),
      productName: reviewData.productName.trim(),
      productId: reviewData.productId || null,
      deliveryRating: delivery,
      qualityRating: quality,
      serviceRating: service,
      websiteRating: website,
      overallRating,
      comments: (reviewData.comments || '').trim(),
      date: new Date().toISOString(),
      verified: true
    };

    setReviews(prev => [newReview, ...prev]);
    return newReview;
  };

  /**
   * Compute the overall average rating and review count for any product
   * based on customer reviews submitted on the Reviews page.
   */
  const getProductReviewStats = (productId, productName, fallbackRating = 4.8, fallbackCount = 0) => {
    const matching = reviews.filter(r => {
      if (productId && r.productId === productId) return true;
      if (productName && r.productName && 
          r.productName.toLowerCase().trim() === productName.toLowerCase().trim()) {
        return true;
      }
      return false;
    });

    if (matching.length === 0) {
      return {
        rating: fallbackRating,
        reviewsCount: fallbackCount,
        hasCustomerReviews: false,
        reviews: []
      };
    }

    const sumOverall = matching.reduce((acc, r) => acc + (r.overallRating || r.qualityRating), 0);
    const avgOverall = Math.round((sumOverall / matching.length) * 10) / 10;

    return {
      rating: avgOverall,
      reviewsCount: fallbackCount > 0 ? (fallbackCount + matching.length) : matching.length,
      customerReviewsCount: matching.length,
      hasCustomerReviews: true,
      reviews: matching
    };
  };

  /**
   * Aggregate store statistics across all customer reviews
   */
  const getStoreStats = () => {
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        avgOverall: 5.0,
        avgDelivery: 5.0,
        avgQuality: 5.0,
        avgService: 5.0,
        avgWebsite: 3.0
      };
    }

    const total = reviews.length;
    const avgDelivery = Math.round((reviews.reduce((acc, r) => acc + r.deliveryRating, 0) / total) * 10) / 10;
    const avgQuality = Math.round((reviews.reduce((acc, r) => acc + r.qualityRating, 0) / total) * 10) / 10;
    const avgService = Math.round((reviews.reduce((acc, r) => acc + r.serviceRating, 0) / total) * 10) / 10;
    const avgWebsite = Math.round((reviews.reduce((acc, r) => acc + r.websiteRating, 0) / total) * 10) / 10;
    const avgOverall = Math.round((reviews.reduce((acc, r) => acc + r.overallRating, 0) / total) * 10) / 10;

    return {
      totalReviews: total,
      avgOverall,
      avgDelivery,
      avgQuality,
      avgService,
      avgWebsite
    };
  };

  return (
    <ReviewsContext.Provider value={{
      reviews,
      addReview,
      getProductReviewStats,
      getStoreStats
    }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
}
