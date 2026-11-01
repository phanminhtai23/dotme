const appDir = __dirname;

module.exports = {
  apps: [
    {
      name: 'dotme-api',
      script: 'server/index.js',
      interpreter: 'node',
      node_args: `--env-file=${appDir}/.env`,
      cwd: appDir,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
}
