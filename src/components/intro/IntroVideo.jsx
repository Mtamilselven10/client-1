import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import './IntroVideo.css';

/**
 * CONFIGURATION & TIMINGS:
 * - FADE_OUT_DURATION_MS: Duration (ms) of the overlay opacity fade-out before unmounting (default 500ms).
 * - SAFETY_TIMEOUT_MS: Maximum time (ms) before forcing completion if the video stalls or hangs (default 10000ms / 10s).
 */
const FADE_OUT_DURATION_MS = 500; // <-- Change fade duration here (must match IntroVideo.css transition)
const SAFETY_TIMEOUT_MS = 10000;  // <-- Change safety fallback timeout here (default 10s)

export default function IntroVideo({ onComplete }) {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const isFinishedRef = useRef(false);

  // Smooth completion handler with fade-out
  const handleFinish = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    // Trigger CSS opacity fade-out
    setIsFadingOut(true);

    // After fade transition finishes, notify parent to unmount and unlock
    setTimeout(() => {
      document.body.style.overflow = '';
      if (onComplete) onComplete();
    }, FADE_OUT_DURATION_MS);
  }, [onComplete]);

  useEffect(() => {
    // 1. Lock document body scrolling while intro runs
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 2. Check prefers-reduced-motion: if enabled, skip intro immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.body.style.overflow = originalOverflow;
      if (onComplete) onComplete();
      return;
    }

    // 3. Set safety timeout in case the video stalls or hangs
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, SAFETY_TIMEOUT_MS);

    // 4. Ensure video starts at 0:00 and handle autoplay promise
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Autoplay prevented or failed, skipping intro video:', error);
          handleFinish();
        });
      }
    }

    return () => {
      clearTimeout(safetyTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, [handleFinish, onComplete]);

  // Handle when video data is ready to play to avoid flicker
  const handleReady = () => {
    setIsReady(true);
  };

  const baseUrl = import.meta.env.BASE_URL || '/';
  const videoSrc = `${baseUrl}intro.mp4`;

  return (
    <div 
      className={`intro-video-overlay ${isFadingOut ? 'is-fading-out' : ''}`}
      aria-label="Gandhi Shop brand intro video"
    >
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        playsInline
        preload="auto"
        onCanPlayThrough={handleReady}
        onLoadedData={handleReady}
        onEnded={handleFinish}
        onError={handleFinish} // If video fails to load, gracefully skip to Home
        className={`intro-video-element ${isReady ? 'is-ready' : ''}`}
      />

      {/* Skip Button */}
      <button 
        onClick={handleFinish} 
        className="intro-video-skip-btn"
        aria-label="Skip intro video"
      >
        <span>Skip</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
