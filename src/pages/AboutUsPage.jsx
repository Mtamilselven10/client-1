import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, HeartHandshake, Award, Clock, Phone, ExternalLink } from 'lucide-react';
import { 
  SHOP_NAME, 
  SHOP_TAGLINE, 
  GOOGLE_MAP_URL, 
  STORE_ADDRESS, 
  WORKING_HOURS, 
  CUSTOMER_CARE_PHONES 
} from '../config';

export default function AboutUsPage() {
  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto bg-cream space-y-16">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-btn bg-cream-deep border border-olive/20 p-1 flex items-center justify-center shadow-xs">
            <img 
              src={`${import.meta.env.BASE_URL}logo.png`} 
              alt={SHOP_NAME} 
              className="w-full h-full object-contain" 
            />
          </div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
            Our Heritage & Roots
          </span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold text-ink leading-tight">
          Fifty Years of Pure Trust, Farmed from the Earth.
        </h1>
        <p className="text-base sm:text-lg text-ink/80 leading-relaxed">
          Founded on principles of unwavering truth and uncompromised food purity, <strong>{SHOP_NAME}</strong> has served as the neighborhood's guardian of authentic groceries since 1974.
        </p>
      </motion.div>

      {/* Main Narrative Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="lg:col-span-6 relative"
        >
          <div className="rounded-card overflow-hidden border-2 border-olive/30 shadow-olive-lg bg-cream-deep">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
              alt="Gandhi Shop Heritage Provisions"
              className="w-full h-[450px] object-cover"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="absolute -bottom-6 -right-3 sm:right-6 bg-cream-light border border-olive/25 p-5 rounded-card shadow-olive-md max-w-xs"
          >
            <p className="font-serif text-sm italic text-ink font-semibold">
              "When you consume pure food harvested with care, peace enters the home."
            </p>
            <p className="text-xs text-olive font-bold mt-2">— Founder's Principle</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="lg:col-span-6 space-y-6"
        >
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            A Living Rejection of Modern Food Adulteration
          </h2>
          <p className="text-sm sm:text-base text-ink/80 leading-relaxed">
            In modern retail, convenience often disguises heavy compromise: vegetable oils extracted with petrochemical solvents, rice stripped of its life-giving aleurone layer, and spices blended with synthetic coloring agents to simulate freshness.
          </p>
          <p className="text-sm sm:text-base text-ink/80 leading-relaxed">
            {SHOP_NAME} was established with one timeless vow: <em>No shortcuts, no synthetics, no adulteration.</em> We travel directly to agrarian belts in the Cauvery Delta, Nilgiri hills, Rajasthan plains, and Konkan orchards, partnering with multigenerational farmers who till their land with care.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <motion.div
              whileHover={{ y: -4 }}
              className="p-4 rounded-btn bg-cream-light border border-olive/20 shadow-xs"
            >
              <ShieldCheck className="w-6 h-6 text-olive mb-2" />
              <h4 className="font-serif font-bold text-ink text-base">Direct From Farms</h4>
              <p className="text-xs text-ink/75 mt-1">Ethically sourced with 100% traceability to origin villages.</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className="p-4 rounded-btn bg-cream-light border border-olive/20 shadow-xs"
            >
              <Award className="w-6 h-6 text-olive mb-2" />
              <h4 className="font-serif font-bold text-ink text-base">Cold Wood Press</h4>
              <p className="text-xs text-ink/75 mt-1">Ancient Vaagai timber expellers that keep nutrient chains intact.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Store Location & Map Integration Banner */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45 }}
        className="p-8 sm:p-12 rounded-card bg-cream-deep border-2 border-olive/30 shadow-olive-md space-y-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
              Visit Our Flagship Store
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Experience Our Heritage In Person
            </h2>
            <p className="text-sm text-ink/80 leading-relaxed">
              Touch the unpolished grains, smell freshly ground cardamom pods, and taste pure honey right at our traditional wooden counter.
            </p>
          </div>

          {/* Olive Location Icon Button that opens GOOGLE_MAP_URL in a new tab */}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={GOOGLE_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-md hover:bg-olive-dark transition-all inline-flex items-center justify-center gap-3 shrink-0 focus-visible:ring-2 focus-visible:ring-olive"
          >
            <MapPin className="w-5 h-5 text-cream" />
            <span>Open Location on Google Maps</span>
            <ExternalLink className="w-4 h-4 text-cream/80" />
          </motion.a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-olive/20">
          <div className="flex items-start gap-3.5 p-4 rounded-btn bg-cream-light border border-olive/15">
            <MapPin className="w-5 h-5 text-olive shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-ink/70">Address</div>
              <div className="text-sm font-semibold text-ink mt-1">{STORE_ADDRESS}</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-btn bg-cream-light border border-olive/15">
            <Clock className="w-5 h-5 text-olive shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-ink/70">Store Hours</div>
              <div className="text-sm font-semibold text-ink mt-1">{WORKING_HOURS}</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-btn bg-cream-light border border-olive/15">
            <Phone className="w-5 h-5 text-olive shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-ink/70">Store Helpline</div>
              <div className="text-sm font-semibold text-ink mt-1">{CUSTOMER_CARE_PHONES[0]}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
