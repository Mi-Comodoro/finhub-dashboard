import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  srcDir: 'src/',

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    shim: false
  },

  app: {
    head: {
      title: 'FinHub',
      htmlAttrs: {
        lang: 'es'
      },
      meta: [
        {
          name: 'description',
          content: 'Control financiero personal inteligente'
        }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
        }
      ]
    }
  },

  components: [
    { path: '~/components/atoms', pathPrefix: false },
    { path: '~/components/molecules', pathPrefix: false },
    { path: '~/components/organisms', pathPrefix: false },
    { path: '~/components/templates', pathPrefix: false }
  ],

  imports: {
    dirs: ['composables', 'stores']
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  nitro: {
    compatibilityDate: '2026-02-07'
  },

  vite: {
    server: {
      watch: {
        usePolling: process.env.NODE_ENV === 'development', // Solo polling en dev
        interval: 1000, // Intervalo de polling
        ignored: ['**/node_modules/**', '**/.git/**', '**/.nuxt/**', '**/dist/**']
      },
      hmr: {
        overlay: process.env.NODE_ENV === 'development', // Mostrar errores solo en dev
        clientPort: 3000,
        protocol: 'ws',
        host: 'localhost',
        timeout: 60000 // Timeout aumentado para HMR
      },

      strictPort: false, // Permitir cambio de puerto si está ocupado
      cors: true,
      fs: {
        strict: false,
        allow: ['.', '/src', '/assets']
      }
    },

    // Optimizaciones de rendimiento
    optimizeDeps: {
      include: ['vue', '@vue/runtime-core'],
      exclude: []
    },

    // Configuración de CSS
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          additionalData: ''
        }
      }
    },

    // Configuración de build
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: id => {
            if (id.includes('node_modules')) {
              if (id.includes('vue')) return 'vue-vendor'
              if (id.includes('chart')) return 'chart-vendor'
              if (id.includes('axios')) return 'axios-vendor'
              return 'vendor'
            }
          }
        }
      },
      chunkSizeWarningLimit: 1500
    },

    // Plugins
    plugins: []
  }
})
