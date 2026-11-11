import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Bill Everything",
        short_name: "Bill Everything",
        description: "Modern Food Management System - Bill Everything",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 3000,
    // Optimize chunk splitting to reduce main bundle TBT
    rollupOptions: {
      output: {
        manualChunks: {
          // Router
          "vendor-router": ["react-router", "react-router-dom"],
          // Redux
          "vendor-redux": ["react-redux", "@reduxjs/toolkit", "redux-persist"],
          // Ant Design (heavy — split out so it caches independently)
          "vendor-antd": ["antd", "@ant-design/icons"],
          // Supabase
          "vendor-supabase": ["@supabase/supabase-js"],
          // Styled components
          "vendor-styled": ["styled-components"],
        },
      },
    },
    // Enable minification optimizations
    minify: "esbuild",
    target: "es2015",
    cssMinify: true,
  },
  server: {
    host: "0.0.0.0", // Accept connections from any IP
    port: 5173, // (optional) default Vite port
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
});

  