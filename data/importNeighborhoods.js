import fs from'fs';
import { Client } from 'pg';

// 1. Connect to your PostgreSQL database
const client = new Client({
  user: 'postgres',       // your username
  host: 'localhost',      // or your DB host
  database: 'urban_logistics', // your DB name
  password: '1234',   // your password
  port: 5432,             // default Postgres port
});

async function importNeighborhoods() {
  try {
    await client.connect();

    // 2. Read and parse districts.json
    const data = fs.readFileSync('districts.json', 'utf8');
    const districts = JSON.parse(data);

    // 3. Extract neighborhoods from each district
    for (const district of districts) {
      const districtId = district.id;
      if (!district.neighborhoods) continue;

      for (const neighborhood of district.neighborhoods) {
        const neighborhoodId = neighborhood.id;
        const name = neighborhood.name;

        // 4. Insert each neighborhood into the table
        await client.query(
          `INSERT INTO neighborhoods (id, name, district_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO NOTHING;`, // Avoid duplicates if re-run
          [neighborhoodId, name, districtId]
        );
      }
    }

    console.log('✅ Neighborhoods imported successfully!');
  } catch (err) {
    console.error('❌ Error importing neighborhoods:', err);
  } finally {
    await client.end();
  }
}

importNeighborhoods();
