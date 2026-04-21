import { fileURLToPath } from 'node:url'

const resolvePath = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url))

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2026-02-08',
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
  srcDir: 'src/',
  serverDir: 'src/server/',
  alias: {
    '@types': resolvePath('./src/types'),
    '@api-types': resolvePath('./src/types/api'),
    '@domain-types': resolvePath('./src/types/domain'),
    '@ui-types': resolvePath('./src/types/ui')
  },
  devtools: {
    enabled: true
  },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
    shim: false
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3005/api/v1'
    },
    FB_API_KEY: process.env.FB_API_KEY,
    FB_AUTH_DOMAIN: process.env.FB_AUTH_DOMAIN,
    FB_PROJECT_ID: process.env.FB_PROJECT_ID,
    FB_STORAGE_BUCKET: process.env.FB_STORAGE_BUCKET,
    FB_MESSAGING_SENDER_ID: process.env.FB_MESSAGING_SENDER_ID,
    FB_APP_ID: process.env.FB_APP_ID,
    FB_MEASUREMENT_ID: process.env.FB_MEASUREMENT_ID
  },

  components: [
    { path: '@/components/atoms', pathPrefix: false, extensions: ['.vue'] },
    { path: '@/components/molecules', pathPrefix: false, extensions: ['.vue'] },
    { path: '@/components/organisms', pathPrefix: false, extensions: ['.vue'] },
    { path: '@/components/business', pathPrefix: false, extensions: ['.vue'] }
    /*     { path: '@/components/templates', pathPrefix: false } */
  ],
  ignore: ['**/*.types.ts', '**/types/**'],

  imports: {
    autoImport: true,
    dirs: ['composables', 'stores', 'middlewares', 'utils']
  },
  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxt/image'],
  image: {
    domains: ['lh3.googleusercontent.com']
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  vite: {
    server: {
      watch: {
        usePolling: process.env.NODE_ENV === 'development',
        interval: 1000,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.nuxt/**', '**/dist/**']
      },
      hmr: {
        overlay: process.env.NODE_ENV === 'development',
        clientPort: 3000,
        protocol: 'ws',
        host: 'localhost',
        timeout: 60000
      },

      strictPort: false,
      cors: true,
      fs: {
        strict: false,
        allow: ['.', '/src', '/assets']
      }
    },

    optimizeDeps: {
      include: ['vue', '@vue/runtime-core'],
      exclude: []
    },

    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          additionalData: ''
        }
      }
    },

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
          manualChunks: (id: string | string[]) => {
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

    plugins: []
  }
})
