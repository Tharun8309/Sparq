import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import PriceDisplay from '../components/PriceDisplay';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await api(`/products/${slug}`);
        setProduct(res.data);
        setActiveImage(res.data?.images?.[0]?.url || '/brand/sparq-logo.svg');
      } catch (err) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const handleAdd = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto p-12 text-center text-xs text-gray-500">Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white text-center rounded border border-gray-200">
        <h2 className="text-base font-bold text-sparq-darkmaroon mb-2">Product Not Found</h2>
        <p className="text-xs text-gray-500 mb-4">{error || 'Unable to locate this fireworks item.'}</p>
        <Link to="/products" className="bg-sparq-maroon text-white text-xs px-4 py-2 rounded">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 sm:p-8 rounded-lg border border-sparq-gold/30">
        {/* Gallery */}
        <div>
          <div className="h-80 bg-sparq-offwhite rounded border border-sparq-gold/20 flex items-center justify-center p-4">
            <img
              src={activeImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
              onError={(e) => { e.currentTarget.src = '/brand/sparq-logo.svg'; }}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-16 h-16 rounded border p-1 bg-white ${
                    activeImage === img.url ? 'border-sparq-gold ring-1 ring-sparq-gold' : 'border-gray-200'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Purchase */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-sparq-gold uppercase tracking-wider block mb-1">
              {product.category?.name || 'Celebration Classic'}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sparq-darkmaroon mb-3">
              {product.name}
            </h1>

            <div className="mb-4">
              <PriceDisplay
                actualPrice={product.actualPrice}
                sellingPrice={product.sellingPrice}
                discountPercentage={product.discountPercentage}
                size="lg"
              />
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
              {product.description || product.shortDescription || 'Authentic fireworks crafted for festive joy.'}
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={!product.isAvailable}
                className={`flex-1 py-3 px-6 rounded text-xs font-bold transition-colors ${
                  product.isAvailable
                    ? 'bg-sparq-maroon text-sparq-cream hover:bg-sparq-darkmaroon border border-sparq-gold/40'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {product.isAvailable ? (addedNotice ? '✓ Added to Cart!' : 'Add to Cart') : 'Sold Out'}
              </button>
            </div>

            <Link
              to="/checkout"
              className="block text-center text-xs font-semibold text-sparq-maroon hover:underline mt-2"
            >
              Or proceed directly to checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
