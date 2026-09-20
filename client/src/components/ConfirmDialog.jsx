import React from 'react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 border border-sparq-gold/40">
        <h3 className="font-bold text-lg text-sparq-darkmaroon mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-sparq-redaccent hover:bg-red-800 rounded"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
