// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:ProjectNyaya%231223@db.gbnvwjzasapedkkvrwrx.supabase.co:5432/postgres' });
const categories = ['Politics', 'Crime', 'Current Affairs', 'Economy', 'Education', 'Governance', 'Technology', 'Environment', 'Law', 'Others'];

async function run() {
  await client.connect();
  for (const name of categories) {
    await client.query('INSERT INTO "Category" (id, name, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, NOW(), NOW()) ON CONFLICT DO NOTHING', [name]);
  }
  const res = await client.query('SELECT name FROM "Category"');
  console.log(res.rows.map(r => r.name).join(', '));
  await client.end();
}
run();
