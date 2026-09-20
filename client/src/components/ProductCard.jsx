import React from 'react';
import { Link } from 'react-router-dom';
import PriceDisplay from './PriceDisplay';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  if (!product) return null;

  const {
    name = 'Sparq Special Product',
    slug = '',
    category,
    actualPrice = 0,
    sellingPrice = 0,
    discountPercentage = 0,
    isAvailable = true,
    images = []
  } = product;

  const categoryName = category?.name || 'Celebration Classic';
  const imageUrl = images?.[0]?.url || '/brand/sparq-logo.svg';

  return (
    <div className="bg-white rounded-lg border border-sparq-gold/30 shadow-sm overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md hover:border-sparq-gold">
      <Link to={`/products/${slug}`} className="relative h-48 bg-sparq-offwhite flex items-center justify-center p-3 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '/brand/sparq-logo.svg';
          }}
        />
        {!isAvailable && (
          <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded">
            Out of Stock
          </span>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-sparq-gold uppercase tracking-wider block mb-1">
            {categoryName}
          </span>
          <Link to={`/products/${slug}`} className="block">
            <h3 className="font-semibold text-sparq-darkmaroon hover:text-sparq-maroon transition-colors line-clamp-2">
              {name}
            </h3>
          </Link>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <PriceDisplay
            actualPrice={actualPrice}
            sellingPrice={sellingPrice}
            discountPercentage={discountPercentage}
            size="sm"
          />

          <button
            onClick={() => addToCart(product, 1)}
            disabled={!isAvailable}
            className={`text-xs font-bold px-3 py-2 rounded transition-colors ${
              isAvailable
                ? 'bg-sparq-maroon text-sparq-cream hover:bg-sparq-darkmaroon border border-sparq-gold/40'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAvailable ? 'Add to Cart' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
