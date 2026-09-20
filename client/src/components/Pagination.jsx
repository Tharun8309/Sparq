import React from 'react';

export default function Pagination({ page = 1, pages = 1, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 my-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-xs font-semibold rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sparq-offwhite"
      >
        Previous
      </button>

      <span className="text-xs font-medium text-gray-700">
        Page {page} of {pages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="px-3 py-1.5 text-xs font-semibold rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sparq-offwhite"
      >
        Next
      </button>
    </div>
  );
}
