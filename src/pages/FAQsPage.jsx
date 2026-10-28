import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { FAQS_DATA } from '../data/faqsData';
import { WHATSAPP_NUMBER, SHOP_NAME } from '../config';
import { useLanguage } from '../context/LanguageContext';

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState(0); // first item opened by default
  const { language, t } = useLanguage();

  const toggleAccordion = (index) => {
    setOpenIndex(prev => prev === index ? -1 : index);
  };

  return (
    <div className="py-8 px-4 sm:px-8 max-w-4xl mx-auto bg-cream space-y-10">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-3"
      >
        <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
          {t('faqs.tag')}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink">
          {t('faqs.title')}
        </h1>
        <p className="text-sm text-ink/75 max-w-xl mx-auto">
          {t('faqs.subtitle')}
        </p>
      </motion.div>

      {/* Accordion Container */}
      <div className="space-y-4">
        {FAQS_DATA.map((faq, index) => {
          const isOpen = openIndex === index;
          const questionText = language === 'ta' && faq.questionTa ? faq.questionTa : faq.question;
          const answerText = language === 'ta' && faq.answerTa ? faq.answerTa : faq.answer;

          return (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              className="rounded-card bg-cream-light border border-olive/20 shadow-olive-sm overflow-hidden transition-colors hover:border-olive/60"
            >
              <button
                onClick={() => toggleAccordion(index)}
                aria-expanded={isOpen}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus-visible:ring-2 focus-visible:ring-olive transition-colors hover:bg-olive-soft"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                    isOpen ? 'bg-olive text-cream' : 'bg-cream-deep text-olive'
                  }`}>
                    {index + 1}
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink leading-snug">
                    {questionText}
                  </h3>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-olive shrink-0 ${
                    isOpen ? 'bg-olive-soft' : ''
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-1 text-sm text-ink/80 leading-relaxed border-t border-olive/10">
                      <p className="pl-10">{answerText}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Help Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="p-6 rounded-card bg-cream-deep border border-olive/20 text-center space-y-4"
      >
        <h3 className="font-serif text-xl font-bold text-ink">{t('faqs.specificQuestion')}</h3>
        <p className="text-xs sm:text-sm text-ink/75 max-w-md mx-auto">
          {t('faqs.helpDesc')}
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            language === 'ta' 
              ? `வணக்கம் ${SHOP_NAME}, உங்கள் தயாரிப்புகள் குறித்து எனக்கு ஒரு கேள்வி உள்ளது.` 
              : `Hello ${SHOP_NAME}, I have an inquiry regarding your products.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-sm hover:bg-olive-dark transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-cream" />
          <span>{t('faqs.askWhatsApp')}</span>
        </a>
      </motion.div>
    </div>
  );
}
