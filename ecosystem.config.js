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
        PORT: 3000,
        HOST: '0.0.0.0'
      }
    }
  ]
}
