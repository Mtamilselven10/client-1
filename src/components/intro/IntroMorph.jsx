import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import './IntroMorph.css';

/**
 * IntroMorph Component
 * Plays a cinematic 4-5s morph animation before revealing the Home section.
 * Runs once per browser session, respects prefers-reduced-motion, and provides an instant Skip button.
 */
export default function IntroMorph({ onComplete }) {
  const containerRef = useRef(null);
  const glowRef = useRef(null);

  // Phase 1: Combined Start Mark
  const startMarkRef = useRef(null);

  // Phase 2: Morph Split Layers
  const morphContainerRef = useRef(null);
  const topPartRef = useRef(null);
  const gandhiHeaderRef = useRef(null);
  const gandhiLettersRef = useRef(null);
  const sunDotRef = useRef(null);

  const leavesRef = useRef(null);

  const bottomPartRef = useRef(null);
  const storeWordmarkRef = useRef(null);
  const bagHandleRef = useRef(null);
  const cartWheelLeftRef = useRef(null);
  const cartWheelRightRef = useRef(null);

  // Phase 3: Final Brand Reveal
  const endFullLogoRef = useRef(null);
  const shineRef = useRef(null);

  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // 1. Lock document body scrolling while intro runs
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 2. Check prefers-reduced-motion: if user prefers reduced motion, skip intro immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.body.style.overflow = originalOverflow;
      if (onComplete) onComplete();
      return;
    }

    // 3. GSAP Timeline setup inside gsap.context for clean unmount & scoping
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          finishIntro();
        }
      });

      // Align layers at dead center using GSAP percentage offsets
      tl.set([startMarkRef.current, morphContainerRef.current, endFullLogoRef.current], {
        xPercent: -50,
        yPercent: -50,
        left: '50%',
        top: '50%'
      });

      /* =========================================================================
       * PHASE 1: LOGO APPEARS (~0.0s – 1.1s)
       * Image 1 centered on website background (#FAF7F2).
       * Fades and scales in gently (0.8s) with a subtle floating breathing motion.
       * ========================================================================= */
      tl.set([morphContainerRef.current, endFullLogoRef.current], { autoAlpha: 0 });
      tl.set(startMarkRef.current, { 
        autoAlpha: 0, 
        scale: 0.84, 
        y: 18, 
        transformOrigin: '50% 50%' 
      });
      tl.set(glowRef.current, { scale: 0.6, opacity: 0 });

      // Ambient warm radiant glow
      tl.to(glowRef.current, {
        opacity: 0.9,
        scale: 1.18,
        duration: 1.1,
        ease: 'power2.out'
      }, 0);

      // Start mark scale & fade in (0.8s)
      tl.to(startMarkRef.current, {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out'
      }, 0.1);

      // Subtle float breathing motion
      tl.to(startMarkRef.current, {
        y: -6,
        duration: 0.45,
        ease: 'sine.inOut'
      }, 0.9);

      /* =========================================================================
       * PHASE 2: MORPH SPLIT (~1.1s – 3.0s)
       * The merged start logo separates into distinct parts:
       * 
       * a) Golden "G" + sunflower petals detaches & morphs into "GANDHI" (top).
       *    Letters A-N-D-H-I unfold outward from "G" with expanding letter-spacing.
       *    The orange sun dot appears over the "I" with an elastic pop.
       * 
       * b) "S" + shopping cart detaches & morphs into the bold black "STORE" wordmark.
       *    Cart wheels slide into position, bag handle pops in with a bounce.
       * 
       * c) Green leaves flow/slide down and settle between "GANDHI" and "STORE".
       * ========================================================================= */
      
      // Detach start mark and activate morph split container
      tl.to(startMarkRef.current, {
        autoAlpha: 0,
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.in'
      }, 1.15);

      tl.to(morphContainerRef.current, {
        autoAlpha: 1,
        duration: 0.25,
        ease: 'power2.out'
      }, 1.18);

      // Initialize sub-elements at natural centered positions
      tl.set(topPartRef.current, { y: 15, scale: 0.96, autoAlpha: 0.8 });
      tl.set(gandhiHeaderRef.current, { autoAlpha: 0.9 });
      tl.set(gandhiLettersRef.current, { letterSpacing: '-0.04em', autoAlpha: 0.3 });
      tl.set(sunDotRef.current, { scale: 0, autoAlpha: 0 });

      tl.set(bottomPartRef.current, { y: -15, scale: 0.96, autoAlpha: 0.8 });
      tl.set(storeWordmarkRef.current, { autoAlpha: 0.9 });
      tl.set(bagHandleRef.current, { scale: 0, transformOrigin: '50% 100%' });
      tl.set(cartWheelLeftRef.current, { x: -28, rotation: -260, autoAlpha: 0 });
      tl.set(cartWheelRightRef.current, { x: 28, rotation: 260, autoAlpha: 0 });

      tl.set(leavesRef.current, { y: -18, scale: 0.85, autoAlpha: 0.3 });

      // 2a. GANDHI detachment & morph upward into place
      tl.to(topPartRef.current, {
        y: -22,
        scale: 1,
        autoAlpha: 1,
        duration: 0.95,
        ease: 'power3.out'
      }, 1.25);

      // Unfold typography letters outward
      tl.to(gandhiLettersRef.current, {
        letterSpacing: '0.14em',
        autoAlpha: 1,
        duration: 1.0,
        ease: 'power2.out'
      }, 1.3);

      // Sun dot pops over the "I"
      tl.to(sunDotRef.current, {
        scale: 1,
        autoAlpha: 1,
        duration: 0.65,
        ease: 'elastic.out(1.2, 0.45)'
      }, 1.7);

      // 2b. STORE detachment & morph downward into place
      tl.to(bottomPartRef.current, {
        y: 22,
        scale: 1,
        autoAlpha: 1,
        duration: 0.95,
        ease: 'power3.out'
      }, 1.25);

      // Bag handle pops in with bounce
      tl.to(bagHandleRef.current, {
        scale: 1,
        duration: 0.55,
        ease: 'back.out(2.2)'
      }, 1.65);

      // Cart wheels slide & roll into place
      tl.to([cartWheelLeftRef.current, cartWheelRightRef.current], {
        x: 0,
        rotation: 0,
        autoAlpha: 1,
        duration: 0.75,
        ease: 'power3.out'
      }, 1.5);

      // 2c. Green leaves slide down and settle right between GANDHI and STORE
      tl.to(leavesRef.current, {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.85,
        ease: 'power2.out'
      }, 1.4);

      /* =========================================================================
       * PHASE 3: FINAL REVEAL & TRANSITION INTO HOME (~3.0s – 4.7s)
       * Seamlessly locks into the pristine GANDHI STORE brand mark.
       * Holds for ~1.0s with an ambient shimmer, then smooth wipe/fade
       * into the Home section.
       * ========================================================================= */
      
      // Smooth lock into unified End Mark
      tl.to(morphContainerRef.current, {
        autoAlpha: 0,
        duration: 0.35,
        ease: 'power2.inOut'
      }, 2.85);

      tl.to(endFullLogoRef.current, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.45,
        ease: 'power2.out'
      }, 2.85);

      // Radiant golden glow pulse around the brand reveal
      tl.to(glowRef.current, {
        scale: 1.3,
        opacity: 0.95,
        duration: 0.8,
        ease: 'sine.inOut'
      }, 2.9);

      // Shimmer sweep across the final logo
      if (shineRef.current) {
        tl.fromTo(shineRef.current, 
          { xPercent: -120, opacity: 0 },
          { xPercent: 120, opacity: 0.75, duration: 0.95, ease: 'power2.inOut' },
          3.05
        );
      }

      // Hold brand reveal for ~1s (from 3.1s to 4.1s)
      // Followed by clean, elegant scale-up and fade transition to Home section
      tl.to([endFullLogoRef.current, glowRef.current], {
        scale: 1.06,
        autoAlpha: 0,
        filter: 'blur(8px)',
        duration: 0.65,
        ease: 'power3.inOut'
      }, 4.1);

      tl.to(containerRef.current, {
        autoAlpha: 0,
        duration: 0.35,
        ease: 'power2.in'
      }, 4.4);
    }, containerRef);

    return () => {
      // Cleanup GSAP animations and restore scroll
      ctx.revert();
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const finishIntro = () => {
    if (hasCompleted) return;
    setHasCompleted(true);
    document.body.style.overflow = '';
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    // Dismiss intro immediately and reveal Home
    finishIntro();
  };

  const baseUrl = import.meta.env.BASE_URL || '/';

  return (
    <div 
      ref={containerRef} 
      className="intro-morph-root" 
      aria-label="Gandhi Shop brand intro animation"
    >
      {/* Background warm radiant glow */}
      <div ref={glowRef} className="intro-ambient-glow" />

      {/* Main Centered Stage */}
      <div className="intro-stage">
        
        {/* PHASE 1: Combined Start Mark */}
        <div ref={startMarkRef} className="intro-layer flex items-center justify-center">
          <img 
            src={`${baseUrl}intro/start_trimmed.png`} 
            alt="Gandhi Shop Initial Mark"
            className="intro-start-mark"
          />
        </div>

        {/* PHASE 2: Separated Morph Split Stage */}
        <div ref={morphContainerRef} className="intro-layer w-full flex flex-col items-center justify-center">
          
          {/* 2a. GANDHI Header with Petals & Unfolding Lettering */}
          <div 
            ref={topPartRef} 
            className="relative flex flex-col items-center justify-center"
          >
            <div ref={gandhiHeaderRef} className="relative">
              <img 
                src={`${baseUrl}intro/end_gandhi.png`} 
                alt="Gandhi Brand Header"
                className="intro-end-gandhi"
              />
              {/* Orange Sun Dot pop over the "I" */}
              <div 
                ref={sunDotRef} 
                className="intro-sun-dot"
                style={{
                  top: '18%',
                  right: '10.5%'
                }}
                aria-hidden="true"
              />
            </div>
            
            {/* Spaced typography letters unfolding outward */}
            <div 
              ref={gandhiLettersRef}
              className="intro-gandhi-unfold font-serif font-bold text-amber-700/80 tracking-widest text-center"
              style={{
                fontSize: 'min(4vw, 22px)',
                marginTop: '-14px',
                textShadow: '0 1px 3px rgba(197, 160, 89, 0.4)'
              }}
            >
              G A N D H I
            </div>
          </div>

          {/* 2c. Green Leaves Flowing & Settling in Center */}
          <div 
            ref={leavesRef} 
            className="relative z-10 my-[-8px] flex items-center justify-center"
          >
            <img 
              src={`${baseUrl}intro/end_leaves.png`} 
              alt="Organic Leaves"
              className="intro-end-leaves"
            />
          </div>

          {/* 2b. STORE Wordmark with Bag Handle and Cart Wheels */}
          <div 
            ref={bottomPartRef} 
            className="relative flex flex-col items-center justify-center"
          >
            <div ref={storeWordmarkRef} className="relative">
              <img 
                src={`${baseUrl}intro/end_store.png`} 
                alt="Store Wordmark"
                className="intro-end-store"
              />
              
              {/* Bag Handle Pop Accent */}
              <div 
                ref={bagHandleRef}
                className="absolute pointer-events-none"
                style={{
                  top: '-12px',
                  left: '42%',
                  width: '36px',
                  height: '24px',
                  border: '3.5px solid #1A1A1A',
                  borderBottom: 'none',
                  borderRadius: '16px 16px 0 0'
                }}
                aria-hidden="true"
              />

              {/* Cart Wheels Roll Accent */}
              <div 
                ref={cartWheelLeftRef}
                className="intro-cart-wheel"
                style={{
                  bottom: '-8px',
                  left: '26%',
                  width: '18px',
                  height: '18px'
                }}
                aria-hidden="true"
              />
              <div 
                ref={cartWheelRightRef}
                className="intro-cart-wheel"
                style={{
                  bottom: '-8px',
                  right: '26%',
                  width: '18px',
                  height: '18px'
                }}
                aria-hidden="true"
              />
            </div>
          </div>

        </div>

        {/* PHASE 3: Pristine Final Brand Reveal */}
        <div 
          ref={endFullLogoRef} 
          className="intro-layer flex items-center justify-center relative overflow-hidden"
        >
          <img 
            src={`${baseUrl}intro/end_trimmed.png`} 
            alt="Gandhi Store Full Brand Identity"
            className="intro-end-full"
          />
          {/* Subtle light shimmer sweep */}
          <div 
            ref={shineRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.45) 50%, transparent 70%)',
              transform: 'skewX(-20deg)'
            }}
            aria-hidden="true"
          />
        </div>

      </div>

      {/* Small Skip Button in bottom-right corner */}
      <button 
        onClick={handleSkip} 
        className="intro-skip-btn"
        aria-label="Skip intro animation"
      >
        <span>Skip</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
