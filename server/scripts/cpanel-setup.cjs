const { execSync } = require('node:child_process');

process.env.ADMIN_EMAIL ||= 'obmilnetworks@hotmail.com';
process.env.ADMIN_PASSWORD ||= 'Kingolaolu';
process.env.PASSWORD_PEPPER ||= '1d7ee7148e4f4fb46e002bd34d7077ee4440afb4f6b17cb5eb1ee5e8cec545da';
process.env.SITE_BRAND ||= 'LUMEN MEGA HOMES';
process.env.SITE_PHONE ||= '07033656721';
process.env.SITE_EMAIL ||= 'obmilnetworks@hotmail.com';
process.env.SITE_ADDRESS ||= 'Lagos, Nigeria';

function run(cmd) {
  console.log('\n$ ' + cmd);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

try {
  console.log('LUMEN MEGA HOMES - database setup starting');
  console.log('DATABASE_URL host: ' + (process.env.DATABASE_URL || '(not set)').split('@').pop());
  run('npx prisma generate --schema server/prisma/schema.prisma');
  run('npx prisma migrate deploy --schema server/prisma/schema.prisma');
  run('npx tsx server/prisma/seed.ts');
  console.log('\nDB SETUP COMPLETE - content, estates, properties, posts and admin user are loaded.');
} catch (error) {
  console.error('\nDB SETUP FAILED');
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
}
