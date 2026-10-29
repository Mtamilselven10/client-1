/**
 * Design System Theme & Color Tokens for Gandhi Shop
 * Coconut Brown Theme (Warm Organic Palette)
 * Reference: Coconut Brown #5D4037 (RGB: 93 64 55), Coconut Bark #2C1E1A, Coconut Cream #F5F2EB
 */
export const THEME = {
  colors: {
    // Primary Brand Identity (Coconut Brown & Cream)
    cream: '#F5F2EB',       // Coconut Cream - Global page background
    creamDeep: '#EBE5D8',   // Coconut Husk Linen - separation cards, sidebar drawer
    creamLight: '#FAF8F5',  // Coconut Milk - Elevated surfaces, input fields, modals

    olive: '#5D4037',       // Coconut Brown (#5D4037, RGB: 93 64 55)
    oliveDark: '#3E2723',   // Deep Roasted Coconut - Hover / pressed state
    oliveSoft: 'rgba(93, 64, 55, 0.12)', // Subtle tinted surfaces, active-state chips
    oliveBorder: 'rgba(93, 64, 55, 0.25)',

    ink: '#2C1E1A',         // High contrast editorial body text (Deep Coconut Bark)
    inkMuted: '#5D4037',    // Coconut Brown (#5D4037, RGB: 93 64 55)

    coconut: '#5D4037',
    palm: '#5D4037'
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
