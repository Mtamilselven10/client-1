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
          DEFAULT: '#5D4037', // Coconut Brown (Uploaded Hex #5D4037, RGB: 93, 64, 55)
          dark: '#3E2723',    // Deep Roasted Coconut - Hover / pressed state
          soft: 'rgba(93, 64, 55, 0.12)', // Tinted chips & active states
          border: 'rgba(93, 64, 55, 0.25)', // Subtle coconut borders
        },
        ink: {
          DEFAULT: '#2C1E1A', // Editorial body text (Deep Coconut Bark / Espresso)
          light: '#5D4037',   // Secondary text (Rich Coconut Husk Brown - Hex #5D4037, RGB: 93, 64, 55)
        },
        coconut: {
          DEFAULT: '#5D4037', // Hex #5D4037 - Coconut Brown
          dark: '#3E2723',
          light: '#795548',
          soft: 'rgba(93, 64, 55, 0.12)'
        },
        palm: {
          DEFAULT: '#5D4037', // Converted to Coconut Brown (#5D4037)
          dark: '#3E2723',
          light: '#795548',
          soft: 'rgba(93, 64, 55, 0.12)'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        liber: ['"Liberation Serif"', '"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'olive-sm': '0 2px 8px rgba(93, 64, 55, 0.12)',
        'olive-md': '0 4px 16px rgba(93, 64, 55, 0.16)',
        'olive-lg': '0 8px 30px rgba(93, 64, 55, 0.22)',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      }
    },
  },
  plugins: [],
}
