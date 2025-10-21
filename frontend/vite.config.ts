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
        drop_console: mode === 'production', // Supprimer console.log en production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        // 🔧 Code splitting intelligent et optimisé
        manualChunks: (id) => {
          // Vendor chunks optimisés
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('@radix-ui')) return 'ui-vendor';
            if (id.includes('stripe')) return 'stripe-vendor';
            if (id.includes('date-fns') || id.includes('zod')) return 'utils-vendor';
            if (id.includes('recharts')) return 'charts-vendor';
            return 'vendor';
          }
          // Chunks par page
          if (id.includes('/pages/')) {
            const page = id.split('/pages/')[1].split('/')[0];
            return `page-${page}`;
          }
          // Chunks par composant
          if (id.includes('/components/')) {
            return 'components';
          }
        },
        // 📦 Optimisation des chunks avec compression
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash].[ext]`;
          const extType = assetInfo.name.split('.').at(1);
          if (!extType) return `assets/[name]-[hash].[ext]`;
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/img/[name]-[hash].[ext]`;
          }
          if (/css/i.test(extType)) {
            return `assets/css/[name]-[hash].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        }
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
