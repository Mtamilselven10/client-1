import * as XLSX from 'xlsx';

/**
 * Format an array of product objects into standard Gandhi Shop Excel sheet format
 * @param {Array} products - List of products to export
 * @returns {Array} - Array of flat objects matching products.xlsx schema
 */
export function formatProductsForExcel(products = []) {
  return products.map((p, idx) => {
    const sku = p.sku || p.id || `GS-${1001 + idx}`;
    const price = Number(p.price) || 0;
    const mrp = Number(p.mrp) || Math.round(price * 1.2);
    const inStock = p.inStock !== undefined ? p.inStock : (p.in_stock !== undefined ? p.in_stock : true);

    return {
      'Product ID': sku,
      'Product Name': p.name || 'Grocery Provision',
      'Tamil Name': p.nameTa || p.name_ta || p.tamilName || '',
      'Category': p.category || p.category_name || 'General Grocery',
      'Selling Price (INR)': price,
      'MRP (INR)': mrp,
      'Package Unit': p.unit || '1 unit',
      'Customer Rating': Number(p.rating) || 4.8,
      'Total Reviews': Number(p.reviewsCount || p.reviews_count) || 50,
      'Image URL': p.imageUrl || p.image_url || p.image || '',
      'Short Description': p.description || `${p.name || ''} - authentic, unadulterated grocery staple.`,
      'Detailed Specifications': p.details || '100% Genuine Quality. Hygienically packed. Direct from reliable Tamil Nadu agrarian sources.',
      'Stock Status': inStock ? 'In Stock' : 'Out of Stock',
    };
  });
}

/**
 * Trigger browser download of products catalog as an Excel (.xlsx) file
 * @param {Array} products - List of products
 * @param {string} [filename='Gandhi_Shop_Products.xlsx']
 */
export function exportProductsToExcel(products = [], filename = 'Gandhi_Shop_Products.xlsx') {
  if (!products || products.length === 0) {
    throw new Error('No products available to export.');
  }

  const formattedRows = formatProductsForExcel(products);
  const worksheet = XLSX.utils.json_to_sheet(formattedRows);

  // Set nice column widths
  worksheet['!cols'] = [
    { wch: 14 }, // Product ID
    { wch: 28 }, // Product Name
    { wch: 28 }, // Tamil Name
    { wch: 24 }, // Category
    { wch: 18 }, // Selling Price
    { wch: 14 }, // MRP
    { wch: 14 }, // Package Unit
    { wch: 16 }, // Customer Rating
    { wch: 14 }, // Total Reviews
    { wch: 38 }, // Image URL
    { wch: 45 }, // Short Description
    { wch: 55 }, // Detailed Specifications
    { wch: 14 }, // Stock Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Gandhi Shop Catalog');

  const safeFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, safeFilename);

  return {
    success: true,
    rowCount: formattedRows.length,
    filename: safeFilename,
  };
}

/**
 * Generate a blank / sample template Excel sheet for adding new products
 * @param {string} [filename='Gandhi_Shop_Product_Import_Template.xlsx']
 */
export function exportCatalogTemplate(filename = 'Gandhi_Shop_Product_Import_Template.xlsx') {
  const sampleData = [
    {
      'Product ID': 'GS-NEW-01',
      'Product Name': 'Sample Toor Dal (Sample Entry)',
      'Tamil Name': 'துவரம்பருப்பு மாதிரி',
      'Category': 'Dal & Pulses',
      'Selling Price (INR)': 165,
      'MRP (INR)': 185,
      'Package Unit': '1 kg',
      'Customer Rating': 4.8,
      'Total Reviews': 45,
      'Image URL': 'products/102_Toor_Dal.jpg',
      'Short Description': 'Sample unpolished toor dal description.',
      'Detailed Specifications': '100% genuine farm fresh grains.',
      'Stock Status': 'In Stock',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 14 }, { wch: 28 }, { wch: 28 }, { wch: 24 },
    { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 16 },
    { wch: 14 }, { wch: 38 }, { wch: 45 }, { wch: 55 }, { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Template');
  XLSX.writeFile(workbook, filename);

  return { success: true, filename };
}
