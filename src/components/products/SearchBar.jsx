import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = "Search pure groceries, spices, grains..." }) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce input to prevent UI lag on large datasets
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, 250);

    return () => clearTimeout(handler);
  }, [localValue, onChange]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-olive">
        <Search className="w-5 h-5" />
      </div>

      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3.5 rounded-btn bg-cream-light text-ink placeholder:text-ink/40 border border-olive/30 shadow-olive-sm focus:border-olive focus:ring-2 focus:ring-olive focus:ring-offset-1 focus:ring-offset-cream transition-all text-sm font-medium"
      />

      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-olive hover:text-olive-dark"
          aria-label="Clear search query"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
