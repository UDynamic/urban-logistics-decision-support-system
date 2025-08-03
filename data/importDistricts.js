import fs from 'fs';
import { Client } from 'pg';

// Update your connection info here:
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'urban_logistics',
  password: '1234',
  port: 5432,
});

async function importDistricts() {
  try {
    await client.connect();

    // Read districts.json
    const data = fs.readFileSync('districts.json', 'utf8');
    const districts = JSON.parse(data);

    for (const district of districts) {
      const { id, name } = district;

      // Insert district (ignore duplicates)
      await client.query(
        `INSERT INTO districts (district_id, name) VALUES ($1, $2) ON CONFLICT (district_id) DO NOTHING`,
        [id, name]
      );
    }

    console.log('Districts imported successfully.');
  } catch (err) {
    console.error('Error importing districts:', err);
  } finally {
    await client.end();
  }
}

importDistricts();
