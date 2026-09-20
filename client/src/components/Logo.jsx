import React from 'react';

export default function Logo({ className = 'h-10' }) {
  return (
    <img
      src="/brand/sparq-logo.svg"
      alt="Sparq - Light Up Every Celebration"
      className={`${className} object-contain`}
      onError={(e) => {
        // Safe inline SVG fallback if image file fails to load
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
