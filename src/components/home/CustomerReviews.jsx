import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const REVIEWS = [
  {
    name: "Dr. Kalyani Sundaram",
    nameTa: "டாக்டர் கல்யாணி சுந்தரம்",
    role: "Nutritionist & Home Chef",
    roleTa: "ஊட்டச்சத்து நிபுணர்",
    review: "The A2 Gir Cow Bilona Ghee and unpolished Toor Dal from Gandhi Shop are pure perfection. You can immediately smell the authentic aroma that took me back to my grandmother's kitchen.",
    reviewTa: "காந்தி ஷாப்பின் பிலோனா நெய் மற்றும் பாலிஷ் செய்யப்படாத துவரம்பருப்பு அலாதியான சுவை. என் பாட்டியின் சமையலறை நினைவுகளை மீட்டெடுக்கும் தூய நறுமணம்.",
    rating: 5,
    location: "Chennai",
    locationTa: "சென்னை"
  },
  {
    name: "Rajeshwar Hegde",
    nameTa: "ராஜேஸ்வர் ஹெக்டே",
    role: "Longtime Customer (18 Years)",
    roleTa: "18 வருட வாடிக்கையாளர்",
    review: "Three generations of my family have bought our monthly spices and cold-pressed sesame oil here. In an era where adulteration is everywhere, Gandhi Shop has kept our trust spotless.",
    reviewTa: "எங்கள் குடும்பத்தின் மூன்று தலைமுறைகளாக மாதாந்திர மசாலா மற்றும் மரச்செக்கு நல்லெண்ணெயை இங்கு வாங்குகிறோம். கலப்பட காலத்திலும் இவர்களின் தரம் நிகரற்றது.",
    rating: 5,
    location: "Madurai",
    locationTa: "மதுரை"
  },
  {
    name: "Ananya Mukherjee",
    nameTa: "அனன்யா முகர்ஜி",
    role: "Organic Living Advocate",
    roleTa: "இயற்கை நல ஆர்வலர்",
    review: "Ordering via their instant WhatsApp flow is remarkably seamless! The Alleppey green cardamom and Kashmiri saffron arrived fresh in sealed glass jars with rich fragrance.",
    reviewTa: "வாட்ஸ்அப் மூலம் எளிதாக ஆர்டர் செய்யும் முறை மிகவும் சிறப்பு! ஆலப்புழா ஏலக்காய் மற்றும் குங்குமப்பூ புதிய நறுமணத்துடன் கண்ணாடி குப்பிகளில் பாதுகாப்பாக வந்தடைந்தது.",
    rating: 5,
    location: "Bengaluru",
    locationTa: "பெங்களூரு"
  }
];

export default function CustomerReviews() {
  const { language, t } = useLanguage();

  return (
    <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto bg-cream">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <span className="text-xs uppercase tracking-widest font-bold text-olive">
          {t('home.reviewsBadge')}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ink">
          {t('home.reviewsTitle')}
        </h2>
        <p className="text-sm text-ink/75">
          {t('home.reviewsSubtitle')}
        </p>
      </div>

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.15
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {REVIEWS.map((rev) => (
          <motion.div
            key={rev.name}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] }
              }
            }}
            whileHover={{ 
              y: -8, 
              transition: { type: "spring", stiffness: 350, damping: 22 } 
            }}
            className="p-8 rounded-card bg-cream-light border border-olive/20 shadow-olive-sm flex flex-col justify-between relative group hover:border-olive hover:shadow-olive-lg transition-colors duration-300"
          >
            <Quote className="w-10 h-10 text-olive/20 absolute top-6 right-6 group-hover:text-olive/30 transition-colors" />

            <div>
              <div className="flex items-center gap-1 mb-4 text-olive">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-olive text-olive" />
                ))}
              </div>

              <p className="text-sm text-ink/85 italic leading-relaxed mb-6">
                "{language === 'ta' ? rev.reviewTa : rev.review}"
              </p>
            </div>

            <div className="pt-4 border-t border-olive/10 flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-ink text-base">
                  {language === 'ta' ? rev.nameTa : rev.name}
                </h4>
                <p className="text-xs text-ink/60 font-medium">
                  {language === 'ta' ? rev.roleTa : rev.role}
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-olive-soft text-olive">
                {language === 'ta' ? rev.locationTa : rev.location}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
