import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  Star, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Share2, 
  Check, 
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { loadProductsCatalog } from '../utils/excelParser';
import { formatCurrency, buildSingleProductWhatsAppUrl, getProductImageUrl } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useFlyToCart } from '../animations/useFlyToCart';
import { useReviews } from '../context/ReviewsContext';
import { SHOP_NAME } from '../config';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, translateCategory } = useLanguage();
  const { addToCart, isInCart, getProductQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const { triggerFlyToCart, triggerFlyToWishlist } = useFlyToCart();
  const { getProductReviewStats } = useReviews();
  

  const wishlistBtnRef = useRef(null);
  const [product, setProduct] = useState(location.state?.product || null);
  const reviewStats = product ? getProductReviewStats(product.id, product.name, product.rating, product.reviewsCount) : { rating: 4.8, reviewsCount: 0, reviews: [] };
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Image Hover Zoom State
  const [zoomStyle, setZoomStyle] = useState({ transform: 'scale(1)', transformOrigin: 'center center' });
  const imageContainerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!product) {
      setLoading(true);
      loadProductsCatalog()
        .then(catalog => {
          const found = catalog.find(p => String(p.id).toLowerCase() === String(id).toLowerCase());
          if (found) {
            setProduct(found);
          } else {
            setError(`Product "${id}" could not be found.`);
          }
        })
        .catch(err => {
          setError("Failed to load product specifications from catalog.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, product]);

  const handleMouseMove = (e) => {
    const container = imageContainerRef.current;
    if (!container) return;

    const { left, top, width, height } = container.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      display: 'block',
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      display: 'block',
      transform: 'scale(1)',
      transformOrigin: 'center center',
      transition: 'transform 0.3s ease-out'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.name} | ${SHOP_NAME}`,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast(t('productDetail.shareCopied') || 'Product link copied to clipboard', 'info');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-cream">
        <div className="w-10 h-10 border-3 border-olive/30 border-t-olive rounded-full animate-spin mb-4" />
        <p className="text-olive font-serif text-lg font-bold">Loading Product Details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-cream">
        <div className="max-w-md p-8 rounded-card bg-cream-light border border-olive/20 shadow-olive-md space-y-4">
          <h2 className="font-serif text-2xl font-bold text-ink">{t('productDetail.itemNotFound')}</h2>
          <p className="text-sm text-ink/75">{error || "The requested item is not currently listed in our catalog."}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-sm hover:bg-olive-dark transition-colors"
          >
            {t('productDetail.returnCatalog')}
          </button>
        </div>
      </div>
    );
  }

  const isWished = isInWishlist(product.id);
  const inCart = isInCart(product.id);
  const cartQty = getProductQuantity(product.id);
  const whatsAppOrderUrl = buildSingleProductWhatsAppUrl(product, quantity);

  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto bg-cream">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-ink/60 mb-6 flex-wrap">
        <NavLink to="/" className="hover:text-olive transition-colors">{t('productDetail.home')}</NavLink>
        <ChevronRight className="w-3.5 h-3.5 text-olive" />
        <NavLink to="/products" className="hover:text-olive transition-colors">{t('productDetail.products')}</NavLink>
        <ChevronRight className="w-3.5 h-3.5 text-olive" />
        <span className="text-olive truncate max-w-[200px]">{translateCategory(product.category)}</span>
        <ChevronRight className="w-3.5 h-3.5 text-olive" />
        <span className="text-ink truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-olive hover:text-olive-dark mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>{t('productDetail.backCatalog')}</span>
      </button>

      {/* Main Product Layout with Parallel Entrance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Interactive Zoomable Image */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="lg:col-span-6 space-y-4"
        >
          <div 
            ref={imageContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative aspect-square w-full rounded-card overflow-hidden bg-cream-deep border-2 border-olive/25 shadow-olive-md cursor-crosshair flex items-center justify-center p-4"
          >
            <img
              src={getProductImageUrl(product.image)}
              alt={product.name}
              style={zoomStyle}
              onError={(e) => {
                if (product.fallbackImage && e.currentTarget.src !== product.fallbackImage) {
                  e.currentTarget.src = product.fallbackImage;
                }
              }}
              className="w-full h-full object-cover rounded-lg pointer-events-none transition-transform duration-100 ease-out"
            />

            {/* Hover hint badge */}
            <div className="absolute bottom-4 left-4 bg-ink/70 backdrop-blur-xs text-cream text-[11px] px-3 py-1 rounded-full pointer-events-none">
              {t('productDetail.hoverZoom')}
            </div>

            {/* In stock badge */}
            <div className="absolute top-4 left-4 bg-olive text-cream text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cream animate-pulse" />
              <span>{product.inStock ? t('productDetail.freshInStock') : t('productDetail.limitedStock')}</span>
            </div>
          </div>

          {/* Quick Assurance Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-btn bg-cream-light border border-olive/15 text-center">
              <ShieldCheck className="w-5 h-5 text-olive mx-auto mb-1" />
              <div className="text-[11px] font-bold text-ink">{t('productDetail.pure100')}</div>
              <div className="text-[10px] text-ink/60">{t('productDetail.labTested')}</div>
            </div>
            <div className="p-3 rounded-btn bg-cream-light border border-olive/15 text-center">
              <Truck className="w-5 h-5 text-olive mx-auto mb-1" />
              <div className="text-[11px] font-bold text-ink">{t('productDetail.swiftDispatch')}</div>
              <div className="text-[10px] text-ink/60">{t('productDetail.within24h')}</div>
            </div>
            <div className="p-3 rounded-btn bg-cream-light border border-olive/15 text-center">
              <Sparkles className="w-5 h-5 text-olive mx-auto mb-1" />
              <div className="text-[11px] font-bold text-ink">{t('productDetail.artisanalCut')}</div>
              <div className="text-[10px] text-ink/60">{t('productDetail.woodPressed')}</div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Product Info & Actions */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="lg:col-span-6 space-y-6"
        >
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
                {translateCategory(product.category)} • {t('productDetail.code')}: {product.id}
              </span>
              <button
                onClick={handleShare}
                className="p-2 text-olive hover:bg-olive-soft rounded-full transition-colors"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars & Unit */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-btn bg-olive text-cream text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-cream text-cream" />
                <span>{reviewStats.rating.toFixed(1)}</span>
              </div>
              <NavLink 
                to={`/reviews?product=${encodeURIComponent(product.name)}`}
                className="text-xs text-olive font-semibold hover:underline"
              >
                ({reviewStats.reviewsCount} {t('productDetail.verifiedRatings')})
              </NavLink>
              <span className="text-xs text-olive font-bold px-2 py-0.5 rounded-full bg-olive-soft">
                {t('productDetail.pack')}: {product.unit}
              </span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-5 rounded-card bg-cream-light border border-olive/20 shadow-olive-sm space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl sm:text-4xl font-extrabold text-olive">
                {formatCurrency(product.price)}
              </span>
              {product.mrp > product.price && (
                <span className="text-base text-ink/50 line-through font-medium">
                  {formatCurrency(product.mrp)}
                </span>
              )}
              {product.mrp > product.price && (
                <span className="text-xs font-bold text-cream bg-olive px-2.5 py-1 rounded-full">
                  Save {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                </span>
              )}
            </div>
            <p className="text-xs text-ink/60">
              {t('productDetail.taxNote')}
            </p>
          </div>

          {/* Sensory Description */}
          <div className="space-y-2">
            <h3 className="font-serif text-base font-bold text-ink">{t('productDetail.tastingNotes')}</h3>
            <p className="text-sm text-ink/85 leading-relaxed bg-cream-deep/60 p-4 rounded-btn border border-olive/10">
              {product.description}
            </p>
          </div>

          {/* Specifications Box */}
          <div className="space-y-2">
            <h3 className="font-serif text-base font-bold text-ink">{t('productDetail.specifications')}</h3>
            <div className="p-4 rounded-btn bg-cream-light border border-olive/15 text-xs text-ink/80 space-y-2">
              <p className="leading-relaxed">{product.details}</p>
            </div>
          </div>

          {/* Quantity Stepper & Primary Actions */}
          <div className="pt-4 border-t border-olive/15 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/80">
                {t('productDetail.quantity')}
              </span>
              <div className="flex items-center rounded-btn bg-cream-light border border-olive/25 overflow-hidden shadow-xs">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-olive hover:bg-olive-soft transition-colors font-bold text-base"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-sm text-ink min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3.5 py-2 text-olive hover:bg-olive-soft transition-colors font-bold text-base"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Add to Cart Button */}
              <motion.button
                data-testid="detail-add-cart-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  triggerFlyToCart(imageContainerRef.current, product, 'image');
                  addToCart(product, quantity);
                }}
                className="w-full py-3.5 px-6 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-md hover:bg-olive-dark transition-colors flex items-center justify-center gap-2 border border-olive-dark focus-visible:ring-2 focus-visible:ring-olive cursor-pointer"
              >
                {inCart ? (
                  <>
                    <Check className="w-5 h-5 text-cream" />
                    <span>{t('productDetail.inCartAddMore', { qty: cartQty })}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 text-cream" />
                    <span>{t('productDetail.addToCart')} ({quantity})</span>
                  </>
                )}
              </motion.button>

              {/* Instant WhatsApp Order Button */}
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                href={whatsAppOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-btn border-1.5 border-olive text-olive font-bold text-sm hover:bg-olive-soft transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-olive"
              >
                <MessageCircle className="w-5 h-5 text-olive" />
                <span>{t('productDetail.orderWhatsApp')}</span>
              </motion.a>
            </div>

            {/* Wishlist Toggle Button */}
            <motion.button
              ref={wishlistBtnRef}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!isWished) {
                  triggerFlyToWishlist(wishlistBtnRef.current, product);
                }
                toggleWishlist(product);
              }}
              className={`w-full py-3 px-4 rounded-btn text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                isWished
                  ? 'bg-olive text-cream border-olive shadow-olive-sm'
                  : 'bg-cream-light text-olive border-olive/30 hover:border-olive hover:bg-olive-soft'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWished ? 'fill-cream text-cream' : 'text-olive'}`} />
              <span>{isWished ? t('productDetail.savedWishlist') : t('productDetail.saveWishlist')}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Customer Reviews for this Product */}
      <div className="mt-14 pt-8 border-t border-olive/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
              <span>Customer Reviews & Ratings</span>
              <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full bg-olive-soft text-olive">
                {reviewStats.reviewsCount} verified
              </span>
            </h2>
            <p className="text-xs text-ink/70 mt-1">
              Real customer feedback on delivery, product quality, service, and website usability.
            </p>
          </div>

          <NavLink
            to={`/reviews?product=${encodeURIComponent(product.name)}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-olive text-cream text-xs font-bold shadow-olive-xs hover:bg-olive-dark transition-colors self-start sm:self-auto"
          >
            <span>Write a Review for this Product</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        {reviewStats.reviews && reviewStats.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewStats.reviews.slice(0, 4).map((r) => (
              <div key={r.id} className="p-4 rounded-card bg-cream-light border border-olive/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-ink">{r.customerName}</span>
                  <div className="px-2 py-0.5 rounded bg-olive text-cream text-[11px] font-bold">
                    ★ {r.overallRating ? r.overallRating.toFixed(1) : "5.0"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-ink/70 bg-cream p-2 rounded border border-olive/10">
                  <div>Delivery: <strong className="text-olive">{r.deliveryRating}/5</strong></div>
                  <div>Quality: <strong className="text-olive">{r.qualityRating}/5</strong></div>
                  <div>Service: <strong className="text-olive">{r.serviceRating}/5</strong></div>
                  <div>Website: <strong className="text-olive">{r.websiteRating}/3</strong></div>
                </div>
                {r.comments && (
                  <p className="text-xs italic text-ink/80">"{r.comments}"</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-card bg-cream-light border border-olive/15 text-center space-y-2">
            <p className="text-xs text-ink/70">No specific reviews written for this product yet.</p>
            <NavLink
              to={`/reviews?product=${encodeURIComponent(product.name)}`}
              className="text-xs font-bold text-olive hover:underline inline-block"
            >
              Be the first to rate this product on the Reviews page →
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}