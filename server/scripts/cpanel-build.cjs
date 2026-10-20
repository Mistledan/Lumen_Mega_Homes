const { execSync } = require('node:child_process');

function run(cmd) {
  console.log('\n$ ' + cmd);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

try {
  console.log('LUMEN MEGA HOMES - production build starting');
  run('npm run build');
  console.log('\nBUILD COMPLETE - you can now restart the app.');
} catch (error) {
  console.error('\nBUILD FAILED');
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
}
