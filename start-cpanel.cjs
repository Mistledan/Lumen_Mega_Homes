const { spawn } = require('node:child_process');
const path = require('node:path');

const port = String(process.env.PORT || '3002');
const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

console.log('Starting LUMEN MEGA HOMES (production) on port ' + port);

const child = spawn(process.execPath, [nextBin, 'start', '-p', port, '-H', '0.0.0.0'], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname,
});

child.on('exit', (code, signal) => {
  console.log('next start exited code=' + code + ' signal=' + signal);
  process.exit(code === null ? 1 : code);
});

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => child.kill(sig));
}
