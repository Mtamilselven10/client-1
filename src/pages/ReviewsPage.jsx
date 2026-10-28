import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Truck, 
  ShieldCheck, 
  HeartHandshake, 
  Monitor, 
  CheckCircle2, 
  MessageSquare, 
  Search, 
  Filter, 
  PlusCircle, 
  ArrowRight, 
  User, 
  Phone, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useReviews } from '../context/ReviewsContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { loadProductsCatalog } from '../utils/excelParser';
import { SEED_PRODUCTS } from '../data/seedProducts';
import StarRatingInput from '../components/reviews/StarRatingInput';
import StarRatingDisplay from '../components/reviews/StarRatingDisplay';

export default function ReviewsPage() {
  const { reviews, addReview, getStoreStats } = useReviews();
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  const location = useLocation();

  const [productsCatalog, setProductsCatalog] = useState(SEED_PRODUCTS);
  const [formOpen, setFormOpen] = useState(false);
  const formRef = useRef(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [websiteRating, setWebsiteRating] = useState(3);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  // Filter / Search State
  const [filterProduct, setFilterProduct] = useState('All');
  const [filterRating, setFilterRating] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Pre-fill product if passed in URL query e.g. /reviews?product=Aachi+Chilli+Powder
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prodParam = params.get('product');
    if (prodParam) {
      setSelectedProduct(prodParam);
      setFilterProduct(prodParam);
      setFormOpen(true);
    }
  }, [location.search]);

  // Load catalog for the product dropdown
  useEffect(() => {
    loadProductsCatalog()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProductsCatalog(data);
        }
      })
      .catch(() => {
        setProductsCatalog(SEED_PRODUCTS);
      });
  }, []);

  const storeStats = useStoreStats(getStoreStats, reviews);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      // Product Filter
      if (filterProduct !== 'All' && rev.productName !== filterProduct) {
        return false;
      }
      // Star Filter
      if (filterRating !== 'All') {
        const roundedOverall = Math.round(rev.overallRating);
        if (roundedOverall !== Number(filterRating)) {
          return false;
        }
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = rev.customerName?.toLowerCase().includes(q);
        const inProd = rev.productName?.toLowerCase().includes(q);
        const inComments = rev.comments?.toLowerCase().includes(q);
        if (!inName && !inProd && !inComments) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, filterProduct, filterRating, searchQuery]);

  // Unique product names that exist in reviews
  const reviewedProductsList = useMemo(() => {
    const set = new Set();
    reviews.forEach(r => {
      if (r.productName) set.add(r.productName);
    });
    return Array.from(set);
  }, [reviews]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalProductName = selectedProduct === '__custom__' 
      ? customProductName.trim() 
      : (selectedProduct || customProductName).trim();

    if (!customerName.trim()) {
      addToast(language === 'ta' ? 'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்' : 'Please enter your name', 'error');
      return;
    }
    if (!customerContact.trim()) {
      addToast(language === 'ta' ? 'தயவுசெய்து உங்கள் தொடர்பு விவரங்களை உள்ளிடவும்' : 'Please enter your contact details (phone or email)', 'error');
      return;
    }
    if (!finalProductName) {
      addToast(language === 'ta' ? 'தயவுசெய்து வாங்கிய பொருளைத் தேர்ந்தெடுக்கவும்' : 'Please select or enter the purchased product', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const matchedProd = productsCatalog.find(p => p.name.toLowerCase() === finalProductName.toLowerCase());

      const created = addReview({
        customerName,
        customerContact,
        productName: finalProductName,
        productId: matchedProd?.id || selectedProductId || null,
        deliveryRating,
        qualityRating,
        serviceRating,
        websiteRating,
        comments
      });

      setSuccessSubmitted(true);
      addToast(
        language === 'ta' 
          ? 'உங்கள் மதிப்பீடு வெற்றிகரமாக பதிவு செய்யப்பட்டது! நன்றி.' 
          : 'Your review has been permanently published! Thank you.',
        'success'
      );

      // Reset form
      setCustomerName('');
      setCustomerContact('');
      setSelectedProduct('');
      setCustomProductName('');
      setDeliveryRating(5);
      setQualityRating(5);
      setServiceRating(5);
      setWebsiteRating(3);
      setComments('');

      setTimeout(() => {
        setSuccessSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error(err);
      addToast('Error saving review. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    setFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto bg-cream min-h-screen">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink/65 mb-6">
        <NavLink to="/" className="hover:text-olive transition-colors">{t('nav.home')}</NavLink>
        <span>/</span>
        <span className="text-olive font-semibold">{t('nav.reviews') || 'Customer Ratings'}</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-olive/15 gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-soft border border-olive/20 text-olive text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-olive" />
            <span>{language === 'ta' ? 'நம்பகமான வாடிக்கையாளர் மதிப்புரைகள்' : '100% Authentic Customer Ratings'}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            {t('nav.reviews') || 'Customer Reviews & Ratings'}
          </h1>
          <p className="text-sm text-ink/75 mt-1.5 max-w-2xl leading-relaxed">
            {language === 'ta'
              ? 'எங்கள் விநியோகம், தூய்மை, வாடிக்கையாளர் கவனிப்பு மற்றும் இணையதள பயன்பாடு குறித்த வாடிக்கையாளர்களின் நேரடி அனுபவங்கள்.'
              : 'Verified feedback on delivery punctuality, product quality and trust, customer service, and website user-friendliness.'}
          </p>
        </div>

        <button
          data-testid="write-review-btn"
          onClick={scrollToForm}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-md hover:bg-olive-dark transition-all duration-200 cursor-pointer self-start md:self-auto shrink-0 group focus-visible:ring-2 focus-visible:ring-olive"
        >
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          <span>{language === 'ta' ? 'மதிப்பீடு எழுதவும்' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Trust & Rating Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {/* Overall Store Score */}
        <div className="sm:col-span-2 lg:col-span-1 rounded-card bg-cream-light border-2 border-olive/25 p-5 shadow-olive-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-olive">
            {language === 'ta' ? 'ஒட்டுமொத்த மதிப்பீடு' : 'Overall Store Rating'}
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-serif text-4xl sm:text-5xl font-extrabold text-olive">
              {storeStats.avgOverall.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-ink/60">/ 5.0</span>
          </div>
          <div className="space-y-1">
            <StarRatingDisplay rating={storeStats.avgOverall} maxStars={5} size="sm" />
            <p className="text-[11px] text-ink/70 font-medium">
              {language === 'ta' 
                ? `மொத்தம் ${storeStats.totalReviews} உண்மை வாடிக்கையாளர் பதிவுகள்` 
                : `Based on ${storeStats.totalReviews} verified ratings`}
            </p>
          </div>
        </div>

        {/* 1. Delivery Punctuality (5-Star) */}
        <div className="rounded-card bg-cream-light border border-olive/20 p-4 shadow-olive-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-ink">
            <div className="flex items-center gap-1.5 text-olive">
              <Truck className="w-4 h-4" />
              <span>{language === 'ta' ? 'விநியோக வேகம்' : 'Delivery Punctuality'}</span>
            </div>
            <span className="text-[10px] text-ink/50 uppercase font-semibold">5 Stars</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-serif text-ink">
              {storeStats.avgDelivery.toFixed(1)} <span className="text-xs font-normal text-ink/50">/ 5.0</span>
            </div>
            <StarRatingDisplay rating={storeStats.avgDelivery} maxStars={5} size="xs" />
          </div>
          <p className="text-[10px] text-ink/60">
            {language === 'ta' ? 'சரியான நேரத்தில் விநியோகம்' : 'On-time delivery performance'}
          </p>
        </div>

        {/* 2. Product Quality and Trust (5-Star) */}
        <div className="rounded-card bg-cream-light border border-olive/20 p-4 shadow-olive-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-ink">
            <div className="flex items-center gap-1.5 text-olive">
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'ta' ? 'தரம் & நம்பகத்தன்மை' : 'Quality & Trust'}</span>
            </div>
            <span className="text-[10px] text-ink/50 uppercase font-semibold">5 Stars</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-serif text-ink">
              {storeStats.avgQuality.toFixed(1)} <span className="text-xs font-normal text-ink/50">/ 5.0</span>
            </div>
            <StarRatingDisplay rating={storeStats.avgQuality} maxStars={5} size="xs" />
          </div>
          <p className="text-[10px] text-ink/60">
            {language === 'ta' ? 'கலப்படமற்ற பாரம்பரிய தரம்' : '100% unadulterated purity'}
          </p>
        </div>

        {/* 3. Customer Treatment & Service (5-Star) */}
        <div className="rounded-card bg-cream-light border border-olive/20 p-4 shadow-olive-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-ink">
            <div className="flex items-center gap-1.5 text-olive">
              <HeartHandshake className="w-4 h-4" />
              <span>{language === 'ta' ? 'வாடிக்கையாளர் கவனிப்பு' : 'Customer Service'}</span>
            </div>
            <span className="text-[10px] text-ink/50 uppercase font-semibold">5 Stars</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-serif text-ink">
              {storeStats.avgService.toFixed(1)} <span className="text-xs font-normal text-ink/50">/ 5.0</span>
            </div>
            <StarRatingDisplay rating={storeStats.avgService} maxStars={5} size="xs" />
          </div>
          <p className="text-[10px] text-ink/60">
            {language === 'ta' ? 'மரியாதையான நேரடி சேவை' : 'Helpful & courteous support'}
          </p>
        </div>

        {/* 4. Website User-Friendliness (3-Star scale!) */}
        <div className="rounded-card bg-cream-light border border-olive/20 p-4 shadow-olive-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-ink">
            <div className="flex items-center gap-1.5 text-olive">
              <Monitor className="w-4 h-4" />
              <span>{language === 'ta' ? 'இணையதள பயன்பாடு' : 'Website Usability'}</span>
            </div>
            <span className="text-[10px] text-olive font-bold uppercase">3-Star Scale</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-serif text-ink">
              {storeStats.avgWebsite.toFixed(1)} <span className="text-xs font-normal text-ink/50">/ 3.0</span>
            </div>
            <StarRatingDisplay rating={storeStats.avgWebsite} maxStars={3} size="xs" />
          </div>
          <p className="text-[10px] text-ink/60">
            {language === 'ta' ? 'வேகமான & எளிய தளம்' : 'Fast & easy shopping'}
          </p>
        </div>
      </div>

      {/* Review Submission Form Section */}
      <div ref={formRef} className="mb-12">
        <div className="rounded-card bg-cream-light border-2 border-olive/20 shadow-olive-md overflow-hidden">
          <div 
            onClick={() => setFormOpen(prev => !prev)}
            className="p-5 sm:p-6 bg-cream-deep/60 border-b border-olive/15 flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-olive-soft flex items-center justify-center text-olive border border-olive/20">
                <MessageSquare className="w-5 h-5 text-olive" />
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink group-hover:text-olive transition-colors">
                  {language === 'ta' ? 'உங்கள் அனுபவத்தை பதிவு செய்யுங்கள்' : 'Submit Your Customer Review'}
                </h2>
                <p className="text-xs text-ink/70">
                  {language === 'ta' 
                    ? 'உங்கள் மதிப்பீடு நிரந்தரமாக இந்த பக்கத்தில் சேமிக்கப்படும்.' 
                    : 'Your review and ratings will be permanently published on this page.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              data-testid="toggle-form-btn"
              className="text-xs font-bold text-olive hover:text-olive-dark underline underline-offset-4"
            >
              {formOpen ? (language === 'ta' ? 'படிவத்தை மூடு' : 'Close Form') : (language === 'ta' ? 'படிவத்தைத் திற' : 'Open Form')}
            </button>
          </div>

          <AnimatePresence>
            {formOpen && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="p-6 sm:p-8 space-y-6"
              >
                {successSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-btn bg-olive-soft border border-olive text-olive font-semibold text-sm flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-olive shrink-0" />
                    <span>
                      {language === 'ta'
                        ? 'உங்கள் மதிப்பீடு வெற்றிகரமாக சேர்க்கப்பட்டது!'
                        : 'Review submitted successfully! It is now permanently listed below.'}
                    </span>
                  </motion.div>
                )}

                {/* Customer Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-olive" />
                      <span>{language === 'ta' ? 'வாடிக்கையாளர் பெயர்' : 'Customer Name'}</span>
                      <span className="text-olive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={language === 'ta' ? 'எ.கா. கார்த்திக் சுப்பிரமணியன்' : 'e.g. Priya Ramanathan'}
                      className="w-full px-3.5 py-2.5 rounded-btn bg-cream border border-olive/30 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-olive transition-all"
                    />
                  </div>

                  {/* Customer Contact Details */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-olive" />
                      <span>{language === 'ta' ? 'தொடர்பு விவரங்கள் (தொலைபேசி / மின்னஞ்சல்)' : 'Contact Details (Phone / Email)'}</span>
                      <span className="text-olive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      placeholder={language === 'ta' ? 'எ.கா. +91 98401 23456 அல்லது priya@gmail.com' : 'e.g. +91 98401 23456 or priya@gmail.com'}
                      className="w-full px-3.5 py-2.5 rounded-btn bg-cream border border-olive/30 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-olive transition-all"
                    />
                  </div>
                </div>

                {/* Purchased Product Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-olive" />
                    <span>{language === 'ta' ? 'வாங்கிய பொருளின் பெயர்' : 'Product Purchased'}</span>
                    <span className="text-olive">*</span>
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedProduct(val);
                      const matched = productsCatalog.find(p => p.name === val);
                      if (matched) {
                        setSelectedProductId(matched.id);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-btn bg-cream border border-olive/30 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-olive transition-all"
                  >
                    <option value="">-- {language === 'ta' ? 'பொருளைத் தேர்ந்தெடுக்கவும்' : 'Select a purchased product from store'} --</option>
                    {productsCatalog.map((product) => (
                      <option key={product.id || product.name} value={product.name}>
                        {product.name} ({product.unit})
                      </option>
                    ))}
                    <option value="__custom__">+ {language === 'ta' ? 'வேறு பொருள் (பெயரை உள்ளிடவும்)' : 'Other Product (Enter name manually)'}</option>
                  </select>

                  {selectedProduct === '__custom__' && (
                    <input
                      type="text"
                      required
                      value={customProductName}
                      onChange={(e) => setCustomProductName(e.target.value)}
                      placeholder={language === 'ta' ? 'பொருளின் பெயரை உள்ளிடவும்' : 'Enter product name'}
                      className="w-full mt-2 px-3.5 py-2 rounded-btn bg-cream border border-olive/30 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-olive"
                    />
                  )}
                </div>

                {/* 4 Ratings Grid */}
                <div className="p-4 rounded-card bg-cream border border-olive/20 space-y-5">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-olive border-b border-olive/15 pb-2 flex items-center justify-between">
                    <span>{language === 'ta' ? 'மதிப்பீட்டு அளவுகோல்கள்' : 'Rating Parameters'}</span>
                    <span className="text-[11px] font-normal text-ink/65">
                      {language === 'ta' ? 'நட்சத்திரங்களை அழுத்தி மதிப்பிடவும்' : 'Click stars to select rating'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. Delivery Punctuality: 5-Star */}
                    <StarRatingInput
                      id="rating-delivery"
                      maxStars={5}
                      value={deliveryRating}
                      onChange={setDeliveryRating}
                      label={language === 'ta' ? '1. விநியோக வேகம் & நேரம்' : '1. Delivery Punctuality'}
                      subtitle={language === 'ta' ? 'பொருட்கள் குறித்த நேரத்தில் பாதுகாப்பாக வந்தடைந்ததா?' : 'Was your package delivered on time and safely?'}
                      labels={["Very Slow", "Delayed", "Acceptable", "Prompt", "Lightning Fast"]}
                    />

                    {/* 2. Product Quality & Trust: 5-Star */}
                    <StarRatingInput
                      id="rating-quality"
                      maxStars={5}
                      value={qualityRating}
                      onChange={setQualityRating}
                      label={language === 'ta' ? '2. தயாரிப்பு தரம் & நம்பகத்தன்மை' : '2. Product Quality & Trust'}
                      subtitle={language === 'ta' ? 'பொருளின் தூய்மை, சுவை மற்றும் புத்துணர்ச்சி' : 'Purity, aroma, natural taste, and freshness of the grocery'}
                      labels={["Poor Quality", "Average", "Authentic", "Superior", "100% Pure & Fresh"]}
                    />

                    {/* 3. Customer Treatment & Service: 5-Star */}
                    <StarRatingInput
                      id="rating-service"
                      maxStars={5}
                      value={serviceRating}
                      onChange={setServiceRating}
                      label={language === 'ta' ? '3. வாடிக்கையாளர் கவனிப்பு & சேவை' : '3. Customer Treatment / Service'}
                      subtitle={language === 'ta' ? 'ஆர்டர் மற்றும் வாட்ஸ்அப் தொடர்பில் எங்கள் ஆதரவு' : 'Courtesy, WhatsApp ordering assistance, and support'}
                      labels={["Unsatisfactory", "Fair", "Polite", "Very Helpful", "Exceptional Hospitality"]}
                    />

                    {/* 4. Website User-Friendliness: 3-Star Scale */}
                    <StarRatingInput
                      id="rating-website"
                      maxStars={3}
                      value={websiteRating}
                      onChange={setWebsiteRating}
                      label={language === 'ta' ? '4. இணையதள பயன்பாடு' : '4. Website User-Friendliness'}
                      subtitle={language === 'ta' ? 'இணையதளத்தில் தேடுதல், மொழி மாற்றம் மற்றும் ஆர்டர் செயல்முறை' : 'Navigation, search, Tamil language toggle, and cart speed'}
                      labels={["Needs Improvement", "Easy to Use", "Delightful & Fast"]}
                    />
                  </div>
                </div>

                {/* Written Feedback Comments */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink flex items-center justify-between">
                    <span>{language === 'ta' ? 'கருத்துக்கள் மற்றும் அனுபவம் (விருப்பத்திற்குட்பட்டது)' : 'Written Feedback / Review Comments (Optional)'}</span>
                    <span className="text-[11px] font-normal text-ink/60">{comments.length}/500</span>
                  </label>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={
                      language === 'ta' 
                        ? 'பொருளின் சுவை, பேக்கிங் மற்றும் உங்கள் அனுபவத்தைப் பகிர்ந்து கொள்ளுங்கள்...'
                        : 'Share your experience about freshness, packaging, aroma, or WhatsApp delivery...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-btn bg-cream border border-olive/30 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-olive transition-all resize-y"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <p className="text-[11px] text-ink/65">
                    {language === 'ta'
                      ? 'சமர்ப்பிக்கப்பட்ட மதிப்பீடுகள் உடனடியாக கீழே உள்ள பொதுப் பட்டியலில் காட்டப்படும்.'
                      : 'Submitted reviews are immediately updated on the public feed and product averages.'}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-md hover:bg-olive-dark transition-colors flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <span>{submitting ? 'Saving...' : (language === 'ta' ? 'மதிப்பீட்டைப் பதிவு செய்க' : 'Submit Review')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Public Reviews Feed Section */}
      <div className="space-y-6">
        {/* Controls: Search & Filters Bar */}
        <div className="p-4 rounded-card bg-cream-light border border-olive/20 shadow-olive-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-olive absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ta' ? 'மதிப்புரைகளில் தேடுக...' : 'Search by customer, product, or comment...'}
              className="w-full pl-9 pr-3.5 py-2 rounded-btn bg-cream border border-olive/25 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-olive"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
            {/* Filter by Product */}
            <div className="flex items-center gap-1.5 text-xs text-ink font-semibold">
              <Filter className="w-3.5 h-3.5 text-olive" />
              <span>{language === 'ta' ? 'பொருள்:' : 'Product:'}</span>
              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="px-2.5 py-1.5 rounded-btn bg-cream border border-olive/25 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-olive"
              >
                <option value="All">{language === 'ta' ? 'அனைத்து பொருட்கள்' : 'All Products'}</option>
                {reviewedProductsList.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Filter by Overall Star */}
            <div className="flex items-center gap-1.5 text-xs text-ink font-semibold">
              <span>{language === 'ta' ? 'மதிப்பீடு:' : 'Rating:'}</span>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="px-2.5 py-1.5 rounded-btn bg-cream border border-olive/25 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-olive"
              >
                <option value="All">{language === 'ta' ? 'அனைத்து' : 'All Ratings'}</option>
                <option value="5">5 {language === 'ta' ? 'நட்சத்திரங்கள்' : 'Stars'}</option>
                <option value="4">4 {language === 'ta' ? 'நட்சத்திரங்கள்' : 'Stars'}</option>
                <option value="3">3 {language === 'ta' ? 'நட்சத்திரங்கள்' : 'Stars'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="py-16 text-center rounded-card bg-cream-light border border-olive/20 p-8 space-y-4">
            <MessageSquare className="w-12 h-12 text-olive/40 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-ink">
              {language === 'ta' ? 'பொருந்திய மதிப்புரைகள் எதுவும் இல்லை' : 'No Reviews Found'}
            </h3>
            <p className="text-xs text-ink/70 max-w-sm mx-auto">
              {language === 'ta' 
                ? 'வடிகட்டிகளை மாற்றவும் அல்லது இந்த பொருளுக்கு முதல் மதிப்பீட்டை எழுதவும்.' 
                : 'Try clearing your filters or be the first to submit a review for this product.'}
            </p>
            <button
              onClick={() => {
                setFilterProduct('All');
                setFilterRating('All');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-olive hover:underline"
            >
              {language === 'ta' ? 'வடிகட்டிகளை மீட்டமைக்க' : 'Reset all filters'}
            </button>
          </div>
        ) : (
          <div data-testid="reviews-grid" className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredReviews.map((rev) => (
              <motion.div
                key={rev.id}
                data-testid="review-card"
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-card bg-cream-light border border-olive/20 p-5 shadow-olive-xs hover:border-olive/40 hover:shadow-olive-sm transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header: Customer Name & Purchased Product */}
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-olive/10 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-ink">{rev.customerName}</span>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-olive/10 text-olive text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-olive" />
                            <span>{language === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified'}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink/60 flex items-center gap-2">
                        <span>{maskContact(rev.customerContact)}</span>
                        <span>•</span>
                        <span>{formatReviewDate(rev.date)}</span>
                      </div>
                    </div>

                    {/* Overall Score Badge */}
                    <div className="px-2.5 py-1 rounded-btn bg-olive text-cream text-xs font-extrabold flex items-center gap-1 shadow-xs shrink-0">
                      <Star className="w-3.5 h-3.5 fill-cream text-cream" />
                      <span>{rev.overallRating ? rev.overallRating.toFixed(1) : '5.0'}</span>
                    </div>
                  </div>

                  {/* Purchased Product Tag */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-olive bg-olive-soft/70 px-2.5 py-1 rounded-md border border-olive/15">
                      <ShoppingBag className="w-3.5 h-3.5 text-olive shrink-0" />
                      <span className="truncate">{rev.productName}</span>
                    </div>
                    {rev.productId && (
                      <NavLink
                        to={`/products/${rev.productId}`}
                        className="text-[11px] text-olive font-bold hover:underline flex items-center gap-0.5"
                      >
                        <span>{language === 'ta' ? 'பொருளைப் பார்க்க' : 'View Product'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </NavLink>
                    )}
                  </div>
                </div>

                {/* 4 Star Ratings Breakdown */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-btn bg-cream-deep/60 border border-olive/10 text-xs">
                  {/* Delivery */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] text-ink/75 font-medium">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-olive" />
                        <span>{language === 'ta' ? 'விநியோகம்' : 'Delivery'}</span>
                      </span>
                      <span className="font-bold text-olive">{rev.deliveryRating}/5</span>
                    </div>
                    <StarRatingDisplay rating={rev.deliveryRating} maxStars={5} size="xs" />
                  </div>

                  {/* Quality & Trust */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] text-ink/75 font-medium">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-olive" />
                        <span>{language === 'ta' ? 'தரம் & நம்பிக்கை' : 'Quality'}</span>
                      </span>
                      <span className="font-bold text-olive">{rev.qualityRating}/5</span>
                    </div>
                    <StarRatingDisplay rating={rev.qualityRating} maxStars={5} size="xs" />
                  </div>

                  {/* Customer Service */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] text-ink/75 font-medium">
                      <span className="flex items-center gap-1">
                        <HeartHandshake className="w-3 h-3 text-olive" />
                        <span>{language === 'ta' ? 'சேவை' : 'Service'}</span>
                      </span>
                      <span className="font-bold text-olive">{rev.serviceRating}/5</span>
                    </div>
                    <StarRatingDisplay rating={rev.serviceRating} maxStars={5} size="xs" />
                  </div>

                  {/* Website Usability (3-Star Scale) */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] text-ink/75 font-medium">
                      <span className="flex items-center gap-1">
                        <Monitor className="w-3 h-3 text-olive" />
                        <span>{language === 'ta' ? 'தளம் (3★)' : 'Website (3★)'}</span>
                      </span>
                      <span className="font-bold text-olive">{rev.websiteRating}/3</span>
                    </div>
                    <StarRatingDisplay rating={rev.websiteRating} maxStars={3} size="xs" />
                  </div>
                </div>

                {/* Customer's Written Feedback Comments */}
                {rev.comments && (
                  <p className="text-xs text-ink/85 leading-relaxed italic bg-cream/70 p-3 rounded-btn border border-olive/10">
                    "{rev.comments}"
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: Custom hook to compute live store stats
function useStoreStats(getStoreStats, reviews) {
  return useMemo(() => {
    return getStoreStats();
  }, [reviews, getStoreStats]);
}

// Helper: Mask phone or email for privacy
function maskContact(contact) {
  if (!contact) return '';
  if (contact.includes('@')) {
    const parts = contact.split('@');
    const name = parts[0];
    const masked = name.length > 2 ? `${name.slice(0, 2)}***` : `${name}***`;
    return `${masked}@${parts[1]}`;
  }
  // Phone mask
  if (contact.length > 6) {
    return contact.slice(0, 7) + ' •••••';
  }
  return contact;
}

// Helper: Date formatter
function formatReviewDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}
