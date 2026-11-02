import React from 'react';
import { NavLink } from 'react-router-dom';
import { Check, Trash2, Plus, Minus, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { formatCurrency, getProductImageUrl } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useFlyToCart } from '../../animations/useFlyToCart';

export default function ShoppingListItem({
  item,
  onToggleComplete,
  onUpdateQuantity,
  onRemove
}) {
  const { addToCart, isInCart, getProductQuantity } = useCart();
  const { triggerFlyToCart } = useFlyToCart();

  const product = item.product || item;
  const isCompleted = Boolean(item.completed);
  const inStock = product.inStock !== false;
  const inCart = isInCart(product.id);
  const cartQty = getProductQuantity(product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!inStock) return;
    triggerFlyToCart(e.currentTarget, product, 'card');
    addToCart(product, item.quantity || 1);
  };

  return (
    <div 
      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${
        isCompleted 
          ? 'bg-cream-deep/40 border-olive/15 opacity-70' 
          : 'bg-cream-light border-olive/20 hover:border-olive/40 shadow-olive-xs'
      }`}
    >
      {/* Left: Completion Checkbox + Product Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Toggle Complete Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(product.id)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
            isCompleted 
              ? 'bg-olive border-olive text-cream' 
              : 'border-olive/40 bg-cream hover:border-olive'
          }`}
          aria-label={isCompleted ? `Mark ${product.name} as incomplete` : `Mark ${product.name} as complete`}
        >
          {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Product Image */}
        <NavLink 
          to={`/products/${product.id}`}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-cream-deep p-1 shrink-0 overflow-hidden border border-olive/15 block"
        >
          <img
            src={getProductImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover rounded"
            onError={(e) => {
              if (product.fallbackImage && e.currentTarget.src !== product.fallbackImage) {
                e.currentTarget.src = product.fallbackImage;
              }
            }}
          />
        </NavLink>

        {/* Product Details */}
        <div className="min-w-0 flex-1">
          <NavLink 
            to={`/products/${product.id}`}
            className={`font-serif text-sm sm:text-base font-bold text-ink hover:text-olive transition-colors block truncate ${
              isCompleted ? 'line-through text-ink/60' : ''
            }`}
          >
            {product.name}
          </NavLink>

          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-ink/70">
            <span className="font-serif font-extrabold text-olive">
              {formatCurrency(product.price)}
            </span>
            {product.unit && (
              <span className="text-[11px] text-ink/60">({product.unit})</span>
            )}
            {!inStock && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quantity Stepper + Item Total + Cart + Delete */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-olive/10">
        
        {/* Quantity Stepper */}
        <div className="flex items-center gap-1.5 bg-cream border border-olive/20 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onUpdateQuantity(product.id, (item.quantity || 1) - 1)}
            className="w-7 h-7 rounded flex items-center justify-center text-olive hover:bg-olive-soft transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-6 text-center font-bold text-xs text-ink">
            {item.quantity || 1}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(product.id, (item.quantity || 1) + 1)}
            className="w-7 h-7 rounded flex items-center justify-center text-olive hover:bg-olive-soft transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Calculated Line Total */}
        <div className="w-20 text-right font-serif text-sm sm:text-base font-black text-ink">
          {formatCurrency((product.price || 0) * (item.quantity || 1))}
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`px-3 py-1.5 rounded-btn font-bold text-xs flex items-center gap-1.5 shadow-olive-xs transition-all cursor-pointer ${
            !inStock 
              ? 'bg-ink/10 text-ink/40 cursor-not-allowed'
              : inCart
              ? 'bg-cream border border-olive text-olive hover:bg-olive-soft'
              : 'bg-olive text-cream hover:bg-olive-dark active:scale-95'
          }`}
          title={inCart ? `In cart (${cartQty})` : `Add ${product.name} to cart`}
        >
          {inCart ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-olive" />
              <span className="hidden xs:inline">In Cart ({cartQty})</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Add</span>
            </>
          )}
        </button>

        {/* Delete Item Button */}
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          className="p-1.5 rounded-lg text-ink/40 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
          title="Remove from list"
          aria-label={`Remove ${product.name} from list`}
        >
          <Trash2 className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
