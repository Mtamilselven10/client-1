import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StarRatingInput({
  maxStars = 5,
  value = 5,
  onChange,
  label,
  subtitle,
  id,
  required = true,
  labels = []
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue > 0 ? hoverValue : value;

  const getStarLabel = (val) => {
    if (labels && labels[val - 1]) return labels[val - 1];
    if (maxStars === 3) {
      const threeStarLabels = ["Needs Improvement", "Good & Easy", "Delightful & Fast"];
      return threeStarLabels[val - 1] || `${val} of 3 Stars`;
    }
    const fiveStarLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
    return fiveStarLabels[val - 1] || `${val} of 5 Stars`;
  };

  return (
    <div className="space-y-1.5" id={id}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-bold text-ink flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-olive">*</span>}
          <span className="text-[11px] font-normal text-ink/60">
            ({maxStars}-star scale)
          </span>
        </label>
        <span className="text-xs font-bold text-olive">
          {displayValue} / {maxStars} • {getStarLabel(displayValue)}
        </span>
      </div>

      {subtitle && (
        <p className="text-[11px] text-ink/65 leading-tight">{subtitle}</p>
      )}

      {/* Interactive Stars */}
      <div 
        className="flex items-center gap-1.5 pt-1"
        onMouseLeave={() => setHoverValue(0)}
        role="radiogroup"
        aria-label={label}
      >
        {Array.from({ length: maxStars }, (_, i) => {
          const starNumber = i + 1;
          const isFilled = starNumber <= displayValue;

          return (
            <motion.button
              key={starNumber}
              type="button"
              whileHover={{ scale: 1.18 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(starNumber)}
              onMouseEnter={() => setHoverValue(starNumber)}
              onFocus={() => setHoverValue(starNumber)}
              onBlur={() => setHoverValue(0)}
              className={`p-1.5 rounded-lg border transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-olive ${
                isFilled 
                  ? 'bg-olive/10 border-olive/30 text-olive' 
                  : 'bg-cream-deep/60 border-olive/15 text-ink/30 hover:border-olive/30'
              }`}
              role="radio"
              aria-checked={value === starNumber}
              aria-label={`${starNumber} out of ${maxStars} stars - ${getStarLabel(starNumber)}`}
            >
              <Star 
                className={`w-6 h-6 transition-colors duration-150 ${
                  isFilled ? 'fill-olive text-olive drop-shadow-xs' : 'fill-transparent text-ink/35'
                }`} 
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
