import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { ExpirationPlugin, NetworkFirst, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Frankfurter API — NetworkFirst with 5s timeout, falls back to cache
    {
      matcher: ({ url }) => url.hostname === "api.frankfurter.dev",
      handler: new NetworkFirst({
        cacheName: "frankfurter-api",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 3600, // 1 hour
          }),
        ],
      }),
    },
    // Google Fonts stylesheets — StaleWhileRevalidate
    {
      matcher: ({ url }) =>
        url.origin === "https://fonts.googleapis.com",
      handler: new StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
      }),
    },
    // Google Fonts files — long-lived CacheFirst
    {
      matcher: ({ url }) =>
        url.origin === "https://fonts.gstatic.com",
      handler: new NetworkFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          }),
        ],
      }),
    },
    // Everything else from the default Serwist cache strategy
    ...defaultCache,
  ],
});

serwist.addEventListeners();
