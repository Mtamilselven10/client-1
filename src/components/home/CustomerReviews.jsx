import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    name: "Dr. Kalyani Sundaram",
    role: "Nutritionist & Home Chef",
    review: "The A2 Gir Cow Bilona Ghee and unpolished Toor Dal from Gandhi Shop are pure perfection. You can immediately smell the authentic aroma that took me back to my grandmother's kitchen.",
    rating: 5,
    location: "Chennai"
  },
  {
    name: "Rajeshwar Hegde",
    role: "Longtime Customer (18 Years)",
    review: "Three generations of my family have bought our monthly spices and cold-pressed sesame oil here. In an era where adulteration is everywhere, Gandhi Shop has kept our trust spotless.",
    rating: 5,
    location: "Madurai"
  },
  {
    name: "Ananya Mukherjee",
    role: "Organic Living Advocate",
    review: "Ordering via their instant WhatsApp flow is remarkably seamless! The Alleppey green cardamom and Kashmiri saffron arrived fresh in sealed glass jars with rich fragrance.",
    rating: 5,
    location: "Bengaluru"
  }
];

export default function CustomerReviews() {
  return (
    <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto bg-cream">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <span className="text-xs uppercase tracking-widest font-bold text-olive">
          Patron Experiences
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ink">
          Cherished Across Generations
        </h2>
        <p className="text-sm text-ink/75">
          Real words from patrons who trust Gandhi Shop for daily family health.
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
                "{rev.review}"
              </p>
            </div>

            <div className="pt-4 border-t border-olive/10 flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-ink text-base">
                  {rev.name}
                </h4>
                <p className="text-xs text-ink/60 font-medium">
                  {rev.role}
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-olive-soft text-olive">
                {rev.location}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
