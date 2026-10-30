import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function FlipkartBannerMarquee() {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef({});

  // 6 media items: 2 videos + 4 images from the user's folder
  const bannerItems = [
    {
      id: 1,
      type: 'video',
      src: `${import.meta.env.BASE_URL}banners/1000196999.mp4`,
      badge: language === 'ta' ? 'நேரடி ஸ்டோர் காட்சி' : 'Live Store Tour',
      title: language === 'ta' ? 'காந்தி ஷாப் பாரம்பரிய மளிகை அங்காடி' : 'Gandhi Shop Authentic Grocery Experience',
      subtitle: language === 'ta' ? 'தூய மசாலா, எண்ணெய்கள் மற்றும் தினசரி சமையல் தேவைகள் அனைத்தும் ஒரே இடத்தில்.' : 'Pure spices, cold-pressed oils, and farm-fresh daily essentials in one trusted store.',
      tag: language === 'ta' ? 'புதிய இருப்பு 2026' : 'Fresh Stock Today',
      cta: language === 'ta' ? 'பொருட்களைப் பார்க்க' : 'Shop Provisions'
    },
    {
      id: 2,
      type: 'image',
      src: `${import.meta.env.BASE_URL}banners/1000196994.jpg`,
      badge: language === 'ta' ? 'அசல் அங்காடி முகப்பு' : 'Direct Storefront',
      title: language === 'ta' ? 'கிராமத்து நயமும் கலப்படமில்லா நம்பிக்கையும்' : 'Native Village Freshness & Authentic Quality',
      subtitle: language === 'ta' ? 'சுவையான பாரம்பரிய தின்பண்டங்கள் மற்றும் மளிகைப் பொருட்கள் நியாயமான விலையில்.' : 'Delicious traditional snacks, provisions, and kitchen supplies at genuine local pricing.',
      tag: language === 'ta' ? '100% இயற்கை தரம்' : '100% Authentic Quality',
      cta: language === 'ta' ? 'இப்போது ஆர்டர் செய்ய' : 'Order Now'
    },
    {
      id: 3,
      type: 'image',
      src: `${import.meta.env.BASE_URL}banners/1000196995.jpg`,
      badge: language === 'ta' ? 'மசாலா வகைகள்' : 'Pure Spice Collection',
      title: language === 'ta' ? 'ஆச்சி & சக்தி மசாலாக்கள் அசல் தொகுப்பு' : 'Aachi & Sakthi Authentic Masala Range',
      subtitle: language === 'ta' ? 'சாம்பார், கறி, மிளகாய், மஞ்சள் தூள் என உங்கள் சமையலுக்குத் தேவையான அனைத்தும்.' : 'Pure turmeric, chilli, sambar, and curry masalas ground for traditional recipes.',
      tag: language === 'ta' ? 'சிறப்பு சலுகைகள்' : 'Special Grocery Offers',
      cta: language === 'ta' ? 'மசாலா வாங்க' : 'Explore Masalas'
    },
    {
      id: 4,
      type: 'video',
      src: `${import.meta.env.BASE_URL}banners/1000197000.mp4`,
      badge: language === 'ta' ? 'அன்றாடத் தேவைகள்' : 'Everyday Grocery Video',
      title: language === 'ta' ? 'உங்கள் இல்லத்தின் அன்றாடத் தேவைக்கு நம்பகமான கடை' : 'Your Family’s Everyday Trusted Store',
      subtitle: language === 'ta' ? 'தூய தானியங்கள், சுத்தமான பருப்புகள் மற்றும் வீட்டுப் பராமரிப்புப் பொருட்கள்.' : 'Unadulterated grains, lentils, soaps, and home care items delivered fresh.',
      tag: language === 'ta' ? 'வாட்ஸ்அப் ஆர்டர் உண்டு' : 'Fast WhatsApp Delivery',
      cta: language === 'ta' ? 'முழு விபரம்' : 'View Catalog'
    },
    {
      id: 5,
      type: 'image',
      src: `${import.meta.env.BASE_URL}banners/1000196996.jpg`,
      badge: language === 'ta' ? 'வீட்டுப் பொருட்கள்' : 'Pantry & Household',
      title: language === 'ta' ? 'முழுமையான வீட்டு மளிகைப் பொருட்கள்' : 'Complete Household Essentials Under One Roof',
      subtitle: language === 'ta' ? 'சமையல் எண்ணெய், சுத்திகரிப்பு திரவங்கள், குளியல் சோப்புகள் மற்றும் பல.' : 'Cooking oils, laundry soaps, bath bars, and pantry provisions stocked daily.',
      tag: language === 'ta' ? 'தினசரி இருப்பு' : 'Daily Fresh Restock',
      cta: language === 'ta' ? 'பொருட்கள் வாங்க' : 'Shop Household'
    },
    {
      id: 6,
      type: 'image',
      src: `${import.meta.env.BASE_URL}banners/1000196997.jpg`,
      badge: language === 'ta' ? 'நம்பிக்கையான பாரம்பரியம்' : 'Heritage Legacy',
      title: language === 'ta' ? '1974 முதல் தொடரும் தூய நற்பணி' : 'Pure Care and Honesty Serving Since 1974',
      subtitle: language === 'ta' ? 'நீங்கள் உண்ணும் உணவில் தூய்மை இருந்தால் குடும்பத்தில் அமைதி நிலவும்.' : 'Pure and honest food sourced from local farmers for healthy happy families.',
      tag: language === 'ta' ? 'வாடிக்கையாளர் திருப்தி' : 'Customer Trusted',
      cta: language === 'ta' ? 'ஆரம்பிக்கலாம்' : 'Start Shopping'
    }
  ];

  // Flipkart Auto-play Slide Timer (advances every 4.8 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
    }, 4800);
    return () => clearInterval(interval);
  }, [isPaused, bannerItems.length]);

  // Autoplay video for active slide
  useEffect(() => {
    const activeItem = bannerItems[currentIndex];
    if (activeItem.type === 'video') {
      const vid = videoRefs.current[activeItem.id];
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    }
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + bannerItems.length) % bannerItems.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
  };

  const currentItem = bannerItems[currentIndex];

  // Marquee highlights items (infinite marquee loop)
  const marqueeCards = [
    ...bannerItems,
    ...bannerItems // doubled for seamless infinite marquee loop
  ];

  return (
    <section className="relative w-full bg-cream py-3 sm:py-5 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
        
        {/* ========================================================= */}
        {/* 1. FLIPKART-STYLE HERO BANNER CAROUSEL WITH AUTO-ADVANCE */}
        {/* ========================================================= */}
        <div 
          className="relative w-full h-[280px] xs:h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-olive-lg border border-olive/20 bg-ink"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          data-testid="flipkart-hero-carousel"
        >
          {/* Active Banner Slide with Cross-fade and Slide Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Media Element: Video or Image */}
              {currentItem.type === 'video' ? (
                <video
                  ref={(el) => { if (el) videoRefs.current[currentItem.id] = el; }}
                  src={currentItem.src}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={currentItem.src}
                  alt={currentItem.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Gradient Scrim for readable Flipkart-style typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />

              {/* Banner Text Content & CTA Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 md:p-12 text-cream z-10 max-w-3xl">
                {/* Badge Tag */}
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-olive text-cream shadow-olive-sm border border-cream/30">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>{currentItem.badge}</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-md text-cream border border-white/20">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{currentItem.tag}</span>
                  </span>
                </div>

                {/* Banner Headline */}
                <h2 className="font-serif text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-cream leading-tight drop-shadow-md mb-2">
                  {currentItem.title}
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-base md:text-lg text-cream/90 font-medium line-clamp-2 drop-shadow-sm mb-4 sm:mb-6 max-w-2xl leading-relaxed">
                  {currentItem.subtitle}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <NavLink
                    to="/products"
                    className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-btn bg-olive hover:bg-olive-dark text-cream font-bold text-xs sm:text-base shadow-olive-md hover:shadow-olive-lg transition-all duration-200 transform hover:-translate-y-0.5 border border-cream/30"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{currentItem.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </NavLink>

                  {/* Video Mute / Unmute Toggle for video slides */}
                  {currentItem.type === 'video' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-cream backdrop-blur-md border border-white/20 transition-colors"
                      title={isMuted ? "Unmute audio" : "Mute audio"}
                      aria-label="Toggle video audio"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Previous Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/75 text-cream backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Next Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/75 text-cream backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Slide Indicator Dots (Flipkart style) */}
          <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
            {bannerItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 sm:w-7 h-2 bg-cream'
                    : 'w-2 h-2 bg-cream/40 hover:bg-cream/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. INFINITE CONTINUOUS MARQUEE ANIMATION STRIP            */}
        {/* ========================================================= */}
        <div className="relative w-full pt-1">
          {/* Header row for Marquee strip */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
            <div className="flex items-center gap-2 text-olive font-serif text-sm sm:text-base font-bold">
              <span className="w-2 h-2 rounded-full bg-olive animate-ping" />
              <span>{language === 'ta' ? 'நேரடி காட்சிகளும் பொருட்களும்' : 'Live Store Media & Provision Showcase'}</span>
            </div>
            <NavLink
              to="/products"
              className="text-xs font-bold text-olive hover:text-olive-dark underline underline-offset-2 flex items-center gap-1"
            >
              <span>{language === 'ta' ? 'அனைத்தும் பார்க்க' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          {/* Smooth Continuous Marquee Container with fade edge masks */}
          <div 
            className="relative w-full overflow-hidden py-1"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Left and right fade gradient mask */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-cream to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-cream to-transparent z-10 pointer-events-none" />

            {/* Seamless Infinite Marquee Track using CSS / Framer Motion */}
            <motion.div
              className="flex items-center gap-3 sm:gap-4 w-max cursor-grab active:cursor-grabbing"
              animate={isPaused ? {} : { x: ['0%', '-50%'] }}
              transition={{
                repeat: Infinity,
                repeatType: 'loop',
                duration: 32,
                ease: 'linear'
              }}
            >
              {marqueeCards.map((item, idx) => (
                <NavLink
                  key={`${item.id}-${idx}`}
                  to="/products"
                  className="group relative w-56 sm:w-72 h-36 sm:h-44 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 shadow-olive-sm hover:shadow-olive-lg border border-olive/20 transition-all duration-300 hover:scale-[1.03] bg-cream-deep block"
                >
                  {/* Media Content */}
                  {item.type === 'video' ? (
                    <video
                      src={item.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Card Content Overlay */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between text-cream z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-olive text-cream uppercase tracking-wider border border-white/20">
                        {item.type === 'video' ? '▶ VIDEO' : 'PHOTO'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-cream backdrop-blur-xs">
                        {item.tag}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-cream line-clamp-1 drop-shadow-sm group-hover:text-cream-light">
                        {item.title}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-cream/80 line-clamp-1">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </NavLink>
              ))}
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
