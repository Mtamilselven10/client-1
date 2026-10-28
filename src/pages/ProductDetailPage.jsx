import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, NavLink } from 'react-router-dom';
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
import { SHOP_NAME } from '../config';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, isInCart, getProductQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(location.state?.product || null);
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
      addToast('Product link copied to clipboard', 'info');
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
          <h2 className="font-serif text-2xl font-bold text-ink">Item Not Found</h2>
          <p className="text-sm text-ink/75">{error || "The requested item is not currently listed in our catalog."}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-sm hover:bg-olive-dark transition-colors"
          >
            Return to Products Catalog
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
        <NavLink to="/" className="hover:text-olive transition-colors">Home</NavLink>
        <ChevronRight className="w-3.5 h-3.5 text-olive" />
        <NavLink to="/products" className="hover:text-olive transition-colors">Products</NavLink>
        <ChevronRight className="w-3.5 h-3.5 text-olive" />
        <span className="text-olive truncate max-w-[200px]">{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-olive" />
        <span className="text-ink truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-olive hover:text-olive-dark mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to catalog</span>
      </button>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Interactive Zoomable Image */}
        <div className="lg:col-span-6 space-y-4">
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
              Hover to zoom details
            </div>

            {/* In stock badge */}
            <div className="absolute top-4 left-4 bg-olive text-cream text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cream animate-pulse" />
              <span>{product.inStock ? 'Fresh Batch in Stock' : 'Limited Stock'}</span>
            </div>
          </div>

          {/* Quick Assurance Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-btn bg-cream-light border border-olive/15 text-center">
              <ShieldCheck className="w-5 h-5 text-olive mx-auto mb-1" />
              <div className="text-[11px] font-bold text-ink">100% Pure</div>
              <div className="text-[10px] text-ink/60">Lab tested</div>
            </div>
            <div className="p-3 rounded-btn bg-cream-light border border-olive/15 text-center">
              <Truck className="w-5 h-5 text-olive mx-auto mb-1" />
              <div className="text-[11px] font-bold text-ink">Swift Dispatch</div>
              <div className="text-[10px] text-ink/60">Within 24 Hours</div>
            </div>
            <div className="p-3 rounded-btn bg-cream-light border border-olive/15 text-center">
              <Sparkles className="w-5 h-5 text-olive mx-auto mb-1" />
              <div className="text-[11px] font-bold text-ink">Artisanal Cut</div>
              <div className="text-[10px] text-ink/60">Wood-pressed</div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
                {product.category} • Code: {product.id}
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
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-ink/70 font-semibold">
                ({product.reviewsCount} verified customer ratings)
              </span>
              <span className="text-xs text-olive font-bold px-2 py-0.5 rounded-full bg-olive-soft">
                Pack: {product.unit}
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
              Price includes all applicable GST and statutory charges. Free delivery above ₹499.
            </p>
          </div>

          {/* Sensory Description */}
          <div className="space-y-2">
            <h3 className="font-serif text-base font-bold text-ink">Heritage Tasting & Sourcing Notes</h3>
            <p className="text-sm text-ink/85 leading-relaxed bg-cream-deep/60 p-4 rounded-btn border border-olive/10">
              {product.description}
            </p>
          </div>

          {/* Specifications Box */}
          <div className="space-y-2">
            <h3 className="font-serif text-base font-bold text-ink">Detailed Specifications</h3>
            <div className="p-4 rounded-btn bg-cream-light border border-olive/15 text-xs text-ink/80 space-y-2">
              <p className="leading-relaxed">{product.details}</p>
            </div>
          </div>

          {/* Quantity Stepper & Primary Actions */}
          <div className="pt-4 border-t border-olive/15 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/80">
                Quantity
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
              <button
                onClick={() => addToCart(product, quantity)}
                className="w-full py-3.5 px-6 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-md hover:bg-olive-dark active:scale-98 transition-all flex items-center justify-center gap-2 border border-olive-dark focus-visible:ring-2 focus-visible:ring-olive"
              >
                {inCart ? (
                  <>
                    <Check className="w-5 h-5 text-cream" />
                    <span>In Cart ({cartQty}) • Add More</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 text-cream" />
                    <span>Add to Cart ({quantity})</span>
                  </>
                )}
              </button>

              {/* Instant WhatsApp Order Button */}
              <a
                href={whatsAppOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-btn border-1.5 border-olive text-olive font-bold text-sm hover:bg-olive-soft transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-olive"
              >
                <MessageCircle className="w-5 h-5 text-olive" />
                <span>Order via WhatsApp</span>
              </a>
            </div>

            {/* Wishlist Toggle Button */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`w-full py-3 px-4 rounded-btn text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                isWished
                  ? 'bg-olive text-cream border-olive shadow-olive-sm'
                  : 'bg-cream-light text-olive border-olive/30 hover:border-olive hover:bg-olive-soft'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWished ? 'fill-cream text-cream' : 'text-olive'}`} />
              <span>{isWished ? 'Saved to Your Wishlist (Click to remove)' : 'Add to Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
