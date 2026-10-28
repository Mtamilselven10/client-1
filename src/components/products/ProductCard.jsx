import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, isInCart, getProductQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWished = isInWishlist(product.id);
  const inCart = isInCart(product.id);
  const cartQty = getProductQuantity(product.id);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`, { state: { product } });
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const discountPercent = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  return (
    <div
      data-testid="product-card"
      onClick={handleCardClick}
      className="group cursor-pointer rounded-card overflow-hidden bg-cream-light border border-olive/20 shadow-olive-sm hover:shadow-olive-md hover:border-olive transition-all duration-300 flex flex-col justify-between"
    >
      {/* Product Image Box */}
      <div className="relative aspect-square w-full overflow-hidden bg-cream-deep p-3 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover rounded-md transition-transform duration-500 group-hover:scale-105"
        />

        {/* Wishlist Heart Toggle Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-cream/90 backdrop-blur-xs flex items-center justify-center text-olive border border-olive/20 shadow-olive-sm hover:scale-110 active:scale-95 transition-all z-10 focus-visible:ring-2 focus-visible:ring-olive"
          aria-label={isWished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isWished ? 'fill-olive text-olive' : 'text-olive'
            }`}
          />
        </button>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-olive text-cream text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {discountPercent}% OFF
          </div>
        )}

        {/* Unit badge */}
        <div className="absolute bottom-3 left-3 bg-ink/75 backdrop-blur-xs text-cream text-[10px] font-semibold px-2 py-0.5 rounded-md">
          {product.unit}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-ink/70 mb-1">
            <span className="font-medium truncate max-w-[140px] text-olive">
              {product.category}
            </span>
            <div className="flex items-center gap-1 font-semibold text-ink">
              <Star className="w-3.5 h-3.5 fill-olive text-olive" />
              <span>{product.rating}</span>
              <span className="text-ink/50 text-[11px]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-serif font-bold text-ink text-base line-clamp-2 leading-snug group-hover:text-olive transition-colors">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="mt-1 text-xs text-ink/75 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-2 border-t border-olive/10 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-lg font-extrabold text-olive">
                {formatCurrency(product.price)}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs text-ink/50 line-through">
                  {formatCurrency(product.mrp)}
                </span>
              )}
            </div>
            <div className="text-[10px] text-ink/60 font-medium">Inclusive of taxes</div>
          </div>

          {/* Add to Cart Olive Button */}
          <button
            onClick={handleAddToCart}
            className={`px-3.5 py-2 rounded-btn font-semibold text-xs tracking-wide shadow-olive-sm transition-all duration-200 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-olive ${
              inCart
                ? 'bg-olive text-cream hover:bg-olive-dark'
                : 'bg-olive text-cream hover:bg-olive-dark active:scale-95'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5 text-cream" />
                <span>In Cart ({cartQty})</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 text-cream" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
