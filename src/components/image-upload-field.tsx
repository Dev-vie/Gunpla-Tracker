"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UseFormSetValue } from "react-hook-form";

interface ImageUploadFieldProps {
  preview: string | null;
  setValue: UseFormSetValue<any>;
}

export default function ImageUploadField({
  preview,
  setValue,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only image files (PNG, JPG, WebP, GIF) are allowed");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 10MB");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setValue("image_url", result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemove = () => {
    setValue("image_url", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-200">
        Image / Box Art
        <span className="text-xs text-gray-500 font-normal"> (optional)</span>
      </label>

      {/* Helper text */}
      <p className="text-xs text-gray-400">
        Upload box front photo, your built kit, or any reference image (PNG,
        JPG, WebP, max 10MB)
      </p>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-900/30 p-3 text-sm text-red-400 border border-red-800">
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 rounded-lg object-contain shadow-lg"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors underline"
          >
            Remove image
          </button>
        </div>
      )}

      {/* Upload area (only show when no preview) */}
      {!preview && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
            isDragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
          }`}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            aria-label="Upload image file"
          />

          {/* Upload icon */}
          <div className="mb-2 text-3xl">📦</div>

          {/* Text content */}
          <p className="text-sm font-medium text-gray-300 mb-1">
            Drag and drop your image here
          </p>
          <p className="text-xs text-gray-500 mb-4">or</p>

          {/* Upload link */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-semibold text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            Upload a file
          </button>
        </div>
      )}
    </div>
  );
}
