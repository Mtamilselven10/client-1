import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Sparkles, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { SHOP_NAME, SHOP_TAGLINE } from '../../config';
import { useLanguage } from '../../context/LanguageContext';

export default function ScrollCanvasHero({ isUnlocked = false, onComplete, onRewind }) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const canvasRef = useRef(null);

  const TOTAL_FRAMES = 282;
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFrameDisplay, setCurrentFrameDisplay] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Cached frame images
  const framesRef = useRef([]);
  const currentFrameIndexRef = useRef(0);
  const targetFrameIndexRef = useRef(0);
  const animFrameIdRef = useRef(null);
  const isCompleteRef = useRef(false);

  // Check reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setIsAnimationComplete(true);
      isCompleteRef.current = true;
      if (onComplete) onComplete();
    }
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) {
        setIsAnimationComplete(true);
        isCompleteRef.current = true;
        if (onComplete) onComplete();
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [onComplete]);

  // Draw frame on canvas with high DPI and Cover fit
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frames = framesRef.current;
    let img = frames[frameIndex];

    // Fallback to nearest loaded frame if current isn't loaded
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < 35; offset++) {
        if (frames[frameIndex - offset]?.complete) {
          img = frames[frameIndex - offset];
          break;
        }
        if (frames[frameIndex + offset]?.complete) {
          img = frames[frameIndex + offset];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Calculate cover fit dimensions
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;
    let renderW, renderH, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderW = width;
      renderH = width / imgRatio;
      offsetX = 0;
      offsetY = (height - renderH) / 2;
    } else {
      renderH = height;
      renderW = height * imgRatio;
      offsetX = (width - renderW) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

    // Subtle brand tone overlay for editorial cohesion
    ctx.fillStyle = 'rgba(43, 58, 44, 0.18)';
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }, []);

  // Preload frames directly on mount
  useEffect(() => {
    let isCancelled = false;
    const images = new Array(TOTAL_FRAMES);
    let loadedCount = 0;
    let hasUnlocked = false;

    const unlock = () => {
      if (hasUnlocked || isCancelled) return;
      hasUnlocked = true;
      framesRef.current = images;
      setIsLoaded(true);
      requestAnimationFrame(() => {
        drawFrame(0);
      });
    };

    const baseUrl = import.meta.env.BASE_URL;
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const padNum = String(i).padStart(3, '0');
      img.src = `${baseUrl}frames/ezgif-frame-${padNum}.jpg`;

      img.onload = () => {
        if (isCancelled) return;
        images[i - 1] = img;
        loadedCount++;
        const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        setLoadProgress(pct);

        if (loadedCount >= 10 && !hasUnlocked) {
          unlock();
        }
      };

      img.onerror = () => {
        if (isCancelled) return;
        loadedCount++;
        if (loadedCount >= 10 && !hasUnlocked) {
          unlock();
        }
      };
    }

    const fallbackTimer = setTimeout(() => {
      unlock();
    }, 1200);

    return () => {
      isCancelled = true;
      clearTimeout(fallbackTimer);
    };
  }, [drawFrame]);

  // Smooth lerp frame scrubbing in RAF loop
  useEffect(() => {
    if (!isLoaded) return;

    const renderLoop = () => {
      const current = currentFrameIndexRef.current;
      const target = targetFrameIndexRef.current;

      const diff = target - current;
      if (Math.abs(diff) > 0.05) {
        currentFrameIndexRef.current += diff * 0.25;
      } else {
        currentFrameIndexRef.current = target;
      }

      const frameToDraw = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(currentFrameIndexRef.current))
      );

      setCurrentFrameDisplay(frameToDraw);
      drawFrame(frameToDraw);

      // Check if animation has reached the 100% breakpoint
      if (currentFrameIndexRef.current >= TOTAL_FRAMES - 1.5) {
        if (!isCompleteRef.current) {
          isCompleteRef.current = true;
          setIsAnimationComplete(true);
          if (onComplete) onComplete();
        }
      } else if (currentFrameIndexRef.current < TOTAL_FRAMES * 0.2) {
        // Only if rewound near the beginning
        if (isCompleteRef.current && window.scrollY <= 10) {
          isCompleteRef.current = false;
          setIsAnimationComplete(false);
          if (onRewind) onRewind();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isLoaded, drawFrame, onComplete, onRewind]);

  // Skip / Instant Unlock Handler
  const handleUnlockBreakpoint = () => {
    targetFrameIndexRef.current = TOTAL_FRAMES - 1;
    currentFrameIndexRef.current = TOTAL_FRAMES - 1;
    drawFrame(TOTAL_FRAMES - 1);
    setCurrentFrameDisplay(TOTAL_FRAMES - 1);
    isCompleteRef.current = true;
    setIsAnimationComplete(true);
    if (onComplete) onComplete();

    // Smoothly scroll down after unlock
    setTimeout(() => {
      const target = document.getElementById('explore-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      }
    }, 250);
  };

  const handleScrollDownToExplore = () => {
    const target = document.getElementById('explore-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  // Skip animation directly to products page
  const handleExploreStore = () => {
    navigate('/products');
  };

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      drawFrame(Math.round(currentFrameIndexRef.current));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  // Strict Breakpoint Scroll/Wheel/Touch Interception Engine
  useEffect(() => {
    if (!isLoaded || prefersReducedMotion) return;

    let touchStartY = 0;

    // 1. Mouse wheel handler
    const onWheel = (e) => {
      // If animation is NOT complete:
      if (!isCompleteRef.current) {
        e.preventDefault();
        const delta = e.deltaY;
        // Normalize wheel delta for controlled, smooth frame advance
        const step = (delta / 40) * 3.5;
        targetFrameIndexRef.current = Math.max(
          0,
          Math.min(TOTAL_FRAMES - 1, targetFrameIndexRef.current + step)
        );
      } else {
        // Animation IS complete (breakpoint reached):
        // If at the top of the page and scrolling UP strongly, allow rewinding
        if (window.scrollY === 0 && e.deltaY < -25 && targetFrameIndexRef.current > 0) {
          // Allow gentle reverse scrub
          targetFrameIndexRef.current = Math.max(0, targetFrameIndexRef.current - 4);
        }
        // Downward scrolling naturally scrolls the page down into the unlocked website!
      }
    };

    // 2. Touch handlers for mobile/tablet
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;

      if (!isCompleteRef.current) {
        e.preventDefault();
        const step = (deltaY / 15) * 3;
        targetFrameIndexRef.current = Math.max(
          0,
          Math.min(TOTAL_FRAMES - 1, targetFrameIndexRef.current + step)
        );
      }
    };

    // 3. Keyboard handlers (Down arrow, PageDown, Space)
    const onKeyDown = (e) => {
      if (!isCompleteRef.current && window.scrollY === 0) {
        if (['ArrowDown', 'PageDown', 'Space'].includes(e.code)) {
          e.preventDefault();
          targetFrameIndexRef.current = Math.min(
            TOTAL_FRAMES - 1,
            targetFrameIndexRef.current + 18
          );
        } else if (['ArrowUp', 'PageUp'].includes(e.code)) {
          e.preventDefault();
          targetFrameIndexRef.current = Math.max(0, targetFrameIndexRef.current - 18);
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isLoaded, prefersReducedMotion]);

  const progressPercent = Math.min(
    100,
    Math.round((currentFrameDisplay / (TOTAL_FRAMES - 1)) * 100)
  );

  return (
    <>
      {/* Preloader Screen */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream px-6">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-card bg-cream-light p-2 border border-olive/20 shadow-olive-md flex items-center justify-center">
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`} 
                alt="Gandhi Shop Logo" 
                className="w-full h-full object-contain animate-pulse" 
              />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-olive-soft text-olive text-sm font-semibold tracking-wider">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{t('hero.heritageTag')}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-olive">
              {t('hero.preparing')}
            </h2>

            <p className="text-ink text-sm sm:text-base font-medium">
              {t('hero.loadingSequence')} ({loadProgress}%)
            </p>

            {/* Olive Progress Bar */}
            <div className="w-full h-3 rounded-full bg-cream-deep overflow-hidden border border-olive/20 shadow-inner">
              <div 
                className="h-full bg-olive rounded-full transition-all duration-150 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>

            {/* Skip Button during preloading */}
            <div className="pt-2">
              <button
                onClick={handleExploreStore}
                className="text-xs uppercase tracking-widest text-olive hover:text-olive-dark underline underline-offset-4 font-semibold"
              >
                {t('hero.skipIntro')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pinned Full-Screen Hero Viewport */}
      <section 
        className="relative w-full h-screen overflow-hidden bg-cream select-none"
        aria-label="Interactive harvest animation"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Editorial Overlay Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/45 pointer-events-none" />

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-between p-4 sm:p-10 text-center text-cream z-10 pointer-events-none">
          {/* Top Brand Pill with Logo */}
          <div className="pointer-events-auto pt-3 sm:pt-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cream/95 backdrop-blur-xs text-olive font-semibold text-xs sm:text-sm tracking-widest uppercase shadow-olive-md border border-olive/20">
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`} 
                alt={t('brand.name')} 
                className="w-5 h-5 object-contain" 
              />
              <span>{t('hero.badge')}</span>
            </div>
          </div>

          {/* Centered Editorial Titles & Explore Button */}
          <div className="pointer-events-auto max-w-3xl space-y-4 px-4 my-auto">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-cream drop-shadow-md leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="text-sm sm:text-lg font-medium text-cream/90 max-w-2xl mx-auto drop-shadow-sm leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Primary Actions Grid */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={handleExploreStore}
                className="px-7 py-3.5 rounded-btn bg-olive text-cream font-bold text-sm sm:text-base shadow-olive-lg hover:bg-olive-dark transition-colors duration-200 flex items-center gap-2.5 border border-cream/30 focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2"
              >
                <span>{t('hero.exploreBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Bottom Breakpoint Gate Status & Control Card */}
          <div className="pointer-events-auto pb-3 sm:pb-6 w-full max-w-xl mx-auto px-4">
            <motion.div
              layout
              className={`p-3.5 sm:p-4 rounded-card backdrop-blur-md border shadow-olive-lg transition-all duration-300 ${
                isAnimationComplete
                  ? 'bg-cream/95 border-olive text-ink shadow-olive-xl'
                  : 'bg-ink/75 border-cream/25 text-cream'
              }`}
            >
              {/* Status Header */}
              <div className="flex items-center justify-between gap-3 text-xs font-semibold mb-2">
                <div className="flex items-center gap-2">
                  {isAnimationComplete ? (
                    <div className="flex items-center gap-1.5 text-olive font-extrabold uppercase tracking-wider text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-olive" />
                      <span>{t('hero.breakpointBadge')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-cream/90 font-extrabold uppercase tracking-wider text-[11px]">
                      <Lock className="w-3.5 h-3.5 text-cream animate-pulse" />
                      <span>{t('hero.breakpointBadge')}</span>
                    </div>
                  )}
                </div>

                <div className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-cream-deep/30 border border-current/20">
                  {currentFrameDisplay + 1} / {TOTAL_FRAMES} ({progressPercent}%)
                </div>
              </div>

              {/* Breakpoint Visual Progress Track */}
              <div className="w-full h-2 rounded-full bg-black/25 overflow-hidden mb-3 border border-cream/20 shadow-inner">
                <motion.div
                  className={`h-full rounded-full transition-all duration-100 ${
                    isAnimationComplete ? 'bg-olive' : 'bg-cream'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Breakpoint State Information & Dynamic Actions */}
              {!isAnimationComplete ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-0.5">
                  <p className="text-[11px] sm:text-xs text-cream/80 text-center sm:text-left font-medium">
                    {t('hero.breakpointNotice')}
                  </p>
                  <button
                    data-testid="skip-to-unlock-btn"
                    onClick={handleUnlockBreakpoint}
                    className="shrink-0 px-3 py-1 rounded-full bg-cream/20 hover:bg-cream/30 text-cream text-[11px] font-bold border border-cream/30 transition-colors"
                  >
                    {t('hero.unlockButton')} →
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-0.5">
                  <div className="flex items-center justify-center gap-2 text-olive font-bold text-xs sm:text-sm">
                    <Unlock className="w-4 h-4 text-olive" />
                    <span>{t('hero.breakpointComplete')}</span>
                  </div>
                  <motion.button
                    data-testid="scroll-down-prompt-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleScrollDownToExplore}
                    className="w-full py-2.5 px-4 rounded-btn bg-olive text-cream font-bold text-xs sm:text-sm shadow-olive-md hover:bg-olive-dark transition-all flex items-center justify-center gap-2 animate-bounce cursor-pointer"
                  >
                    <span>{t('hero.scrollDownPrompt')}</span>
                    <ChevronDown className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
