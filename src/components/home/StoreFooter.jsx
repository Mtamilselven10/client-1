import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Heart,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { 
  SHOP_NAME, 
  SHOP_TAGLINE, 
  STORE_ADDRESS, 
  WORKING_HOURS, 
  CUSTOMER_CARE_PHONES, 
  CUSTOMER_CARE_EMAIL,
  WHATSAPP_NUMBER,
  GOOGLE_MAP_URL
} from '../../config';
import { useLanguage } from '../../context/LanguageContext';

export default function StoreFooter() {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-olive-dark text-cream pt-10 pb-16 px-4 sm:px-8 border-t-2 border-cream/20">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Brand & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`} 
                alt={t('brand.name')} 
                className="w-8 h-8 object-contain shrink-0" 
              />
              <span className="font-serif text-2xl font-black tracking-tight text-cream">
                {t('brand.name')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cream/15 text-cream border border-cream/20">
                Est. 1974
              </span>
            </div>
            <p className="text-sm text-cream/75 leading-relaxed">
              {language === 'ta' 
                ? '1974 முதல் மூன்று தலைமுறைகளாகத் தொடரும் கலப்படமில்லா தூய மளிகைப் பாரம்பரியம்.' 
                : 'Over 50 years of uncompromising purity, serving native grain varieties, fresh cold-pressed oils, and farm provisions.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-cream/80 pt-1">
              <ShieldCheck className="w-4 h-4 text-cream shrink-0" />
              <span>{language === 'ta' ? '100% அசல் தரம் & நியாயமான விலை' : '100% Genuine Quality Guarantee'}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-cream tracking-wide">
              {language === 'ta' ? 'முக்கிய பக்கங்கள்' : 'Store Pages'}
            </h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li>
                <NavLink to="/products" className="hover:text-cream transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-cream/60" />
                  <span>{t('nav.products') || 'Products Catalog'}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/orders" className="hover:text-cream transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-cream/60" />
                  <span>{t('nav.buyAgain') || 'Buy Again & Orders'}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/lists" className="hover:text-cream transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-cream/60" />
                  <span>{t('nav.shoppingLists') || 'Smart Shopping Lists'}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/reviews" className="hover:text-cream transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-cream/60" />
                  <span>{t('nav.reviews') || 'Customer Ratings'}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className="hover:text-cream transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-cream/60" />
                  <span>{t('nav.about') || 'Our Story'}</span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Store Location & Timings */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-cream tracking-wide">
              {language === 'ta' ? 'அங்காடி முகவரி' : 'Store Timings & Address'}
            </h4>
            <div className="space-y-2.5 text-sm text-cream/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cream/70 shrink-0 mt-0.5" />
                <span>{STORE_ADDRESS}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-cream/70 shrink-0 mt-0.5" />
                <span>{WORKING_HOURS}</span>
              </div>
              {GOOGLE_MAP_URL && (
                <a 
                  href={GOOGLE_MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cream underline hover:text-cream/80 pt-1"
                >
                  <span>{language === 'ta' ? 'வரைபடத்தில் பார்க்க' : 'Open Google Maps Directions'}</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Column 4: WhatsApp Instant Ordering */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-cream tracking-wide">
              {language === 'ta' ? 'வாட்ஸ்அப் உதவி' : 'Direct WhatsApp Help'}
            </h4>
            <p className="text-xs text-cream/75 leading-relaxed">
              {language === 'ta' 
                ? 'உங்கள் மளிகைப் பட்டியலை வாட்ஸ்அப்பில் அனுப்பி உடனடியாக வீட்டுக்கே வரவழைக்கலாம்.' 
                : 'Send your provision list or questions directly to our staff on WhatsApp for immediate dispatch.'}
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Gandhi Shop, I would like to place an order or ask a question.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#25D366] text-ink font-bold text-xs hover:bg-[#20ba5a] transition-all shadow-md active:scale-98"
            >
              <MessageCircle className="w-4 h-4 text-ink" />
              <span>{language === 'ta' ? 'வாட்ஸ்அப் அரட்டை' : 'Chat on WhatsApp'}</span>
            </a>
            <div className="text-[11px] text-cream/60">
              <span>{CUSTOMER_CARE_PHONES[0]}</span> • <span>{CUSTOMER_CARE_EMAIL}</span>
            </div>
          </div>
        </div>

        {/* Bottom Rights Bar */}
        <div className="pt-8 border-t border-cream/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/60">
          <div>
            © 2026 {SHOP_NAME}. {language === 'ta' ? 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.' : 'All rights reserved.'}
          </div>
          <div className="flex items-center gap-4">
            <NavLink to="/privacy-policy" className="hover:text-cream transition-colors">
              {t('nav.privacyPolicy') || 'Privacy Policy'}
            </NavLink>
            <span>•</span>
            <NavLink to="/faqs" className="hover:text-cream transition-colors">
              {t('nav.faqs') || 'FAQs'}
            </NavLink>
            <span>•</span>
            <NavLink to="/customer-care" className="hover:text-cream transition-colors">
              {t('nav.customerCare') || 'Customer Care'}
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
