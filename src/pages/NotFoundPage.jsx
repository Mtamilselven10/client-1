import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Home, ShoppingBag } from 'lucide-react';
import { SHOP_NAME } from '../config';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-cream">
      <div className="max-w-md w-full p-8 rounded-card bg-cream-light border-2 border-olive/25 text-center shadow-olive-md space-y-6">
        <div className="w-16 h-16 rounded-card bg-cream-deep p-2 border border-olive/20 shadow-olive-sm flex items-center justify-center mx-auto">
          <img 
            src={`${import.meta.env.BASE_URL}logo.png`} 
            alt={SHOP_NAME} 
            className="w-full h-full object-contain" 
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-olive">
            Page Not Found • 404
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink">
            A Stray Seed in the Wind
          </h1>
          <p className="text-sm text-ink/75 leading-relaxed">
            The page you are looking for does not exist or may have been relocated in our pantry shelves.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <NavLink
            to="/"
            className="w-full sm:w-auto px-5 py-3 rounded-btn bg-olive text-cream font-bold text-xs shadow-olive-sm hover:bg-olive-dark transition-colors inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-cream" />
            <span>Return Home</span>
          </NavLink>

          <NavLink
            to="/products"
            className="w-full sm:w-auto px-5 py-3 rounded-btn border border-olive text-olive font-bold text-xs hover:bg-olive-soft transition-colors inline-flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-olive" />
            <span>Browse Products</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
