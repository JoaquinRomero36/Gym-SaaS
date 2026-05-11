const { Pool } = require('pg');
const p = new Pool({ user: 'postgres', password: 'Fortnite36', host: '127.0.0.1', port: 5432, database: 'postgres' });
p.query("SELECT 1 FROM pg_database WHERE datname = 'gym'").then(r => {
  if (r.rows.length === 0) return p.query('CREATE DATABASE gym');
}).then(() => {
  console.log('DB ready');
  process.exit(0);
}).catch(e => {
  console.log('Error:', e.message);
  process.exit(1);
});
