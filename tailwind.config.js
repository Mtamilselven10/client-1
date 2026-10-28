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
          DEFAULT: '#FFF3D5', // Global page background
          deep: '#F6E6BC',    // Panels, cards needing subtle separation
          light: '#FFF9EA',   // Input fields, elevated surfaces, modals
        },
        olive: {
          DEFAULT: '#4D694E', // Signature brand color
          dark: '#3A503B',    // Hover / pressed state
          soft: 'rgba(77, 105, 78, 0.12)', // Tinted chips & active states
          border: 'rgba(77, 105, 78, 0.25)', // Subtle borders
        },
        ink: {
          DEFAULT: '#2B3A2C', // Editorial body text (dark olive tone)
          light: '#4B5E4C',   // Muted editorial secondary text
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'olive-sm': '0 2px 8px rgba(77, 105, 78, 0.08)',
        'olive-md': '0 4px 16px rgba(77, 105, 78, 0.12)',
        'olive-lg': '0 8px 30px rgba(77, 105, 78, 0.16)',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      }
    },
  },
  plugins: [],
}
