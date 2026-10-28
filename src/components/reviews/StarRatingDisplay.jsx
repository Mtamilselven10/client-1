import React from 'react';
import { Star } from 'lucide-react';

export default function StarRatingDisplay({
  rating = 5,
  maxStars = 5,
  size = "sm", // "xs" | "sm" | "md" | "lg"
  showNumber = false,
  className = ""
}) {
  const sizeMap = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const starSize = sizeMap[size] || sizeMap.sm;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of ${maxStars} stars`}>
        {Array.from({ length: maxStars }, (_, i) => {
          const starNumber = i + 1;
          const isFull = starNumber <= rating;
          const isPartial = !isFull && starNumber - 0.5 <= rating;

          return (
            <Star
              key={starNumber}
              className={`${starSize} ${
                isFull
                  ? 'fill-olive text-olive'
                  : isPartial
                  ? 'fill-olive/50 text-olive'
                  : 'fill-transparent text-olive/25'
              }`}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-xs font-bold text-olive ml-1">
          {rating.toFixed(1)} <span className="text-ink/50 text-[10px]">/ {maxStars}</span>
        </span>
      )}
    </div>
  );
}
