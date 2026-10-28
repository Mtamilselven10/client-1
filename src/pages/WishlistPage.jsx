import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto bg-cream">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-olive/15 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
            Curated For You
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink mt-1">
            Your Wishlist ({wishlist.length})
          </h1>
          <p className="text-sm text-ink/75 mt-1">
            Pure staples and provisions saved for your next harvest order.
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs font-bold text-olive hover:text-olive-dark underline underline-offset-4 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto rounded-card bg-cream-light border border-olive/20 p-8 space-y-5 shadow-olive-sm">
          <div className="w-16 h-16 rounded-full bg-olive-soft flex items-center justify-center mx-auto text-olive">
            <Heart className="w-8 h-8 text-olive" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-ink">Your Wishlist is Empty</h2>
            <p className="text-sm text-ink/75 leading-relaxed">
              Explore our fresh harvest catalog and click the heart icon on any product to save it here for later.
            </p>
          </div>
          <NavLink
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-md hover:bg-olive-dark transition-colors"
          >
            <span>Explore Store</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      ) : (
        /* Wishlist Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="rounded-card overflow-hidden bg-cream-light border border-olive/20 shadow-olive-sm flex flex-col justify-between group hover:border-olive transition-all"
            >
              {/* Image & Remove Action */}
              <div 
                onClick={() => navigate(`/products/${item.id}`, { state: { product: item } })}
                className="relative aspect-square w-full bg-cream-deep p-3 cursor-pointer overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(item.id);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cream/90 backdrop-blur-xs flex items-center justify-center text-olive hover:text-olive-dark border border-olive/20 shadow-xs hover:scale-110 transition-all"
                  aria-label={`Remove ${item.name} from wishlist`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 bg-ink/75 backdrop-blur-xs text-cream text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  {item.unit}
                </div>
              </div>

              {/* Details & Action */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-olive font-semibold mb-1">
                    <span className="truncate max-w-[130px]">{item.category}</span>
                    <div className="flex items-center gap-1 text-ink">
                      <Star className="w-3 h-3 fill-olive text-olive" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  <h3 
                    onClick={() => navigate(`/products/${item.id}`, { state: { product: item } })}
                    className="font-serif font-bold text-ink text-base line-clamp-2 leading-snug cursor-pointer group-hover:text-olive transition-colors"
                  >
                    {item.name}
                  </h3>

                  <p className="mt-1 text-xs text-ink/70 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-olive/10 space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-lg font-extrabold text-olive">
                      {formatCurrency(item.price)}
                    </span>
                    {item.mrp > item.price && (
                      <span className="text-xs text-ink/50 line-through">
                        {formatCurrency(item.mrp)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={() => addToCart(item, 1)}
                    className="w-full py-2.5 px-4 rounded-btn bg-olive text-cream font-bold text-xs shadow-olive-sm hover:bg-olive-dark transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
