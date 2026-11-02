import React from 'react';
import { NavLink } from 'react-router-dom';
import { RotateCcw, ArrowRight, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import OrdersHistoryDashboard from '../components/buyAgain/OrdersHistoryDashboard';

export default function OrdersPage() {
  const { t } = useLanguage();

  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto bg-cream min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-olive/15 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-olive flex items-center gap-1.5 mb-1">
            <RotateCcw className="w-3.5 h-3.5 text-olive" />
            <span>{t('buyAgain.pageBadge') || 'Pantry Restock & Order History'}</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink mt-1">
            {t('buyAgain.pageTitle') || 'Buy Again & Past Orders'}
          </h1>
          <p className="text-sm text-ink/75 mt-1 max-w-2xl">
            {t('buyAgain.pageSubtitle') || 'Easily restock regular household groceries and access your past WhatsApp orders in one convenient place.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/products"
            className="px-4 py-2 rounded-xl bg-olive/10 hover:bg-olive/20 text-olive text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('buyAgain.browseCatalog') || 'Browse Catalog'}</span>
          </NavLink>
        </div>
      </div>

      {/* Main Dashboard */}
      <OrdersHistoryDashboard />
    </div>
  );
}
