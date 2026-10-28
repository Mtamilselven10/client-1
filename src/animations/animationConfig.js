/**
 * Animation Configuration for Gandhi Shop
 * Centralizes durations, easings, toggle flags, and reduced-motion detection.
 */

export const ANIMATION_CONFIG = {
  // Master switches
  animationsEnabled: true,
  flyToCartEnabled: true,

  // Fly-to-cart timing & dynamics
  flyDuration: 0.95, // seconds (0.9 to 1.1s as specified)
  flyEasing: [0.22, 1, 0.36, 1], // cubic-bezier(0.22, 1, 0.36, 1)
  maxSimultaneousFlights: 6, // Concurrency limit to preserve 60fps

  // Visual lift parameters
  liftScale: 1.04,
  liftRotate: 2, // degrees
  targetScale: 0.12, // end scale on arrival at cart icon

  // Target arrival reactions
  badgePopScale: 1.4,
  badgeDuration: 0.35,

  // Picked pulse for source card
  pickedScale: [1, 0.98, 1],
  pickedDuration: 0.3,

  // Page transition settings
  pageTransitionDuration: 0.26,
  pageSlideOffset: 12, // px

  // Stagger timing
  gridStagger: 0.04, // seconds between card reveals

  // Floating WhatsApp pulse timing
  whatsAppPulseInterval: 4.5, // seconds
};

/**
 * Checks if the user prefers reduced motion
 */
export function isReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default ANIMATION_CONFIG;
