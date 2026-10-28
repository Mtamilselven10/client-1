import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { FAQS_DATA } from '../data/faqsData';
import { WHATSAPP_NUMBER, SHOP_NAME } from '../config';

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState(0); // first item opened by default

  const toggleAccordion = (index) => {
    setOpenIndex(prev => prev === index ? -1 : index);
  };

  return (
    <div className="py-8 px-4 sm:px-8 max-w-4xl mx-auto bg-cream space-y-10">
      {/* Editorial Header */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
          Assistance & Clarity
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-ink/75 max-w-xl mx-auto">
          Everything you need to know about our sourcing authenticity, WhatsApp order process, delivery standards, and purity guarantees.
        </p>
      </div>

      {/* Accordion Container */}
      <div className="space-y-4">
        {FAQS_DATA.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.id}
              className="rounded-card bg-cream-light border border-olive/20 shadow-olive-sm overflow-hidden transition-all duration-200"
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
                    {faq.question}
                  </h3>
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-olive shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 bg-olive-soft' : ''
                }`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-1 text-sm text-ink/80 leading-relaxed border-t border-olive/10">
                  <p className="pl-10">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Banner */}
      <div className="p-6 rounded-card bg-cream-deep border border-olive/20 text-center space-y-4">
        <h3 className="font-serif text-xl font-bold text-ink">Have a specific question not covered here?</h3>
        <p className="text-xs sm:text-sm text-ink/75 max-w-md mx-auto">
          Our senior grocery consultants are ready to assist with grain choices, recipes, and bulk orders directly on WhatsApp.
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello ${SHOP_NAME}, I have an inquiry regarding your products.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-sm hover:bg-olive-dark transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-cream" />
          <span>Ask Us on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
