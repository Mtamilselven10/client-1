/**
 * Utility functions for Gandhi Shop Buy Again & Order History Architecture
 * Manages guest order tracking in localStorage, catalog hydration, and purchase metrics.
 */

export const ORDER_STORAGE_KEY = 'gandhi_order_history';

/**
 * Retrieve saved order history from localStorage safely
 */
export function getStoredOrders() {
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse order history from localStorage:', err);
    return [];
  }
}

/**
 * Persist order history to localStorage safely
 */
export function saveStoredOrders(orders) {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders.slice(0, 50)));
  } catch (err) {
    console.error('Failed to save order history to localStorage:', err);
  }
}

/**
 * Generate a clean, unique order ID: GS-ORD-<TIMESTAMP_BASE36>
 */
export function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `GS-ORD-${timestamp}-${randomSuffix}`;
}

/**
 * Format timestamp into readable date string
 */
export function formatOrderDate(isoString, lang = 'en') {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return d.toLocaleString(lang === 'ta' ? 'ta-IN' : 'en-IN', options);
  } catch {
    return isoString;
  }
}

/**
 * Construct an order record from current cart or single item
 */
export function createOrderRecord({ items = [], subtotal = 0, deliveryFee = 0, total = 0 }) {
  const now = new Date().toISOString();
  
  const sanitizedItems = items.map(item => {
    const product = item.product || item;
    return {
      id: product.id || String(Math.random()),
      name: product.name || 'Grocery Provision',
      tamilName: product.tamilName || '',
      category: product.category || 'Other Grocery Essentials',
      price: Number(product.price) || 0,
      mrp: Number(product.mrp) || Number(product.price) || 0,
      unit: product.unit || '1 unit',
      quantity: Math.max(1, Number(item.quantity) || 1),
      image: product.image || ''
    };
  });

  const calculatedSubtotal = subtotal || sanitizedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const calculatedTotal = total || (calculatedSubtotal + deliveryFee);
  const totalItemCount = sanitizedItems.reduce((acc, it) => acc + it.quantity, 0);

  return {
    id: generateOrderId(),
    timestamp: now,
    items: sanitizedItems,
    itemCount: totalItemCount,
    subtotal: calculatedSubtotal,
    deliveryFee: Number(deliveryFee) || 0,
    total: calculatedTotal,
    status: 'placed_via_whatsapp'
  };
}

/**
 * Extract unique previously ordered products and hydrate with live catalog
 * Aggregates timesPurchased, lastOrderedAt, and totalQuantity
 */
export function extractBuyAgainProducts(orders = [], catalog = []) {
  if (!Array.isArray(orders) || orders.length === 0) return [];

  // Map of productId -> aggregate purchase metrics
  const itemMap = new Map();

  // Process from oldest to newest or newest to oldest
  orders.forEach(order => {
    if (!order.items || !Array.isArray(order.items)) return;
    const orderTime = new Date(order.timestamp).getTime();

    order.items.forEach(it => {
      const pid = it.id;
      if (!pid) return;

      const existing = itemMap.get(pid);
      if (!existing) {
        itemMap.set(pid, {
          id: pid,
          snapshot: it,
          timesPurchased: 1,
          totalQuantity: it.quantity || 1,
          lastOrderedAt: order.timestamp,
          lastOrderedTime: orderTime
        });
      } else {
        existing.timesPurchased += 1;
        existing.totalQuantity += (it.quantity || 1);
        if (orderTime > existing.lastOrderedTime) {
          existing.lastOrderedAt = order.timestamp;
          existing.lastOrderedTime = orderTime;
        }
      }
    });
  });

  // Hydrate with live catalog
  const catalogMap = new Map();
  if (Array.isArray(catalog)) {
    catalog.forEach(p => {
      if (p && p.id) catalogMap.set(p.id, p);
    });
  }

  const hydratedList = [];

  itemMap.forEach(record => {
    const liveProduct = catalogMap.get(record.id);
    const baseProduct = liveProduct || record.snapshot;

    // Attach purchase intelligence metadata
    const times = record.timesPurchased;
    const badgeLabel = times > 1 ? `Ordered ${times}x` : 'Previously Ordered';

    hydratedList.push({
      ...baseProduct,
      timesPurchased: record.timesPurchased,
      totalQuantity: record.totalQuantity,
      lastOrderedAt: record.lastOrderedAt,
      purchaseBadge: badgeLabel,
      isLiveCatalogItem: Boolean(liveProduct)
    });
  });

  // Sort by purchase frequency (descending), then recency
  hydratedList.sort((a, b) => {
    if (b.timesPurchased !== a.timesPurchased) {
      return b.timesPurchased - a.timesPurchased;
    }
    return new Date(b.lastOrderedAt).getTime() - new Date(a.lastOrderedAt).getTime();
  });

  return hydratedList;
}

/**
 * Realistic Gandhi Shop sample orders for demonstration / guest testing
 */
export function getSampleOrders() {
  const now = Date.now();
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'GS-ORD-SAMPLE-01',
      timestamp: threeDaysAgo,
      items: [
        {
          id: 'GS-1001',
          name: 'Idly Rice (First Quality)',
          tamilName: 'இட்லி அரிசி (முதல் தரம்)',
          category: 'Rice',
          price: 65,
          mrp: 75,
          unit: '1 kg',
          quantity: 2,
          image: 'products/072_Basmati_Rice.jpg'
        },
        {
          id: 'GS-1004',
          name: 'Aachi Chilli Powder',
          tamilName: 'ஆச்சி மிளகாய் தூள்',
          category: 'Aachi Masala & Podi',
          price: 48,
          mrp: 55,
          unit: '200g',
          quantity: 1,
          image: 'products/001_Aachi_Chilli_Powder.jpg'
        },
        {
          id: 'GS-1005',
          name: 'Gold Winner Sunflower Oil',
          tamilName: 'கோல்ட் வின்னர் சூரியகாந்தி எண்ணெய்',
          category: 'Cooking Oil',
          price: 155,
          mrp: 170,
          unit: '1 L',
          quantity: 1,
          image: 'products/023_Gold_Winner_Sunflower_Oil.jpg'
        }
      ],
      itemCount: 4,
      subtotal: 333,
      deliveryFee: 40,
      total: 373,
      status: 'placed_via_whatsapp'
    },
    {
      id: 'GS-ORD-SAMPLE-02',
      timestamp: twoWeeksAgo,
      items: [
        {
          id: 'GS-1001',
          name: 'Idly Rice (First Quality)',
          tamilName: 'இட்லி அரிசி (முதல் தரம்)',
          category: 'Rice',
          price: 65,
          mrp: 75,
          unit: '1 kg',
          quantity: 2,
          image: 'products/072_Basmati_Rice.jpg'
        },
        {
          id: 'GS-1002',
          name: 'Toor Dal Premium Unpolished',
          tamilName: 'துவரம் பருப்பு பிரீமியம்',
          category: 'Other Grocery Essentials',
          price: 165,
          mrp: 185,
          unit: '1 kg',
          quantity: 1,
          image: 'products/102_Toor_Dal.jpg'
        },
        {
          id: 'GS-1003',
          name: '3 Roses Dust Tea',
          tamilName: '3 ரோசஸ் டீ தூள்',
          category: 'Tea & Coffee',
          price: 95,
          mrp: 110,
          unit: '250g',
          quantity: 1,
          image: 'products/012_3_Roses_Tea.jpg'
        }
      ],
      itemCount: 4,
      subtotal: 390,
      deliveryFee: 40,
      total: 430,
      status: 'placed_via_whatsapp'
    }
  ];
}
