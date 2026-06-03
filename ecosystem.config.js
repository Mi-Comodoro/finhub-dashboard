module.exports = {
  apps: [
    {
      name: 'micomodoro',

      script: '/var/www/intranet/micomodoro-app/.output/server/index.mjs',

      cwd: '/var/www/intranet/micomodoro-app',

      instances: 1,

      exec_mode: 'fork',

      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 3000,
        NUXT_PUBLIC_WS_BASE: process.env.NUXT_PUBLIC_WS_BASE || 'http://localhost:3005'
      }
    }
  ]
}
