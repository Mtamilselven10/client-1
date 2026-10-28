# Gandhi Shop — Premium Grocery & Organic Provisions E-Commerce Showcase

A production-quality, editorial grocery e-commerce showcase web application built for **Gandhi Shop**. Designed with a strict two-color brand system (Lemon Chiffon `#FFFACD` and Indian Red `#CD5C5C`), scroll-driven canvas frame scrubbing hero, dynamic Excel catalog parser (SheetJS), Amazon/Flipkart-style grocery grid, persistent live Cart & Wishlist with localStorage synchronization, and direct per-item WhatsApp order generation.

---

## 🌾 Tech Stack
- **Framework:** React 18 + Vite 6
- **Styling:** Tailwind CSS (configured with exact CSS variables and custom tokens)
- **Routing:** React Router v6
- **Animation:** Full-screen 60fps `<canvas>` scrubbing with `requestAnimationFrame` + Framer Motion
- **State Management:** React Context (`CartContext`, `WishlistContext`, `ToastContext`) persisted in `localStorage`
- **Spreadsheet Parser:** SheetJS (`xlsx`) for runtime Excel parsing and column aliasing
- **Icons:** Lucide React

---

## 🎨 Design System & Color Palette
The entire website is strictly built with **Lemon Chiffon** as the global page background and **Indian Red** as the single signature identity color. There are **zero white or gray backgrounds** anywhere on the site.

| Token | Hex / CSS Value | Description & Purpose |
| :--- | :--- | :--- |
| `cream` | `#FFFACD` | Lemon Chiffon - Default global background on every page, drawer, and canvas base |
| `cream-deep` | `#F5ECB7` | Deeper Lemon Chiffon - Sidebar base, order summary panels, filter sidebar, separation cards |
| `cream-light` | `#FFFDEE` | Elevated surfaces, product card boxes, input fields, modal panels |
| `olive` | `#CD5C5C` | Indian Red - Signature brand color: primary buttons, prices, active route, badges, slider, focus rings |
| `olive-dark` | `#A83E3E` | Deep Indian Red - Hover and pressed states of primary buttons and elements |
| `olive-soft` | `rgba(205, 92, 92, 0.12)` | Subtle tinted surfaces, active-state chips, hover backgrounds |
| `ink` | `#381B1B` | High-contrast editorial body text and headings (deep terracotta, WCAG AAA compliant) |

### How to Change the Palette in One Place
All colors are centralized in `src/theme.js` and exposed as CSS variables in `src/index.css` and `tailwind.config.js`. To change the brand theme, simply update the hex values in `src/theme.js` and `src/index.css`.

---

## ⚙️ Central Configuration (`src/config.js`)
All store-wide contact details, phone numbers, WhatsApp routing, and map links are defined exclusively in `src/config.js`:

```javascript
export const SHOP_NAME = "Gandhi Shop";
export const SHOP_TAGLINE = "Pure Traditions, Freshly Handpicked";
export const WHATSAPP_NUMBER = "919876543210"; // Country code + 10 digits, no '+'
export const CUSTOMER_CARE_PHONES = ["+91 98765 43210", "+91 98765 43211"];
export const CUSTOMER_CARE_EMAIL = "care@gandhishop.com";
export const GOOGLE_MAP_URL = "https://maps.google.com/?q=Gandhi+Shop+Main+Bazaar";
export const STORE_ADDRESS = "142, Main Heritage Bazaar, Opp. Town Hall, Gandhi Nagar, Tamil Nadu 600001";
export const WORKING_HOURS = "Mon - Sat: 7:00 AM - 9:30 PM | Sun: 7:00 AM - 2:00 PM";
```

To update your WhatsApp ordering number or customer care numbers, edit `src/config.js`. All product order links and contact cards will update automatically.

---

## 📁 How to Replace Assets

### 1. Replacing Animation Frames
1. Extract your sequential JPG or PNG frames (e.g. `frame-001.jpg` to `frame-282.jpg`) into `/public/frames/`.
2. Update `/public/frames/manifest.json` with your frame count and naming pattern:
   ```json
   {
     "frameCount": 282,
     "namingPattern": "ezgif-frame-%03d.jpg",
     "prefix": "ezgif-frame-",
     "digits": 3,
     "extension": "jpg",
     "fps": 30
   }
   ```
3. The canvas hero automatically auto-detects the count and scrubs smoothly across the frames on scroll.

### 2. Replacing the Product Spreadsheet
1. Save your Excel spreadsheet at `/public/data/products.xlsx`.
2. The runtime parser (`src/utils/excelParser.js`) flexibly recognizes common column headers:
   - **Name:** `Name`, `Product Name`, `Item`, `Title`
   - **Price:** `Selling Price`, `Price`, `Rate`, `Cost`, `MRP`
   - **Category:** `Category`, `Dept`, `Type`, `Group`
   - **Unit:** `Unit`, `Pack Unit`, `Package`, `Quantity`, `Weight`
   - **Image:** `Image URL`, `Image`, `Photo`, `Thumbnail`
   - **Description:** `Short Description`, `Description`, `About`
   - **Details:** `Detailed Specifications`, `Details`, `Specs`, `Origin`
3. If any cell is empty or columns are named slightly differently, the parser handles missing values gracefully with fallback defaults.

### 3. Modifying FAQs and Policy Text
- **FAQs:** Edit `src/data/faqsData.js`.
- **Privacy Policy & Terms:** Edit `src/data/policyData.js`.

---

## 🚀 Run & Build Instructions

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```
Creates an optimized static production bundle in `/dist`.

### 4. Preview Production Build
```bash
npm run preview
```

### 5. Automated Verification & Screenshot Capture
```bash
node scripts/verify_app.js
```
Launches a headless browser session, tests all navigation routes, verifies Excel parsing, tests cart and wishlist synchronization, checks color palette compliance, and captures screenshots in the `/screenshots` directory.

---

## 🌐 Bilingual Language Switch (English & Tamil)
- **Top-Right Switcher:** Located fixed at the top-right corner (`top-3.5 right-14 lg:right-6 sm:top-4 z-50`), cleanly accessible across both mobile viewports and desktop screens.
- **Instant Reactive Toggle:** Powered by `LanguageContext` (`src/context/LanguageContext.jsx`) and `translations.js` (`src/i18n/translations.js`). Switching between **EN** and **தமிழ்** instantly re-renders the entire website with zero page reload.
- **Dynamic Category & Text Translation:** Automatically maps and translates all Excel spreadsheet categories, descriptions, navigational items, order forms, and WhatsApp pre-filled messages.
- **Persistence:** Stored in `localStorage` under `gandhi_shop_lang` and updates `document.documentElement.lang`.

---

## 🔒 Scroll-Driven Hero Animation Breakpoint & Gate
- **Strict Breakpoint Gate:** The website content below the hero (`FeaturedCategories`, `StoreStoryPreview`, `CustomerReviews`) is **unmounted and locked** until the hero animation completely reaches its **100% final frame (Frame 282 / 282)**.
- **Scrubbing Control:** All mouse wheel events, touch swipes, and keyboard down-arrows smoothly advance the animation frames via high-performance RequestAnimationFrame (RAF) interpolation.
- **Live Breakpoint Card:** An on-brand status card shows current frame progress (`Frame X / 282 (X%)`) and lock state.
- **Website Unlocking:** Once the animation completes 100%, the breakpoint triggers, unlocking the website below with a fluid Framer Motion slide-in animation, accompanied by an interactive downward scroll prompt.

---

## 📸 Key Pages & Visual Verification

1. **Home Page (`/`):** Full-screen scroll-scrubbed canvas hero with progressive preloader, "Explore Store" instant skip, pinned frame sequence, followed by unlocked featured categories, store legacy, and customer reviews.
2. **Products Catalog (`/products`):** Real-time SheetJS Excel parsed grid with debounced instant search, price slider, category chips, sorting, and pagination.
3. **Product Detail (`/products/:id`):** Zoomable high-resolution image with hover lens inspection, nutritional specs, origin notes, quantity selector, and instant "Order via WhatsApp".
4. **Wishlist (`/wishlist`):** Auto-populated saved products with direct "Add to Cart" and "Remove" options.
5. **Shopping Cart (`/cart`):** Quantity steppers, live subtotal, and dedicated per-item "Order" buttons that pre-format WhatsApp messages with item code, unit, price, and total.
6. **Editorial Pages:** About Us (`/about`) with Google Maps button, FAQs (`/faqs`) with accessible accordion, Customer Care (`/customer-care`) with tap-to-call and tap-to-email cards, Privacy Policy (`/privacy-policy`), and brand-styled 404 page (`/404`).
