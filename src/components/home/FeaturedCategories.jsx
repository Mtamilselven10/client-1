import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Wheat, Droplets, Sparkles, Flame, Apple, Coffee } from 'lucide-react';
import { getProductImageUrl } from '../../utils/formatters';

const CATEGORIES = [
  {
    name: 'Aachi Masala & Podi',
    count: '10 Items',
    desc: 'Traditional Aachi chilli, sambar, rasam, and signature kitchen masalas',
    icon: Flame,
    image: 'products/001_Aachi_Chilli_Powder.jpg',
  },
  {
    name: 'Cooking Oil',
    count: '8 Items',
    desc: 'Cold-pressed gingelly, pure groundnut, coconut, and sunflower oils',
    icon: Droplets,
    image: 'products/023_Gold_Winner_Sunflower_Oil.jpg',
  },
  {
    name: 'Tea & Coffee',
    count: '8 Items',
    desc: 'Brooke Bond 3 Roses, Red Label, Tata Tea, and degree filter coffee',
    icon: Coffee,
    image: 'products/012_3_Roses_Tea.jpg',
  },
  {
    name: 'Rice',
    count: '8 Items',
    desc: 'Thanjavur Ponni rice, Seeraga Samba, Basmati, and Idli Gundu Arisi',
    icon: Wheat,
    image: 'products/072_Basmati_Rice.jpg',
  },
  {
    name: 'Sakthi & Other Cooking Masalas',
    count: '11 Items',
    desc: 'Famous Sakthi chicken, mutton, biryani, and kulambu spice blends',
    icon: Sparkles,
    image: 'products/064_Sakthi_Sambar_Powder.jpg',
  },
  {
    name: 'Other Grocery Essentials',
    count: '19 Items',
    desc: 'Unpolished toor & urad dals, spices, whole wheat atta, and appalam',
    icon: Apple,
    image: 'products/102_Toor_Dal.jpg',
  },
];

export default function FeaturedCategories() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto bg-cream">
      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-olive">
            Pure Sourcing Categories
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ink mt-2">
            Explore Handpicked Essentials
          </h2>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 text-olive hover:text-olive-dark font-semibold text-sm group"
        >
          <span>View All 120+ Grocery Products</span>
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
                  src={getProductImageUrl(cat.image)}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-cream">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-olive/90 backdrop-blur-xs">
                    {cat.count}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-cream text-olive flex items-center justify-center shadow-sm group-hover:bg-olive group-hover:text-cream transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-ink group-hover:text-olive transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-ink/75 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-olive/10 flex items-center text-xs font-bold text-olive group-hover:text-olive-dark">
                  <span>Browse Category</span>
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
