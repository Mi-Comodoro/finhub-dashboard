import { fileURLToPath } from 'node:url'

const resolvePath = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url))

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2026-02-09', // fecha actualizada

  app: {
    head: {
      title: 'Mi Comodoro',
      htmlAttrs: { lang: 'es' },
      meta: [
        {
          name: 'description',
          content: 'Control financiero personal inteligente'
        }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' },
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

  devtools: { enabled: true },
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
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        'vue-echarts',
        'firebase/app',
        'firebase/auth',
        'vue',
        '@vue/runtime-core',
        'country-flag-icons/string/3x2', // ← mantenlo
        '@heroicons/vue/20/solid', // ← mantenlo
        'libphonenumber-js' // ← mantenlo
      ],
      force: true
    },

    css: {
      devSourcemap: process.env.NODE_ENV !== 'production',
      preprocessorOptions: {
        scss: { additionalData: '' }
      }
    },

    build: {
      minify: 'esbuild',
      sourcemap: process.env.NODE_ENV !== 'production',
      chunkSizeWarningLimit: 1500,

      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            warning.message.includes('/* #__PURE__ */') ||
            warning.message.includes('Sourcemap is likely to be incorrect') ||
            warning.message.includes('A comment "/* #__PURE__ */"')
          ) {
            return
          }
          warn(warning)
        }
      }
    },

    plugins: []
  }
})
