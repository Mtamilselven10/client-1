import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Wheat, Droplets, Sparkles, Flame, Apple, Coffee } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORIES = [
  {
    name: 'Grains, Rice & Millets',
    nameTa: 'பாரம்பரிய தானியங்கள் & அரிசி',
    count: '24',
    desc: 'Ancient unpolished millets, aged basmati & heirloom grains',
    descTa: 'பட்டை தீட்டப்படாத பாரம்பரிய அரிசி மற்றும் சிறுதானியங்கள்',
    icon: Wheat,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Cold-Pressed Oils & Pure Ghee',
    nameTa: 'மரச்செக்கு எண்ணெய்கள் & நெய்',
    count: '16',
    desc: 'Vedic Gir cow Bilona ghee & wood-pressed virgin seed oils',
    descTa: 'நாட்டுப் பசு பிலோனா நெய் மற்றும் வாகை மரச்செக்கு எண்ணெய்கள்',
    icon: Droplets,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Spices, Masalas & Seasonings',
    nameTa: 'தூய மசாலா & வாசனைப் பொருட்கள்',
    count: '32',
    desc: 'Alleppey green cardamom, high-curcumin Salem turmeric & whole spices',
    descTa: 'ஆலப்புழா ஏலக்காய், சேலம் மஞ்சள் மற்றும் முழு மசாலா பொருட்கள்',
    icon: Flame,
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Organic Pulses & Lentils',
    nameTa: 'நாட்டுப் பருப்பு வகைகள்',
    count: '20',
    desc: 'Unpolished sun-dried toor, moong, and mineral-dense dals',
    descTa: 'சூரிய ஒளியில் உலர்ந்த துவரம்பருப்பு, பாசிப்பருப்பு மற்றும் உளுந்து',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ee?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Dry Fruits, Nuts & Seeds',
    nameTa: 'உலர் பழங்கள் & கொட்டைகள்',
    count: '18',
    desc: 'Kashmiri walnuts, California almonds & hand-shelled Goan cashews',
    descTa: 'காஷ்மீரி வால்நட், பாதாம்பருப்பு மற்றும் முந்திரிப்பருப்பு',
    icon: Apple,
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Artisanal Teas & Filter Coffee',
    nameTa: 'தேயிலை & பில்டர் காபி',
    count: '14',
    desc: 'Nilgiri orthodox black leaf & Chikmagalur degree filter blends',
    descTa: 'நீலகிரி ஆர்த்தடாக்ஸ் தேயிலை மற்றும் சிக்மகளூர் பில்டர் காபி பொடி',
    icon: Coffee,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  },
];

export default function FeaturedCategories() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto bg-cream">
      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-olive">
            {t('home.categoriesBadge')}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ink mt-2">
            {t('home.categoriesTitle')}
          </h2>
          <p className="text-sm text-ink/75 mt-1 max-w-xl">
            {t('home.categoriesSubtitle')}
          </p>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 text-olive hover:text-olive-dark font-semibold text-sm group"
        >
          <span>{language === 'ta' ? 'அனைத்து 140+ பொருட்களையும் காண்க' : 'View All 140+ Grocery Products'}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Grid of Categories with Parallel Stagger Motion */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.name}
              variants={{
                hidden: { opacity: 0, y: 35 },
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
              onClick={() => handleCategoryClick(cat.name)}
              className="group cursor-pointer rounded-card overflow-hidden bg-cream-light border border-olive/20 shadow-olive-sm hover:shadow-olive-lg hover:border-olive transition-colors duration-300 flex flex-col"
            >
              <div className="relative h-48 w-full overflow-hidden bg-cream-deep">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-cream">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-olive/90 backdrop-blur-xs">
                    {cat.count} {t('home.itemsSuffix')}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-cream text-olive flex items-center justify-center shadow-sm group-hover:bg-olive group-hover:text-cream transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-ink group-hover:text-olive transition-colors">
                    {language === 'ta' ? cat.nameTa : cat.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-ink/75 leading-relaxed">
                    {language === 'ta' ? cat.descTa : cat.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-olive/10 flex items-center text-xs font-bold text-olive group-hover:text-olive-dark">
                  <span>{t('home.exploreCategory')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1.5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
