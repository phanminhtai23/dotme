module.exports = {
  apps: [
    {
      name: 'dotme-api',
      script: 'server/index.js',
      interpreter: 'node',
      node_args: '--env-file=/var/www/dotme/.env',
      cwd: '/var/www/dotme',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
