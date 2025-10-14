import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://backend:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 🚀 OPTIMISATIONS POUR LA PRODUCTION
  build: {
    target: 'es2015', // Support des navigateurs modernes
    minify: 'terser', // Minification avancée
    terserOptions: {
      compress: {
       // drop_console: mode === 'production', // Supprimer console.log en production
        //drop_debugger: true,
        //pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        // 🔧 Code splitting intelligent
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          utils: ['date-fns', 'zod', 'react-hook-form'],
          charts: ['recharts'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js']
        },
        // 📦 Optimisation des chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // ⚡ Optimisations de build
    chunkSizeWarningLimit: 1000,
    sourcemap: mode === 'development',
    // 🎯 Préchargement des ressources critiques
    assetsInlineLimit: 4096, // Inline les petits assets
  },
  // 🔧 Optimisations de développement
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      '@tanstack/react-query', 'date-fns', 'zod'
    ],
    exclude: ['@stripe/stripe-js'] // Exclure Stripe du pré-bundling
  },
  // 🚀 OPTIMISATIONS CSS
  css: {
    devSourcemap: mode === 'development'
  }
}));
