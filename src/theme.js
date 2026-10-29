/**
 * Design System Theme & Color Tokens for Gandhi Shop
 * Coconut & Palm Theme (Fresh Organic Palette)
 * Reference: Coconut Husk Brown #5D4037 (RGB: 93 64 55), Palm Green #558B2F (RGB: 85 139 47)
 */
export const THEME = {
  colors: {
    // Primary Brand Identity (Coconut & Palm)
    cream: '#F5F2EB',       // Coconut Cream - Global page background
    creamDeep: '#EBE5D8',   // Coconut Husk Linen - separation cards, sidebar drawer
    creamLight: '#FAF8F5',  // Coconut Milk - Elevated surfaces, input fields, modals

    olive: '#558B2F',       // Palm Green / Rich Forest Green (#558B2F, RGB: 85 139 47)
    oliveDark: '#3B631E',   // Deep Palm Foliage - Hover / pressed state
    oliveSoft: 'rgba(85, 139, 47, 0.12)', // Subtle tinted surfaces, active-state chips
    oliveBorder: 'rgba(85, 139, 47, 0.25)',

    ink: '#2C1E1A',         // High contrast editorial body text (Deep Coconut Bark)
    inkMuted: '#5D4037',    // Coconut Husk Brown (#5D4037, RGB: 93 64 55)

    coconut: '#5D4037',
    palm: '#558B2F'
  },
  typography: {
    headingFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Plus Jakarta Sans", Inter, system-ui, sans-serif',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  }
};
