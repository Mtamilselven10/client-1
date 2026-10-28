import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, HeartHandshake, Award, MapPin } from 'lucide-react';
import { SHOP_NAME, GOOGLE_MAP_URL, STORE_ADDRESS } from '../../config';

export default function StoreStoryPreview() {
  return (
    <section className="py-20 px-4 sm:px-8 bg-cream-deep border-y border-olive/15">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Image with editorial framing & parallel float */}
        <motion.div 
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="lg:col-span-5 relative"
        >
          <div className="rounded-card overflow-hidden border-2 border-olive/30 shadow-olive-lg bg-cream">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
              alt="Traditional grocery heritage at Gandhi Shop"
              className="w-full h-[420px] object-cover"
              loading="lazy"
            />
          </div>
          {/* Floating badge with continuous subtle parallel float */}
          <motion.div 
            animate={{ y: [0, -7, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="absolute -bottom-6 -right-4 sm:right-6 bg-olive text-cream p-5 rounded-card shadow-olive-lg border-2 border-cream max-w-[220px]"
          >
            <div className="font-serif text-3xl font-extrabold leading-none">50+</div>
            <div className="text-xs font-semibold mt-1 uppercase tracking-wider text-cream/90">
              Years of Uncompromising Purity
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Narrative with parallel entrance */}
        <motion.div 
          initial={{ opacity: 0, x: 35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-olive-soft text-olive text-xs font-bold tracking-widest uppercase">
            <span>Our Sourcing Promise</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ink leading-tight">
            "Food Should Heal and Nourish, Not Deceive."
          </h2>

          <p className="text-sm sm:text-base text-ink/80 leading-relaxed">
            At <strong>{SHOP_NAME}</strong>, we believe every grain of rice, every drop of cold-pressed oil, and every pinch of turmeric tells a story of the soil it was born in. Unlike commercial supermarkets filled with bleached grains and mineral oils, our provisions come directly from generational agrarian families who honor traditional farming.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-3 p-4 rounded-btn bg-cream-light border border-olive/15">
              <ShieldCheck className="w-6 h-6 text-olive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-ink text-base">Zero Adulteration</h4>
                <p className="text-xs text-ink/75 mt-1">Laboratory verified for purity. No chemical waxes, no dye powders.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-btn bg-cream-light border border-olive/15">
              <HeartHandshake className="w-6 h-6 text-olive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-ink text-base">Farmer Fair-Price</h4>
                <p className="text-xs text-ink/75 mt-1">Direct ethical trade eliminating exploitative middlemen.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-btn bg-cream-light border border-olive/15">
              <Award className="w-6 h-6 text-olive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-ink text-base">Wood-Pressed Craft</h4>
                <p className="text-xs text-ink/75 mt-1">Extracted on slow Vagai wooden expellers under 40°C temperature.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-btn bg-cream-light border border-olive/15">
              <MapPin className="w-6 h-6 text-olive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-ink text-base">Heritage Store</h4>
                <p className="text-xs text-ink/75 mt-1">{STORE_ADDRESS.split(',')[0]} - Welcoming three generations of families.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <NavLink
              to="/about"
              className="px-6 py-3 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-md hover:bg-olive-dark transition-colors inline-flex items-center gap-2"
            >
              <span>Read Our Full Story</span>
            </NavLink>

            <a
              href={GOOGLE_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-btn border-1.5 border-olive text-olive font-bold text-sm hover:bg-olive-soft transition-colors inline-flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Locate Our Store on Map</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
