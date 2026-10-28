import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WHATSAPP_NUMBER, SHOP_NAME } from '../../config';
import { buildGeneralInquiryWhatsAppUrl } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import { isReducedMotion } from '../../animations/animationConfig';

export default function FloatingWhatsApp() {
  const [isHovered, setIsHovered] = useState(false);
  const { language, t } = useLanguage();
  const reducedMotion = isReducedMotion();

  const inquiryMessage = language === 'ta'
    ? `வணக்கம் ${SHOP_NAME}, உங்கள் இயற்கை மளிகைப் பொருட்கள் மற்றும் விநியோகம் குறித்து அறிய விரும்புகிறேன்!`
    : `Hello ${SHOP_NAME}, I would like to inquire about your pure grocery products and home delivery!`;

  const whatsappUrl = buildGeneralInquiryWhatsAppUrl(inquiryMessage);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip on hover */}
      {isHovered && (
        <div 
          className="hidden sm:block px-3 py-1.5 rounded-btn bg-olive text-cream text-xs font-semibold shadow-olive-md tracking-wide animate-fade-in border border-olive-dark"
          role="tooltip"
        >
          {t('whatsapp.floatingTooltip')}
        </div>
      )}

      {/* Floating circular button in olive with cream icon */}
      <div className="relative">
        {/* Subtle periodic pulse ring in olive-soft (paused on reduced motion) */}
        {!reducedMotion && (
          <motion.span
            animate={{ scale: [1, 1.3, 1.55], opacity: [0.55, 0.2, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3.5, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-olive pointer-events-none -z-10"
          />
        )}

        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-14 h-14 rounded-full bg-olive text-cream shadow-olive-lg hover:bg-olive-dark transition-colors duration-200 flex items-center justify-center border-2 border-cream focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2"
          aria-label={`Chat with ${SHOP_NAME} on WhatsApp`}
        >
          {/* Authentic WhatsApp Glyph styled on-brand in cream */}
          <svg 
            className="w-7 h-7 fill-cream" 
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.488-8.414z"/>
          </svg>
        </motion.a>
      </div>
    </div>
  );
}
