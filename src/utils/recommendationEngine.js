/**
 * SMART PRODUCT RECOMMENDATION ENGINE FOR GANDHI SHOP
 * Inspired by Flipkart e-commerce discovery patterns.
 * 
 * Features:
 * 1. Often Paired Together (Rule-based complementary grocery bundles)
 * 2. Similar Products (Category, brand, and attribute relevance)
 * 3. Recommended For You (Personalized from browsing, wishlist, and cart signals)
 * 4. Trending Products (High ratings and popularity)
 */

// Complementary grocery category pairings mapping
const COMPLEMENTARY_PAIRS = {
  'Rice': ['Other Grocery Essentials', 'Cooking Oil', 'Aachi Masala & Podi', 'Sakthi & Other Cooking Masalas'],
  'Other Grocery Essentials': ['Rice', 'Cooking Oil', 'Aachi Masala & Podi'],
  'Tea & Coffee': ['Sugar & Sweeteners', 'Other Grocery Essentials'],
  'Sugar & Sweeteners': ['Tea & Coffee', 'Other Grocery Essentials'],
  'Aachi Masala & Podi': ['Rice', 'Cooking Oil', 'Other Grocery Essentials'],
  'Sakthi & Other Cooking Masalas': ['Rice', 'Cooking Oil', 'Other Grocery Essentials'],
  'Cooking Oil': ['Rice', 'Aachi Masala & Podi', 'Other Grocery Essentials'],
  'Bath Soap': ['Personal Care & Shampoo', 'Laundry Soap Bar', 'Cleaning Products'],
  'Personal Care & Shampoo': ['Bath Soap', 'Cleaning Products'],
  'Dishwash': ['Cleaning Products', 'Laundry Detergent'],
  'Laundry Detergent': ['Laundry Soap Bar', 'Dishwash', 'Cleaning Products'],
  'Laundry Soap Bar': ['Laundry Detergent', 'Dishwash', 'Cleaning Products'],
  'Cleaning Products': ['Dishwash', 'Laundry Detergent', 'Bath Soap']
};

// Keyword-based pairing rules for specific staples
const KEYWORD_PAIRS = [
  { match: ['tea', 'coffee'], suggest: ['sugar', 'sweetener', 'milk'] },
  { match: ['sugar'], suggest: ['tea', 'coffee', 'cardamom'] },
  { match: ['rice'], suggest: ['dal', 'sambar', 'oil', 'ghee'] },
  { match: ['dal', 'dhal', 'toor', 'urad', 'moong'], suggest: ['rice', 'chilli', 'turmeric', 'oil'] },
  { match: ['chilli', 'turmeric', 'coriander', 'sambar', 'masala'], suggest: ['oil', 'rice', 'dal'] },
  { match: ['oil', 'ghee'], suggest: ['mustard', 'rice', 'chilli', 'sambar'] },
  { match: ['soap'], suggest: ['shampoo', 'toothpaste', 'paste'] },
  { match: ['shampoo'], suggest: ['soap', 'conditioner', 'oil'] },
  { match: ['dishwash'], suggest: ['scrubber', 'detergent', 'bar'] },
  { match: ['detergent', 'wash'], suggest: ['bar', 'soap', 'rin'] }
];

/**
 * 1. OFTEN PAIRED TOGETHER (Complementary Grocery Bundles)
 * Returns 1 or 2 complementary in-stock items to pair with the given product.
 */
export function getOftenPairedProducts(currentProduct, catalog = [], maxItems = 2) {
  if (!currentProduct || !Array.isArray(catalog) || catalog.length === 0) return [];

  const currentId = String(currentProduct.id).toLowerCase();
  const currentName = String(currentProduct.name || '').toLowerCase();
  const currentCategory = currentProduct.category || '';

  // Candidates that are in stock and not the current product
  const availableCandidates = catalog.filter(
    p => p && String(p.id).toLowerCase() !== currentId && p.inStock !== false
  );

  if (availableCandidates.length === 0) return [];

  // Step A: Check keyword-based pairing rules
  const matchedKeywords = KEYWORD_PAIRS.find(rule => 
    rule.match.some(m => currentName.includes(m))
  );

  let primaryPairings = [];
  if (matchedKeywords) {
    primaryPairings = availableCandidates.filter(p => {
      const pName = String(p.name || '').toLowerCase();
      return matchedKeywords.suggest.some(s => pName.includes(s));
    });
  }

  // Step B: Check complementary category pairings
  const complementaryCategories = COMPLEMENTARY_PAIRS[currentCategory] || [];
  let categoryPairings = availableCandidates.filter(p => 
    complementaryCategories.includes(p.category) && !primaryPairings.some(pair => pair.id === p.id)
  );

  // Combine candidates, prioritizing high customer rating
  const combined = [...primaryPairings, ...categoryPairings].sort((a, b) => {
    return (b.rating || 4.5) - (a.rating || 4.5);
  });

  // If still not enough, fallback to popular staples from different category
  if (combined.length < maxItems) {
    const fallbacks = availableCandidates
      .filter(p => p.category !== currentCategory && !combined.some(c => c.id === p.id))
      .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    combined.push(...fallbacks);
  }

  return combined.slice(0, maxItems);
}

/**
 * 2. SIMILAR PRODUCTS
 * Returns products from the same category or brand, with similar price range, excluding current.
 */
export function getSimilarProducts(currentProduct, catalog = [], maxItems = 10) {
  if (!currentProduct || !Array.isArray(catalog) || catalog.length === 0) return [];

  const currentId = String(currentProduct.id).toLowerCase();
  const currentCategory = currentProduct.category || '';
  const currentPrice = currentProduct.price || 0;

  // Words in name for brand/keyword matching
  const nameWords = String(currentProduct.name || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3);

  const candidates = catalog.filter(p => {
    if (!p || String(p.id).toLowerCase() === currentId) return false;
    if (p.inStock === false) return false;
    return true;
  });

  // Score candidate items for similarity
  const scored = candidates.map(p => {
    let score = 0;

    // Exact same category gets high weight
    if (p.category === currentCategory) {
      score += 50;
    }

    // Name keyword match (e.g. brand "Aachi", "Sakthi", "Basmati")
    const pName = String(p.name || '').toLowerCase();
    for (const word of nameWords) {
      if (pName.includes(word)) {
        score += 25;
      }
    }

    // Similar price bracket (+/- 60%)
    if (currentPrice > 0 && p.price > 0) {
      const priceDiffRatio = Math.abs(p.price - currentPrice) / currentPrice;
      if (priceDiffRatio <= 0.3) score += 15;
      else if (priceDiffRatio <= 0.6) score += 8;
    }

    // High customer rating boost
    score += (p.rating || 4.0) * 2;

    return { product: p, score };
  });

  return scored
    .filter(item => item.score > 20) // Only genuinely similar items
    .sort((a, b) => b.score - a.score)
    .map(item => item.product)
    .slice(0, maxItems);
}

/**
 * 3. RECOMMENDED FOR YOU (Personalized from browsing, wishlist, and cart signals)
 */
export function getPersonalizedRecommendations({
  catalog = [],
  recentlyViewedIds = [],
  wishlistIds = [],
  cartIds = [],
  maxItems = 10
}) {
  if (!Array.isArray(catalog) || catalog.length === 0) return [];

  const activeIdsSet = new Set(
    [...recentlyViewedIds, ...wishlistIds, ...cartIds].map(id => String(id).toLowerCase())
  );

  // If user has zero activity, return diverse top-rated catalog items
  if (activeIdsSet.size === 0) {
    return getTrendingProducts(catalog, maxItems);
  }

  // Count category affinity from user activity
  const categoryWeights = {};
  catalog.forEach(p => {
    const idKey = String(p.id).toLowerCase();
    if (activeIdsSet.has(idKey) && p.category) {
      categoryWeights[p.category] = (categoryWeights[p.category] || 0) + 1;
    }
  });

  const preferredCategories = Object.keys(categoryWeights).sort(
    (a, b) => categoryWeights[b] - categoryWeights[a]
  );

  // Score unviewed/unadded products based on category affinity
  const scored = catalog
    .filter(p => p && p.inStock !== false && !activeIdsSet.has(String(p.id).toLowerCase()))
    .map(p => {
      const weight = categoryWeights[p.category] || 0;
      const score = weight * 20 + (p.rating || 4.5) * 5 + Math.min(10, (p.reviewsCount || 0) / 20);
      return { product: p, score };
    });

  const recommended = scored
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);

  // If not enough items, pad with top trending products
  if (recommended.length < maxItems) {
    const trending = getTrendingProducts(catalog, maxItems);
    for (const t of trending) {
      if (!recommended.some(r => r.id === t.id)) {
        recommended.push(t);
        if (recommended.length >= maxItems) break;
      }
    }
  }

  return recommended.slice(0, maxItems);
}

/**
 * 4. TRENDING PRODUCTS
 * Highlights top-rated provisions with high customer satisfaction across diverse categories.
 */
export function getTrendingProducts(catalog = [], maxItems = 10) {
  if (!Array.isArray(catalog) || catalog.length === 0) return [];

  const inStock = catalog.filter(p => p && p.inStock !== false);

  // Ensure category diversity: pick highest rated from distinct categories first
  const byCategory = new Map();
  inStock.forEach(p => {
    const cat = p.category || 'General';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(p);
  });

  const trending = [];
  const categories = Array.from(byCategory.keys());

  // Round-robin top item from each category
  let round = 0;
  while (trending.length < maxItems && round < 5) {
    for (const cat of categories) {
      const items = byCategory.get(cat);
      if (items && items[round]) {
        trending.push(items[round]);
        if (trending.length >= maxItems) break;
      }
    }
    round++;
  }

  return trending.slice(0, maxItems);
}
