const { spawnSync } = require('node:child_process');
const path = require('node:path');

const nextBin = path.join(__dirname, '..', '..', 'node_modules', 'next', 'dist', 'bin', 'next');

const result = spawnSync(process.execPath, [nextBin, 'build', '--webpack'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
  },
});

process.exit(result.status === null ? 1 : result.status);
