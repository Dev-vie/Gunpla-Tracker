/**
 * Image Optimization Utilities
 * Reduces egress by compressing & resizing images before upload
 * Target: 80-90% reduction in bandwidth usage
 */

const COMPRESSION_SETTINGS = {
  thumbnail: { width: 200, height: 200, quality: 0.70 }, // Grid view
  medium: { width: 400, height: 600, quality: 0.75 }, // Card hover/detail
  full: { width: 800, height: 1200, quality: 0.78 }, // Full page view
};

/**
 * Compress image using Canvas API
 * Returns optimized WebP blob
 */
export async function compressImage(
  file: File,
  targetWidth: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // Calculate height based on aspect ratio
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        const targetHeight = Math.round(targetWidth * aspectRatio);
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Draw resized image on canvas
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Convert to WebP blob with quality setting
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas conversion failed"));
            }
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate multiple image sizes for a single upload
 * Returns object with thumbnail, medium, and full-sized images
 */
export async function generateImageSizes(
  file: File
): Promise<{
  thumbnail: Blob;
  medium: Blob;
  full: Blob;
  originalSize: number;
  totalCompressedSize: number;
}> {
  const originalSize = file.size;

  const [thumbnail, medium, full] = await Promise.all([
    compressImage(
      file,
      COMPRESSION_SETTINGS.thumbnail.width,
      COMPRESSION_SETTINGS.thumbnail.quality
    ),
    compressImage(
      file,
      COMPRESSION_SETTINGS.medium.width,
      COMPRESSION_SETTINGS.medium.quality
    ),
    compressImage(
      file,
      COMPRESSION_SETTINGS.full.width,
      COMPRESSION_SETTINGS.full.quality
    ),
  ]);

  const totalCompressedSize = thumbnail.size + medium.size + full.size;

  return {
    thumbnail,
    medium,
    full,
    originalSize,
    totalCompressedSize,
  };
}

/**
 * Upload multiple image sizes to Supabase Storage
 * Returns URLs for each size with cache control headers
 */
export async function uploadImageSizes(
  supabaseStorageUrl: string,
  sizes: { thumbnail: Blob; medium: Blob; full: Blob },
  kitId: string,
  token: string
): Promise<{
  thumbnail_url: string;
  medium_url: string;
  full_url: string;
}> {
  const timestamp = Date.now();

  const uploadToStorage = async (
    blob: Blob,
    size: "thumbnail" | "medium" | "full"
  ) => {
    const fileName = `${kitId}_${size}_${timestamp}.webp`;
    const path = `gunpla-images/${kitId}/${fileName}`;

    const response = await fetch(
      `${supabaseStorageUrl}/storage/v1/object/gunpla-images/${kitId}/${fileName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable", // 1 year cache
        },
        body: blob,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to upload ${size} image: ${response.statusText}`);
    }

    const publicPath = `${supabaseStorageUrl}/storage/v1/object/public/gunpla-images/${kitId}/${fileName}`;
    return publicPath;
  };

  const [thumbnail_url, medium_url, full_url] = await Promise.all([
    uploadToStorage(sizes.thumbnail, "thumbnail"),
    uploadToStorage(sizes.medium, "medium"),
    uploadToStorage(sizes.full, "full"),
  ]);

  return { thumbnail_url, medium_url, full_url };
}

/**
 * Get appropriate image URL based on context (size hint)
 * Reduces egress by serving correctly-sized images
 */
export function getOptimizedImageUrl(
  imageUrls: {
    thumbnail_url?: string;
    medium_url?: string;
    full_url?: string;
  },
  context: "thumbnail" | "medium" | "full" = "medium"
): string {
  const { thumbnail_url, medium_url, full_url } = imageUrls;

  switch (context) {
    case "thumbnail":
      return thumbnail_url || medium_url || full_url || "";
    case "medium":
      return medium_url || full_url || "";
    case "full":
      return full_url || medium_url || "";
    default:
      return medium_url || full_url || "";
  }
}

/**
 * Estimate data savings from compression
 * For monitoring dashboard
 */
export function estimateEgressSavings(
  originalSize: number,
  compressedSize: number
): {
  savedBytes: number;
  reduction: string;
  estimatedMonthlySavings: string;
} {
  const savedBytes = originalSize - compressedSize;
  const reduction = ((savedBytes / originalSize) * 100).toFixed(1);

  // Rough estimate: if 50 kits viewed 100x per month = 5000 views
  // Savings per view: savedBytes, Monthly: savedBytes * 5000
  const estimatedMonthlyEgress = (savedBytes * 5000) / (1024 * 1024 * 1024); // GB

  return {
    savedBytes,
    reduction: `${reduction}%`,
    estimatedMonthlySavings: `${estimatedMonthlyEgress.toFixed(2)} GB`,
  };
}
