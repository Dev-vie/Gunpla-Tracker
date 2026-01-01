"use client";

import { useState, useMemo } from "react";
import { Database } from "@/types/database.types";
import {
  calculateImageStats,
  calculateOptimizationSavings,
} from "@/lib/image-stats";

type GunplaKit = Database["public"]["Tables"]["gunpla_kits"]["Row"];

interface ImageMonitoringProps {
  kits: GunplaKit[];
}

export default function ImageMonitoring({ kits }: ImageMonitoringProps) {
  const stats = useMemo(() => calculateImageStats(kits), [kits]);
  const savings = useMemo(() => calculateOptimizationSavings(kits), [kits]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Image Optimization Stats
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Monitor image sizes, compression savings, and estimated monthly egress
          usage
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Kits */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Kits
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalKits}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {stats.kitsWithImages} with images
          </p>
        </div>

        {/* Average Image Size */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Avg Image Size (Optimized)
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            {(stats.averageImageSize / 1024).toFixed(0)} KB
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            After compression
          </p>
        </div>

        {/* Total Storage */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Optimized Storage
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {(stats.estimatedTotalSize / (1024 * 1024)).toFixed(2)} MB
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Multiple sizes per kit
          </p>
        </div>

        {/* Savings Per Kit */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Saved Per Kit
          </p>
          <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
            {savings.savedPerKit} KB
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {savings.compressionRatio} reduction
          </p>
        </div>
      </div>

      {/* Estimated Monthly Egress */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Estimated Monthly Egress (After Optimization)
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Estimates based on different usage levels
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Conservative */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              💤 Conservative
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {stats.estimatedMonthlyEgress.conservative} GB
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              ~100 views per image/month
            </p>
          </div>

          {/* Moderate */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              📊 Moderate
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.estimatedMonthlyEgress.moderate} GB
            </p>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              ~500 views per image/month
            </p>
          </div>

          {/* Heavy */}
          <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/30">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
              🔥 Heavy Usage
            </p>
            <p className="mt-2 text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.estimatedMonthlyEgress.heavy} GB
            </p>
            <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
              ~1000 views per image/month
            </p>
          </div>
        </div>
      </div>

      {/* Optimization Benefits */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-900/30">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
          ✅ Optimization Benefits
        </h3>
        <div className="mt-4 space-y-2 text-sm text-green-800 dark:text-green-200">
          <p>
            <strong>Total Storage Saved:</strong> {savings.totalSavedStorage} GB
          </p>
          <p>
            <strong>Estimated Monthly Savings:</strong>{" "}
            {savings.estimatedMonthlySavings} GB/month
          </p>
          <p>
            <strong>Compression Ratio:</strong> {savings.compressionRatio}{" "}
            reduction per image
          </p>
        </div>
      </div>

      {/* Implementation Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          How Optimization Works
        </h3>
        <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>
            <strong>Image Compression:</strong> Canvas API compresses images to
            WebP format at 70-78% quality
          </li>
          <li>
            <strong>Responsive Sizes:</strong> Three sizes generated (thumbnail
            200px, medium 400px, full 800px)
          </li>
          <li>
            <strong>Next.js Image:</strong> Automatic srcset generation and lazy
            loading
          </li>
          <li>
            <strong>Browser Caching:</strong> 1-year cache headers on Supabase
            Storage
          </li>
          <li>
            <strong>Quality Reduction:</strong> quality=70 in kit cards,
            imperceptible quality loss
          </li>
          <li>
            <strong>Pagination:</strong> 20 kits per page instead of loading all
            at once
          </li>
        </ul>
      </div>

      {/* Monitoring Tips */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-900/30">
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
          📈 Monitoring Recommendations
        </h3>
        <ul className="mt-4 space-y-2 text-sm text-amber-800 dark:text-amber-200">
          <li>
            • Check Supabase Dashboard → Billing monthly to track actual egress
            usage
          </li>
          <li>
            • Free tier: 5GB egress/month (after optimization: ~15-40 active
            users)
          </li>
          <li>• Use Google Lighthouse to verify images are optimized</li>
          <li>
            • Monitor Network tab in DevTools to see image sizes being served
          </li>
          <li>• Set up Supabase alerts at 80% of quota to get early warning</li>
        </ul>
      </div>
    </div>
  );
}
