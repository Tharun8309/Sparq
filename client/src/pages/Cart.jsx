import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export default function Cart() {
  const { cartItems, cartSubtotal, updateQuantity, removeFromCart, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-16 px-4 text-center">
        <div className="bg-white p-10 rounded-lg border border-sparq-gold/30 shadow-sm">
          <div className="w-16 h-16 bg-sparq-offwhite rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-sparq-maroon">
            ✨
          </div>
          <h2 className="font-serif text-xl font-bold text-sparq-darkmaroon mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-gray-600 mb-6">Explore our festive fireworks catalogue to add sparkling crackers.</p>
          <Link
            to="/products"
            className="inline-block bg-sparq-maroon text-sparq-cream text-xs font-bold px-6 py-2.5 rounded hover:bg-sparq-darkmaroon border border-sparq-gold/30"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl font-bold text-sparq-darkmaroon">Your Celebration Cart</h1>
        <button onClick={clearCart} className="text-xs text-red-600 hover:underline">
          Clear All
        </button>
      </div>

      <div className="bg-white rounded-lg border border-sparq-gold/30 overflow-hidden shadow-sm mb-6">
        <div className="divide-y divide-gray-100">
          {cartItems.map((item) => (
            <div key={item.productId} className="p-4 sm:p-6 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image || '/brand/sparq-logo.svg'}
                  alt={item.name}
                  className="w-16 h-16 object-contain bg-sparq-offwhite rounded p-1"
                />
                <div>
                  <h3 className="font-semibold text-sm text-sparq-darkmaroon">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(item.sellingPrice)} each</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <p className="text-xs font-bold text-sparq-maroon">
                    {formatCurrency(item.sellingPrice * item.quantity)}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-gray-400 hover:text-red-600 text-sm"
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-sparq-offwhite p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs text-gray-600">Subtotal (Taxes included)</p>
            <p className="text-xl font-bold text-sparq-maroon">{formatCurrency(cartSubtotal)}</p>
          </div>
          <div className="flex space-x-3 w-full sm:w-auto">
            <Link
              to="/products"
              className="flex-1 sm:flex-none text-center px-4 py-2.5 border border-gray-300 text-xs font-semibold rounded hover:bg-white text-gray-700"
            >
              Add More
            </Link>
            <Link
              to="/checkout"
              className="flex-1 sm:flex-none text-center px-6 py-2.5 bg-sparq-maroon text-sparq-cream text-xs font-bold rounded hover:bg-sparq-darkmaroon border border-sparq-gold/40 shadow-sm"
            >
              Proceed to Checkout →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
