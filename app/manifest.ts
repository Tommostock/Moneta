import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MONETA",
    short_name: "MONETA",
    description: "Currency converter and rate tracker",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0C0C0C",
    theme_color: "#0C0C0C",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
