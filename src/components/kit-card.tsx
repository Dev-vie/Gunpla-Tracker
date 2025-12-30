"use client";

import Image from "next/image";
import { useState } from "react";

interface KitCardProps {
  kit: {
    brand: string;
    id: string;
    grade: string;
    model_number: string;
    model_name: string;
    series?: string | null;
    image_url?: string | null;
    subline?: string | null;
    exclusive?: boolean;
  };
  priority?: boolean;
}

export default function KitCard({ kit, priority = false }: KitCardProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const imageSrc = (kit.image_url ?? "").trim();
  const hasImage = imageSrc.length > 0;
  const prefix =
    kit.brand !== "Bandai" ? kit.brand : kit.subline ? kit.subline : kit.grade;
  const displayTitle = `${prefix} ${kit.model_number} ${kit.model_name}`.trim();
  const imageAlt = `${displayTitle}${kit.series ? ` - ${kit.series}` : ""}`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 hover:scale-105">
      {/* Image Container */}
      <div
        className="relative h-72 w-full overflow-hidden bg-gray-100 dark:bg-gray-700 sm:h-80 cursor-pointer"
        onClick={() => hasImage && setShowImageModal(true)}
      >
        {hasImage ? (
          <>
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-300 group-hover:brightness-110"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30" />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
            {/* Subtle Gundam Silhouette Placeholder */}
            <div className="mb-3 text-5xl opacity-30">🤖</div>
            <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              No box art yet
            </p>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between p-4">
        {/* Grade Badge */}
        <div className="mb-2 flex gap-2 flex-wrap items-start">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {kit.brand !== "Bandai" ? kit.brand : prefix}
          </span>
          {kit.exclusive && (
            <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              ⭐ Exclusive
            </span>
          )}
        </div>

        {/* Model Info */}
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 break-words">
            {`${prefix} ${kit.model_number}`}
          </p>
          <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-white leading-tight">
            {kit.model_name}
          </h3>

          {/* Series Badge */}
          {kit.series && (
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="inline-block rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {kit.series}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Image Modal */}
      {showImageModal && hasImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 transition-colors"
            onClick={() => setShowImageModal(false)}
          >
            ×
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-contain"
              priority
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
