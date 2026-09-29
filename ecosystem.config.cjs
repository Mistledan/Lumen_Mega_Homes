module.exports = {
  apps: [
    {
      name: 'lumen-api',
      cwd: __dirname,
      script: 'npm',
      args: 'run start:api',
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'lumen-web',
      cwd: __dirname,
      script: 'npm',
      args: 'run start',
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
      env: { NODE_ENV: 'production' }
    }
  ]
};