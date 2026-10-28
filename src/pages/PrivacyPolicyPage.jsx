import React from 'react';
import { ShieldCheck, Lock, FileText } from 'lucide-react';
import { POLICY_SECTIONS } from '../data/policyData';
import { SHOP_NAME } from '../config';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPolicyPage() {
  const { language, t } = useLanguage();

  return (
    <div className="py-8 px-4 sm:px-8 max-w-4xl mx-auto bg-cream space-y-10">
      {/* Editorial Header */}
      <div className="space-y-3 border-b border-olive/15 pb-6">
        <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
          {t('privacy.tag')}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink">
          {t('privacy.title')}
        </h1>
        <p className="text-sm text-ink/75 leading-relaxed">
          {language === 'ta'
            ? `கடைசியாக புதுப்பிக்கப்பட்டது: அக்டோபர் 2026. வாடிக்கையாளர் தரவு பாதுகாப்பு, வாட்ஸ்அப் ஆர்டர்கள் மற்றும் தூய்மை உத்தரவாதம் குறித்த ${SHOP_NAME}-ன் தெளிவான வெளிப்படையான கொள்கை.`
            : `Last revised: October 2026. Clear, transparent commitments governing customer data, direct messaging orders, and purity guarantees at ${SHOP_NAME}.`}
        </p>
      </div>

      {/* Trust Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-btn bg-cream-light border border-olive/20 text-center">
          <Lock className="w-5 h-5 text-olive mx-auto mb-1.5" />
          <h4 className="font-serif text-sm font-bold text-ink">
            {language === 'ta' ? 'தரவு விற்பனை இல்லை' : 'Zero Data Selling'}
          </h4>
          <p className="text-[11px] text-ink/65 mt-0.5">
            {language === 'ta' ? 'உங்கள் தொலைபேசி & முகவரி ரகசியமாக வைக்கப்படும்.' : 'Your phone & address stay strictly confidential.'}
          </p>
        </div>
        <div className="p-4 rounded-btn bg-cream-light border border-olive/20 text-center">
          <ShieldCheck className="w-5 h-5 text-olive mx-auto mb-1.5" />
          <h4 className="font-serif text-sm font-bold text-ink">
            {language === 'ta' ? '48-மணி நேர உத்தரவாதம்' : '48-Hour Fresh Guarantee'}
          </h4>
          <p className="text-[11px] text-ink/65 mt-0.5">
            {language === 'ta' ? 'நறுமணம் அல்லது தரத்தில் குறை இருந்தால் உடனடி மாற்றீடு.' : 'Full replacement if seal or aroma is compromised.'}
          </p>
        </div>
        <div className="p-4 rounded-btn bg-cream-light border border-olive/20 text-center">
          <FileText className="w-5 h-5 text-olive mx-auto mb-1.5" />
          <h4 className="font-serif text-sm font-bold text-ink">
            {language === 'ta' ? 'வெளிப்படையான விலை' : 'Transparent Pricing'}
          </h4>
          <p className="text-[11px] text-ink/65 mt-0.5">
            {language === 'ta' ? 'மறைமுக கட்டணங்கள் அல்லது செயற்கை சேர்க்கை இல்லை.' : 'Zero hidden surcharges or synthetic padding.'}
          </p>
        </div>
      </div>

      {/* Policy Sections from policyData.js */}
      <div className="space-y-8">
        {POLICY_SECTIONS.map((sec, idx) => {
          const title = language === 'ta' && sec.titleTa ? sec.titleTa : sec.title;
          const content = language === 'ta' && sec.contentTa ? sec.contentTa : sec.content;

          return (
            <div 
              key={idx}
              className="p-6 sm:p-8 rounded-card bg-cream-light border border-olive/20 shadow-olive-sm space-y-3"
            >
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-olive" />
                <span>{title}</span>
              </h2>
              <p className="text-sm sm:text-base text-ink/80 leading-relaxed pl-4 border-l-2 border-olive/20">
                {content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Closing note */}
      <div className="p-6 rounded-card bg-cream-deep border border-olive/15 text-xs text-ink/75 leading-relaxed">
        <p>
          {language === 'ta'
            ? `${SHOP_NAME}-ன் நேரடி அங்காடி அல்லது வாட்ஸ்அப் மூலம் தொடர்புகொள்வதன் மூலம், இந்த விதிமுறைகளை ஒப்புக்கொள்கிறீர்கள். உங்கள் தகவலை நீக்க கோர எங்கள் உதவி மையத்தை எப்போது வேண்டுமானாலும் அணுகலாம்.`
            : `By engaging with ${SHOP_NAME} in person, on our catalog portal, or via our WhatsApp messaging concierge, you acknowledge and agree to these terms. If you have questions regarding any terms or wish to request data deletion, contact our care desk at any time.`}
        </p>
      </div>
    </div>
  );
}
