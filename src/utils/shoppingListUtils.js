/**
 * SMART SHOPPING LIST UTILITIES FOR GANDHI SHOP
 * Calculations for grocery budget estimation, progress metrics, and live catalog reconciliation.
 */

export const DEFAULT_LIST_TEMPLATES = [
  { name: 'Monthly Grocery', nameTa: 'மாதாந்திர மளிகை' },
  { name: 'Weekly Essentials', nameTa: 'வாராந்திர தேவைகள்' },
  { name: 'Kitchen Requirements', nameTa: 'அஞ்சறைப்பெட்டி தேவைகள்' },
  { name: 'Festival Shopping', nameTa: 'பண்டிகை கால மளிகை' }
];

/**
 * Calculates smart list metrics using live catalog data.
 */
export function calculateListMetrics(items = [], catalogMap = new Map()) {
  const totalProducts = items.length;
  let totalQuantity = 0;
  let completedCount = 0;
  let estimatedCost = 0;
  let totalMrp = 0;
  let availableCount = 0;

  items.forEach(item => {
    const qty = Math.max(1, item.quantity || 1);
    totalQuantity += qty;
    if (item.completed) completedCount++;

    // Reconcile with live catalog item if available
    const liveProd = catalogMap.get(String(item.productId || item.id).toLowerCase());
    const unitPrice = liveProd?.price ?? item.price ?? 0;
    const unitMrp = liveProd?.mrp ?? item.mrp ?? unitPrice;
    const inStock = liveProd?.inStock !== false;

    if (inStock) availableCount++;
    estimatedCost += unitPrice * qty;
    totalMrp += unitMrp * qty;
  });

  const remainingCount = totalProducts - completedCount;
  const progressPercent = totalProducts > 0 
    ? Math.round((completedCount / totalProducts) * 100) 
    : 0;
  const potentialSavings = totalMrp > estimatedCost ? totalMrp - estimatedCost : 0;

  return {
    totalProducts,
    totalQuantity,
    completedCount,
    remainingCount,
    progressPercent,
    estimatedCost,
    totalMrp,
    potentialSavings,
    availableCount
  };
}

/**
 * Hydrates shopping list items with latest product data (image, current price, inStock, unit)
 */
export function hydrateListItems(items = [], catalog = []) {
  if (!Array.isArray(items)) return [];
  const catalogMap = new Map();
  (catalog || []).forEach(p => {
    if (p && p.id) {
      catalogMap.set(String(p.id).toLowerCase(), p);
    }
  });

  return items.map(item => {
    const prodId = String(item.productId || item.id).toLowerCase();
    const liveProd = catalogMap.get(prodId);

    return {
      ...item,
      product: liveProd || {
        id: item.productId || item.id,
        name: item.name || 'Provision Item',
        price: item.price || 0,
        mrp: item.mrp || 0,
        unit: item.unit || '1 unit',
        image: item.image || 'products/001_Aachi_Chilli_Powder.jpg',
        inStock: item.inStock !== false,
        category: item.category || 'General'
      }
    };
  });
}
