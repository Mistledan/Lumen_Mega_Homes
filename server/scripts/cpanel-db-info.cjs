const path = require('node:path');

const root = path.join(__dirname, '..', '..');
require('dotenv').config({ path: path.join(root, '.env'), override: true });

const { Client } = require('pg');

const dbUser = process.argv[2] || process.env.DB_USER || '';
const dbPass = process.argv[3] || process.env.DB_PASS || '';
const dbName = process.argv[4] || 'lumenmeg_lmhadmin';

const connectionString = dbUser
  ? `postgresql://${dbUser}:${dbPass}@localhost:5432/${dbName}`
  : process.env.DATABASE_URL;

(async () => {
  if (!connectionString) {
    console.error('No connection string. Usage: node server/scripts/cpanel-db-info.cjs <user> <pass> [db]');
    process.exit(1);
  }

  const client = new Client({ connectionString: connectionString.split('?')[0] });
  try {
    await client.connect();
  } catch (error) {
    console.error('CONNECT FAILED: ' + (error && error.message ? error.message : error));
    process.exit(1);
  }

  const me = await client.query(
    'SELECT current_user AS current_user, session_user AS session_user, current_database() AS db'
  );
  console.log('connected as : ' + me.rows[0].current_user + ' (session ' + me.rows[0].session_user + ')');
  console.log('database     : ' + me.rows[0].db);
  console.log('');

  const dbOwner = await client.query(
    'SELECT pg_get_userbyid(datdba) AS owner FROM pg_database WHERE datname = current_database()'
  );
  console.log('database owner : ' + (dbOwner.rows[0] ? dbOwner.rows[0].owner : 'unknown'));

  const privs = await client.query(
    "SELECT has_database_privilege(current_user, current_database(), 'CREATE') AS db_create," +
      " has_schema_privilege(current_user, 'public', 'CREATE') AS schema_create," +
      " has_database_privilege(current_user, current_database(), 'CREATE') AS can_create_tables"
  );
  console.log('my privileges  : db CREATE=' + privs.rows[0].db_create + ' schema CREATE=' + privs.rows[0].schema_create);
  console.log('');

  console.log('roles:');
  const roles = await client.query(
    "SELECT rolname, rolsuper, rolcreatedb, rolcanlogin FROM pg_roles WHERE rolname NOT LIKE 'pg_%' ORDER BY rolname"
  );
  for (const r of roles.rows) {
    console.log('  ' + r.rolname + '  super=' + r.rolsuper + ' createdb=' + r.rolcreatedb + ' login=' + r.rolcanlogin);
  }
  console.log('');

  console.log('');
  console.log('schemas:');
  const schemas = await client.query(
    "SELECT nspname AS name, pg_get_userbyid(nspowner) AS owner FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' ORDER BY nspname"
  );
  for (const s of schemas.rows) {
    console.log('  ' + s.name + '  ->  ' + s.owner);
  }
  console.log('');

  console.log('table owners in schema public:');
  const tables = await client.query(
    "SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  );
  if (tables.rows.length === 0) {
    console.log('  (no tables)');
  }
  for (const t of tables.rows) {
    console.log('  ' + t.tablename + '  ->  ' + t.tableowner);
  }

  await client.end();
})().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
