/**
 * Design System Theme & Color Tokens for Gandhi Shop
 * Strict two-color base palette (Lemon Chiffon & Indian Red) with derived tints.
 * Reference: Indian Red #CD5C5C (RGB: 205 92 92), Lemon Chiffon #FFFACD (RGB: 255 250 205)
 */
export const THEME = {
  colors: {
    // Primary Brand Identity (Lemon Chiffon & Indian Red)
    cream: '#FFFACD',       // Lemon Chiffon - Global page background
    creamDeep: '#F5ECB7',   // Deeper Lemon Chiffon - separation cards, sidebar base, accordion containers
    creamLight: '#FFFDEE',  // Elevated surfaces, input fields, modals

    olive: '#CD5C5C',       // Indian Red - Primary signature brand color
    oliveDark: '#A83E3E',   // Deep Indian Red - Hover / pressed state
    oliveSoft: 'rgba(205, 92, 92, 0.12)', // Subtle tinted surfaces, active-state chips
    oliveBorder: 'rgba(205, 92, 92, 0.25)',

    ink: '#381B1B',         // High contrast editorial body text (deep terracotta tone)
    inkMuted: '#633939',    // Subdued captions and metadata
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
