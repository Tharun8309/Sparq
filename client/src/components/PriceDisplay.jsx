import React from 'react';
import { formatCurrency } from '../utils/formatters';

export default function PriceDisplay({ actualPrice = 0, sellingPrice = 0, discountPercentage = 0, size = 'base' }) {
  const isDiscounted = actualPrice > sellingPrice;
  const textSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-baseline space-x-2 flex-wrap">
      <span className={`font-bold text-sparq-maroon ${textSize}`}>
        {formatCurrency(sellingPrice)}
      </span>
      {isDiscounted && (
        <>
          <span className="text-xs line-through text-gray-500">
            {formatCurrency(actualPrice)}
          </span>
          {discountPercentage > 0 && (
            <span className="text-xs font-semibold text-sparq-redaccent bg-red-50 px-1.5 py-0.5 rounded">
              {discountPercentage}% OFF
            </span>
          )}
        </>
      )}
    </div>
  );
}
