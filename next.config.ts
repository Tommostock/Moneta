import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Keep the SW active in dev so you can test offline behaviour
  disable: false,
});

const nextConfig: NextConfig = {};

export default withSerwist(nextConfig);
