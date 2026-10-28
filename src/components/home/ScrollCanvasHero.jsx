import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { SHOP_NAME, SHOP_TAGLINE } from '../../config';
import { useLanguage } from '../../context/LanguageContext';
import frameManifest from '../../home/frameManifest.js';
import homeHeroContent from '../../content/homeHero.js';

export default function ScrollCanvasHero() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const canvasRef = useRef(null);

  const TOTAL_FRAMES = frameManifest.totalFrames;
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFrameDisplay, setCurrentFrameDisplay] = useState(0);
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
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

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
    ctx.fillStyle = 'rgba(43, 58, 44, 0.12)';
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }, []);

  // Preload frames using auto-detected naming pattern
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
      img.src = frameManifest.getFrameUrl(i, baseUrl);

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
  }, [TOTAL_FRAMES, drawFrame]);

  // Smooth lerp frame scrubbing in RAF loop
  useEffect(() => {
    if (!isLoaded) return;

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const renderLoop = () => {
      if (isVisible) {
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
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isLoaded, drawFrame]);

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

  // Smooth native window scroll scrubbing - no scroll-lock or preventDefault
  useEffect(() => {
    if (!isLoaded || prefersReducedMotion) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      const progress = Math.min(1, Math.max(0, scrollY / heroHeight));
      targetFrameIndexRef.current = Math.round(progress * (TOTAL_FRAMES - 1));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLoaded, prefersReducedMotion, TOTAL_FRAMES]);

  // Compute text fade-out progress over the first 15% of frames
  const scrollRatio = TOTAL_FRAMES > 1 ? currentFrameDisplay / (TOTAL_FRAMES - 1) : 0;
  const fadeProgress = Math.min(1, scrollRatio / 0.15);
  const textOpacity = Math.max(0, 1 - fadeProgress);
  const textTranslateY = -fadeProgress * 20;

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
        aria-label="Interactive store animation"
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Soft Olive/Ink Editorial Overlay Scrim for WCAG AA Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-olive/15 to-ink/40 pointer-events-none" />

        {/* Hero Content Overlay: ONLY the two text lines and Explore Store button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-12 text-center text-cream z-10 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: textOpacity, 
              y: textTranslateY 
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              pointerEvents: textOpacity < 0.1 ? 'none' : 'auto',
              display: textOpacity <= 0 ? 'none' : 'flex'
            }}
            className="flex-col items-center max-w-4xl space-y-4 px-4"
          >
            {/* Line 1: Bold prominent headline using font-liber token */}
            <h1 
              data-testid="hero-headline"
              className="font-liber font-bold tracking-wider text-cream drop-shadow-xl leading-[1.08] uppercase"
              style={{
                fontSize: 'clamp(2.25rem, 6vw, 4.75rem)',
              }}
            >
              {language === 'ta' ? homeHeroContent.headlineTa : homeHeroContent.headline}
            </h1>

            {/* Line 2: Bold sentence beneath headline, noticeably smaller */}
            <p 
              data-testid="hero-subheading"
              className="font-sans font-bold text-cream/95 drop-shadow-md leading-relaxed tracking-normal max-w-2xl mx-auto"
              style={{
                fontSize: 'clamp(1.125rem, 2.5vw, 1.75rem)',
              }}
            >
              {language === 'ta' ? homeHeroContent.subheadingTa : homeHeroContent.subheading}
            </p>

            {/* Explore Store Button */}
            <div className="pt-4 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={handleExploreStore}
                className="px-8 py-3.5 rounded-btn bg-olive text-cream font-bold text-sm sm:text-base shadow-olive-lg hover:bg-olive-dark transition-colors duration-200 flex items-center gap-2.5 border border-cream/30 focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 cursor-pointer"
              >
                <span>{language === 'ta' ? homeHeroContent.exploreButtonTextTa : homeHeroContent.exploreButtonText}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Scroll Down Indicator */}
          <div className="pointer-events-auto pb-4 sm:pb-6">
            <button
              onClick={handleScrollDownToExplore}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cream/90 hover:bg-cream text-olive font-bold text-xs uppercase tracking-wider shadow-olive-md transition-all duration-200 hover:scale-105"
            >
              <span>{t('hero.exploreBtn')}</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
