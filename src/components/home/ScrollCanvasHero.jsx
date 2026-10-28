import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { SHOP_NAME, SHOP_TAGLINE } from '../../config';

export default function ScrollCanvasHero() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [manifest, setManifest] = useState({
    frameCount: 282,
    prefix: 'ezgif-frame-',
    digits: 3,
    extension: 'jpg',
  });
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Cached frame images
  const framesRef = useRef([]);
  const currentFrameIndexRef = useRef(0);
  const targetFrameIndexRef = useRef(0);
  const animFrameIdRef = useRef(null);

  // Format frame filename
  const getFrameUrl = useCallback((index, meta) => {
    const padNum = String(index).padStart(meta.digits, '0');
    return `/frames/${meta.prefix}${padNum}.${meta.extension}`;
  }, []);

  // 1. Check reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 2. Draw frame on canvas with high DPI and Cover fit
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frames = framesRef.current;
    let img = frames[frameIndex];

    // Fallback to nearest loaded frame if current isn't loaded
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < 30; offset++) {
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
    ctx.fillStyle = 'rgba(43, 58, 44, 0.15)';
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }, []);

  // 3. Preload frames directly on mount
  useEffect(() => {
    let isCancelled = false;
    const totalFrames = 282;
    const images = new Array(totalFrames);
    let loadedCount = 0;
    let hasUnlocked = false;

    const unlock = () => {
      if (hasUnlocked || isCancelled) return;
      hasUnlocked = true;
      framesRef.current = images;
      setIsLoaded(true);
      // Immediately draw first frame
      requestAnimationFrame(() => {
        drawFrame(0);
      });
    };

    const baseUrl = import.meta.env.BASE_URL;
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const padNum = String(i).padStart(3, '0');
      img.src = `${baseUrl}frames/ezgif-frame-${padNum}.jpg`;

      img.onload = () => {
        if (isCancelled) return;
        images[i - 1] = img;
        loadedCount++;
        const pct = Math.round((loadedCount / totalFrames) * 100);
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

    // Fallback: unlock after 1.5s regardless of network speed
    const fallbackTimer = setTimeout(() => {
      unlock();
    }, 1500);

    return () => {
      isCancelled = true;
      clearTimeout(fallbackTimer);
    };
  }, [drawFrame]);

  // 4. RAF animation loop for smooth frame interpolation
  useEffect(() => {
    if (!isLoaded) return;

    const renderLoop = () => {
      const current = currentFrameIndexRef.current;
      const target = targetFrameIndexRef.current;

      // Smooth lerp scrubbing
      const diff = target - current;
      if (Math.abs(diff) > 0.05) {
        currentFrameIndexRef.current += diff * 0.28;
      } else {
        currentFrameIndexRef.current = target;
      }

      const frameToDraw = Math.min(
        manifest.frameCount - 1,
        Math.max(0, Math.round(currentFrameIndexRef.current))
      );

      drawFrame(frameToDraw);
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isLoaded, manifest.frameCount, drawFrame]);

  // 5. Scroll listener mapping scroll progress to frame index
  useEffect(() => {
    if (!isLoaded || prefersReducedMotion) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollableDist = container.scrollHeight - window.innerHeight;
      if (scrollableDist <= 0) return;

      // Progress from 0 to 1 based on how far container has scrolled
      const progress = Math.min(1, Math.max(0, -rect.top / scrollableDist));
      const targetIndex = progress * (manifest.frameCount - 1);
      targetFrameIndexRef.current = targetIndex;

      if (progress >= 0.98) {
        setIsComplete(true);
      } else {
        setIsComplete(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoaded, manifest.frameCount, prefersReducedMotion]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      drawFrame(Math.round(currentFrameIndexRef.current));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  // Skip animation button handler
  const handleExploreStore = () => {
    navigate('/products');
  };

  const handleScrollDown = () => {
    const container = containerRef.current;
    if (!container) return;
    const targetY = container.offsetTop + container.scrollHeight;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  // Parallel scroll depth transitions
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 200, damping: 28 });
  const textY = useTransform(smoothProgress, [0, 0.9], [0, -60]);
  const textOpacity = useTransform(smoothProgress, [0, 0.75, 0.98], [1, 0.9, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.9], [1, 0.96]);

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
              <span>GANDHI SHOP HERITAGE</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-olive">
              Preparing Your Experience
            </h2>

            <p className="text-ink text-sm sm:text-base font-medium">
              Loading authentic farm-to-table sequence ({loadProgress}%)
            </p>

            {/* Olive Progress Bar on Cream Deep Background */}
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
                Skip intro & go directly to shop →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pinned Scroll Container (Height 400vh for comfortable scrub distance) */}
      <div 
        ref={containerRef} 
        className="relative w-full"
        style={{ height: prefersReducedMotion ? '100vh' : '400vh' }}
      >
        {/* Sticky Fullscreen Canvas Viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-cream">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Editorial Overlay Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/40 pointer-events-none" />

          {/* Hero Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-between p-6 sm:p-12 text-center text-cream z-10 pointer-events-none">
            {/* Top Brand Pill with Logo */}
            <div className="pointer-events-auto pt-4 sm:pt-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cream/95 backdrop-blur-xs text-olive font-semibold text-xs sm:text-sm tracking-widest uppercase shadow-olive-md border border-olive/20">
                <img 
                  src={`${import.meta.env.BASE_URL}logo.png`} 
                  alt="Gandhi Shop" 
                  className="w-5 h-5 object-contain" 
                />
                <span>Pure & Authentic Since 1974</span>
              </div>
            </div>

            {/* Centered Editorial Titles & Explore Button with Parallel Parallax */}
            <motion.div 
              style={{ y: textY, opacity: textOpacity, scale: heroScale }}
              className="pointer-events-auto max-w-3xl space-y-5 px-4 my-auto"
            >
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-cream drop-shadow-md leading-[1.1]">
                Nourish Life with Pure Earthly Harvest
              </h1>
              <p className="text-base sm:text-xl font-medium text-cream/90 max-w-2xl mx-auto drop-shadow-sm leading-relaxed">
                Handpicked grains, stone-ground flours, wood-pressed oils, and royal hill spices sourced unadulterated from native farmers.
              </p>

              {/* Centered "Explore Store" Button with fluid spring interaction */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={handleExploreStore}
                  className="px-8 py-4 rounded-btn bg-olive text-cream font-bold text-base sm:text-lg shadow-olive-lg hover:bg-olive-dark transition-colors duration-200 flex items-center gap-3 border border-cream/30 focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2"
                >
                  <span>Explore Store</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Bottom Scroll Indicator */}
            <div className="pointer-events-auto pb-4 sm:pb-8 flex flex-col items-center gap-2">
              <button
                onClick={handleScrollDown}
                className="group flex flex-col items-center gap-1 text-xs sm:text-sm text-cream/80 hover:text-cream transition-colors font-medium tracking-wide"
                aria-label="Scroll to view next section"
              >
                <span>{isComplete ? 'Scroll down to discover more' : 'Scroll down to scrub harvest sequence'}</span>
                <div className="w-8 h-8 rounded-full bg-cream/20 flex items-center justify-center group-hover:bg-cream/30 transition-colors animate-bounce">
                  <ChevronDown className="w-4 h-4 text-cream" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
