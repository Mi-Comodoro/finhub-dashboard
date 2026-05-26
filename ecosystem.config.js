module.exports = {
  apps: [
    {
      name: 'micomodoro',

      script: '.output/server/index.mjs',

      cwd: '/var/www/intranet/micomodoro-app',

      instances: 1,

      exec_mode: 'fork',

      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 3000
      }
    }
  ]
}
