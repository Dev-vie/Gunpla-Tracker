/**
 * Service Worker Registration
 * Register the service worker for offline image caching
 * 
 * Usage in app/layout.tsx:
 * ```
 * import { registerServiceWorker } from '@/lib/sw-register'
 * 
 * useEffect(() => {
 *   registerServiceWorker()
 * }, [])
 * ```
 */

export async function registerServiceWorker() {
  // Only register in browser, not SSR
  if (typeof window === "undefined") {
    return;
  }

  // Check if service workers are supported
  if (!("serviceWorker" in navigator)) {
    console.log("Service Workers not supported");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });

    console.log("✅ Service Worker registered successfully:", registration);

    // Check for updates every hour
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    // Handle updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          // New service worker available, prompt user to reload
          console.log(
            "New version available! Refresh the page or wait for automatic update."
          );
        }
      });
    });
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
}

/**
 * Unregister service worker (for cleanup)
 */
export async function unregisterServiceWorker() {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    registrations.forEach((registration) => {
      registration.unregister();
    });
    console.log("Service Worker unregistered");
  }
}

/**
 * Clear service worker cache
 */
export async function clearServiceWorkerCache() {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "CLEAR_CACHE",
    });
    console.log("Cache clearing requested");
  }
}
