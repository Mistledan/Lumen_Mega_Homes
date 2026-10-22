const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
require('dotenv').config({ path: path.join(root, '.env'), override: true });

const { Client } = require('pg');

const rawUrl = process.argv[2] || process.env.DATABASE_URL;
if (!rawUrl) {
  console.error('DATABASE_URL is not set. Set it in the Node.js App environment or in .env');
  process.exit(1);
}

const connectionString = rawUrl.split('?')[0];
const schemaMatch = rawUrl.match(/[?&]schema=([^&]+)/);
const schema = (process.env.DB_SCHEMA || (schemaMatch ? schemaMatch[1] : 'public')).replace(/"/g, '');
const sqlFile = path.join(root, 'database', 'lumen_megahomes.sql');

(async () => {
  if (!fs.existsSync(sqlFile)) {
    console.error('SQL file not found: ' + sqlFile);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlFile, 'utf8');
  const host = connectionString.split('@').pop();
  console.log('LUMEN MEGA HOMES - SQL import starting');
  console.log('target: ' + host);
  console.log('file: ' + sqlFile + ' (' + sql.length + ' bytes)');

  const client = new Client({ connectionString });
  await client.connect();
  try {
    const who = await client.query('SELECT current_user AS u');
    console.log('connected as: ' + who.rows[0].u);
    console.log('target schema: ' + schema);
    if (schema !== 'public') {
      await client.query('CREATE SCHEMA IF NOT EXISTS "' + schema + '"');
      await client.query('SET search_path TO "' + schema + '"');
    }
    await client.query(sql);
    console.log('SQL executed OK');
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    console.error('SQL IMPORT FAILED');
    console.error(message);
    if (/must be owner of|permission denied/i.test(message)) {
      console.error('');
      console.error('HINT: this role does not own the existing tables.');
      console.error('      In cPanel > PostgreSQL Databases > Users, change the password of the');
      console.error('      user created together with the database (the owner), then re-run:');
      console.error('      DB_USER=<owner-user> DB_PASS=\'<new-password>\' bash server/scripts/cpanel-deploy.sh');
    }
    await client.end();
    process.exit(1);
  }

  for (const t of ['AdminUser', 'SiteContent', 'Property', 'Estate', 'Post', 'Lead', '_prisma_migrations']) {
    try {
      const r = await client.query('SELECT count(*)::int AS n FROM "' + t + '"');
      console.log('  ' + t + ' = ' + r.rows[0].n);
    } catch (e) {
      console.log('  ' + t + ' = (missing)');
    }
  }
  const c = await client.query('SELECT "brandName", "phone", "email" FROM "SiteContent"');
  console.log('  brand = ' + JSON.stringify(c.rows[0]));
  await client.end();
  console.log('\nIMPORT COMPLETE - your content is now in the database.');
})().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});