/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F5F2EB', // Natural Coconut Cream - Global page background
          deep: '#EBE5D8',    // Deeper Coconut Linen - panels, cards needing subtle separation
          light: '#FAF8F5',   // Elevated surfaces, input fields, modals
        },
        olive: {
          DEFAULT: '#558B2F', // Rich Forest / Palm Green (Hex #558B2F, RGB: 85, 139, 47)
          dark: '#3B631E',    // Deep Palm Foliage - Hover / pressed state
          soft: 'rgba(85, 139, 47, 0.12)', // Tinted chips & active states
          border: 'rgba(85, 139, 47, 0.25)', // Subtle palm borders
        },
        ink: {
          DEFAULT: '#2C1E1A', // Editorial body text (Deep Coconut Bark / Espresso)
          light: '#5D4037',   // Secondary text (Rich Coconut Husk Brown - Hex #5D4037, RGB: 93, 64, 55)
        },
        coconut: {
          DEFAULT: '#5D4037', // Hex #5D4037 - Coconut Husk Brown
          dark: '#3E2723',
          light: '#795548',
          soft: 'rgba(93, 64, 55, 0.12)'
        },
        palm: {
          DEFAULT: '#558B2F', // Hex #558B2F - Palm Green
          dark: '#3B631E',
          light: '#689F38',
          soft: 'rgba(85, 139, 47, 0.12)'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        liber: ['"Liberation Serif"', '"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'olive-sm': '0 2px 8px rgba(85, 139, 47, 0.12)',
        'olive-md': '0 4px 16px rgba(85, 139, 47, 0.16)',
        'olive-lg': '0 8px 30px rgba(85, 139, 47, 0.22)',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      }
    },
  },
  plugins: [],
}
