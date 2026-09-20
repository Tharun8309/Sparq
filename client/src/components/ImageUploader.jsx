import React, { useState } from 'react';

export default function ImageUploader({ onUpload, isUploading = false }) {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('File size exceeds 4MB limit.');
      return;
    }
    onUpload(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
      }}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive ? 'border-sparq-gold bg-sparq-offwhite' : 'border-gray-300 bg-gray-50'
      }`}
    >
      <input
        type="file"
        id="product-image-input"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={isUploading}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />
      <label htmlFor="product-image-input" className="cursor-pointer block">
        <p className="text-xs font-semibold text-gray-700">
          {isUploading ? 'Uploading to Cloudinary...' : 'Click or Drag & Drop to upload image'}
        </p>
        <p className="text-[11px] text-gray-500 mt-1">PNG, JPG, WebP up to 4MB</p>
      </label>
    </div>
  );
}
