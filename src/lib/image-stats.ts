import { Database } from "@/types/database.types";

type GunplaKit = Database["public"]["Tables"]["gunpla_kits"]["Row"];

/**
 * Image Statistics and Monitoring
 * Helps track bandwidth usage and estimate monthly egress
 */

export interface ImageStats {
  totalKits: number;
  kitsWithImages: number;
  estimatedTotalSize: number; // bytes
  averageImageSize: number; // bytes
  estimatedMonthlyEgress: {
    conservative: string; // GB (100 views per kit)
    moderate: string; // GB (500 views per kit)
    heavy: string; // GB (1000 views per kit)
  };
}

/**
 * Calculate image statistics from kit collection
 */
export function calculateImageStats(kits: GunplaKit[]): ImageStats {
  const kitsWithImages = kits.filter((k) => k.image_url?.trim()).length;
  
  // Estimate based on compression:
  // After optimization: thumbnail (30KB), medium (100KB), full (200KB) = 330KB total
  // Before optimization: Full-size (2-5MB) = 5MB
  // Compression ratio: ~6.5x reduction per image
  
  const ESTIMATED_SIZE_PER_KIT_OPTIMIZED = 330 * 1024; // 330KB after compression
  const ESTIMATED_SIZE_PER_KIT_ORIGINAL = 2.5 * 1024 * 1024; // 2.5MB before compression
  
  const totalOptimizedSize = kitsWithImages * ESTIMATED_SIZE_PER_KIT_OPTIMIZED;
  const averageSize = kitsWithImages > 0 ? totalOptimizedSize / kitsWithImages : 0;
  
  // Estimate monthly egress based on view count assumptions
  // Views per kit per month at different usage levels
  const conservativeViews = kitsWithImages * 100; // Each image viewed 100x/month
  const moderateViews = kitsWithImages * 500;
  const heavyViews = kitsWithImages * 1000;
  
  return {
    totalKits: kits.length,
    kitsWithImages,
    estimatedTotalSize: totalOptimizedSize,
    averageImageSize: averageSize,
    estimatedMonthlyEgress: {
      conservative: ((conservativeViews * ESTIMATED_SIZE_PER_KIT_OPTIMIZED) / (1024 * 1024 * 1024)).toFixed(2),
      moderate: ((moderateViews * ESTIMATED_SIZE_PER_KIT_OPTIMIZED) / (1024 * 1024 * 1024)).toFixed(2),
      heavy: ((heavyViews * ESTIMATED_SIZE_PER_KIT_OPTIMIZED) / (1024 * 1024 * 1024)).toFixed(2),
    },
  };
}

/**
 * Calculate savings from optimization
 */
export function calculateOptimizationSavings(kits: GunplaKit[]): {
  savedPerKit: string; // KB
  totalSavedStorage: string; // GB
  estimatedMonthlySavings: string; // GB
  compressionRatio: string;
} {
  const kitsWithImages = kits.filter((k) => k.image_url?.trim()).length;
  
  const ORIGINAL_SIZE = 2.5 * 1024 * 1024; // 2.5MB
  const OPTIMIZED_SIZE = 330 * 1024; // 330KB
  const SAVED_PER_KIT = ORIGINAL_SIZE - OPTIMIZED_SIZE;
  
  const totalSaved = kitsWithImages * SAVED_PER_KIT;
  
  // Estimate: moderate usage = 500 views per kit per month
  const monthlyViews = kitsWithImages * 500;
  const monthlySaved = (monthlyViews * SAVED_PER_KIT) / (1024 * 1024 * 1024);
  
  return {
    savedPerKit: (SAVED_PER_KIT / 1024).toFixed(0),
    totalSavedStorage: (totalSaved / (1024 * 1024 * 1024)).toFixed(2),
    estimatedMonthlySavings: monthlySaved.toFixed(2),
    compressionRatio: `${((SAVED_PER_KIT / ORIGINAL_SIZE) * 100).toFixed(0)}%`,
  };
}
