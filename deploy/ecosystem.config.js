// PM2 process config — runs Next.js in production
module.exports = {
  apps: [
    {
      name:        'medguide',
      script:      'node_modules/.bin/next',
      args:        'start',
      cwd:         '/var/www/medguide',
      instances:   1,
      autorestart: true,
      watch:       false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT:     3000,
      },
    },
  ],
}
