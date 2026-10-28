/**
 * Design System Theme & Color Tokens for Gandhi Shop
 * Strict two-color base palette (Beige Cream & Olive Green) with derived tints.
 */
export const THEME = {
  colors: {
    // Primary Brand Identity
    cream: '#FFF3D5',       // Global page background
    creamDeep: '#F6E6BC',   // Subtle separation cards, sidebar base, accordion containers
    creamLight: '#FFF9EA',  // Input fields, modals, elevated surfaces

    olive: '#4D694E',       // Primary signature brand color
    oliveDark: '#3A503B',   // Hover / pressed state
    oliveSoft: 'rgba(77, 105, 78, 0.12)', // Subtle tinted surfaces, active-state chips
    oliveBorder: 'rgba(77, 105, 78, 0.22)',

    ink: '#2B3A2C',         // High contrast editorial body text (dark olive tone)
    inkMuted: '#4B5E4C',    // Subdued captions and metadata
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
