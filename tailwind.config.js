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
          DEFAULT: '#FFFACD', // Lemon Chiffon - Global page background
          deep: '#F5ECB7',    // Deeper Lemon Chiffon - panels, cards needing subtle separation
          light: '#FFFDEE',   // Elevated surfaces, input fields, modals
        },
        olive: {
          DEFAULT: '#CD5C5C', // Indian Red - Signature brand color
          dark: '#A83E3E',    // Deep Indian Red - Hover / pressed state
          soft: 'rgba(205, 92, 92, 0.12)', // Tinted chips & active states
          border: 'rgba(205, 92, 92, 0.25)', // Subtle borders
        },
        ink: {
          DEFAULT: '#381B1B', // Editorial body text (deep terracotta tone)
          light: '#633939',   // Muted editorial secondary text
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'olive-sm': '0 2px 8px rgba(205, 92, 92, 0.10)',
        'olive-md': '0 4px 16px rgba(205, 92, 92, 0.15)',
        'olive-lg': '0 8px 30px rgba(205, 92, 92, 0.20)',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      }
    },
  },
  plugins: [],
}
